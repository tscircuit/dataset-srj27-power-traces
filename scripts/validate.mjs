import { existsSync, readFileSync, readdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const repositoryDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
)
const packageExports = require(resolve(repositoryDirectory, "index.js"))
const manifest = packageExports.manifest
const fail = (message) => {
  throw new Error(message)
}

const assertPositiveNumber = (value, fieldName, sampleId) => {
  if (!Number.isFinite(value) || value <= 0) {
    fail(`${sampleId}: ${fieldName} must be a positive number`)
  }
}

const getConnectionAliases = (connection) =>
  [
    connection.name,
    connection.source_trace_id,
    connection.rootConnectionName,
    connection.netConnectionName,
    ...(connection.mergedConnectionNames ?? []),
  ].filter(Boolean)

const getTraceAliases = (trace) =>
  new Set(
    [
      trace.connection_name,
      trace.source_trace_id,
      trace.rootConnectionName,
      ...(trace.mergedConnectionNames ?? []),
      ...(trace.connectsTo ?? []),
    ].filter(Boolean),
  )

const getConnectionForTrace = (trace, connections) => {
  const traceAliases = getTraceAliases(trace)
  return connections.find((connection) =>
    getConnectionAliases(connection).some((alias) => traceAliases.has(alias)),
  )
}

const validateBounds = (sample, sampleId) => {
  const { bounds } = sample
  if (
    !bounds ||
    !Number.isFinite(bounds.minX) ||
    !Number.isFinite(bounds.maxX) ||
    !Number.isFinite(bounds.minY) ||
    !Number.isFinite(bounds.maxY) ||
    bounds.minX >= bounds.maxX ||
    bounds.minY >= bounds.maxY
  ) {
    fail(`${sampleId}: bounds must define a non-empty finite rectangle`)
  }

  for (const trace of sample.traces) {
    for (const routePoint of trace.route) {
      if (
        routePoint.x < bounds.minX ||
        routePoint.x > bounds.maxX ||
        routePoint.y < bounds.minY ||
        routePoint.y > bounds.maxY
      ) {
        fail(`${sampleId}: ${trace.pcb_trace_id} leaves the board bounds`)
      }
    }
  }
}

const validatePowerNets = (sample, manifestSample) => {
  const sampleId = manifestSample.sampleId
  const metadataPowerNets = sample.metadata?.powerNets
  if (
    !Array.isArray(manifestSample.powerNets) ||
    manifestSample.powerNets.length === 0
  ) {
    fail(`${sampleId}: manifest needs authored power requirements`)
  }
  if (
    JSON.stringify(metadataPowerNets) !==
    JSON.stringify(manifestSample.powerNets)
  ) {
    fail(`${sampleId}: SRJ and manifest power requirements differ`)
  }

  for (const powerNet of manifestSample.powerNets) {
    if (!powerNet.net || !powerNet.purpose || !powerNet.connectionName) {
      fail(
        `${sampleId}: every power requirement needs net, purpose, and connectionName`,
      )
    }
    if (!Number.isFinite(powerNet.voltage) || powerNet.voltage < 0) {
      fail(`${sampleId}: ${powerNet.net} voltage must be non-negative`)
    }
    assertPositiveNumber(
      powerNet.maxCurrentA,
      `${powerNet.net} maxCurrentA`,
      sampleId,
    )
    assertPositiveNumber(
      powerNet.nominalTraceWidthMm,
      `${powerNet.net} nominalTraceWidthMm`,
      sampleId,
    )

    const connection = sample.connections.find(
      ({ name }) => name === powerNet.connectionName,
    )
    if (!connection) {
      fail(`${sampleId}: ${powerNet.net} connection is missing from the SRJ`)
    }
    if (
      Math.abs(connection.nominalTraceWidth - powerNet.nominalTraceWidthMm) >
      1e-6
    ) {
      fail(`${sampleId}: ${powerNet.net} nominal width was not preserved`)
    }
  }
}

