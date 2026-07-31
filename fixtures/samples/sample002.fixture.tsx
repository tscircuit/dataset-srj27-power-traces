import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample002-intermediate-width-channel.srj.json"

export default function IntermediateWidthChannelFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
