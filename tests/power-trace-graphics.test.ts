import { expect, test } from "bun:test"
import type { SimpleRouteJson } from "tscircuit"
import { getPowerTraceGraphics } from "../fixtures/getPowerTraceGraphics"
import sample from "../samples/sample001-usbc-pico-power.srj.json"

test("power trace graphics use autorouter layer and pad rendering", () => {
  const problem = sample as unknown as SimpleRouteJson
  const graphics = getPowerTraceGraphics({
    problem,
    traces: problem.traces ?? [],
  })

  expect(graphics.lines.some((line) => line.layer === "z0")).toBeTrue()
  expect(
    graphics.lines.some(
      (line) => line.layer === "z1" && line.strokeDash !== undefined,
    ),
  ).toBeTrue()
  expect(graphics.circles.some((circle) => circle.layer === "z0,1")).toBeTrue()
  expect(graphics.points.length).toBeGreaterThan(0)
  expect(graphics.rects.length).toBe(
    problem.obstacles.filter((obstacle) => !obstacle.isCopperPour).length,
  )
  expect(graphics.rects.some((rect) => rect.layer === "z0")).toBeTrue()
  expect(graphics.rects.some((rect) => rect.layer === "z0,1")).toBeTrue()
})
