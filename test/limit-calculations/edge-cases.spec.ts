/**
 * Deterministic edge-case tests for all 14 limit calculation functions.
 *
 * Complements:
 * - golden-datasets.spec.ts (correctness against reference data)
 * - limit-invariants.spec.ts (property-based invariants)
 *
 * Tests from Edge Case Catalogue:
 * 1. Minimum data (n=2) — functions must not crash
 * 2. All zeros (where chart type permits)
 * 3. Subset points — only subset used for limit calculation
 * 4. S-chart lower limits must be non-negative (BUG 6)
 * 5. S-chart n<=1 subgroup safety (BUG 7)
 * 6. All-identical data (variance = 0)
 * 7. Reference-value assertions (independently computed)
 * 8. B3 boundary crossing (n=5 vs n=6)
 * 9. Extreme outlier with subset exclusion
 * 10. Large dataset (n=500)
 */
import * as limitFunctions from "../../src/Limit Calculations";
import buildControlLimitsArgs from "../helpers/build-control-limits-args";
import type { controlLimitsArgs, controlLimitsObject } from "../../src/Classes/viewModelClass";

function makeKeys(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `key-${i}`);
}

// Chart types grouped by input requirements
const countCharts = ["c", "g"] as const;
const ratioCharts = ["p", "pp", "u", "up"] as const;
const continuousCharts = ["i", "i_m", "i_mm", "run"] as const;
const mrChart = "mr";
const tChart = "t";
const sChart = "s";
const xbarChart = "xbar";

const limitFnMap: Record<string, (args: controlLimitsArgs) => controlLimitsObject> = {
  "i": limitFunctions.i,
  "i_m": limitFunctions.i_m,
  "i_mm": limitFunctions.i_mm,
  "c": limitFunctions.c,
  "g": limitFunctions.g,
  "mr": limitFunctions.mr,
  "p": limitFunctions.p,
  "pp": limitFunctions.pp,
  "run": limitFunctions.run,
  "s": limitFunctions.s,
  "t": limitFunctions.t,
  "u": limitFunctions.u,
  "up": limitFunctions.up,
  "xbar": limitFunctions.xbar,
};

// Helper: assert limits are finite and correctly ordered at every point
function assertLimitsFiniteAndOrdered(limits: controlLimitsObject, hasLimits: boolean = true): void {
  for (let i = 0; i < limits.keys.length; i++) {
    expect(isFinite(limits.targets[i])).toBeTrue();
    expect(isFinite(limits.values[i])).toBeTrue();
    if (hasLimits) {
      expect(isFinite(limits.ul99![i])).toBeTrue();
      expect(isFinite(limits.ll99![i])).toBeTrue();
      expect(limits.ll99![i]).toBeLessThanOrEqual(limits.targets[i]);
      expect(limits.targets[i]).toBeLessThanOrEqual(limits.ul99![i]);
    }
  }
}

// ===== Edge Case 1: Minimum data (n=2) =====

