import { convertSrjToGraphicsObject } from "@tscircuit/capacity-autorouter"
import type { SimpleRouteJson, SimplifiedPcbTrace } from "tscircuit"

export const getPowerTraceGraphics = ({
  problem,
  traces,
}: {
  problem: SimpleRouteJson
  traces: SimplifiedPcbTrace[]
}) => {
  const visualizationSrj = {
    ...problem,
    traces,
  } as Parameters<typeof convertSrjToGraphicsObject>[0]

  return {
    ...convertSrjToGraphicsObject(visualizationSrj, {
      traceColorMode: "layer",
    }),
    coordinateSystem: "cartesian" as const,
    title: "Power trace expansion by PCB layer",
  }
}
