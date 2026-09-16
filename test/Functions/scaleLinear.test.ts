import { describe, expect, it } from "vitest";
import scaleLinear from "../../src/Functions/scaleLinear";

describe("scaleLinear", () => {
  it.each([0, 1, 100])("centres an equal domain at %s in the output range", value => {
    const scale = scaleLinear().domain([value, value]).range([450, 50]);

    expect(scale(value)).toBe(250);
    expect(scale.copy()(value)).toBe(250);
    expect(scale.ticks(10)).toEqual([value]);
  });

  it("maps a nonzero domain across the output range", () => {
    const scale = scaleLinear().domain([0, 100]).range([450, 50]);

    expect(scale(0)).toBe(450);
    expect(scale(25)).toBe(350);
    expect(scale(100)).toBe(50);
  });
});
