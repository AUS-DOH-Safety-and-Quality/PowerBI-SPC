import * as fc from "fast-check";
import * as limitFunctions from "../../src/Limit Calculations";
import buildControlLimitsArgs from "../helpers/build-control-limits-args";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";

/**
 * Property-based invariant tests for SPC limit calculations.
 *
 * These tests verify that statistical invariants hold for ALL valid inputs,
 * not just specific test datasets. This is the primary defence against
 * calculation errors that could affect clinical decisions.
 *
 * Invariants tested:
 * 1. Limit ordering (ll99 <= ll95 <= ll68 <= target <= ul68 <= ul95 <= ul99)
 * 2. Target consistency (constant within a single calculation)
 * 3. Non-negativity constraints (per chart type)
 * 4. Constant vs variable limits (per chart type)
 * 5. Symmetric spacing (for applicable chart types)
 */

const NUM_RUNS = 50; // Balance thoroughness with test speed

function makeKeys(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `key-${i}`);
}

// ===== Invariant 1: Limit Ordering =====
// For all chart types with control limits:
// ll99[i] <= ll95[i] <= ll68[i] <= target[i] <= ul68[i] <= ul95[i] <= ul99[i]

function assertLimitOrdering(limits: controlLimitsObject, _label: string): void {
  if (!limits.ul99 || !limits.ul95 || !limits.ul68 ||
      !limits.ll68 || !limits.ll95 || !limits.ll99) {
    return; // Chart type without limits (e.g., run chart)
  }

  for (let i = 0; i < limits.keys.length; i++) {
    // Use >= to allow equality (e.g., when sigma = 0, limits collapse)
    expect(limits.ll99![i]).toBeLessThanOrEqual(limits.ll95![i]);
    expect(limits.ll95![i]).toBeLessThanOrEqual(limits.ll68![i]);
    expect(limits.ll68![i]).toBeLessThanOrEqual(limits.targets[i]);
    expect(limits.targets[i]).toBeLessThanOrEqual(limits.ul68![i]);
    expect(limits.ul68![i]).toBeLessThanOrEqual(limits.ul95![i]);
    expect(limits.ul95![i]).toBeLessThanOrEqual(limits.ul99![i]);
  }
}

