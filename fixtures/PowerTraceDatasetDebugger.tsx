import type { SimpleRouteJson } from "tscircuit"
import { PowerTraceExpanderSolver } from "@tscircuit/power-trace-expander"
import { GenericSolverDebugger } from "@tscircuit/solver-utils/react"
import { useMemo } from "react"
import { getPowerTraceGraphics } from "./getPowerTraceGraphics"

class LayerAwarePowerTraceExpanderSolver extends PowerTraceExpanderSolver {
  constructor(private readonly visualizationProblem: SimpleRouteJson) {
    super(structuredClone(visualizationProblem))
  }

  override visualize() {
    return getPowerTraceGraphics({
      problem: this.visualizationProblem,
      traces: this.getOutput(),
    })
  }
}

export const PowerTraceDatasetDebugger = ({
  problem,
  animationSpeed = 30,
}: {
  problem: SimpleRouteJson
  animationSpeed?: number
}) => {
  const metadata = (
    problem as SimpleRouteJson & {
      metadata?: {
        title?: string
        application?: string
        source?: string
        powerNets?: Array<{
          net: string
          voltage: number
          maxCurrentA: number
          nominalTraceWidthMm: number
        }>
      }
    }
  ).metadata
  const solver = useMemo(
    () => new LayerAwarePowerTraceExpanderSolver(problem),
    [problem],
  )

  return (
    <main
      style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#172033" }}
    >
      <section
        style={{
          display: "grid",
          gap: 12,
          padding: 18,
          borderBottom: "1px solid #dbe3ef",
          background: "linear-gradient(135deg, #f7faff, #eef5ff)",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>{metadata?.title}</h1>
          <p style={{ margin: "6px 0 0", maxWidth: 900 }}>
            {metadata?.application}
          </p>
          <code style={{ fontSize: 12 }}>{metadata?.source}</code>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {metadata?.powerNets?.map((rail) => (
            <div
              key={rail.net}
              style={{
                minWidth: 150,
                padding: "8px 10px",
                border: "1px solid #c8d7eb",
                borderRadius: 8,
                background: "white",
              }}
            >
              <strong>{rail.net}</strong>
              <div style={{ fontSize: 13, marginTop: 3 }}>
                {rail.voltage} V · {rail.maxCurrentA} A ·{" "}
                {rail.nominalTraceWidthMm} mm
              </div>
            </div>
          ))}
        </div>
      </section>
      <GenericSolverDebugger solver={solver} animationSpeed={animationSpeed} />
    </main>
  )
}
