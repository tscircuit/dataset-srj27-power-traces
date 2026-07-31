# dataset-srj27-power-traces

Realistic tscircuit boards for benchmarking power-trace routing as a late
autorouter pipeline stage. The source of truth is TSX in `circuits/`; every
checked-in `samples/*.srj.json` file is generated from those circuits.

The initial consumer is
[`@tscircuit/power-trace-expander`](https://github.com/tscircuit/power-trace-expander),
with the dataset intended to support its integration into
[`@tscircuit/capacity-autorouter`](https://github.com/tscircuit/tscircuit-autorouter).

## Dataset pipeline

1. Render each default-exported `.circuit.tsx` board with `RootCircuit`.
2. Convert Circuit JSON with `getSimpleRouteJsonFromCircuitJson`.
3. Route the board with `@tscircuit/capacity-autorouter`.
4. Normalize the routed copper to the 0.15 mm base width while preserving each
   authored `nominalTraceWidth`.
5. Write the post-routing SRJ, manifest, and CommonJS exports.

The last normalization models the handoff to a dedicated late power-width
stage: connectivity and obstacles are real, but the power copper still needs to
be expanded. The declared widths are benchmark requirements, not a substitute
for fabrication-specific current-capacity and thermal review.

## Boards

| Sample | Circuit | Power requirements |
| --- | --- | --- |
| `sample001` | USB-C Pico W controller with AP2112K auxiliary rail | 5 V / 1.5 A input; 3.3 V / 0.6 A output |
| `sample002` | TB6612FNG dual brushed-motor controller | 12 V / 2.4 A supply; four 1.2 A motor phases |
| `sample003` | Pico W with twelve WS2812B-2020 pixels | 5 V / 0.72 A distributed pixel rail |
| `sample004` | TP4056 USB-C Li-ion charger with AP2112K load rail | 5 V / 1 A charge input; 4.2 V / 1 A battery path |
| `sample005` | PT4115 constant-current LED buck | 24 V / 0.8 A input; 700 mA LED path |
| `sample006` | ACS37800 inline power monitor | 12 V / 5 A pass-through; 3.3 V I2C logic |

Key components use real package data: the USB-C receptacle, Pico W,
TB6612FNG, and WS2812B-2020 come from tscircuit registry packages; AP2112K,
TP4056, PT4115, and ACS37800 wrappers carry real manufacturer and JLCPCB part
numbers with their package footprints.

Each TSX module also exports `sampleMetadata.powerNets`. Generation resolves
the human-readable rail name to the concrete SRJ `connectionName`, making the
voltage, current, and nominal-width requirement machine-readable.

## Generate and verify

```sh
bun install
bun run generate
bun run check
```

`bun run check` validates source provenance, generated metadata, route shape,
base widths, package exports, and runs every sample through the real
`PowerTraceExpanderSolver`. CI regenerates the corpus and fails if committed
artifacts differ.

To inspect an authored circuit or the generated solver catalog:

```sh
bun run dev
bun run start
bun run build:site
```

`bun run start` opens React Cosmos with one step-through solver fixture per
board. `bun run build:site` writes the Vercel-ready catalog to
`cosmos-export/`.

## Usage

This dataset follows the tscircuit handbook convention: it is installed from
GitHub, uses a handwritten/generated CommonJS `index.js` plus `index.d.ts`, and
is not published to npm.

```sh
bun add -D https://github.com/tscircuit/dataset-srj27-power-traces
```

```js
const { dataset, manifest, sample001 } = require(
  "@tscircuit/dataset-srj27-power-traces",
)
```