// ===== I-chart invariants =====
describe("I-chart invariants", () => {
  it("should satisfy limit ordering for random data", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 100 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.i(args);
        assertLimitOrdering(limits, "I-chart");
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have constant limits across all points", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.i(args);

        for (let i = 1; i < limits.keys.length; i++) {
          expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
          expect(limits.ul99![i]).toBeCloseTo(limits.ul99![0], 10);
          expect(limits.ll99![i]).toBeCloseTo(limits.ll99![0], 10);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have symmetric limits around centreline", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.i(args);

        const upperDist = limits.ul99![0] - limits.targets[0];
        const lowerDist = limits.targets[0] - limits.ll99![0];
        expect(upperDist).toBeCloseTo(lowerDist, 2);
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== C-chart invariants =====
describe("C-chart invariants", () => {
  it("should satisfy limit ordering for random count data", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 100 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.c(args);
        assertLimitOrdering(limits, "C-chart");
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have non-negative lower limits", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.c(args);

        for (let i = 0; i < limits.keys.length; i++) {
          expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
          expect(limits.ll95![i]).toBeGreaterThanOrEqual(0);
          expect(limits.ll68![i]).toBeGreaterThanOrEqual(0);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have constant limits across all points", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.c(args);

        for (let i = 1; i < limits.keys.length; i++) {
          expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
          expect(limits.ul99![i]).toBeCloseTo(limits.ul99![0], 10);
          expect(limits.ll99![i]).toBeCloseTo(limits.ll99![0], 10);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("sigma should equal sqrt(mean) (Poisson property)", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.c(args);

        const mean = limits.targets[0];
        const expectedSigma = Math.sqrt(mean);
        // ul99 = mean + 3*sigma, so sigma = (ul99 - mean) / 3
        const actualSigma = (limits.ul99![0] - limits.targets[0]) / 3;
        expect(actualSigma).toBeCloseTo(expectedSigma, 5);
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== P-chart invariants =====
describe("P-chart invariants", () => {
  // Generator for valid p-chart data: numerators <= denominators, denominators > 0
  const pChartData = fc.array(
    fc.record({
      numerator: fc.nat({ max: 100 }),
      denominator: fc.integer({ min: 1, max: 200 })
    }).filter(({ numerator, denominator }) => numerator <= denominator),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(pChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.numerator),
        denominators: data.map(d => d.denominator)
      });
      const limits = limitFunctions.p(args);
      assertLimitOrdering(limits, "P-chart");
    }), { numRuns: NUM_RUNS });
  });

  it("should have limits bounded between 0 and 1", () => {
    fc.assert(fc.property(pChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.numerator),
        denominators: data.map(d => d.denominator)
      });
      const limits = limitFunctions.p(args);

      for (let i = 0; i < limits.keys.length; i++) {
        expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
        expect(limits.ul99![i]).toBeLessThanOrEqual(1);
        expect(limits.values[i]).toBeGreaterThanOrEqual(0);
        expect(limits.values[i]).toBeLessThanOrEqual(1);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("should have constant target (pbar) across all points", () => {
    fc.assert(fc.property(pChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.numerator),
        denominators: data.map(d => d.denominator)
      });
      const limits = limitFunctions.p(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("limits should widen as denominator decreases", () => {
    // For two points with same pbar but different n, the smaller n
    // should have wider limits (larger sigma)
    fc.assert(fc.property(
      fc.integer({ min: 5, max: 50 }),
      fc.integer({ min: 51, max: 200 }),
      (smallN, largeN) => {
        // Create dataset where all proportions are ~0.5 but sample sizes differ
        const prop = 0.3;
        const args = buildControlLimitsArgs({
          keys: makeKeys(2),
          numerators: [Math.round(prop * smallN), Math.round(prop * largeN)],
          denominators: [smallN, largeN]
        });
        const limits = limitFunctions.p(args);

        // Point with smaller denominator should have wider limits
        const width0 = limits.ul99![0] - limits.ll99![0];
        const width1 = limits.ul99![1] - limits.ll99![1];
        expect(width0).toBeGreaterThan(width1);
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== XBar-chart invariants =====
describe("XBar-chart invariants", () => {
  // Generator for valid xbar data: means, sample sizes >= 2, and SDs >= 0
  const xbarData = fc.array(
    fc.record({
      mean: fc.double({ min: -100, max: 100, noNaN: true, noDefaultInfinity: true }),
      count: fc.integer({ min: 2, max: 50 }),
      sd: fc.double({ min: 0.01, max: 50, noNaN: true, noDefaultInfinity: true })
    }),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(xbarData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.mean),
        denominators: data.map(d => d.count),
        xbar_sds: data.map(d => d.sd)
      });
      const limits = limitFunctions.xbar(args);
      assertLimitOrdering(limits, "XBar");
    }), { numRuns: NUM_RUNS });
  });

  it("should have constant target across all points", () => {
    fc.assert(fc.property(xbarData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.mean),
        denominators: data.map(d => d.count),
        xbar_sds: data.map(d => d.sd)
      });
      const limits = limitFunctions.xbar(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });
});

// ===== Run chart invariants =====
describe("Run chart invariants", () => {
  it("should produce only centreline with no control limits", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.run(args);

        // Should have keys, values, and targets
        expect(limits.keys.length).toBe(values.length);
        expect(limits.values.length).toBe(values.length);
        expect(limits.targets.length).toBe(values.length);

        // Should NOT have control limits
        const hasLimits = limits.ul99 !== undefined
          && limits.ul99.some(v => v !== undefined && v !== null);
        expect(hasLimits).toBeFalse();
      }
    ), { numRuns: NUM_RUNS });
  });

  it("centreline should be the median of the data", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.run(args);

        // Calculate expected median
        const sorted = values.slice().sort((a, b) => a - b);
        const n = sorted.length;
        const expectedMedian = n % 2 === 0
          ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
          : sorted[Math.floor(n / 2)];

        for (let i = 0; i < limits.keys.length; i++) {
          expect(limits.targets[i]).toBeCloseTo(expectedMedian, 5);
        }
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== MR-chart invariants =====
describe("MR-chart invariants", () => {
  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 100 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.mr(args);
        assertLimitOrdering(limits, "MR-chart");
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have n-1 output points", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.mr(args);
        expect(limits.keys.length).toBe(values.length - 1);
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have all lower limits equal to 0", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.mr(args);

        for (let i = 0; i < limits.keys.length; i++) {
          expect(limits.ll99![i]).toBe(0);
          expect(limits.ll95![i]).toBe(0);
          expect(limits.ll68![i]).toBe(0);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have constant limits across all points", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.mr(args);

        for (let i = 1; i < limits.keys.length; i++) {
          expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
          expect(limits.ul99![i]).toBeCloseTo(limits.ul99![0], 10);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("all values should be non-negative (absolute differences)", () => {
    fc.assert(fc.property(
      fc.array(fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }), { minLength: 3, maxLength: 50 }),
      (values) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(values.length),
          numerators: values
        });
        const limits = limitFunctions.mr(args);

        for (let i = 0; i < limits.keys.length; i++) {
          expect(limits.values[i]).toBeGreaterThanOrEqual(0);
        }
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== S-chart invariants =====
describe("S-chart invariants", () => {
  const sChartData = fc.array(
    fc.record({
      sd: fc.double({ min: 0.01, max: 50, noNaN: true, noDefaultInfinity: true }),
      count: fc.integer({ min: 2, max: 50 })
    }),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(sChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.sd),
        denominators: data.map(d => d.count)
      });
      const limits = limitFunctions.s(args);
      assertLimitOrdering(limits, "S-chart");
    }), { numRuns: NUM_RUNS });
  });

  // Note: S-chart lower limits can be negative for small subgroup sizes
  // because B3(n,k) = 1 - k*c5(n)/c4(n) can be < 0 and the source does
  // not clamp. This is standard SPC behaviour — negative LCL means any
  // value of s is in control.

  it("should have constant target across all points", () => {
    fc.assert(fc.property(sChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.sd),
        denominators: data.map(d => d.count)
      });
      const limits = limitFunctions.s(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });
});

// ===== G-chart invariants =====
describe("G-chart invariants", () => {
  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.g(args);
        assertLimitOrdering(limits, "G-chart");
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have all lower limits equal to 0", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.g(args);

        for (let i = 0; i < limits.keys.length; i++) {
          expect(limits.ll99![i]).toBe(0);
          expect(limits.ll95![i]).toBe(0);
          expect(limits.ll68![i]).toBe(0);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("should have constant limits and targets across all points", () => {
    fc.assert(fc.property(
      fc.array(fc.nat({ max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.g(args);

        for (let i = 1; i < limits.keys.length; i++) {
          expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
          expect(limits.ul99![i]).toBeCloseTo(limits.ul99![0], 10);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("sigma should equal sqrt(mean * (mean + 1)) (geometric property)", () => {
    fc.assert(fc.property(
      fc.array(fc.integer({ min: 1, max: 500 }), { minLength: 3, maxLength: 50 }),
      (counts) => {
        const args = buildControlLimitsArgs({
          keys: makeKeys(counts.length),
          numerators: counts
        });
        const limits = limitFunctions.g(args);

        const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
        const expectedSigma = Math.sqrt(mean * (mean + 1));
        // ul99 = mean + 3*sigma, so sigma = (ul99 - mean) / 3
        const actualSigma = (limits.ul99![0] - mean) / 3;
        expect(actualSigma).toBeCloseTo(expectedSigma, 2);
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== T-chart invariants =====
describe("T-chart invariants", () => {
  // T-chart requires strictly positive values (power transform x^(1/3.6))
  const tChartArb = fc.array(
    fc.double({ min: 0.1, max: 1e4, noNaN: true, noDefaultInfinity: true }),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(tChartArb, (values) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(values.length),
        numerators: values
      });
      const limits = limitFunctions.t(args);
      assertLimitOrdering(limits, "T-chart");
    }), { numRuns: NUM_RUNS });
  });

  it("should have non-negative lower limits", () => {
    fc.assert(fc.property(tChartArb, (values) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(values.length),
        numerators: values
      });
      const limits = limitFunctions.t(args);

      for (let i = 0; i < limits.keys.length; i++) {
        expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
        expect(limits.ll95![i]).toBeGreaterThanOrEqual(0);
        expect(limits.ll68![i]).toBeGreaterThanOrEqual(0);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("should have constant limits across all points", () => {
    fc.assert(fc.property(tChartArb, (values) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(values.length),
        numerators: values
      });
      const limits = limitFunctions.t(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
        expect(limits.ul99![i]).toBeCloseTo(limits.ul99![0], 10);
        expect(limits.ll99![i]).toBeCloseTo(limits.ll99![0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });
});

// ===== U-chart invariants =====
describe("U-chart invariants", () => {
  const uChartData = fc.array(
    fc.record({
      count: fc.nat({ max: 500 }),
      size: fc.integer({ min: 1, max: 200 })
    }),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(uChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.count),
        denominators: data.map(d => d.size)
      });
      const limits = limitFunctions.u(args);
      assertLimitOrdering(limits, "U-chart");
    }), { numRuns: NUM_RUNS });
  });

  it("should have non-negative lower limits", () => {
    fc.assert(fc.property(uChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.count),
        denominators: data.map(d => d.size)
      });
      const limits = limitFunctions.u(args);

      for (let i = 0; i < limits.keys.length; i++) {
        expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("should have constant target across all points", () => {
    fc.assert(fc.property(uChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.count),
        denominators: data.map(d => d.size)
      });
      const limits = limitFunctions.u(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("limits should widen as denominator decreases", () => {
    fc.assert(fc.property(
      fc.integer({ min: 5, max: 50 }),
      fc.integer({ min: 51, max: 200 }),
      (smallN, largeN) => {
        const rate = 5;
        const args = buildControlLimitsArgs({
          keys: makeKeys(2),
          numerators: [Math.round(rate * smallN), Math.round(rate * largeN)],
          denominators: [smallN, largeN]
        });
        const limits = limitFunctions.u(args);

        const width0 = limits.ul99![0] - limits.ll99![0];
        const width1 = limits.ul99![1] - limits.ll99![1];
        expect(width0).toBeGreaterThan(width1);
      }
    ), { numRuns: NUM_RUNS });
  });
});

// ===== P'-chart invariants =====
describe("P'-chart invariants", () => {
  const ppChartData = fc.array(
    fc.record({
      numerator: fc.nat({ max: 100 }),
      denominator: fc.integer({ min: 1, max: 200 })
    }).filter(({ numerator, denominator }) => numerator <= denominator),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(ppChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.numerator),
        denominators: data.map(d => d.denominator)
      });
      const limits = limitFunctions.pp(args);
      assertLimitOrdering(limits, "P'-chart");
    }), { numRuns: NUM_RUNS });
  });

  it("should have limits bounded between 0 and 1", () => {
    fc.assert(fc.property(ppChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.numerator),
        denominators: data.map(d => d.denominator)
      });
      const limits = limitFunctions.pp(args);

      for (let i = 0; i < limits.keys.length; i++) {
        expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
        expect(limits.ul99![i]).toBeLessThanOrEqual(1);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("should have constant target across all points", () => {
    fc.assert(fc.property(ppChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.numerator),
        denominators: data.map(d => d.denominator)
      });
      const limits = limitFunctions.pp(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });
});

// ===== U'-chart invariants =====
describe("U'-chart invariants", () => {
  const upChartData = fc.array(
    fc.record({
      count: fc.nat({ max: 500 }),
      size: fc.integer({ min: 1, max: 200 })
    }),
    { minLength: 3, maxLength: 50 }
  );

  it("should satisfy limit ordering", () => {
    fc.assert(fc.property(upChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.count),
        denominators: data.map(d => d.size)
      });
      const limits = limitFunctions.up(args);
      assertLimitOrdering(limits, "U'-chart");
    }), { numRuns: NUM_RUNS });
  });

  it("should have non-negative lower limits", () => {
    fc.assert(fc.property(upChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.count),
        denominators: data.map(d => d.size)
      });
      const limits = limitFunctions.up(args);

      for (let i = 0; i < limits.keys.length; i++) {
        expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
      }
    }), { numRuns: NUM_RUNS });
  });

  it("should have constant target across all points", () => {
    fc.assert(fc.property(upChartData, (data) => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(data.length),
        numerators: data.map(d => d.count),
        denominators: data.map(d => d.size)
      });
      const limits = limitFunctions.up(args);

      for (let i = 1; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(limits.targets[0], 10);
      }
    }), { numRuns: NUM_RUNS });
  });
});

// ===== Cross-chart invariant: all identical values =====
describe("Degenerate data invariants", () => {
  it("I-chart: all identical values should produce sigma=0 (limits collapse to centreline)", () => {
    fc.assert(fc.property(
      fc.double({ min: 0.01, max: 1e4, noNaN: true, noDefaultInfinity: true }),
      fc.integer({ min: 3, max: 50 }),
      (value, n) => {
        const values = new Array(n).fill(value);
        const args = buildControlLimitsArgs({
          keys: makeKeys(n),
          numerators: values
        });
        const limits = limitFunctions.i(args);

        // When all values are identical, moving range is 0 so sigma = 0
        // All limits should equal the centreline
        for (let i = 0; i < n; i++) {
          expect(limits.targets[i]).toBeCloseTo(value, 2);
          expect(limits.ul99![i]).toBeCloseTo(limits.targets[i], 2);
          expect(limits.ll99![i]).toBeCloseTo(limits.targets[i], 2);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("C-chart: all identical values should still have limits (sigma = sqrt(mean))", () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 500 }),
      fc.integer({ min: 3, max: 50 }),
      (value, n) => {
        const values = new Array(n).fill(value);
        const args = buildControlLimitsArgs({
          keys: makeKeys(n),
          numerators: values
        });
        const limits = limitFunctions.c(args);

        // C-chart sigma = sqrt(mean), so even with identical values, limits differ from centreline
        const expectedSigma = Math.sqrt(value);
        for (let i = 0; i < n; i++) {
          expect(limits.targets[i]).toBeCloseTo(value, 2);
          expect(limits.ul99![i]).toBeCloseTo(value + 3 * expectedSigma, 2);
          expect(limits.ll99![i]).toBeCloseTo(Math.max(0, value - 3 * expectedSigma), 2);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("G-chart: all identical values should still have limits (sigma = sqrt(v*(v+1)))", () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 500 }),
      fc.integer({ min: 3, max: 50 }),
      (value, n) => {
        const values = new Array(n).fill(value);
        const args = buildControlLimitsArgs({
          keys: makeKeys(n),
          numerators: values
        });
        const limits = limitFunctions.g(args);

        const expectedSigma = Math.sqrt(value * (value + 1));
        for (let i = 0; i < n; i++) {
          expect(limits.targets[i]).toBeCloseTo(value, 2);
          expect(limits.ul99![i]).toBeCloseTo(value + 3 * expectedSigma, 2);
          expect(limits.ll99![i]).toBe(0);
        }
      }
    ), { numRuns: NUM_RUNS });
  });

  it("MR-chart: all identical values should produce centreline=0 and limits collapse", () => {
    fc.assert(fc.property(
      fc.double({ min: 0.01, max: 1e4, noNaN: true, noDefaultInfinity: true }),
      fc.integer({ min: 3, max: 50 }),
      (value, n) => {
        const values = new Array(n).fill(value);
        const args = buildControlLimitsArgs({
          keys: makeKeys(n),
          numerators: values
        });
        const limits = limitFunctions.mr(args);

        // All moving ranges are 0 when values are identical
        for (let i = 0; i < limits.keys.length; i++) {
          expect(limits.values[i]).toBeCloseTo(0, 10);
          expect(limits.targets[i]).toBeCloseTo(0, 10);
          expect(limits.ul99![i]).toBeCloseTo(0, 10);
        }
      }
    ), { numRuns: NUM_RUNS });
  });
});
