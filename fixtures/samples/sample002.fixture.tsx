import type { SimpleRouteJson } from "tscircuit"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample002-dual-motor-driver.srj.json"

export default function DualMotorDriverFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
