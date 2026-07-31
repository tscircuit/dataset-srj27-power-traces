# dataset-srj27-power-traces

Post-routing Simple Route JSON fixtures for evaluating power-trace expansion
and cleanup after the main PCB autorouter has produced connected traces.

The first consumer is
[`@tscircuit/power-trace-expander`](https://github.com/tscircuit/power-trace-expander).
The dataset is also shaped for a future final stage in
[`@tscircuit/capacity-autorouter`](https://github.com/tscircuit/tscircuit-autorouter):

1. Pipeline 7 routes every connection and runs its existing post-processing.
2. The pipeline emits Simple Route JSON with populated `traces`.
3. The power-trace stage expands copper toward each connection's
   `nominalTraceWidth`, repairs preferred pad clearance, and cleans up avoidable
   vias or non-octilinear geometry.

## Sample contract

Every `samples/*.srj.json` file is a complete, post-routing problem with:

- populated `traces` containing wire widths and any routed vias
- a matching connection for every selected trace
- per-connection `nominalTraceWidth`
- explicit board bounds, layer count, trace clearance, and via dimensions
- obstacles with connectivity aliases when same-net copper is relevant
- deterministic metadata in `manifest.json`

The routed input may be electrically connected while still having insufficient
copper width or undesirable cleanup geometry. This distinction is the point of
the dataset.

## Seed scenarios

| Sample | Focus |
| --- | --- |
| `sample001` | Clear, under-width straight power route |
| `sample002` | Channel that admits an intermediate width but not nominal width |
| `sample003` | Wide power corridor blocked by a lower-width movable signal |
| `sample004` | Top-layer wall requiring a bounded multilayer reroute and terminal necking |
| `sample005` | Under-width power route that also needs unrelated-pad clearance repair |
| `sample006` | Same-net aliases, connected pads, child copper, and a fixed via |

These synthetic samples keep the initial review small. Production-derived
samples should be added with immutable source provenance and the same manifest
fields.

## Usage

Install directly from GitHub; this dataset is intentionally not published to
npm.

```sh
bun add -D https://github.com/tscircuit/dataset-srj27-power-traces
```

```js
const {
  dataset,
  manifest,
  sample001,
} = require("@tscircuit/dataset-srj27-power-traces")
```

## Development

```sh
bun install
bun run check
bun run start
bun run build:site
```

`bun run start` opens a React Cosmos catalog with one step-through
`PowerTraceExpanderSolver` debugger per sample. `bun run build:site` writes the
deployable static catalog to `cosmos-export/`.

The package uses a handwritten CommonJS `index.js` and lightweight
`index.d.ts`. There is no transpilation or npm release step, following the
tscircuit handbook's dataset guidelines.