describe("Minimum data (n=2)", () => {

  for (const chartType of continuousCharts) {
    it(`${chartType}-chart handles n=2 with valid limits`, () => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(2),
        numerators: [10, 20]
      });
      const limits = limitFnMap[chartType](args);
      expect(limits.keys.length).toBe(2);
      assertLimitsFiniteAndOrdered(limits, chartType !== "run");
    });
  }

  for (const chartType of countCharts) {
    it(`${chartType}-chart handles n=2 with valid limits`, () => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(2),
        numerators: [5, 10]
      });
      const limits = limitFnMap[chartType](args);
      expect(limits.keys.length).toBe(2);
      assertLimitsFiniteAndOrdered(limits);
      // Count charts have constant limits
      expect(limits.ul99![0]).toBeCloseTo(limits.ul99![1], 10);
    });
  }

  for (const chartType of ratioCharts) {
    it(`${chartType}-chart handles n=2 with valid limits`, () => {
      const args = buildControlLimitsArgs({
        keys: makeKeys(2),
        numerators: [5, 10],
        denominators: [100, 200]
      });
      const limits = limitFnMap[chartType](args);
      expect(limits.keys.length).toBe(2);
      assertLimitsFiniteAndOrdered(limits);
    });
  }

  it("mr-chart handles n=2 with valid limits (1 output point)", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(2),
      numerators: [10, 20]
    });
    const limits = limitFnMap[mrChart](args);
    expect(limits.keys.length).toBe(1);
    expect(limits.values[0]).toBeCloseTo(10, 2);
    assertLimitsFiniteAndOrdered(limits);
  });

  it("t-chart handles n=2 with valid limits", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(2),
      numerators: [5, 15]
    });
    const limits = limitFnMap[tChart](args);
    expect(limits.keys.length).toBe(2);
    assertLimitsFiniteAndOrdered(limits);
    // T-chart has constant limits
    expect(limits.ul99![0]).toBeCloseTo(limits.ul99![1], 10);
  });

  it("s-chart handles n=2 with valid limits", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(2),
      numerators: [3.5, 4.2],
      denominators: [10, 15]
    });
    const limits = limitFnMap[sChart](args);
    expect(limits.keys.length).toBe(2);
    assertLimitsFiniteAndOrdered(limits);
  });

  it("xbar-chart handles n=2 with valid limits", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(2),
      numerators: [50, 55],
      denominators: [10, 15],
      xbar_sds: [2.0, 3.0]
    });
    const limits = limitFnMap[xbarChart](args);
    expect(limits.keys.length).toBe(2);
    assertLimitsFiniteAndOrdered(limits);
  });
});

// ===== Edge Case 2: All zeros =====

