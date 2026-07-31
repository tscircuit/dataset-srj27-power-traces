export interface RoutePointBase {
  x: number
  y: number
}

export interface WireRoutePoint extends RoutePointBase {
  route_type: "wire"
  width: number
  layer: string
}

export interface ViaRoutePoint extends RoutePointBase {
  route_type: "via"
  from_layer: string
  to_layer: string
  via_diameter?: number
  via_hole_diameter?: number
}

export type RoutePoint = WireRoutePoint | ViaRoutePoint

export interface SimplifiedPcbTrace {
  type: "pcb_trace"
  pcb_trace_id: string
  connection_name?: string
  source_trace_id?: string
  rootConnectionName?: string
  mergedConnectionNames?: string[]
  connectsTo?: string[]
  route: RoutePoint[]
}

export interface SimpleRouteConnectionPointBase {
  x: number
  y: number
  pointId?: string
  pcb_port_id?: string
}

export type SimpleRouteConnectionPoint =
  | (SimpleRouteConnectionPointBase & { layer: string })
  | (SimpleRouteConnectionPointBase & { layers: string[] })

export interface SimpleRouteConnection {
  name: string
  source_trace_id?: string
  rootConnectionName?: string
  mergedConnectionNames?: string[]
  netConnectionName?: string
  nominalTraceWidth: number
  width?: number
  pointsToConnect: SimpleRouteConnectionPoint[]
}

export interface SimpleRouteObstacle {
  obstacleId?: string
  componentId?: string
  type: "rect"
  layers: string[]
  center: { x: number; y: number }
  width: number
  height: number
  ccwRotationDegrees?: number
  connectedTo: string[]
  isCopperPour?: boolean
}

export interface SimpleRouteJson {
  id: string
  layerCount: number
  minTraceWidth: number
  nominalTraceWidth?: number
  minViaDiameter?: number
  minViaHoleDiameter?: number
  minViaPadDiameter?: number
  defaultObstacleMargin?: number
  minTraceToPadEdgeClearance?: number
  obstacles: SimpleRouteObstacle[]
  connections: SimpleRouteConnection[]
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  outline?: Array<{ x: number; y: number }>
  traces: SimplifiedPcbTrace[]
}

export interface DatasetManifestSample {
  sampleId: string
  file: string
  title: string
  origin: "synthetic" | "production"
  tags: string[]
  sourceUrl?: string
  sourceCommit?: string
  sourceLicense?: string
}

export interface DatasetManifest {
  manifestVersion: 1
  datasetName: "dataset-srj27-power-traces"
  format: "simple_route_json"
  pipelineStage: "post_routing_power_trace_expansion"
  primaryConsumer: "@tscircuit/power-trace-expander"
  samples: DatasetManifestSample[]
}

export const manifest: DatasetManifest
export const sample001: SimpleRouteJson
export const sample002: SimpleRouteJson
export const sample003: SimpleRouteJson
export const sample004: SimpleRouteJson
export const sample005: SimpleRouteJson
export const sample006: SimpleRouteJson

export const dataset: Record<string, SimpleRouteJson>
declare const defaultDataset: Record<string, SimpleRouteJson>
export default defaultDataset
