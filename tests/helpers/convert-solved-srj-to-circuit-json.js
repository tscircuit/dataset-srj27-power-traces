import path from "node:path"
import { pathToFileURL } from "node:url"
import * as React from "react"
import { RootCircuit } from "tscircuit"

// Older registry packages use the classic JSX runtime and resolve React from
// the global object when the authored circuit is rendered in this test.
Object.assign(globalThis, { React })

const getBoardLayers = (layerCount) => {
  if (layerCount === 1) return ["top"]
  return [
    "top",
    ...Array.from(
      { length: layerCount - 2 },
      (_, index) => `inner${index + 1}`,
    ),
    "bottom",
  ]
}

const getViaLayers = (fromLayer, toLayer, boardLayers) => {
  const fromIndex = boardLayers.indexOf(fromLayer)
  const toIndex = boardLayers.indexOf(toLayer)
  if (fromIndex === -1 || toIndex === -1) {
    throw new Error(`invalid via span ${fromLayer} to ${toLayer}`)
  }
  return boardLayers.slice(
    Math.min(fromIndex, toIndex),
    Math.max(fromIndex, toIndex) + 1,
  )
}

const renderSourceCircuit = async (sourcePath) => {
  const absoluteSourcePath = path.resolve(sourcePath)
  const moduleUrl = `${pathToFileURL(absoluteSourcePath).href}?drc=${Date.now()}`
  const circuitModule = await import(moduleUrl)
  const circuit = new RootCircuit()
  circuit.schematicDisabled = true
  circuit.add(React.createElement(circuitModule.default))
  await circuit.renderUntilSettled()

  const circuitJson = circuit.getCircuitJson()
  const renderErrors = circuitJson.filter((element) =>
    element.type.endsWith("_error"),
  )
  if (renderErrors.length > 0) {
    throw new Error(
      `${sourcePath} rendered with errors: ${renderErrors
        .map((error) => error.message)
        .join("; ")}`,
    )
  }
  return circuitJson
}

export const convertSolvedSrjToCircuitJson = async ({
  sourcePath,
  solvedTraces,
}) => {
  const sourceCircuitJson = await renderSourceCircuit(sourcePath)
  const board = sourceCircuitJson.find(
    (element) => element.type === "pcb_board",
  )
  if (!board) throw new Error(`${sourcePath} did not render a pcb_board`)
  const boardLayers = getBoardLayers(board.num_layers)
  const routedElements = []

  for (const [traceIndex, trace] of solvedTraces.entries()) {
    const connectionName =
      trace.connection_name ?? trace.source_trace_id ?? trace.pcb_trace_id
    const sourceConnection = sourceCircuitJson.find(
      (element) =>
        (element.type === "source_trace" &&
          element.source_trace_id === connectionName) ||
        (element.type === "source_net" &&
          element.source_net_id === connectionName),
    )
    if (!sourceConnection) {
      throw new Error(
        `${sourcePath}: ${trace.pcb_trace_id} has unknown connection ${connectionName}`,
      )
    }

    const route = trace.route.map((point) =>
      point.route_type === "via"
        ? {
            route_type: "via",
            x: point.x,
            y: point.y,
            from_layer: point.from_layer,
            to_layer: point.to_layer,
            outer_diameter:
              point.via_diameter ??
              point.outer_diameter ??
              board.min_via_pad_diameter,
            hole_diameter:
              point.via_hole_diameter ??
              point.hole_diameter ??
              board.min_via_hole_diameter,
          }
        : { ...point },
    )

    const firstWire = route.find((point) => point.route_type === "wire")
    const lastWire = route.findLast((point) => point.route_type === "wire")
    const [startPcbPortId, endPcbPortId] = trace.connectsTo ?? []
    if (firstWire && startPcbPortId?.startsWith("pcb_port_")) {
      firstWire.start_pcb_port_id = startPcbPortId
    }
    if (lastWire && endPcbPortId?.startsWith("pcb_port_")) {
      lastWire.end_pcb_port_id = endPcbPortId
    }

    routedElements.push({
      type: "pcb_trace",
      pcb_trace_id: trace.pcb_trace_id,
      source_trace_id: connectionName,
      subcircuit_id: sourceConnection.subcircuit_id,
      route,
    })

    for (const [pointIndex, point] of route.entries()) {
      if (point.route_type !== "via") continue
      routedElements.push({
        type: "pcb_via",
        pcb_via_id: `drc_via_${traceIndex}_${pointIndex}`,
        pcb_trace_id: trace.pcb_trace_id,
        subcircuit_id: sourceConnection.subcircuit_id,
        subcircuit_connectivity_map_key:
          sourceConnection.subcircuit_connectivity_map_key,
        x: point.x,
        y: point.y,
        outer_diameter: point.outer_diameter,
        hole_diameter: point.hole_diameter,
        from_layer: point.from_layer,
        to_layer: point.to_layer,
        layers: getViaLayers(point.from_layer, point.to_layer, boardLayers),
      })
    }
  }

  return [
    ...sourceCircuitJson.filter(
      (element) => element.type !== "pcb_trace" && element.type !== "pcb_via",
    ),
    ...routedElements,
  ]
}