describe("All zeros", () => {

  for (const chartType of countCharts) {
    it(`${chartType}-chart with all-zero numerators: limits collapse to 0`, () => {
      const n = 5;
      const args = buildControlLimitsArgs({
        keys: makeKeys(n),
        numerators: new Array(n).fill(0)
      });
      const limits = limitFnMap[chartType](args);

      expect(limits.keys.length).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(limits.targets[i]).toBeCloseTo(0, 5);
        // sigma = sqrt(0) = 0, so all limits collapse to 0
        expect(limits.ul99![i]).toBeCloseTo(0, 5);
        expect(limits.ll99![i]).toBeCloseTo(0, 5);
        expect(isFinite(limits.ul99![i])).toBeTrue();
        expect(isFinite(limits.ll99![i])).toBeTrue();
      }
    });
  }

  // Standard ratio charts (p, u): sigma uses sqrt(pbar*(1-pbar)/n), pbar=0 → sigma=0 → finite limits
  for (const chartType of (["p", "u"] as const)) {
    it(`${chartType}-chart with all-zero numerators: limits finite and at 0`, () => {
      const n = 5;
      const args = buildControlLimitsArgs({
        keys: makeKeys(n),
        numerators: new Array(n).fill(0),
        denominators: new Array(n).fill(100)
      });
      const limits = limitFnMap[chartType](args);

      expect(limits.keys.length).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(limits.values[i]).toBeCloseTo(0, 5);
        expect(limits.targets[i]).toBeCloseTo(0, 5);
        expect(isFinite(limits.ul99![i])).toBeTrue();
        expect(isFinite(limits.ll99![i])).toBeTrue();
        expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
      }
    });
  }

  // Laney (pp, up): z-score SD is 0/0 = NaN when all proportions are 0,
  // so limits produce NaN. This is a known degenerate case.
  for (const chartType of (["pp", "up"] as const)) {
    it(`${chartType}-chart with all-zero numerators: NaN limits (degenerate Laney z-score)`, () => {
      const n = 5;
      const args = buildControlLimitsArgs({
        keys: makeKeys(n),
        numerators: new Array(n).fill(0),
        denominators: new Array(n).fill(100)
      });
      const limits = limitFnMap[chartType](args);

      expect(limits.keys.length).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(limits.values[i]).toBeCloseTo(0, 5);
        expect(limits.targets[i]).toBeCloseTo(0, 5);
        // Laney method: sigma_z = sd(z_i) where z_i = 0/0 = NaN → limits are NaN
        expect(isNaN(limits.ul99![i])).toBeTrue();
      }
    });
  }

  for (const chartType of continuousCharts) {
    it(`${chartType}-chart with all-zero values: limits collapse to 0`, () => {
      const n = 5;
      const args = buildControlLimitsArgs({
        keys: makeKeys(n),
        numerators: new Array(n).fill(0)
      });
      const limits = limitFnMap[chartType](args);

      expect(limits.keys.length).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(limits.targets[i]).toBeCloseTo(0, 5);
        if (chartType !== "run") {
          // MR=0 so sigma=0, limits collapse to centreline
          expect(limits.ul99![i]).toBeCloseTo(0, 5);
          expect(limits.ll99![i]).toBeCloseTo(0, 5);
        }
      }
    });
  }

  it("mr-chart with all-zero values: all outputs are 0", () => {
    const n = 5;
    const args = buildControlLimitsArgs({
      keys: makeKeys(n),
      numerators: new Array(n).fill(0)
    });
    const limits = limitFnMap[mrChart](args);

    expect(limits.keys.length).toBe(n - 1);
    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.values[i]).toBeCloseTo(0, 10);
      expect(limits.targets[i]).toBeCloseTo(0, 10);
      expect(limits.ul99![i]).toBeCloseTo(0, 10);
      expect(limits.ll99![i]).toBeCloseTo(0, 10);
    }
  });

  it("s-chart with all-zero SDs: limits collapse to 0", () => {
    const n = 5;
    const args = buildControlLimitsArgs({
      keys: makeKeys(n),
      numerators: new Array(n).fill(0),
      denominators: new Array(n).fill(10)
    });
    const limits = limitFnMap[sChart](args);

    expect(limits.keys.length).toBe(n);
    for (let i = 0; i < n; i++) {
      expect(limits.targets[i]).toBeCloseTo(0, 5);
      // sbar=0, so sigma_s=0, limits collapse
      expect(limits.ul99![i]).toBeCloseTo(0, 5);
      expect(isFinite(limits.ul99![i])).toBeTrue();
    }
  });

  it("xbar-chart with all-zero SDs: limits collapse to centreline", () => {
    const n = 5;
    const args = buildControlLimitsArgs({
      keys: makeKeys(n),
      numerators: new Array(n).fill(50),
      denominators: new Array(n).fill(10),
      xbar_sds: new Array(n).fill(0)
    });
    const limits = limitFnMap[xbarChart](args);

    expect(limits.keys.length).toBe(n);
    for (let i = 0; i < n; i++) {
      expect(limits.ul99![i]).toBeCloseTo(limits.targets[i], 2);
      expect(limits.ll99![i]).toBeCloseTo(limits.targets[i], 2);
      expect(isFinite(limits.ul99![i])).toBeTrue();
      expect(isFinite(limits.ll99![i])).toBeTrue();
    }
  });
});

// ===== Edge Case 3: Subset points =====

