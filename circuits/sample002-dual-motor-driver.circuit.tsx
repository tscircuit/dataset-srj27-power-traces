import { MotorDriver } from "@tsci/imrishabh18.TB6612FNG/index.esm.js"
import type { PowerTraceSampleMetadata } from "./types"

export const sampleMetadata: PowerTraceSampleMetadata = {
  title: "TB6612FNG dual brushed-motor controller",
  application:
    "A 12 V dual H-bridge board with two 1.2 A motor channels, bulk bypassing, and 3.3 V control logic.",
  tags: ["motor_driver", "h_bridge", "12v", "high_current"],
  powerNets: [
    {
      net: "VM_12V",
      voltage: 12,
      maxCurrentA: 2.4,
      nominalTraceWidthMm: 1.6,
      purpose: "Shared H-bridge motor supply",
    },
    ...["MOTOR_A1", "MOTOR_A2", "MOTOR_B1", "MOTOR_B2"].map((net) => ({
      net,
      voltage: 12,
      maxCurrentA: 1.2,
      nominalTraceWidthMm: 1.1,
      purpose: "Switched motor phase",
    })),
    {
      net: "VCC_3V3",
      voltage: 3.3,
      maxCurrentA: 0.1,
      nominalTraceWidthMm: 0.35,
      purpose: "Driver logic supply",
    },
    {
      net: "GND",
      voltage: 0,
      maxCurrentA: 2.4,
      nominalTraceWidthMm: 1.6,
      purpose: "Motor and logic return",
    },
  ],
}

const motorOutputs = [
  { net: "MOTOR_A1", terminal: ".J2 > .pin1", driverPins: [1, 2] },
  { net: "MOTOR_A2", terminal: ".J2 > .pin2", driverPins: [5, 6] },
  { net: "MOTOR_B2", terminal: ".J3 > .pin1", driverPins: [7, 8] },
  { net: "MOTOR_B1", terminal: ".J3 > .pin2", driverPins: [11, 12] },
]

export default () => (
  <board
    width="58mm"
    height="38mm"
    layers={2}
    routingDisabled
    schematicDisabled
    minTraceWidth="0.15mm"
  >
    <net name="VM_12V" isPowerNet nominalTraceWidth="1.6mm" />
    <net name="MOTOR_A1" isPowerNet nominalTraceWidth="1.1mm" />
    <net name="MOTOR_A2" isPowerNet nominalTraceWidth="1.1mm" />
    <net name="MOTOR_B1" isPowerNet nominalTraceWidth="1.1mm" />
    <net name="MOTOR_B2" isPowerNet nominalTraceWidth="1.1mm" />
    <net name="VCC_3V3" isPowerNet nominalTraceWidth="0.35mm" />
    <net name="GND" isGroundNet nominalTraceWidth="1.6mm" />

    <pinheader
      name="J1"
      pinCount={2}
      pitch="5.08mm"
      footprint="pinrow2_p5.08mm_id1.3mm_od2.5mm"
      pcbX={-24}
      pcbY={10}
    />
    <pinheader
      name="J2"
      pinCount={2}
      pitch="5.08mm"
      footprint="pinrow2_p5.08mm_id1.3mm_od2.5mm"
      pcbX={24}
      pcbY={10}
    />
    <pinheader
      name="J3"
      pinCount={2}
      pitch="5.08mm"
      footprint="pinrow2_p5.08mm_id1.3mm_od2.5mm"
      pcbX={24}
      pcbY={-10}
    />
    <pinheader
      name="J4"
      pinCount={8}
      pitch="2.54mm"
      footprint="pinrow8"
      pcbX={-24}
      pcbY={-7}
      pcbRotation={90}
    />
    <MotorDriver name="U1" pcbX={3} pcbY={0} />
    <capacitor
      name="C1"
      capacitance="100uF"
      footprint="1206"
      pcbX={-13}
      pcbY={8}
    />
    <capacitor
      name="C2"
      capacitance="100nF"
      footprint="0603"
      pcbX={-7}
      pcbY={8}
    />
    <capacitor
      name="C3"
      capacitance="100nF"
      footprint="0603"
      pcbX={-7}
      pcbY={-8}
    />

    <trace from=".J1 > .pin1" to="net.VM_12V" thickness="1.6mm" />
    <trace from=".C1 > .pin1" to="net.VM_12V" thickness="1.6mm" />
    <trace from=".C2 > .pin1" to="net.VM_12V" thickness="1.6mm" />
    {[13, 14, 24].map((pin) => (
      <trace
        key={`vm-${pin}`}
        from={`.U1 > .pin${pin}`}
        to="net.VM_12V"
        thickness="1.6mm"
      />
    ))}

    {motorOutputs.flatMap(({ net, terminal, driverPins }) => [
      <trace
        key={`${net}-terminal`}
        from={terminal}
        to={`net.${net}`}
        thickness="1.1mm"
      />,
      ...driverPins.map((pin) => (
        <trace
          key={`${net}-${pin}`}
          from={`.U1 > .pin${pin}`}
          to={`net.${net}`}
          thickness="1.1mm"
        />
      )),
    ])}

    <trace from=".J4 > .pin1" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".U1 > .pin20" to="net.VCC_3V3" thickness="0.35mm" />
    <trace from=".C3 > .pin1" to="net.VCC_3V3" thickness="0.35mm" />
    {[23, 21, 22, 19, 17, 16, 15].map((pin, index) => (
      <trace
        key={`logic-${pin}`}
        from={`.J4 > .pin${index + 2}`}
        to={`.U1 > .pin${pin}`}
        thickness="0.15mm"
      />
    ))}

    {[
      ".J1 > .pin2",
      ".C1 > .pin2",
      ".C2 > .pin2",
      ".C3 > .pin2",
      ".U1 > .pin3",
      ".U1 > .pin4",
      ".U1 > .pin9",
      ".U1 > .pin10",
      ".U1 > .pin18",
    ].map((from) => (
      <trace key={from} from={from} to="net.GND" thickness="1.6mm" />
    ))}
  </board>
)
