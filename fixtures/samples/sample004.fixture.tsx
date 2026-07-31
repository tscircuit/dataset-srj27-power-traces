import type { SimpleRouteJson } from "tscircuit"
import { PowerTraceDatasetDebugger } from "../PowerTraceDatasetDebugger"
import sample from "../../samples/sample004-usbc-lipo-charger.srj.json"

export default function UsbCLipoChargerFixture() {
  return (
    <PowerTraceDatasetDebugger
      problem={sample as unknown as SimpleRouteJson}
      animationSpeed={8}
    />
  )
}
