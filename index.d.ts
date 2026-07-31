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

export interface SimpleRouteConnectionPoint {
  x: number
  y: number
  layer?: string
  layers?: string[]
  pointId?: string
  pcb_port_id?: string
}

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

export interface PowerNetRequirement {
  net: string
  connectionName: string
  voltage: number
  maxCurrentA: number
  nominalTraceWidthMm: number
  purpose: string
}

export interface GeneratedSampleMetadata {
  source: string
  title: string
  application: string
  tags: string[]
  powerNets: PowerNetRequirement[]
  generation: {
    circuitJsonToSrj: "getSimpleRouteJsonFromCircuitJson"
    baseAutorouter: "@tscircuit/capacity-autorouter"
    baseRouteWidthMm: number
    normalizedAfterBaseRouting: true
  }
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
  metadata: GeneratedSampleMetadata
}

export interface DatasetManifestSample {
  sampleId: string
  file: string
  source: string
  title: string
  origin: "tsx"
  tags: string[]
  powerNets: PowerNetRequirement[]
}

export interface DatasetManifest {
  manifestVersion: 2
  datasetName: "dataset-srj27-power-traces"
  format: "simple_route_json"
  sourceFormat: "tscircuit_tsx"
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
