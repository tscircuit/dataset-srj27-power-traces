import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample001-straight-underwidth.srj.json"

export default function StraightUnderwidthFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
