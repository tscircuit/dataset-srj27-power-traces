import type { SimpleRouteJson } from "@tscircuit/core"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample006-same-net-aliases.srj.json"

export default function SameNetAliasesFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
