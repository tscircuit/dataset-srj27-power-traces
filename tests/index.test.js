import { describe, expect, test } from "bun:test"
import datasetPackage from "../index.js"

describe("dataset exports", () => {
  test("exports every manifest sample through the named and dataset APIs", () => {
    const { dataset, manifest } = datasetPackage
    const manifestSampleIds = manifest.samples.map((sample) => sample.sampleId)

    expect(Object.keys(dataset)).toEqual(manifestSampleIds)
    for (const sampleId of manifestSampleIds) {
      expect(datasetPackage[sampleId]).toBe(dataset[sampleId])
      expect(dataset[sampleId].traces.length).toBeGreaterThan(0)
    }
  })

  test("uses the post-routing power-trace manifest contract", () => {
    expect(datasetPackage.manifest).toMatchObject({
      manifestVersion: 2,
      datasetName: "dataset-srj27-power-traces",
      format: "simple_route_json",
      sourceFormat: "tscircuit_tsx",
      pipelineStage: "post_routing_power_trace_expansion",
      primaryConsumer: "@tscircuit/power-trace-expander",
    })
  })

  test("links every generated SRJ to an authored TSX circuit", () => {
    for (const sample of datasetPackage.manifest.samples) {
      expect(sample.origin).toBe("tsx")
      expect(sample.source).toEndWith(".circuit.tsx")
      expect(sample.powerNets.length).toBeGreaterThan(0)
      expect(datasetPackage.dataset[sample.sampleId].metadata.source).toBe(
        sample.source,
      )
    }
  })
})
