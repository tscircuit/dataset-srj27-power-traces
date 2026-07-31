import { SmdUsbC } from "@tsci/seveibar.smd-usb-c"
import { PICO_W } from "@tsci/seveibar.PICO_W/index.esm.js"
import { AP2112K_3V3 } from "../components/RealPowerComponents"
import type { PowerTraceSampleMetadata } from "./types"

export const sampleMetadata: PowerTraceSampleMetadata = {
  title: "USB-C Pico W controller with auxiliary 3.3 V rail",
  application:
    "A USB-C powered Pico W controller feeding a protected 5 V module rail and a 600 mA AP2112K auxiliary rail.",
  tags: ["usb_c", "pico_w", "ldo", "mixed_signal"],
  powerNets: [
    {
      net: "VBUS_RAW",
      voltage: 5,
      maxCurrentA: 1.5,
      nominalTraceWidthMm: 1.2,
      purpose: "USB-C receptacle to input fuse",
    },
    {
      net: "V5_PROTECTED",
      voltage: 5,
      maxCurrentA: 1.2,
      nominalTraceWidthMm: 1,
      purpose: "Protected controller and regulator input rail",
    },
    {
      net: "V3V3_AUX",
      voltage: 3.3,
      maxCurrentA: 0.6,
      nominalTraceWidthMm: 0.65,
      purpose: "Auxiliary sensor rail from AP2112K",
    },
    {
      net: "GND",
      voltage: 0,
      maxCurrentA: 1.5,
      nominalTraceWidthMm: 1.2,
      purpose: "Power return",
    },
  ],
}

export default () => (
  <board
    width="84mm"
    height="42mm"
    layers={2}
    routingDisabled
    schematicDisabled
    minTraceWidth="0.15mm"
  >
    <net name="VBUS_RAW" isPowerNet nominalTraceWidth="1.2mm" />
    <net name="V5_PROTECTED" isPowerNet nominalTraceWidth="1mm" />
    <net name="V3V3_AUX" isPowerNet nominalTraceWidth="0.65mm" />
    <net name="GND" isGroundNet nominalTraceWidth="1.2mm" />

    <SmdUsbC name="J1" pcbX={-36} pcbY={0} pcbRotation={90} />
    <fuse name="F1" footprint="1206" currentRating="1.5A" pcbX={-29} pcbY={9} />
    <capacitor
      name="C1"
      capacitance="10uF"
      footprint="1206"
      pcbX={-24}
      pcbY={14}
    />
    <AP2112K_3V3 name="U1" pcbX={-20} pcbY={7} pcbRotation={90} />
    <capacitor
      name="C2"
      capacitance="1uF"
      footprint="0805"
      pcbX={-15}
      pcbY={11}
    />
    <capacitor
      name="C3"
      capacitance="1uF"
      footprint="0805"
      pcbX={-15}
      pcbY={4}
    />
    <PICO_W name="U2" pcbX={14} pcbY={0} pcbRotation={0} />
    <pinheader
      name="J2"
      pinCount={4}
      pitch="2.54mm"
      footprint="pinrow4"
      pcbX={-20}
      pcbY={-13}
      pcbRotation={90}
    />
    <resistor
      name="R1"
      resistance="5.1k"
      footprint="0603"
      pcbX={-31}
      pcbY={-10}
    />
    <resistor
      name="R2"
      resistance="5.1k"
      footprint="0603"
      pcbX={-26}
      pcbY={-10}
    />

    <trace from=".J1 > .pin3" to="net.VBUS_RAW" thickness="1.2mm" />
    <trace from=".J1 > .pin4" to="net.VBUS_RAW" thickness="1.2mm" />
    <trace from=".J1 > .pin13" to="net.VBUS_RAW" thickness="1.2mm" />
    <trace from=".J1 > .pin14" to="net.VBUS_RAW" thickness="1.2mm" />
    <trace from=".F1 > .pin1" to="net.VBUS_RAW" thickness="1.2mm" />
    <trace from=".F1 > .pin2" to="net.V5_PROTECTED" thickness="1mm" />
    <trace from=".C1 > .pin1" to="net.V5_PROTECTED" thickness="1mm" />
    <trace from=".C2 > .pin1" to="net.V5_PROTECTED" thickness="1mm" />
    <trace from=".U1 > .VIN" to="net.V5_PROTECTED" thickness="1mm" />
    <trace from=".U1 > .EN" to="net.V5_PROTECTED" thickness="0.25mm" />
    <trace from=".U2 > .VBUS" to="net.V5_PROTECTED" thickness="1mm" />
    <trace from=".U1 > .VOUT" to="net.V3V3_AUX" thickness="0.65mm" />
    <trace from=".C3 > .pin1" to="net.V3V3_AUX" thickness="0.65mm" />
    <trace from=".J2 > .pin1" to="net.V3V3_AUX" thickness="0.65mm" />
    <trace from=".J2 > .pin3" to=".U2 > .pin1" thickness="0.15mm" />
    <trace from=".J2 > .pin4" to=".U2 > .pin2" thickness="0.15mm" />
    <trace from=".J1 > .pin6" to=".R1 > .pin1" thickness="0.15mm" />
    <trace from=".J1 > .pin12" to=".R2 > .pin1" thickness="0.15mm" />

    {[
      ".J1 > .pin1",
      ".J1 > .pin2",
      ".J1 > .pin15",
      ".J1 > .pin16",
      ".C1 > .pin2",
      ".C2 > .pin2",
      ".C3 > .pin2",
      ".U1 > .GND",
      ".U2 > .GND1",
      ".U2 > .GND2",
      ".J2 > .pin2",
      ".R1 > .pin2",
      ".R2 > .pin2",
    ].map((from) => (
      <trace key={from} from={from} to="net.GND" thickness="1.2mm" />
    ))}
  </board>
)