describe("Subset points", () => {

  it("I-chart: subset produces tighter limits than full dataset with outliers", () => {
    const numerators = [10, 12, 11, 100, 200]; // last 2 are outliers
    const argsSubset = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      subset_points: [0, 1, 2]
    });
    const argsFull = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators
    });
    const limitsSubset = limitFunctions.i(argsSubset);
    const limitsFull = limitFunctions.i(argsFull);

    // Target from subset: (10+12+11)/3 = 11
    expect(limitsSubset.targets[0]).toBeCloseTo(11, 1);
    // All 5 points in output
    expect(limitsSubset.keys.length).toBe(5);
    // Subset limits should be TIGHTER (narrower) than full dataset limits
    const subsetWidth = limitsSubset.ul99![0] - limitsSubset.ll99![0];
    const fullWidth = limitsFull.ul99![0] - limitsFull.ll99![0];
    expect(subsetWidth).toBeLessThan(fullWidth);
  });

  it("C-chart: subset excludes outlier from target calculation", () => {
    const numerators = [5, 6, 4, 5, 500]; // last is outlier
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      subset_points: [0, 1, 2, 3]
    });
    const limits = limitFunctions.c(args);

    // Target from first 4: (5+6+4+5)/4 = 5
    expect(limits.targets[0]).toBeCloseTo(5, 1);
    expect(limits.keys.length).toBe(5);
    // sigma = sqrt(5) ≈ 2.236; ul99 = 5 + 3*2.236 ≈ 11.7
    expect(limits.ul99![0]).toBeCloseTo(5 + 3 * Math.sqrt(5), 1);
  });

  it("P-chart: subset pbar excludes outlier proportion", () => {
    const numerators = [10, 12, 11, 90]; // last is outlier proportion
    const denominators = [100, 100, 100, 100];
    const args = buildControlLimitsArgs({
      keys: makeKeys(4),
      numerators: numerators,
      denominators: denominators,
      subset_points: [0, 1, 2]
    });
    const limits = limitFunctions.p(args);

    // pbar from first 3: (10+12+11)/(100+100+100) = 33/300 = 0.11
    expect(limits.targets[0]).toBeCloseTo(0.11, 2);
    expect(limits.keys.length).toBe(4);
    // Limits should be finite and ordered
    assertLimitsFiniteAndOrdered(limits);
  });

  it("MR-chart: subset excludes outlier from limit calculation", () => {
    const numerators = [10, 12, 11, 13, 200]; // last is outlier
    const argsSubset = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      subset_points: [0, 1, 2, 3]
    });
    const argsFull = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators
    });
    const limitsSubset = limitFunctions.mr(argsSubset);
    const limitsFull = limitFunctions.mr(argsFull);

    expect(limitsSubset.keys.length).toBe(4);
    // Subset limits should be tighter
    expect(limitsSubset.ul99![0]).toBeLessThan(limitsFull.ul99![0]);
  });
});

// ===== Edge Case 4: S-chart lower limits must be non-negative =====
// B3 is negative for small sample sizes (n < ~6 at 3σ), so raw cl * B3 < 0.
// Standard deviations cannot be negative, so lower limits must be clamped to 0.
// Other chart types (c, p, p', u, u') already use Math.max(0, ...) for this.

describe("S-chart lower limits non-negative (BUG 6)", () => {

  it("s-chart lower limits are >= 0 for small subgroup sizes (n=2)", () => {
    // b3(2, 3) ≈ -1.267, so raw LCL = cl * b3 < 0
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [2, 2, 2, 2, 2] // n=2 per subgroup
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
      expect(limits.ll95![i]).toBeGreaterThanOrEqual(0);
      expect(limits.ll68![i]).toBeGreaterThanOrEqual(0);
    }
  });

  it("s-chart lower limits are >= 0 for n=3 subgroups", () => {
    // b3(3, 3) ≈ -0.726
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [3, 3, 3, 3, 3]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
      expect(limits.ll95![i]).toBeGreaterThanOrEqual(0);
    }
  });

  it("s-chart lower limits are >= 0 for n=5 subgroups", () => {
    // b3(5, 3) ≈ -0.089
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [5, 5, 5, 5, 5]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
    }
  });

  it("s-chart upper limits remain unchanged by clamping", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [2, 2, 2, 2, 2]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ul99![i]).toBeGreaterThan(limits.targets[i]);
      expect(limits.ul95![i]).toBeGreaterThan(limits.targets[i]);
      expect(limits.ul68![i]).toBeGreaterThan(limits.targets[i]);
    }
  });

  it("s-chart limits correct for large subgroup sizes where b3 > 0 (no clamping needed)", () => {
    // b3(10, 3) ≈ 0.284, lower limit naturally positive
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [10, 10, 10, 10, 10]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBeGreaterThan(0);
      expect(limits.targets[i]).toBeGreaterThan(limits.ll99![i]);
      expect(limits.ul99![i]).toBeGreaterThan(limits.targets[i]);
    }
  });
});

