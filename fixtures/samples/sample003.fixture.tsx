import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample003-signal-shove.srj.json"

export default function SignalShoveFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
