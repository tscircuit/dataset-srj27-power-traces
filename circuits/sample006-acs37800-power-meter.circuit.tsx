import { ACS37800 } from "../components/RealPowerComponents"
import type { PowerTraceSampleMetadata } from "./types"

export const sampleMetadata: PowerTraceSampleMetadata = {
  title: "ACS37800 12 V / 5 A power monitor",
  application:
    "An inline 12 V current and voltage monitor with 5 A terminal pass-through, a 51:1 voltage-sense divider, local 3.3 V decoupling, and dual I2C headers.",
  tags: ["power_meter", "current_sensor", "12v", "i2c", "high_current"],
  powerNets: [
    {
      net: "POWER_IN_12V",
      voltage: 12,
      maxCurrentA: 5,
      nominalTraceWidthMm: 2.2,
      purpose: "Input terminal to current-sense conductor",
    },
    {
      net: "POWER_OUT_12V",
      voltage: 12,
      maxCurrentA: 5,
      nominalTraceWidthMm: 2.2,
      purpose: "Current-sense conductor to output terminal",
    },
    {
      net: "VCC_3V3",
      voltage: 3.3,
      maxCurrentA: 0.1,
      nominalTraceWidthMm: 0.35,
      purpose: "Sensor and I2C supply",
    },
    {
      net: "GND",
      voltage: 0,
      maxCurrentA: 0.1,
      nominalTraceWidthMm: 0.35,
      purpose: "Logic return",
    },
  ],
}

export default () => (
  <board
    width="68mm"
    height="34mm"
    layers={2}
    routingDisabled
    schematicDisabled
    minTraceWidth="0.15mm"
  >
    <net name="POWER_IN_12V" isPowerNet nominalTraceWidth="2.2mm" />
    <net name="POWER_OUT_12V" isPowerNet nominalTraceWidth="2.2mm" />
    <net name="VCC_3V3" isPowerNet nominalTraceWidth="0.35mm" />
    <net name="GND" isGroundNet nominalTraceWidth="0.35mm" />

    <pinheader
      name="J1"
      pinCount={2}
      pitch="5.08mm"
      footprint="pinrow2_p5.08mm_id1.3mm_od2.5mm"
      pcbX={-28}
      pcbY={0}
    />
    <pinheader
      name="J2"
      pinCount={2}
      pitch="5.08mm"
      footprint="pinrow2_p5.08mm_id1.3mm_od2.5mm"
      pcbX={28}
      pcbY={0}
    />
    <ACS37800 name="U1" pcbX={0} pcbY={0} pcbRotation={90} />
    <pinheader
      name="J3"
      pinCount={4}
      pitch="1mm"
      footprint="pinrow4_p1mm_id0.5mm_od0.9mm"
      pcbX={-15}
      pcbY={11}
    />
    <pinheader
      name="J4"
      pinCount={4}
      pitch="1mm"
      footprint="pinrow4_p1mm_id0.5mm_od0.9mm"
      pcbX={15}
      pcbY={11}
    />
    <capacitor
      name="C1"
      capacitance="100nF"
      footprint="0603"
      pcbX={-6}
      pcbY={8}
    />
    <resistor
      name="R1"
      resistance="2.2k"
      footprint="0603"
      pcbX={-8}
      pcbY={-8}
    />
    <resistor name="R2" resistance="2.2k" footprint="0603" pcbX={8} pcbY={-8} />
    <resistor name="R3" resistance="51k" footprint="0603" pcbX={-8} pcbY={3} />
    <resistor name="R4" resistance="1k" footprint="0603" pcbX={8} pcbY={3} />

    <trace from=".J1 > .pin1" to="net.POWER_IN_12V" thickness="2.2mm" />
    {[1, 2, 3, 4].map((pin) => (
      <trace
        key={`ip-plus-${pin}`}
        from={`.U1 > .IP_PLUS_${pin}`}
        to="net.POWER_IN_12V"
        thickness="2.2mm"
      />
    ))}
    {[1, 2, 3, 4].map((pin) => (
      <trace
        key={`ip-minus-${pin}`}
        from={`.U1 > .IP_MINUS_${pin}`}
        to="net.POWER_OUT_12V"
        thickness="2.2mm"
      />
    ))}
    <trace from=".J2 > .pin1" to="net.POWER_OUT_12V" thickness="2.2mm" />

    <trace from=".U1 > .VCC" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".C1 > .pin1" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".R1 > .pin1" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".R2 > .pin1" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".J3 > .pin2" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".J4 > .pin2" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".U1 > .SDA" to=".J3 > .pin3" thickness="0.15mm" />
    <trace from=".U1 > .SDA" to=".J4 > .pin3" thickness="0.15mm" />
    <trace from=".U1 > .SCL" to=".J3 > .pin4" thickness="0.15mm" />
    <trace from=".U1 > .SCL" to=".J4 > .pin4" thickness="0.15mm" />
    <trace from=".R1 > .pin2" to=".U1 > .SDA" thickness="0.15mm" />
    <trace from=".R2 > .pin2" to=".U1 > .SCL" thickness="0.15mm" />
    <trace from=".R3 > .pin1" to="net.POWER_IN_12V" thickness="0.15mm" />
    <trace from=".R3 > .pin2" to=".U1 > .VINP" thickness="0.15mm" />
    <trace from=".R4 > .pin1" to=".U1 > .VINP" thickness="0.15mm" />

    {[
      ".J1 > .pin2",
      ".J2 > .pin2",
      ".J3 > .pin1",
      ".J4 > .pin1",
      ".U1 > .GND",
      ".U1 > .VINN",
      ".C1 > .pin2",
      ".R4 > .pin2",
    ].map((from) => (
      <trace key={from} from={from} to="net.GND" thickness="0.35mm" />
    ))}
  </board>
)