// ===== Edge Case 5: S-chart n<=1 subgroup safety =====
// c4(n) is undefined for n <= 1, causing NaN propagation through b3/b4.
// The pooled SD divides by Σ(n_i - 1), which is 0 when all n_i <= 1.
// These must degrade to NaN (→ null downstream), not crash or corrupt.

describe("S-chart n<=1 subgroup safety (BUG 7)", () => {

  it("all subgroups n=1: centreline is NaN (zero degrees of freedom)", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(3),
      numerators: [2.0, 3.0, 2.5],
      denominators: [1, 1, 1]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.targets[i]).toBeNaN();
    }
  });

  it("all subgroups n=1: all control limits are NaN", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(3),
      numerators: [2.0, 3.0, 2.5],
      denominators: [1, 1, 1]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBeNaN();
      expect(limits.ul99![i]).toBeNaN();
      expect(limits.ll95![i]).toBeNaN();
      expect(limits.ul95![i]).toBeNaN();
    }
  });

  it("mixed sizes: n=1 point gets NaN limits, valid points get finite limits", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(4),
      numerators: [3.5, 4.2, 3.8, 4.0],
      denominators: [10, 1, 10, 10] // point 1 has n=1
    });
    const limits = limitFunctions.s(args);

    // Centreline should be finite (pooled from the three n=10 subgroups)
    expect(isFinite(limits.targets[0])).toBeTrue();

    // Point 1 (n=1): limits are NaN
    expect(limits.ll99![1]).toBeNaN();
    expect(limits.ul99![1]).toBeNaN();

    // Other points: limits are finite
    expect(isFinite(limits.ll99![0])).toBeTrue();
    expect(isFinite(limits.ul99![0])).toBeTrue();
    expect(isFinite(limits.ll99![2])).toBeTrue();
    expect(isFinite(limits.ul99![2])).toBeTrue();
  });

  it("all denominators 0: centreline and all limits are NaN", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(3),
      numerators: [2.0, 3.0, 2.5],
      denominators: [0, 0, 0]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.targets[i]).toBeNaN();
      expect(limits.ll99![i]).toBeNaN();
      expect(limits.ul99![i]).toBeNaN();
    }
  });
});

// ===== Edge Case 6: All-identical data (variance = 0) =====
// When all values are identical (non-zero), moving range / pooled SD = 0.
// Limits should collapse to the centreline at the data value, not produce NaN.

