import { existsSync, readFileSync } from "node:fs"
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

const assertPositiveNumber = (number, fieldName, sampleId) => {
  if (!Number.isFinite(number) || number <= 0) {
    fail(`${sampleId}: ${fieldName} must be a positive number`)
  }
}

const getNominalTraceWidth = (trace, connections) => {
  const traceAliases = new Set(
    [
      trace.connection_name,
      trace.source_trace_id,
      trace.rootConnectionName,
      ...(trace.mergedConnectionNames ?? []),
      ...(trace.connectsTo ?? []),
    ].filter(Boolean),
  )

  return connections.find((connection) => {
    const connectionAliases = [
      connection.name,
      connection.source_trace_id,
      connection.rootConnectionName,
      connection.netConnectionName,
      ...(connection.mergedConnectionNames ?? []),
    ].filter(Boolean)
    return connectionAliases.some((alias) => traceAliases.has(alias))
  })?.nominalTraceWidth
}

const validateBounds = (sample) => {
  const { bounds, id: sampleId } = sample
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
        fail(
          `${sampleId}: ${trace.pcb_trace_id} has a route point outside bounds`,
        )
      }
    }
  }
}

const validateSample = (sample, manifestSample) => {
  const sampleId = manifestSample.sampleId
  if (
    sample.id !== manifestSample.file.split("/").at(-1).replace(".srj.json", "")
  ) {
    fail(`${sampleId}: JSON id must match its filename`)
  }
  if (!Number.isInteger(sample.layerCount) || sample.layerCount < 1) {
    fail(`${sampleId}: layerCount must be a positive integer`)
  }
  assertPositiveNumber(sample.minTraceWidth, "minTraceWidth", sampleId)
  if (!Array.isArray(sample.connections) || sample.connections.length === 0) {
    fail(`${sampleId}: connections must be populated`)
  }
  if (!Array.isArray(sample.traces) || sample.traces.length === 0) {
    fail(`${sampleId}: traces must be populated for a post-routing dataset`)
  }
  if (!Array.isArray(sample.obstacles)) {
    fail(`${sampleId}: obstacles must be an array`)
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

    const nominalTraceWidth = getNominalTraceWidth(trace, sample.connections)
    if (nominalTraceWidth === undefined) {
      fail(
        `${sampleId}: ${trace.pcb_trace_id} does not resolve to a connection alias`,
      )
    }

    for (const routePoint of trace.route) {
      if (!Number.isFinite(routePoint.x) || !Number.isFinite(routePoint.y)) {
        fail(`${sampleId}: ${trace.pcb_trace_id} has a non-finite route point`)
      }
      if (routePoint.route_type === "wire") {
        assertPositiveNumber(routePoint.width, "wire width", sampleId)
        if (!routePoint.layer)
          fail(`${sampleId}: wire route points require a layer`)
        if (
          nominalTraceWidth > sample.minTraceWidth &&
          routePoint.width < nominalTraceWidth
        ) {
          hasUnderWidthPowerCopper = true
        }
      } else if (routePoint.route_type === "via") {
        if (!routePoint.from_layer || !routePoint.to_layer) {
          fail(`${sampleId}: via route points require from_layer and to_layer`)
        }
      } else {
        fail(`${sampleId}: unsupported route_type ${routePoint.route_type}`)
      }
    }
  }

  if (!hasUnderWidthPowerCopper) {
    fail(`${sampleId}: expected at least one under-width power segment`)
  }

  for (const obstacle of sample.obstacles) {
    if (obstacle.type !== "rect")
      fail(`${sampleId}: obstacles must be rectangles`)
    assertPositiveNumber(obstacle.width, "obstacle width", sampleId)
    assertPositiveNumber(obstacle.height, "obstacle height", sampleId)
    if (!Array.isArray(obstacle.layers) || obstacle.layers.length === 0) {
      fail(`${sampleId}: obstacles require at least one layer`)
    }
    if (!Array.isArray(obstacle.connectedTo)) {
      fail(`${sampleId}: obstacle connectedTo must be an array`)
    }
  }

  validateBounds(sample)
}

if (manifest.manifestVersion !== 1) fail("Unsupported manifestVersion")
if (manifest.datasetName !== "dataset-srj27-power-traces") {
  fail("Unexpected datasetName")
}
if (!Array.isArray(manifest.samples) || manifest.samples.length === 0) {
  fail("Manifest must include samples")
}

const sampleIds = new Set()
const sampleFiles = new Set()
for (const [sampleIndex, manifestSample] of manifest.samples.entries()) {
  const expectedSampleId = `sample${String(sampleIndex + 1).padStart(3, "0")}`
  if (manifestSample.sampleId !== expectedSampleId) {
    fail(`Expected ${expectedSampleId}, received ${manifestSample.sampleId}`)
  }
  if (sampleIds.has(manifestSample.sampleId))
    fail(`Duplicate ${manifestSample.sampleId}`)
  if (sampleFiles.has(manifestSample.file))
    fail(`Duplicate ${manifestSample.file}`)
  sampleIds.add(manifestSample.sampleId)
  sampleFiles.add(manifestSample.file)

  const samplePath = resolve(repositoryDirectory, manifestSample.file)
  if (!existsSync(samplePath))
    fail(`${manifestSample.sampleId}: missing ${manifestSample.file}`)
  const sample = JSON.parse(readFileSync(samplePath, "utf8"))
  if (packageExports[manifestSample.sampleId] === undefined) {
    fail(`${manifestSample.sampleId}: missing index.js export`)
  }
  validateSample(sample, manifestSample)
}

if (existsSync(resolve(repositoryDirectory, "index.ts"))) {
  fail("Dataset packages must not contain index.ts")
}

console.log(
  `Validated ${manifest.samples.length} post-routing power-trace samples`,
)
