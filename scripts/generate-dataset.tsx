import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { AutoroutingPipelineSolver } from "@tscircuit/capacity-autorouter"
import * as React from "react"
import { RootCircuit, getSimpleRouteJsonFromCircuitJson } from "tscircuit"
import type { SimpleRouteJson } from "tscircuit"
import type { PowerTraceSampleMetadata } from "../circuits/types"

type CircuitModule = {
  default: () => React.JSX.Element
  sampleMetadata: PowerTraceSampleMetadata
}

const circuitsDirectory = path.resolve("circuits")
const samplesDirectory = path.resolve("samples")
const baseRouteWidth = 0.15
const generatedNumberPrecision = 9

// Some older registry packages were emitted with the classic JSX runtime.
Object.assign(globalThis, { React })

const canonicalizeForStableJson = (value: unknown): unknown => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`cannot serialize non-finite number ${value}`)
    }
    const rounded = Number(value.toFixed(generatedNumberPrecision))
    return Object.is(rounded, -0) ? 0 : rounded
  }
  if (Array.isArray(value)) {
    return value.map(canonicalizeForStableJson)
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        canonicalizeForStableJson(nestedValue),
      ]),
    )
  }
  return value
}

const renderCircuit = async (modulePath: string) => {
  const moduleUrl = `${pathToFileURL(modulePath).href}?v=${Date.now()}`
  const circuitModule = (await import(moduleUrl)) as CircuitModule
  const circuit = new RootCircuit()
  circuit.schematicDisabled = true
  circuit.add(<circuitModule.default />)
  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()

  const errors = circuitJson.filter((element) =>
    element.type.endsWith("_error"),
  )
  if (errors.length > 0) {
    throw new Error(
      `circuit render emitted ${errors.length} error(s): ${errors
        .map((error) => "message" in error && error.message)
        .filter(Boolean)
        .join("; ")}`,
    )
  }

  const { simpleRouteJson } = getSimpleRouteJsonFromCircuitJson({
    circuitJson,
    minTraceWidth: baseRouteWidth,
  })

  return { circuitModule, circuitJson, simpleRouteJson }
}

const createBaseRoutingProblem = (srj: SimpleRouteJson): SimpleRouteJson => ({
  ...srj,
  minTraceWidth: baseRouteWidth,
  connections: srj.connections.map((connection) => ({
    ...connection,
    width: baseRouteWidth,
  })),
})

const solveBaseRoute = (srj: SimpleRouteJson): SimpleRouteJson => {
  const solver = new AutoroutingPipelineSolver(
    createBaseRoutingProblem(srj) as never,
  )
  let stepCount = 0
  const maximumSteps = 2_000_000

  while (!solver.solved && !solver.failed && stepCount < maximumSteps) {
    solver.step()
    stepCount += 1
  }
  if (solver.failed || !solver.solved) {
    throw new Error(
      `base autorouter ${solver.failed ? "failed" : "timed out"} after ${stepCount} steps`,
    )
  }

  const routedSrj =
    solver.getOutputSimpleRouteJson() as unknown as SimpleRouteJson
  return {
    ...routedSrj,
    traces: routedSrj.traces?.map((trace) => ({
      ...trace,
      route: trace.route.map((point) =>
        point.route_type === "wire"
          ? { ...point, width: baseRouteWidth }
          : point,
      ),
    })),
  }
}

const connectPowerRequirementsToSrj = (
  sampleId: string,
  srj: SimpleRouteJson,
  metadata: PowerTraceSampleMetadata,
  circuitJson: ReturnType<RootCircuit["getCircuitJson"]>,
) => {
  const sourceNetIdByName = new Map(
    circuitJson
      .filter((element) => element.type === "source_net")
      .map((sourceNet) => [sourceNet.name, sourceNet.source_net_id]),
  )

  return metadata.powerNets.map((powerNet) => {
    const connectionName = sourceNetIdByName.get(powerNet.net)
    const connection = srj.connections.find(
      ({ name }) => name === connectionName,
    )
    if (!connectionName || !connection) {
      throw new Error(
        `${sampleId}: power net ${powerNet.net} does not resolve to an SRJ connection`,
      )
    }
    if (
      connection.nominalTraceWidth === undefined ||
      Math.abs(connection.nominalTraceWidth - powerNet.nominalTraceWidthMm) >
        1e-6
    ) {
      throw new Error(
        `${sampleId}: ${powerNet.net} did not preserve its ${powerNet.nominalTraceWidthMm} mm nominal width`,
      )
    }
    return { ...powerNet, connectionName }
  })
}

const generateSample = async (fileName: string) => {
  const sampleId = fileName.slice(0, "sample000".length)
  const slug = fileName.replace(/\.circuit\.tsx$/, "")
  const modulePath = path.join(circuitsDirectory, fileName)
  const { circuitModule, circuitJson, simpleRouteJson } =
    await renderCircuit(modulePath)
  const powerNets = connectPowerRequirementsToSrj(
    sampleId,
    simpleRouteJson,
    circuitModule.sampleMetadata,
    circuitJson,
  )

  const routedSrj = solveBaseRoute(simpleRouteJson)
  const generatedSample = {
    ...routedSrj,
    id: slug,
    metadata: {
      source: `circuits/${fileName}`,
      title: circuitModule.sampleMetadata.title,
      application: circuitModule.sampleMetadata.application,
      tags: circuitModule.sampleMetadata.tags,
      powerNets,
      generation: {
        circuitJsonToSrj: "getSimpleRouteJsonFromCircuitJson",
        baseAutorouter: "@tscircuit/capacity-autorouter",
        baseRouteWidthMm: baseRouteWidth,
        normalizedAfterBaseRouting: true,
      },
    },
  }
  const outputFileName = `${slug}.srj.json`
  await writeFile(
    path.join(samplesDirectory, outputFileName),
    `${JSON.stringify(canonicalizeForStableJson(generatedSample), null, 2)}\n`,
  )

  return {
    sampleId,
    file: `samples/${outputFileName}`,
    source: `circuits/${fileName}`,
    title: circuitModule.sampleMetadata.title,
    origin: "tsx",
    tags: circuitModule.sampleMetadata.tags,
    powerNets,
  }
}

const main = async () => {
  const circuitFileNames = (await readdir(circuitsDirectory))
    .filter((fileName) => fileName.endsWith(".circuit.tsx"))
    .sort()
  const samples = []

  for (const fileName of circuitFileNames) {
    const sample = await generateSample(fileName)
    samples.push(sample)
    console.log(`${sample.sampleId}: generated ${sample.file}`)
  }

  const manifest = {
    manifestVersion: 2,
    datasetName: "dataset-srj27-power-traces",
    format: "simple_route_json",
    sourceFormat: "tscircuit_tsx",
    pipelineStage: "post_routing_power_trace_expansion",
    primaryConsumer: "@tscircuit/power-trace-expander",
    samples,
  }
  await writeFile("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`)

  const indexLines = [
    '"use strict"',
    "",
    'exports.manifest = require("./manifest.json")',
    "",
    ...samples.map(
      ({ sampleId, file }) => `exports.${sampleId} = require("./${file}")`,
    ),
    "",
    "exports.dataset = {",
    ...samples.map(({ sampleId }) => `  ${sampleId}: exports.${sampleId},`),
    "}",
    "",
    "exports.default = exports.dataset",
    "",
  ]
  await writeFile("index.js", indexLines.join("\n"))
  console.log(`Generated ${samples.length} TSX-backed power-trace samples.`)
}

void main()
