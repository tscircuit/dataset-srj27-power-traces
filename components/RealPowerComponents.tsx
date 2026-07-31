import type { ChipProps } from "@tscircuit/props"
import { Fragment } from "react"

const ap2112PinLabels = {
  pin1: ["VIN"],
  pin2: ["GND"],
  pin3: ["EN"],
  pin4: ["NC"],
  pin5: ["VOUT"],
} as const

export const AP2112K_3V3 = (props: ChipProps<typeof ap2112PinLabels>) => (
  <chip
    pinLabels={ap2112PinLabels}
    manufacturerPartNumber="AP2112K-3.3TRG1"
    supplierPartNumbers={{ jlcpcb: ["C51118"] }}
    footprint="sot23_5"
    {...props}
  />
)

const tp4056PinLabels = {
  pin1: ["TEMP"],
  pin2: ["PROG"],
  pin3: ["GND", "EP"],
  pin4: ["VCC"],
  pin5: ["BAT"],
  pin6: ["STDBY"],
  pin7: ["CHRG"],
  pin8: ["CE"],
} as const

const tp4056Pads = [1, 2, 3, 4].flatMap((pin, index) => {
  const y = 1.905 - index * 1.27
  return [
    <Fragment key={`tp4056-left-${pin}`}>
      <smtpad
        portHints={[`pin${pin}`]}
        pcbX={-2.55}
        pcbY={y}
        width="1.2mm"
        height="0.6mm"
        shape="rect"
      />
    </Fragment>,
    <Fragment key={`tp4056-right-${9 - pin}`}>
      <smtpad
        portHints={[`pin${9 - pin}`]}
        pcbX={2.55}
        pcbY={y}
        width="1.2mm"
        height="0.6mm"
        shape="rect"
      />
    </Fragment>,
  ]
})

export const TP4056 = (props: ChipProps<typeof tp4056PinLabels>) => (
  <chip
    pinLabels={tp4056PinLabels}
    manufacturerPartNumber="TP4056-42-ESOP8"
    supplierPartNumbers={{ jlcpcb: ["C16581"] }}
    footprint={
      <footprint>
        {tp4056Pads}
        <smtpad
          portHints={["pin3"]}
          pcbX={0}
          pcbY={0}
          width="2.4mm"
          height="3.2mm"
          shape="rect"
        />
        <silkscreenrect pcbX={0} pcbY={0} width="4mm" height="5.2mm" />
      </footprint>
    }
    {...props}
  />
)

const pt4115PinLabels = {
  pin1: ["SW"],
  pin2: ["GND"],
  pin3: ["DIM"],
  pin4: ["CSN"],
  pin5: ["VIN"],
} as const

export const PT4115 = (props: ChipProps<typeof pt4115PinLabels>) => (
  <chip
    pinLabels={pt4115PinLabels}
    manufacturerPartNumber="PT4115B89E"
    supplierPartNumbers={{ jlcpcb: ["C84512"] }}
    footprint="sot89_5"
    {...props}
  />
)

const acs37800PinLabels = {
  pin1: ["IP_PLUS_1"],
  pin2: ["IP_PLUS_2"],
  pin3: ["IP_PLUS_3"],
  pin4: ["IP_PLUS_4"],
  pin5: ["IP_MINUS_1"],
  pin6: ["IP_MINUS_2"],
  pin7: ["IP_MINUS_3"],
  pin8: ["IP_MINUS_4"],
  pin9: ["DIO_1"],
  pin10: ["DIO_0"],
  pin11: ["SCL"],
  pin12: ["SDA"],
  pin13: ["VCC"],
  pin14: ["GND"],
  pin15: ["VINN"],
  pin16: ["VINP"],
} as const

const acs37800Pads = Array.from({ length: 8 }, (_, index) => {
  const y = 4.445 - index * 1.27
  return [
    <Fragment key={`acs37800-left-${index + 1}`}>
      <smtpad
        portHints={[`pin${index + 1}`]}
        pcbX={-4.75}
        pcbY={y}
        width="2.25mm"
        height="0.65mm"
        shape="rect"
      />
    </Fragment>,
    <Fragment key={`acs37800-right-${16 - index}`}>
      <smtpad
        portHints={[`pin${16 - index}`]}
        pcbX={4.75}
        pcbY={y}
        width="2.25mm"
        height="0.65mm"
        shape="rect"
      />
    </Fragment>,
  ]
})

export const ACS37800 = (props: ChipProps<typeof acs37800PinLabels>) => (
  <chip
    pinLabels={acs37800PinLabels}
    manufacturerPartNumber="ACS37800KMACTR-030B3-I2C"
    supplierPartNumbers={{ jlcpcb: ["C3686299"] }}
    footprint={
      <footprint>
        {acs37800Pads}
        <silkscreenrect pcbX={0} pcbY={0} width="7.5mm" height="10.21mm" />
      </footprint>
    }
    {...props}
  />
)
