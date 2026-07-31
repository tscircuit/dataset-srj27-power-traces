import type { SimpleRouteJson, SimplifiedPcbTrace } from "@tscircuit/core"
import { BaseSolver } from "@tscircuit/solver-utils"

export interface PowerTraceExpanderOptions {
  onlyConnectionNames?: readonly string[]
  powerTraceToPadClearance?: number
}

export declare class PowerTraceExpanderSolver extends BaseSolver {
  constructor(
    simpleRouteJson: SimpleRouteJson,
    options?: PowerTraceExpanderOptions,
  )

  getOutput(): SimplifiedPcbTrace[]
}
