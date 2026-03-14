import { c4, c5, a3, b3, b4 } from "../../src/Functions/sampleConstants";
import {
  PUBLISHED_C4, PUBLISHED_A3, PUBLISHED_B3_K3, PUBLISHED_B4_K3, PRECISION
} from "../fixtures/publishedConstants";

/**
 * Verifies statistical constants against published tables.
 *
 * Reference values are sourced from test/fixtures/publishedConstants.ts,
 * which was web-validated 2026-03-12 against:
 *   - r-bar.net XbarS Constants table (4dp, n=2..30)
 *   - QualityAmerica Control Chart Constants table
 *   - MIT AIAG SPC reference PDF
 *   - Montgomery, "Introduction to Statistical Quality Control", Table VI
 *
 * These constants are foundational to all SPC limit calculations.
 * Incorrect values here propagate errors to every chart type.
 */
describe("sampleConstants", () => {

  // ===== c4: Bias correction for sample standard deviation =====
  // c4(n) = sqrt(2/(n-1)) * Γ(n/2) / Γ((n-1)/2)
  describe("c4", () => {
    const testPoints: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25];

    testPoints.forEach((n) => {
      it(`c4(${n}) should match published value ${PUBLISHED_C4[n]}`, () => {
        expect(c4(n)).toBeCloseTo(PUBLISHED_C4[n], PRECISION.C4);
      });
    });

    it("should return null for n <= 1", () => {
      expect(c4(1)).toBeNull();
      expect(c4(0)).toBeNull();
      expect(c4(-1)).toBeNull();
    });

    it("should return null for null/undefined input", () => {
      expect(c4(null as any)).toBeNull();
      expect(c4(undefined as any)).toBeNull();
    });

    it("should be monotonically increasing for n >= 2", () => {
      for (let n = 2; n < 50; n++) {
        expect(c4(n + 1)).toBeGreaterThan(c4(n));
      }
    });

    it("should converge toward 1 for large n", () => {
      expect(c4(100)).toBeGreaterThan(0.997);
      expect(c4(100)).toBeLessThan(1.0);
      expect(c4(1000)).toBeGreaterThan(0.9997);
      expect(c4(1000)).toBeLessThan(1.0);
    });

    it("should not produce NaN for large n", () => {
      expect(isNaN(c4(500))).toBeFalse();
      expect(isNaN(c4(1000))).toBeFalse();
    });
  });

  // ===== c5: Relative variability of sample SD =====
  // c5(n) = sqrt(1 - c4(n)^2)
  // NOTE: c5 is not independently published in standard tables.
  // Reference values below are derived from published c4.
  describe("c5", () => {
    const derivedC5: [number, number][] = [
      [2,  0.6028],
      [3,  0.4633],
      [5,  0.3412],
      [10, 0.2321],
      [25, 0.1439],
    ];

    derivedC5.forEach(([n, expected]) => {
      it(`c5(${n}) should be approximately ${expected}`, () => {
        expect(c5(n)).toBeCloseTo(expected, 3);
      });
    });

    it("should be monotonically decreasing for n >= 2", () => {
      for (let n = 2; n < 50; n++) {
        expect(c5(n + 1)).toBeLessThan(c5(n));
      }
    });

    it("should converge toward 0 for large n", () => {
      expect(c5(100)).toBeLessThan(0.1);
      expect(c5(100)).toBeGreaterThan(0);
    });
  });

  // ===== a3: X-bar chart control limit factor =====
  // a3(n) = 3 / (c4(n) * sqrt(n))
  describe("a3", () => {
    const testPoints: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25];

    testPoints.forEach((n) => {
      it(`a3(${n}) should match published value ${PUBLISHED_A3[n]}`, () => {
        expect(a3(n)).toBeCloseTo(PUBLISHED_A3[n], PRECISION.A3);
      });
    });

    it("should be monotonically decreasing for n >= 2", () => {
      for (let n = 2; n < 50; n++) {
        expect(a3(n + 1)).toBeLessThan(a3(n));
      }
    });

    it("should converge toward 0 for large n", () => {
      expect(a3(100)).toBeLessThan(0.31);
      expect(a3(100)).toBeGreaterThan(0);
    });
  });

  // ===== b3 and b4: S-chart control limit factors =====
  // b3(n, k) = 1 - k * c5(n) / c4(n)
  // b4(n, k) = 1 + k * c5(n) / c4(n)
  describe("b3 and b4", () => {
    it("should satisfy b4(n,k) > b3(n,k) for all valid n and k", () => {
      for (let n = 2; n <= 30; n++) {
        for (const k of [1, 2, 3]) {
          expect(b4(n, k)).toBeGreaterThan(b3(n, k));
        }
      }
    });

    // Published B3 values at k=3 — expanded from 5 to 13 test points
    const b3TestPoints: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25];

    b3TestPoints.forEach((n) => {
      it(`b3(${n}, 3) should match published value ${PUBLISHED_B3_K3[n]}`, () => {
        expect(b3(n, 3)).toBeCloseTo(PUBLISHED_B3_K3[n], PRECISION.B3_B4);
      });
    });

    // Published B4 values at k=3 — expanded from 5 to 13 test points
    const b4TestPoints: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25];

    b4TestPoints.forEach((n) => {
      it(`b4(${n}, 3) should match published value ${PUBLISHED_B4_K3[n]}`, () => {
        expect(b4(n, 3)).toBeCloseTo(PUBLISHED_B4_K3[n], PRECISION.B3_B4);
      });
    });

    it("b3 at k=3 should be negative for small sample sizes (n < ~6)", () => {
      expect(b3(2, 3)).toBeLessThan(0);
      expect(b3(3, 3)).toBeLessThan(0);
      expect(b3(4, 3)).toBeLessThan(0);
      expect(b3(5, 3)).toBeLessThan(0);
    });

    it("b3 at k=3 should become positive for larger sample sizes", () => {
      expect(b3(6, 3)).toBeGreaterThan(0);
      expect(b3(10, 3)).toBeGreaterThan(0);
      expect(b3(25, 3)).toBeGreaterThan(0);
    });

    it("b4 should always be positive", () => {
      for (let n = 2; n <= 50; n++) {
        for (const k of [1, 2, 3]) {
          expect(b4(n, k)).toBeGreaterThan(0);
        }
      }
    });
  });
});
