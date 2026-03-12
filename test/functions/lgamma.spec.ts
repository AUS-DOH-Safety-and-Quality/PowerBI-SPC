import lgamma from "../../src/Functions/lgamma";

describe("lgamma", () => {

    it("should return correct values for positive integers (ln of factorial)", () => {
        // lgamma(n) = ln((n-1)!)
        expect(lgamma(1)).toBeCloseTo(Math.log(1)); // ln(0!) = ln(1) = 0
        expect(lgamma(2)).toBeCloseTo(Math.log(1)); // ln(1!) = ln(1) = 0
        expect(lgamma(3)).toBeCloseTo(Math.log(2)); // ln(2!) = ln(2)
        expect(lgamma(4)).toBeCloseTo(Math.log(6)); // ln(3!) = ln(6)
        expect(lgamma(5)).toBeCloseTo(Math.log(24)); // ln(4!) = ln(24)
    });

    it("should return correct values for half-integers", () => {
        // gamma(0.5) = sqrt(PI)
        expect(lgamma(0.5)).toBeCloseTo(Math.log(Math.sqrt(Math.PI)));
        // gamma(1.5) = 0.5 * sqrt(PI)
        expect(lgamma(1.5)).toBeCloseTo(Math.log(0.5 * Math.sqrt(Math.PI)));
    });

    it("should handle small positive numbers", () => {
        // gamma(x) ~ 1/x for small x
        // lgamma(x) ~ -ln(x)
        expect(lgamma(0.1)).toBeCloseTo(Math.log(9.513507698668736));
        expect(lgamma(0.01)).toBeCloseTo(Math.log(99.4325851191506));
    });

    it("should handle negative non-integer numbers (ln of absolute gamma)", () => {
        // gamma(-0.5) = -2 * sqrt(PI)
        // lgamma(-0.5) = ln(2 * sqrt(PI))
        expect(lgamma(-0.5)).toBeCloseTo(Math.log(2 * Math.sqrt(Math.PI)));

        // gamma(-1.5) = (4/3) * sqrt(PI)
        expect(lgamma(-1.5)).toBeCloseTo(Math.log((4/3) * Math.sqrt(Math.PI)));
    });

    it("should return Infinity for 0 and negative integers", () => {
        // Implementation check: if (x <= 0 && x === Math.trunc(x)) return Number.POSITIVE_INFINITY;
        expect(lgamma(0)).toBe(Number.POSITIVE_INFINITY);
        expect(lgamma(-1)).toBe(Number.POSITIVE_INFINITY);
        expect(lgamma(-2)).toBe(Number.POSITIVE_INFINITY);
    });

    it("should return NaN for NaN input", () => {
        expect(lgamma(NaN)).toBeNaN();
    });

    it("should maintain accuracy for larger integers", () => {
        // lgamma(6) = ln(120)
        expect(lgamma(6)).toBeCloseTo(Math.log(120));
        // lgamma(10) = ln(362880)
        expect(lgamma(10)).toBeCloseTo(Math.log(362880));
    });

    it("should handle very large numbers (where gamma would overflow)", () => {
        // gamma(171) is just within double precision range (~7.25e306)
        // lgamma(171) should be accurate
        const expected171 = 706.573062245787; // precomputed or approximate
        expect(lgamma(171)).toBeCloseTo(expected171);

        // gamma(1000) overflows double (~4e2567), but lgamma(1000) is fine (~5912)
        // Stirling approximation: ln(n!) ~ n*ln(n) - n
        // lgamma(1001) = ln(1000!) ~ 1000*ln(1000) - 1000 = 6907 - 1000 = 5907
        // Actual value ~ 5912.128
        expect(lgamma(1001)).toBeCloseTo(5912.128178, 1);

        // Should be finite for very large numbers where gamma is Infinity
        expect(isFinite(lgamma(1000))).toBe(true);
        expect(isFinite(lgamma(1e10))).toBe(true);
    });
});
