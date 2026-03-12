import gamma from "../../src/Functions/gamma";

describe("gamma", () => {

    it("should return correct values for positive integers (factorial)", () => {
        // gamma(n) = (n-1)!
        expect(gamma(1)).toBeCloseTo(1);
        expect(gamma(2)).toBeCloseTo(1);
        expect(gamma(3)).toBeCloseTo(2);
        expect(gamma(4)).toBeCloseTo(6);
        expect(gamma(5)).toBeCloseTo(24);
    });

    it("should return correct values for half-integers", () => {
        // gamma(0.5) = sqrt(PI)
        expect(gamma(0.5)).toBeCloseTo(Math.sqrt(Math.PI));
        // gamma(1.5) = 0.5 * sqrt(PI)
        expect(gamma(1.5)).toBeCloseTo(0.5 * Math.sqrt(Math.PI));
    });

    it("should handle small positive numbers", () => {
        // Test values close to 0
        expect(gamma(0.1)).toBeCloseTo(9.513507698668736);
        expect(gamma(0.01)).toBeCloseTo(99.4325851191506);
    });

    it("should handle negative non-integer numbers", () => {
        // gamma(-0.5) = -2 * sqrt(PI)
        expect(gamma(-0.5)).toBeCloseTo(-2 * Math.sqrt(Math.PI));

        // gamma(-1.5) = (4/3) * sqrt(PI)
        expect(gamma(-1.5)).toBeCloseTo((4/3) * Math.sqrt(Math.PI));
    });

    it("should return NaN for 0", () => {
        expect(gamma(0)).toBeNaN();
    });

    it("should return NaN for negative integers", () => {
        expect(gamma(-1)).toBeNaN();
        expect(gamma(-2)).toBeNaN();
        expect(gamma(-10)).toBeNaN();
    });

    it("should return NaN for NaN input", () => {
        expect(gamma(NaN)).toBeNaN();
    });

    it("should handle large positive numbers using Stirling's approximation implicitly", () => {
        // gamma(10) = 362880
        expect(gamma(10)).toBeCloseTo(362880);
    });

    it("should maintain accuracy for larger integers", () => {
        // gamma(6) = 120
        expect(gamma(6)).toBeCloseTo(120);
        // gamma(7) = 720
        expect(gamma(7)).toBeCloseTo(720);
        // gamma(8) = 5040
        expect(gamma(8)).toBeCloseTo(5040);
        // gamma(9) = 40320
        expect(gamma(9)).toBeCloseTo(40320);
    });

    it("should maintain accuracy for larger non-integers", () => {
         // gamma(2.5) = 1.329340...
         expect(gamma(2.5)).toBeCloseTo(1.329340388179);
         // gamma(3.5) = 3.323350...
         expect(gamma(3.5)).toBeCloseTo(3.323350970447);
         // gamma(4.5) = 11.631728...
         expect(gamma(4.5)).toBeCloseTo(11.631728396567);
    });

    it("should handle larger arguments approaching overflow", () => {
        // 170! = 7.257415615307999e+306
        // We use a custom matcher logic here essentially because toBeCloseTo expects number of decimal places
        // for large numbers we care about relative precision.
        // gamma(171) ~ 7.2574e306

        const res = gamma(171);
        const expected = 7.257415615307999e+306;
        // Check if within 0.000001% relative error
        expect(Math.abs(res - expected) / expected).toBeLessThan(1e-8);

        expect(isFinite(gamma(50))).toBe(true);
        expect(isFinite(gamma(100))).toBe(true);
        expect(isFinite(gamma(170))).toBe(true);
    });

    it("should handle very small positive numbers close to zero", () => {
        // gamma(epsilon) ~= 1/epsilon - gamma_constant
        const eps = 1e-10;
        const result = gamma(eps);
        const expected = 1/eps - 0.5772156649;
        expect(result).toBeCloseTo(expected, 1);
    });
});