describe("All-identical data (variance = 0)", () => {

  it("C-chart with identical counts: limits collapse correctly", () => {
    const n = 5;
    const args = buildControlLimitsArgs({
      keys: makeKeys(n),
      numerators: new Array(n).fill(8) // All counts = 8
    });
    const limits = limitFunctions.c(args);

    for (let i = 0; i < n; i++) {
      expect(limits.targets[i]).toBeCloseTo(8, 5);
      // sigma = sqrt(8) ≈ 2.828 — Poisson sigma depends on mean, NOT data variance
      // So limits do NOT collapse for C-chart (this is correct Poisson behavior)
      expect(limits.ul99![i]).toBeGreaterThan(8);
      expect(isFinite(limits.ul99![i])).toBeTrue();
      expect(isFinite(limits.ll99![i])).toBeTrue();
    }
  });

  for (const chartType of continuousCharts) {
    it(`${chartType}-chart with identical non-zero values: limits collapse to centreline`, () => {
      const n = 10;
      const args = buildControlLimitsArgs({
        keys: makeKeys(n),
        numerators: new Array(n).fill(42)
      });
      const limits = limitFnMap[chartType](args);

      for (let i = 0; i < limits.keys.length; i++) {
        expect(limits.targets[i]).toBeCloseTo(42, 5);
        if (chartType !== "run") {
          // MR = 0 for all points, so sigma = 0, limits = centreline
          expect(limits.ul99![i]).toBeCloseTo(42, 5);
          expect(limits.ll99![i]).toBeCloseTo(42, 5);
          expect(isFinite(limits.ul99![i])).toBeTrue();
          expect(isFinite(limits.ll99![i])).toBeTrue();
        }
      }
    });
  }

  it("S-chart with identical SDs: pooled SD equals the common value", () => {
    const n = 5;
    const commonSD = 3.0;
    const args = buildControlLimitsArgs({
      keys: makeKeys(n),
      numerators: new Array(n).fill(commonSD),
      denominators: new Array(n).fill(10)
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < n; i++) {
      // Pooled SD = sqrt(Σ(n-1)*s² / Σ(n-1)) = sqrt(s²) = s when all identical
      expect(limits.targets[i]).toBeCloseTo(commonSD, 5);
      expect(isFinite(limits.ul99![i])).toBeTrue();
      expect(limits.ll99![i]).toBeGreaterThanOrEqual(0);
    }
  });
});

// ===== Edge Case 7: Reference-value assertions =====
// Independently computed expected values — NOT restating formulas from implementation.
// These catch bugs where the formula itself is wrong (e.g., wrong constant, missing sqrt).

describe("Reference-value assertions (independently computed)", () => {

  it("C-chart: exact limits for c-bar=4", () => {
    // Data: all counts = 4, c-bar = 4, sigma = sqrt(4) = 2
    // Independently computed:
    //   UCL(3σ) = 4 + 3*2 = 10
    //   LCL(3σ) = max(0, 4 - 6) = 0
    //   UCL(2σ) = 4 + 2*2 = 8
    //   LCL(2σ) = max(0, 4 - 4) = 0
    //   UCL(1σ) = 4 + 2 = 6
    //   LCL(1σ) = max(0, 4 - 2) = 2
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [4, 4, 4, 4, 4]
    });
    const limits = limitFunctions.c(args);

    expect(limits.targets[0]).toBeCloseTo(4.0, 10);
    expect(limits.ul99![0]).toBeCloseTo(10.0, 10);
    expect(limits.ll99![0]).toBeCloseTo(0.0, 10);
    expect(limits.ul95![0]).toBeCloseTo(8.0, 10);
    expect(limits.ll95![0]).toBeCloseTo(0.0, 10);
    expect(limits.ul68![0]).toBeCloseTo(6.0, 10);
    expect(limits.ll68![0]).toBeCloseTo(2.0, 10);
  });

  it("P-chart: exact limits for p-bar=0.1, n=100", () => {
    // Data: 10 defectives per 100 samples, 5 subgroups
    // p-bar = 50/500 = 0.1
    // sigma = sqrt(0.1 * 0.9 / 100) = sqrt(0.0009) = 0.03
    // Independently computed:
    //   UCL(3σ) = min(1, 0.1 + 0.09) = 0.19
    //   LCL(3σ) = max(0, 0.1 - 0.09) = 0.01
    //   UCL(2σ) = min(1, 0.1 + 0.06) = 0.16
    //   LCL(2σ) = max(0, 0.1 - 0.06) = 0.04
    //   UCL(1σ) = min(1, 0.1 + 0.03) = 0.13
    //   LCL(1σ) = max(0, 0.1 - 0.03) = 0.07
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [10, 10, 10, 10, 10],
      denominators: [100, 100, 100, 100, 100]
    });
    const limits = limitFunctions.p(args);

    expect(limits.targets[0]).toBeCloseTo(0.10, 10);
    expect(limits.ul99![0]).toBeCloseTo(0.19, 10);
    expect(limits.ll99![0]).toBeCloseTo(0.01, 10);
    expect(limits.ul95![0]).toBeCloseTo(0.16, 10);
    expect(limits.ll95![0]).toBeCloseTo(0.04, 10);
    expect(limits.ul68![0]).toBeCloseTo(0.13, 10);
    expect(limits.ll68![0]).toBeCloseTo(0.07, 10);
  });

  it("P-chart: varying denominators produce different limit widths at each point", () => {
    // p-bar = (10+10)/(50+200) = 20/250 = 0.08
    // Point 0 (n=50):  sigma = sqrt(0.08*0.92/50) = sqrt(0.001472) = 0.03837
    //   UCL = min(1, 0.08 + 3*0.03837) = 0.19510
    //   LCL = max(0, 0.08 - 3*0.03837) = 0
    // Point 1 (n=200): sigma = sqrt(0.08*0.92/200) = sqrt(0.000368) = 0.01918
    //   UCL = min(1, 0.08 + 3*0.01918) = 0.13755
    //   LCL = max(0, 0.08 - 3*0.01918) = 0.02245
    const args = buildControlLimitsArgs({
      keys: makeKeys(2),
      numerators: [10, 10],
      denominators: [50, 200]
    });
    const limits = limitFunctions.p(args);

    expect(limits.targets[0]).toBeCloseTo(0.08, 5);
    // Point 0: wider limits (smaller sample)
    expect(limits.ul99![0]).toBeCloseTo(0.19510, 3);
    expect(limits.ll99![0]).toBeCloseTo(0.0, 5);
    // Point 1: tighter limits (larger sample)
    expect(limits.ul99![1]).toBeCloseTo(0.13755, 3);
    expect(limits.ll99![1]).toBeCloseTo(0.02245, 3);
    // Confirm: smaller sample → wider limits
    const width0 = limits.ul99![0] - limits.ll99![0];
    const width1 = limits.ul99![1] - limits.ll99![1];
    expect(width0).toBeGreaterThan(width1);
  });
});