const validateSample = (sample, manifestSample) => {
  const sampleId = manifestSample.sampleId
  const expectedId = manifestSample.file
    .split("/")
    .at(-1)
    .replace(".srj.json", "")
  if (sample.id !== expectedId)
    fail(`${sampleId}: JSON id must match its filename`)
  if (!Number.isInteger(sample.layerCount) || sample.layerCount < 1) {
    fail(`${sampleId}: layerCount must be a positive integer`)
  }
  assertPositiveNumber(sample.minTraceWidth, "minTraceWidth", sampleId)
  if (!Array.isArray(sample.connections) || sample.connections.length === 0) {
    fail(`${sampleId}: connections must be populated`)
  }
  if (!Array.isArray(sample.traces) || sample.traces.length === 0) {
    fail(`${sampleId}: routed traces must be populated`)
  }
  if (!Array.isArray(sample.obstacles))
    fail(`${sampleId}: obstacles must be an array`)
  if (sample.metadata?.source !== manifestSample.source) {
    fail(`${sampleId}: generated SRJ must name its TSX source`)
  }
  if (sample.metadata?.generation?.normalizedAfterBaseRouting !== true) {
    fail(
      `${sampleId}: generation metadata must identify base-route normalization`,
    )
  }

  for (const connection of sample.connections) {
    assertPositiveNumber(
      connection.nominalTraceWidth,
      `connection ${connection.name} nominalTraceWidth`,
      sampleId,
    )
    if (
      !Array.isArray(connection.pointsToConnect) ||
      connection.pointsToConnect.length < 2
    ) {
      fail(
        `${sampleId}: connection ${connection.name} needs at least two points`,
      )
    }
  }

  let hasUnderWidthPowerCopper = false
  for (const trace of sample.traces) {
    if (trace.type !== "pcb_trace" || !trace.pcb_trace_id) {
      fail(`${sampleId}: every trace must be an identified pcb_trace`)
    }
    if (!Array.isArray(trace.route) || trace.route.length < 2) {
      fail(`${sampleId}: ${trace.pcb_trace_id} needs at least two route points`)
    }
    const connection = getConnectionForTrace(trace, sample.connections)
    if (!connection) {
      fail(
        `${sampleId}: ${trace.pcb_trace_id} does not resolve to a connection`,
      )
    }

    for (const routePoint of trace.route) {
      if (!Number.isFinite(routePoint.x) || !Number.isFinite(routePoint.y)) {
        fail(`${sampleId}: ${trace.pcb_trace_id} has a non-finite point`)
      }
      if (routePoint.route_type === "wire") {
        assertPositiveNumber(routePoint.width, "wire width", sampleId)
        if (!routePoint.layer) fail(`${sampleId}: wire points require a layer`)
        if (Math.abs(routePoint.width - sample.minTraceWidth) > 1e-6) {
          fail(`${sampleId}: base-route wires must use minTraceWidth`)
        }
        if (connection.nominalTraceWidth > routePoint.width + 1e-6) {
          hasUnderWidthPowerCopper = true
        }
      } else if (routePoint.route_type === "via") {
        if (!routePoint.from_layer || !routePoint.to_layer) {
          fail(`${sampleId}: via points require from_layer and to_layer`)
        }
      } else {
        fail(`${sampleId}: unsupported route_type ${routePoint.route_type}`)
      }
    }
  }
  if (!hasUnderWidthPowerCopper) {
    fail(`${sampleId}: expected under-width copper for the late pipeline stage`)
  }

  for (const obstacle of sample.obstacles) {
    if (obstacle.type !== "rect" && obstacle.type !== "oval") {
      fail(`${sampleId}: unsupported obstacle type ${obstacle.type}`)
    }
    assertPositiveNumber(obstacle.width, "obstacle width", sampleId)
    assertPositiveNumber(obstacle.height, "obstacle height", sampleId)
    if (!Array.isArray(obstacle.layers) || obstacle.layers.length === 0) {
      fail(`${sampleId}: obstacles require a layer`)
    }
    if (!Array.isArray(obstacle.connectedTo)) {
      fail(`${sampleId}: obstacle connectedTo must be an array`)
    }
  }

  validatePowerNets(sample, manifestSample)
  validateBounds(sample, sampleId)
}

if (manifest.manifestVersion !== 2) fail("Unsupported manifestVersion")
if (manifest.datasetName !== "dataset-srj27-power-traces")
  fail("Unexpected datasetName")
if (manifest.sourceFormat !== "tscircuit_tsx")
  fail("Expected TSX source format")
if (!Array.isArray(manifest.samples) || manifest.samples.length === 0) {
  fail("Manifest must include samples")
}

const manifestFiles = new Set()
for (const [sampleIndex, manifestSample] of manifest.samples.entries()) {
  const sampleId = `sample${String(sampleIndex + 1).padStart(3, "0")}`
  if (manifestSample.sampleId !== sampleId) {
    fail(`Expected ${sampleId}, received ${manifestSample.sampleId}`)
  }
  if (manifestSample.origin !== "tsx") fail(`${sampleId}: origin must be tsx`)
  if (!manifestSample.source.endsWith(".circuit.tsx")) {
    fail(`${sampleId}: source must be a .circuit.tsx file`)
  }
  const sourcePath = resolve(repositoryDirectory, manifestSample.source)
  if (!existsSync(sourcePath))
    fail(`${sampleId}: missing ${manifestSample.source}`)
  const source = readFileSync(sourcePath, "utf8")
  if (!source.includes("export default") || !source.includes("powerNets")) {
    fail(`${sampleId}: TSX source must export a circuit and power requirements`)
  }

  const samplePath = resolve(repositoryDirectory, manifestSample.file)
  if (!existsSync(samplePath))
    fail(`${sampleId}: missing ${manifestSample.file}`)
  manifestFiles.add(manifestSample.file.split("/").at(-1))
  const sample = JSON.parse(readFileSync(samplePath, "utf8"))
  if (packageExports[sampleId] === undefined) {
    fail(`${sampleId}: missing index.js export`)
  }
  validateSample(sample, manifestSample)
}

const actualSampleFiles = readdirSync(resolve(repositoryDirectory, "samples"))
  .filter((fileName) => fileName.endsWith(".srj.json"))
  .sort()
if (actualSampleFiles.some((fileName) => !manifestFiles.has(fileName))) {
  fail("samples/ contains SRJ files that are not generated into the manifest")
}
if (existsSync(resolve(repositoryDirectory, "index.ts"))) {
  fail("Dataset packages must not contain index.ts")
}

console.log(
  `Validated ${manifest.samples.length} TSX-backed power-trace samples`,
)
