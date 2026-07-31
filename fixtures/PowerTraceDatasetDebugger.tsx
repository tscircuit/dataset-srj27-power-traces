import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceExpanderSolver } from "@tscircuit/power-trace-expander"
import { GenericSolverDebugger } from "@tscircuit/solver-utils/react"
import { useMemo } from "react"

export const PowerTraceDatasetDebugger = ({
  problem,
  animationSpeed = 30,
}: {
  problem: SimpleRouteJson
  animationSpeed?: number
}) => {
  const solver = useMemo(
    () => new PowerTraceExpanderSolver(structuredClone(problem)),
    [problem],
  )

  return (
    <GenericSolverDebugger solver={solver} animationSpeed={animationSpeed} />
  )
}