// ===== Edge Case 8: B3 boundary crossing =====
// B3(n, 3) crosses zero around n=6 for 3-sigma limits.
// At n=5: B3 < 0 → clamped to 0. At n=6: B3 >= 0 → not clamped.

describe("S-chart B3 boundary crossing (n=5 vs n=6)", () => {

  it("n=5: lower 3-sigma limit is clamped to exactly 0", () => {
    // b3(5, 3) ≈ -0.089 → Math.max(0, cl * (-0.089)) = 0
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [5, 5, 5, 5, 5]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBe(0);
    }
  });

  it("n=6: lower 3-sigma limit is naturally positive (no clamping)", () => {
    // b3(6, 3) > 0 → lower limit = cl * b3 > 0
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: [3.5, 4.2, 3.8, 4.0, 3.9],
      denominators: [6, 6, 6, 6, 6]
    });
    const limits = limitFunctions.s(args);

    for (let i = 0; i < limits.keys.length; i++) {
      expect(limits.ll99![i]).toBeGreaterThan(0);
    }
  });

  it("mixed n=5 and n=6: clamped and unclamped limits coexist", () => {
    const args = buildControlLimitsArgs({
      keys: makeKeys(4),
      numerators: [3.5, 4.2, 3.8, 4.0],
      denominators: [5, 6, 5, 6]
    });
    const limits = limitFunctions.s(args);

    // n=5 points (indices 0, 2): clamped to 0
    expect(limits.ll99![0]).toBe(0);
    expect(limits.ll99![2]).toBe(0);
    // n=6 points (indices 1, 3): naturally positive
    expect(limits.ll99![1]).toBeGreaterThan(0);
    expect(limits.ll99![3]).toBeGreaterThan(0);
  });
});

// ===== Edge Case 9: Extreme outlier with subset exclusion =====

