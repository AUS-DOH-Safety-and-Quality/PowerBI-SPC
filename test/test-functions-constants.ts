import { c4, c5, a3, b3, b4 } from "../src/Functions/Constants";

describe("Utility Functions - Statistical Constants", () => {
  describe("c4() - Unbiased Estimator Constant", () => {
    it("should calculate c4 for sample size 2", () => {
      // Known value: c4(2) ≈ 0.7979
      const result = c4(2);
      expect(result).toBeCloseTo(0.7979, 4);
    });

    it("should calculate c4 for sample size 5", () => {
      // Known value: c4(5) ≈ 0.9400
      const result = c4(5);
      expect(result).toBeCloseTo(0.9400, 4);
    });

    it("should calculate c4 for sample size 10", () => {
      // Known value: c4(10) ≈ 0.9727
      const result = c4(10);
      expect(result).toBeCloseTo(0.9727, 4);
    });

    it("should calculate c4 for sample size 25", () => {
      // Known value: c4(25) ≈ 0.9896
      const result = c4(25);
      expect(result).toBeCloseTo(0.9896, 4);
    });

    it("should return null for sample size 1", () => {
      const result = c4(1);
      expect(result).toBe(null);
    });

    it("should return null for sample size 0", () => {
      const result = c4(0);
      expect(result).toBe(null);
    });

    it("should return null for negative sample size", () => {
      const result = c4(-5);
      expect(result).toBe(null);
    });

    it("should return null for null input", () => {
      const result = c4(null);
      expect(result).toBe(null);
    });

    it("should return null for undefined input", () => {
      const result = c4(undefined);
      expect(result).toBe(null);
    });

    it("should broadcast over array of sample sizes", () => {
      const result = c4([2, 5, 10]);
      expect(result.length).toBe(3);
      expect(result[0]).toBeCloseTo(0.7979, 4);
      expect(result[1]).toBeCloseTo(0.9400, 4);
      expect(result[2]).toBeCloseTo(0.9727, 4);
    });

    it("should approach 1 as sample size increases", () => {
      const result50 = c4(50);
      const result100 = c4(100);
      expect(result50).toBeGreaterThan(0.99);
      expect(result100).toBeGreaterThan(result50);
      expect(result100).toBeLessThan(1.0);
    });
  });

  describe("c5() - Standard Deviation Constant", () => {
    it("should calculate c5 for sample size 2", () => {
      // c5 = sqrt(1 - c4^2)
      const result = c5(2);
      const expected = Math.sqrt(1 - Math.pow(0.7979, 2));
      expect(result).toBeCloseTo(expected, 4);
    });

    it("should calculate c5 for sample size 5", () => {
      const result = c5(5);
      const expected = Math.sqrt(1 - Math.pow(0.9400, 2));
      expect(result).toBeCloseTo(expected, 4);
    });

    it("should calculate c5 for sample size 10", () => {
      const result = c5(10);
      expect(result).toBeCloseTo(0.2322, 3);
    });

    it("should approach 0 as sample size increases", () => {
      const result50 = c5(50);
      const result100 = c5(100);
      expect(result50).toBeLessThan(0.15);
      expect(result100).toBeLessThan(result50);
      expect(result100).toBeGreaterThan(0);
    });

    it("should handle sample size 1 (c4 is null)", () => {
      const result = c5(1);
      // c5 = sqrt(1 - c4^2), c4(1) = null, square(null) = null (see broadcastUnary)
      // sqrt(1 - null) = sqrt(1) = 1
      expect(result).toBe(1);
    });

    it("should broadcast over array", () => {
      const result = c5([2, 5, 10]);
      expect(result.length).toBe(3);
      expect(result[0]).toBeCloseTo(0.6028, 3);
      expect(result[1]).toBeCloseTo(0.3414, 3);
      expect(result[2]).toBeCloseTo(0.2318, 3);
    });
  });

  describe("a3() - XBar Chart Constant", () => {
    it("should calculate a3 for sample size 2", () => {
      // a3 = 3 / (c4 * sqrt(n))
      const result = a3(2);
      const c4_val = c4(2);
      const expected = 3.0 / (c4_val * Math.sqrt(2));
      expect(result).toBeCloseTo(expected, 4);
    });

    it("should calculate a3 for sample size 5", () => {
      const result = a3(5);
      // a3(5) ≈ 1.427
      expect(result).toBeCloseTo(1.427, 3);
    });

    it("should calculate a3 for sample size 10", () => {
      const result = a3(10);
      // a3(10) ≈ 0.975
      expect(result).toBeCloseTo(0.975, 3);
    });

    it("should decrease as sample size increases", () => {
      const result5 = a3(5);
      const result10 = a3(10);
      const result25 = a3(25);
      expect(result5).toBeGreaterThan(result10);
      expect(result10).toBeGreaterThan(result25);
    });

    it("should return Infinity for sample size 1 (division by zero)", () => {
      const result = a3(1);
      // a3 filters sample size <= 1 to null, then 3 / (c4(null) * sqrt(null))
      // c4(null) = null, so 3 / (null * NaN) = 3 / NaN = Infinity
      expect(result).toBe(Infinity);
    });

    it("should return Infinity for sample size 0 (division by zero)", () => {
      const result = a3(0);
      // a3 = 3 / (c4 * sqrt(n)), when n=0, sqrt(0)=0, so division by zero
      expect(result).toBe(Infinity);
    });

    it("should broadcast over array", () => {
      const result = a3([2, 5, 10]);
      expect(result.length).toBe(3);
      expect(result[0]).toBeCloseTo(2.659, 3);
      expect(result[1]).toBeCloseTo(1.427, 3);
      expect(result[2]).toBeCloseTo(0.975, 3);
    });
  });

  describe("b3() - Lower Control Limit Constant", () => {
    it("should calculate b3 for sample size 2, sigma 3", () => {
      // b3 = 1 - (sigma * c5 / c4)
      const result = b3(2, 3);
      const c4_val = c4(2);
      const c5_val = c5(2);
      const expected = 1 - (3 * c5_val / c4_val);
      expect(result).toBeCloseTo(expected, 4);
    });

    it("should calculate b3 for sample size 5, sigma 3", () => {
      const result = b3(5, 3);
      // b3(5, 3) ≈ -0.089 (can be negative)
      expect(result).toBeCloseTo(-0.089, 2);
    });

    it("should calculate b3 for sample size 10, sigma 3", () => {
      const result = b3(10, 3);
      expect(result).toBeCloseTo(0.284, 3);
    });

    it("should work with sigma = 2", () => {
      const result = b3(5, 2);
      const result3 = b3(5, 3);
      // Lower sigma should give higher b3
      expect(result).toBeGreaterThan(result3);
    });

    it("should increase as sample size increases (for fixed sigma)", () => {
      const result5 = b3(5, 3);
      const result10 = b3(10, 3);
      const result25 = b3(25, 3);
      expect(result10).toBeGreaterThan(result5);
      expect(result25).toBeGreaterThan(result10);
    });

    it("should handle sample size 1", () => {
      const result = b3(1, 3);
      // b3 = 1 - (sigma * c5 / c4), with c4(1)=null and c5(1)=1
      // = 1 - (3 * 1 / null) = 1 - Infinity = -Infinity
      expect(result).toBe(-Infinity);
    });

    it("should broadcast over sample sizes", () => {
      const result = b3([5, 10, 25], 3);
      expect(result.length).toBe(3);
      expect(result[0]).toBeCloseTo(-0.089, 2);
      expect(result[1]).toBeCloseTo(0.284, 2);
      expect(result[2]).toBeCloseTo(0.565, 2);
    });

    it("should broadcast over sigmas", () => {
      const result = b3(10, [2, 3]);
      expect(result.length).toBe(2);
      expect(result[0]).toBeGreaterThan(result[1]);
    });
  });

  describe("b4() - Upper Control Limit Constant", () => {
    it("should calculate b4 for sample size 2, sigma 3", () => {
      // b4 = 1 + (sigma * c5 / c4)
      const result = b4(2, 3);
      const c4_val = c4(2);
      const c5_val = c5(2);
      const expected = 1 + (3 * c5_val / c4_val);
      expect(result).toBeCloseTo(expected, 4);
    });

    it("should calculate b4 for sample size 5, sigma 3", () => {
      const result = b4(5, 3);
      // b4(5, 3) ≈ 2.089
      expect(result).toBeCloseTo(2.089, 3);
    });

    it("should calculate b4 for sample size 10, sigma 3", () => {
      const result = b4(10, 3);
      expect(result).toBeCloseTo(1.716, 3);
    });

    it("should be symmetric with b3 around 1", () => {
      const b3_val = b3(10, 3);
      const b4_val = b4(10, 3);
      const avg = (b3_val + b4_val) / 2;
      expect(avg).toBeCloseTo(1.0, 4);
    });

    it("should decrease as sample size increases (for fixed sigma)", () => {
      const result5 = b4(5, 3);
      const result10 = b4(10, 3);
      const result25 = b4(25, 3);
      expect(result5).toBeGreaterThan(result10);
      expect(result10).toBeGreaterThan(result25);
      // All should be > 1
      expect(result25).toBeGreaterThan(1.0);
    });

    it("should work with different sigma values", () => {
      const result2 = b4(10, 2);
      const result3 = b4(10, 3);
      // Higher sigma gives higher b4
      expect(result3).toBeGreaterThan(result2);
    });

    it("should handle sample size 1", () => {
      const result = b4(1, 3);
      // b4 = 1 + (sigma * c5 / c4), with c4(1)=null and c5(1)=1
      // = 1 + (3 * 1 / null) = 1 + Infinity = Infinity
      expect(result).toBe(Infinity);
    });

    it("should broadcast over sample sizes", () => {
      const result = b4([5, 10, 25], 3);
      expect(result.length).toBe(3);
      expect(result[0]).toBeCloseTo(2.089, 3);
      expect(result[1]).toBeCloseTo(1.716, 3);
      expect(result[2]).toBeCloseTo(1.435, 3);
    });

    it("should broadcast over both parameters", () => {
      const result = b4([5, 10], [2, 3]);
      expect(result.length).toBe(2);
      // Each should get corresponding pair
      expect(result[0]).toBeCloseTo(b4(5, 2), 4);
      expect(result[1]).toBeCloseTo(b4(10, 3), 4);
    });
  });

  describe("Constants relationship tests", () => {
    it("should satisfy c4^2 + c5^2 = 1 for various sample sizes", () => {
      const sizes = [2, 5, 10, 25, 50];
      sizes.forEach(n => {
        const c4_val = c4(n);
        const c5_val = c5(n);
        const sum_squares = c4_val * c4_val + c5_val * c5_val;
        expect(sum_squares).toBeCloseTo(1.0, 10);
      });
    });

    it("should have b3 and b4 equidistant from 1", () => {
      const sizes = [5, 10, 25];
      sizes.forEach(n => {
        const b3_val = b3(n, 3);
        const b4_val = b4(n, 3);
        const dist_b3 = Math.abs(b3_val - 1);
        const dist_b4 = Math.abs(b4_val - 1);
        expect(dist_b3).toBeCloseTo(dist_b4, 10);
      });
    });

    it("should have all constants approach limiting values for large n", () => {
      const c4_100 = c4(100);
      const c5_100 = c5(100);
      const a3_100 = a3(100);
      
      // c4 → 1 as n → ∞
      expect(c4_100).toBeGreaterThan(0.997);
      
      // c5 → 0 as n → ∞
      expect(c5_100).toBeLessThan(0.08);
      
      // a3 → 0 as n → ∞
      expect(a3_100).toBeLessThan(0.35);
    });
  });
});
