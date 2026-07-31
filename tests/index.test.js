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
      manifestVersion: 1,
      datasetName: "dataset-srj27-power-traces",
      format: "simple_route_json",
      pipelineStage: "post_routing_power_trace_expansion",
      primaryConsumer: "@tscircuit/power-trace-expander",
    })
  })
})
