import type { SimpleRouteJson } from "tscircuit"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample005-pt4115-led-driver.srj.json"

export default function Pt4115LedDriverFixture() {
  return (
    <PowerTraceDatasetDebugger
      problem={sample as unknown as SimpleRouteJson}
      animationSpeed={8}
    />
  )
}
