import { SmdUsbC } from "@tsci/seveibar.smd-usb-c"
import { AP2112K_3V3, TP4056 } from "../components/RealPowerComponents"
import type { PowerTraceSampleMetadata } from "./types"

export const sampleMetadata: PowerTraceSampleMetadata = {
  title: "USB-C single-cell Li-ion charger and sensor supply",
  application:
    "A 1 A TP4056 charger with an exposed-pad footprint, battery connector, charge LEDs, and a battery-fed AP2112K sensor rail.",
  tags: ["usb_c", "li_ion", "charger", "ldo"],
  powerNets: [
    {
      net: "USB_5V",
      voltage: 5,
      maxCurrentA: 1,
      nominalTraceWidthMm: 0.9,
      purpose: "USB-C input and charger supply",
    },
    {
      net: "BAT_4V2",
      voltage: 4.2,
      maxCurrentA: 1,
      nominalTraceWidthMm: 0.9,
      purpose: "Charge path and battery output",
    },
    {
      net: "V3V3_LOAD",
      voltage: 3.3,
      maxCurrentA: 0.5,
      nominalTraceWidthMm: 0.6,
      purpose: "Regulated sensor/load output",
    },
    {
      net: "GND",
      voltage: 0,
      maxCurrentA: 1,
      nominalTraceWidthMm: 0.9,
      purpose: "Charge and load return",
    },
  ],
}

export default () => (
  <board
    width="58mm"
    height="34mm"
    layers={2}
    routingDisabled
    schematicDisabled
    minTraceWidth="0.15mm"
  >
    <net name="USB_5V" isPowerNet nominalTraceWidth="0.9mm" />
    <net name="BAT_4V2" isPowerNet nominalTraceWidth="0.9mm" />
    <net name="V3V3_LOAD" isPowerNet nominalTraceWidth="0.6mm" />
    <net name="GND" isGroundNet nominalTraceWidth="0.9mm" />

    <SmdUsbC name="J1" pcbX={-24} pcbY={0} pcbRotation={90} />
    <TP4056 name="U1" pcbX={-5} pcbY={2} />
    <AP2112K_3V3 name="U2" pcbX={10} pcbY={3} pcbRotation={90} />
    <pinheader
      name="J2"
      pinCount={2}
      pitch="2mm"
      footprint="pinrow2_p2mm_id0.9mm_od1.8mm"
      pcbX={24}
      pcbY={8}
    />
    <pinheader
      name="J3"
      pinCount={3}
      pitch="2.54mm"
      footprint="pinrow3"
      pcbX={22}
      pcbY={-8}
    />
    <resistor
      name="R1"
      resistance="1.2k"
      footprint="0603"
      pcbX={-7}
      pcbY={-8}
    />
    <resistor
      name="R2"
      resistance="5.1k"
      footprint="0603"
      pcbX={-20}
      pcbY={-8}
    />
    <resistor
      name="R3"
      resistance="5.1k"
      footprint="0603"
      pcbX={-15}
      pcbY={-8}
    />
    <resistor name="R4" resistance="1k" footprint="0603" pcbX={3} pcbY={9} />
    <resistor name="R5" resistance="1k" footprint="0603" pcbX={3} pcbY={-6} />
    <led name="D1" color="red" footprint="0603" pcbX={7} pcbY={9} />
    <led name="D2" color="green" footprint="0603" pcbX={7} pcbY={-6} />
    <capacitor
      name="C1"
      capacitance="10uF"
      footprint="1206"
      pcbX={-13}
      pcbY={8}
    />
    <capacitor
      name="C2"
      capacitance="10uF"
      footprint="1206"
      pcbX={3}
      pcbY={2}
    />
    <capacitor
      name="C3"
      capacitance="1uF"
      footprint="0805"
      pcbX={15}
      pcbY={3}
    />

    {[3, 4, 13, 14].map((pin) => (
      <trace
        key={`usb-${pin}`}
        from={`.J1 > .pin${pin}`}
        to="net.USB_5V"
        thickness="0.9mm"
      />
    ))}
    <trace from=".U1 > .VCC" to="net.USB_5V" thickness="0.9mm" />
    <trace from=".C1 > .pin1" to="net.USB_5V" thickness="0.9mm" />
    <trace from=".R4 > .pin1" to="net.USB_5V" thickness="0.25mm" />
    <trace from=".R5 > .pin1" to="net.USB_5V" thickness="0.25mm" />

    <trace from=".U1 > .BAT" to="net.BAT_4V2" thickness="0.9mm" />
    <trace from=".C2 > .pin1" to="net.BAT_4V2" thickness="0.9mm" />
    <trace from=".J2 > .pin1" to="net.BAT_4V2" thickness="0.9mm" />
    <trace from=".U2 > .VIN" to="net.BAT_4V2" thickness="0.9mm" />
    <trace from=".U2 > .EN" to="net.BAT_4V2" thickness="0.25mm" />
    <trace from=".U2 > .VOUT" to="net.V3V3_LOAD" thickness="0.6mm" />
    <trace from=".C3 > .pin1" to="net.V3V3_LOAD" thickness="0.6mm" />
    <trace from=".J3 > .pin1" to="net.V3V3_LOAD" thickness="0.6mm" />

    <trace from=".U1 > .PROG" to=".R1 > .pin1" thickness="0.15mm" />
    <trace from=".J1 > .CC1" to=".R2 > .pin1" thickness="0.15mm" />
    <trace from=".J1 > .CC2" to=".R3 > .pin1" thickness="0.15mm" />
    <trace from=".R4 > .pin2" to=".D1 > .pin1" thickness="0.15mm" />
    <trace from=".D1 > .pin2" to=".U1 > .CHRG" thickness="0.15mm" />
    <trace from=".R5 > .pin2" to=".D2 > .pin1" thickness="0.15mm" />
    <trace from=".D2 > .pin2" to=".U1 > .STDBY" thickness="0.15mm" />

    {[
      ".J1 > .pin1",
      ".J1 > .pin2",
      ".J1 > .pin15",
      ".J1 > .pin16",
      ".U1 > .GND",
      ".U1 > .TEMP",
      ".U1 > .CE",
      ".U2 > .GND",
      ".J2 > .pin2",
      ".J3 > .pin3",
      ".C1 > .pin2",
      ".C2 > .pin2",
      ".C3 > .pin2",
      ".R1 > .pin2",
      ".R2 > .pin2",
      ".R3 > .pin2",
    ].map((from) => (
      <trace key={from} from={from} to="net.GND" thickness="0.9mm" />
    ))}
  </board>
)
