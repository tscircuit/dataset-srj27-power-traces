import { describe, expect, test } from "bun:test"
import { PowerTraceExpanderSolver } from "@tscircuit/power-trace-expander"
import datasetPackage from "../index.js"

describe("power-trace solver compatibility", () => {
  test("solves and widens every generated real-board sample", () => {
    for (const { sampleId } of datasetPackage.manifest.samples) {
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
      expect(
        solver
          .getOutput()
          .flatMap((trace) => trace.route)
          .some(
            (point) =>
              point.route_type === "wire" &&
              point.width > problem.minTraceWidth + 1e-6,
          ),
      ).toBeTrue()
    }
  }, 60_000)
})
