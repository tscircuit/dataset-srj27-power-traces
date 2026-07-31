import type { SimpleRouteJson } from "tscircuit"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample001-usbc-pico-power.srj.json"

export default function UsbCPicoPowerFixture() {
  return (
    <PowerTraceDatasetDebugger problem={sample as unknown as SimpleRouteJson} />
  )
}
