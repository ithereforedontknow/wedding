import test from "node:test";
import assert from "node:assert/strict";
import { clamp, getScrollProgress } from "../src/lib/scroll.js";

test("clamp keeps progress in range", () => {
  assert.equal(clamp(-0.5), 0);
  assert.equal(clamp(0.5), 0.5);
  assert.equal(clamp(1.5), 1);
});

test("progress is 0 at the start and 1 at the end of the scrub distance", () => {
  const base = { elementTop: 0, elementHeight: 1800, viewportHeight: 1000 };
  assert.equal(getScrollProgress({ ...base, scrollY: 0 }), 0);
  assert.equal(getScrollProgress({ ...base, scrollY: 400 }), 0.5);
  assert.equal(getScrollProgress({ ...base, scrollY: 800 }), 1);
  assert.equal(getScrollProgress({ ...base, scrollY: 1200 }), 1);
  assert.equal(getScrollProgress({ ...base, scrollY: -100 }), 0);
});

test("progress is 0 when there is no positive scrub distance", () => {
  assert.equal(
    getScrollProgress({ scrollY: 500, elementTop: 0, elementHeight: 1000, viewportHeight: 1000 }),
    0
  );
});
