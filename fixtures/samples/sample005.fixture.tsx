import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample005-pad-clearance.srj.json"

export default function PadClearanceFixture() {
  return (
    <PowerTraceDatasetDebugger
      problem={sample as unknown as SimpleRouteJson}
      animationSpeed={8}
    />
  )
}
