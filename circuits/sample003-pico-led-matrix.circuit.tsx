import { PICO_W } from "@tsci/seveibar.PICO_W/index.esm.js"
import { WS2812B_2020 } from "@tsci/seveibar.WS2812B_2020"
import type { PowerTraceSampleMetadata } from "./types"

export const sampleMetadata: PowerTraceSampleMetadata = {
  title: "Pico W twelve-pixel status panel",
  application:
    "A 5 V Pico W controller driving a 3 × 4 matrix of WS2812B-2020 pixels at a 720 mA worst-case white load.",
  tags: ["led_matrix", "ws2812", "pico_w", "multipoint_power"],
  powerNets: [
    {
      net: "V5_INPUT",
      voltage: 5,
      maxCurrentA: 1,
      nominalTraceWidthMm: 1,
      purpose: "Connector-to-fuse input",
    },
    {
      net: "V5_PIXELS",
      voltage: 5,
      maxCurrentA: 0.72,
      nominalTraceWidthMm: 0.85,
      purpose: "Distributed pixel and Pico supply",
    },
    {
      net: "GND",
      voltage: 0,
      maxCurrentA: 1,
      nominalTraceWidthMm: 1,
      purpose: "Pixel current return",
    },
  ],
}

const pixels = Array.from({ length: 12 }, (_, index) => ({
  name: `D${index + 1}`,
  x: 2 + (index % 4) * 9,
  y: 9 - Math.floor(index / 4) * 9,
}))

export default () => (
  <board
    width="84mm"
    height="58mm"
    layers={2}
    routingDisabled
    schematicDisabled
    minTraceWidth="0.15mm"
  >
    <net name="V5_INPUT" isPowerNet nominalTraceWidth="1mm" />
    <net name="V5_PIXELS" isPowerNet nominalTraceWidth="0.85mm" />
    <net name="GND" isGroundNet nominalTraceWidth="1mm" />

    <PICO_W name="U1" pcbX={-22} pcbY={0} pcbRotation={90} />
    <pinheader
      name="J1"
      pinCount={2}
      pitch="5.08mm"
      footprint="pinrow2_p5.08mm_id1.3mm_od2.5mm"
      pcbX={-38}
      pcbY={22}
    />
    <fuse name="F1" currentRating="1A" footprint="1206" pcbX={-38} pcbY={12} />
    <capacitor
      name="C1"
      capacitance="220uF"
      footprint="1206"
      pcbX={-38}
      pcbY={2}
    />

    {pixels.map(({ name, x, y }) => (
      <WS2812B_2020 key={name} name={name} pcbX={x} pcbY={y} />
    ))}

    <trace from=".J1 > .pin1" to="net.V5_INPUT" thickness="1mm" />
    <trace from=".F1 > .pin1" to="net.V5_INPUT" thickness="1mm" />
    <trace from=".F1 > .pin2" to="net.V5_PIXELS" thickness="0.85mm" />
    <trace from=".C1 > .pin1" to="net.V5_PIXELS" thickness="0.85mm" />
    <trace from=".U1 > .VBUS" to="net.V5_PIXELS" thickness="0.85mm" />
    {pixels.map(({ name }) => (
      <trace
        key={`${name}-vdd`}
        from={`.${name} > .VDD`}
        to="net.V5_PIXELS"
        thickness="0.85mm"
      />
    ))}

    <trace from=".U1 > .pin9" to=".D1 > .DI" thickness="0.15mm" />
    {pixels.slice(0, -1).map(({ name }, index) => (
      <trace
        key={`${name}-data`}
        from={`.${name} > .DO`}
        to={`.${pixels[index + 1].name} > .DI`}
        thickness="0.15mm"
      />
    ))}

    {[
      ".J1 > .pin2",
      ".C1 > .pin2",
      ".U1 > .GND1",
      ".U1 > .GND2",
      ...pixels.map(({ name }) => `.${name} > .GND`),
    ].map((from) => (
      <trace key={from} from={from} to="net.GND" thickness="1mm" />
    ))}
  </board>
)
