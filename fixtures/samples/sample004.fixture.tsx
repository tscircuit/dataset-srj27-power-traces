import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample004-multilayer-necking.srj.json"

export default function MultilayerNeckingFixture() {
  return (
    <PowerTraceDatasetDebugger
      problem={sample as unknown as SimpleRouteJson}
      animationSpeed={8}
    />
  )
}