describe("Extreme outlier with subset exclusion", () => {

  it("I-chart: excluding extreme outlier dramatically tightens limits", () => {
    const numerators = [10, 11, 9, 10, 1_000_000];
    const argsSubset = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      subset_points: [0, 1, 2, 3] // Exclude the outlier
    });
    const argsFull = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators
    });
    const limitsSubset = limitFunctions.i(argsSubset);
    const limitsFull = limitFunctions.i(argsFull);

    // Subset target: (10+11+9+10)/4 = 10
    expect(limitsSubset.targets[0]).toBeCloseTo(10, 1);
    // Full target: (10+11+9+10+1000000)/5 = 200008
    expect(limitsFull.targets[0]).toBeCloseTo(200008, 0);

    // Subset limits should be DRAMATICALLY tighter
    const subsetWidth = limitsSubset.ul99![0] - limitsSubset.ll99![0];
    const fullWidth = limitsFull.ul99![0] - limitsFull.ll99![0];
    expect(subsetWidth).toBeLessThan(fullWidth / 100); // >100x tighter
  });

  it("C-chart: outlier excluded from subset does not affect limits", () => {
    const numerators = [5, 4, 6, 5, 10_000];
    const args = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      subset_points: [0, 1, 2, 3]
    });
    const limits = limitFunctions.c(args);

    // Target from first 4: (5+4+6+5)/4 = 5
    expect(limits.targets[0]).toBeCloseTo(5, 5);
    // UCL = 5 + 3*sqrt(5) ≈ 11.708 — the 10,000 outlier should have no effect
    expect(limits.ul99![0]).toBeCloseTo(11.708, 0);
    // The outlier point should still be plotted (values present for all 5 points)
    expect(limits.values[4]).toBe(10_000);
    expect(limits.keys.length).toBe(5);
  });

  it("P-chart: extreme outlier proportion excluded from pbar", () => {
    // Normal proportions ~10%, outlier at 100%
    const numerators = [10, 12, 11, 10, 100];
    const denominators = [100, 100, 100, 100, 100];
    const argsSubset = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      denominators: denominators,
      subset_points: [0, 1, 2, 3]
    });
    const argsFull = buildControlLimitsArgs({
      keys: makeKeys(5),
      numerators: numerators,
      denominators: denominators
    });
    const limitsSubset = limitFunctions.p(argsSubset);
    const limitsFull = limitFunctions.p(argsFull);

    // Subset pbar: (10+12+11+10)/400 = 0.1075
    expect(limitsSubset.targets[0]).toBeCloseTo(0.1075, 4);
    // Full pbar: (10+12+11+10+100)/500 = 0.286
    expect(limitsFull.targets[0]).toBeCloseTo(0.286, 3);

    // Subset limits should be tighter (lower pbar, less variance)
    const subsetWidth = limitsSubset.ul99![0] - limitsSubset.ll99![0];
    const fullWidth = limitsFull.ul99![0] - limitsFull.ll99![0];
    expect(subsetWidth).toBeLessThan(fullWidth);
  });
});

// ===== Edge Case 10: Large dataset =====

describe("Large dataset", () => {

  it("I-chart handles 500 data points with correct centreline and finite limits", () => {
    const n = 500;
    const numerators = Array.from({ length: n }, (_, i) => Math.sin(i) * 100);
    const args = buildControlLimitsArgs({
      keys: makeKeys(n),
      numerators: numerators
    });
    const limits = limitFunctions.i(args);

    expect(limits.keys.length).toBe(n);

    // Centreline should be close to mean of sin(0..499)*100
    const expectedMean = numerators.reduce((a, b) => a + b, 0) / n;
    expect(limits.targets[0]).toBeCloseTo(expectedMean, 2);

    // All limits must be finite and correctly ordered
    for (let i = 0; i < n; i++) {
      expect(isFinite(limits.ul99![i])).toBeTrue();
      expect(isFinite(limits.ll99![i])).toBeTrue();
      expect(limits.ul99![i]).toBeGreaterThan(limits.targets[i]);
      expect(limits.ll99![i]).toBeLessThan(limits.targets[i]);
    }
  });
});
