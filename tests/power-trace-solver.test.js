import { describe, expect, test } from "bun:test"
import { runAllRoutingChecks } from "@tscircuit/checks"
import { PowerTraceExpanderSolver } from "@tscircuit/power-trace-expander"
import datasetPackage from "../index.js"
import { convertSolvedSrjToCircuitJson } from "./helpers/convert-solved-srj-to-circuit-json.js"

describe("power-trace solver compatibility", () => {
  for (const { sampleId, source } of datasetPackage.manifest.samples) {
    test(`${sampleId} solves, widens, and passes Circuit JSON routing DRC`, async () => {
      const problem = structuredClone(datasetPackage.dataset[sampleId])
      const solver = new PowerTraceExpanderSolver(problem)
      let steps = 0
      const maximumSteps = 3_000_000

      while (!solver.solved && !solver.failed && steps < maximumSteps) {
        solver.step()
        steps += 1
      }

      expect(solver.failed).toBeFalse()
      expect(solver.solved).toBeTrue()
      const solvedTraces = solver.getOutput()
      expect(
        solvedTraces
          .flatMap((trace) => trace.route)
          .some(
            (point) =>
              point.route_type === "wire" &&
              point.width > problem.minTraceWidth + 1e-6,
          ),
      ).toBeTrue()

      const solvedCircuitJson = await convertSolvedSrjToCircuitJson({
        sourcePath: source,
        solvedTraces,
      })
      const routingDrcErrors = (await runAllRoutingChecks(solvedCircuitJson))
        .filter((result) => result.type.endsWith("_error"))
        .map(({ type, message }) => `${sampleId}: ${type}: ${message}`)

      expect(routingDrcErrors).toEqual([])
    }, 60_000)
  }
})
