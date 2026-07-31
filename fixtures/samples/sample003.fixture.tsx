import type { SimpleRouteJson } from "tscircuit"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample003-pico-led-matrix.srj.json"

export default function PicoLedMatrixFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
