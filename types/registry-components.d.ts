declare module "@tsci/seveibar.PICO_W/index.esm.js" {
  import type { ChipProps } from "@tscircuit/props"

  export const PICO_W: (
    props: ChipProps<Record<string, string[]>>,
  ) => React.JSX.Element
}

declare module "@tsci/imrishabh18.TB6612FNG/index.esm.js" {
  import type { CommonLayoutProps } from "@tscircuit/props"

  export const MotorDriver: (
    props: CommonLayoutProps & { name: string },
  ) => React.JSX.Element
}
