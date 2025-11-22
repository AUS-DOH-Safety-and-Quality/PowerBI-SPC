import broadcastBinary, {
  add,
  subtract,
  multiply,
  divide,
  pow
} from "../src/Functions/broadcastBinary";
import broadcastUnary, {
  sqrt,
  abs,
  exp,
  lgamma,
  square
} from "../src/Functions/broadcastUnary";

describe("Broadcasting Functions", () => {
  
  describe("broadcastBinary() - Binary operations", () => {
    
    describe("add() - Addition", () => {
      it("should add two scalars", () => {
        expect(add(3, 5)).toBe(8);
      });

      it("should broadcast scalar to array (left)", () => {
        const result = add(10, [1, 2, 3]);
        expect(result).toEqual([11, 12, 13]);
      });

      it("should broadcast scalar to array (right)", () => {
        const result = add([1, 2, 3], 10);
        expect(result).toEqual([11, 12, 13]);
      });

      it("should add two arrays element-wise", () => {
        const result = add([1, 2, 3], [4, 5, 6]);
        expect(result).toEqual([5, 7, 9]);
      });

      it("should handle negative numbers", () => {
        expect(add(-5, 3)).toBe(-2);
        expect(add([-1, -2], [3, 4])).toEqual([2, 2]);
      });

      it("should handle decimal numbers", () => {
        expect(add(1.5, 2.3)).toBeCloseTo(3.8, 10);
        expect(add([1.1, 2.2], [3.3, 4.4])[0]).toBeCloseTo(4.4, 10);
      });
    });

    describe("subtract() - Subtraction", () => {
      it("should subtract two scalars", () => {
        expect(subtract(10, 3)).toBe(7);
      });

      it("should broadcast scalar to array (left)", () => {
        const result = subtract(10, [1, 2, 3]);
        expect(result).toEqual([9, 8, 7]);
      });

      it("should broadcast scalar to array (right)", () => {
        const result = subtract([10, 20, 30], 5);
        expect(result).toEqual([5, 15, 25]);
      });

      it("should subtract two arrays element-wise", () => {
        const result = subtract([10, 20, 30], [1, 2, 3]);
        expect(result).toEqual([9, 18, 27]);
      });

      it("should handle negative results", () => {
        expect(subtract(3, 10)).toBe(-7);
      });
    });

    describe("multiply() - Multiplication", () => {
      it("should multiply two scalars", () => {
        expect(multiply(3, 5)).toBe(15);
      });

      it("should broadcast scalar to array (left)", () => {
        const result = multiply(2, [1, 2, 3]);
        expect(result).toEqual([2, 4, 6]);
      });

      it("should broadcast scalar to array (right)", () => {
        const result = multiply([1, 2, 3], 3);
        expect(result).toEqual([3, 6, 9]);
      });

      it("should multiply two arrays element-wise", () => {
        const result = multiply([2, 3, 4], [5, 6, 7]);
        expect(result).toEqual([10, 18, 28]);
      });

      it("should handle multiplication by zero", () => {
        expect(multiply(5, 0)).toBe(0);
        expect(multiply([1, 2, 3], 0)).toEqual([0, 0, 0]);
      });

      it("should return null when either input is null", () => {
        expect(multiply(null, 5)).toBe(null);
        expect(multiply(5, null)).toBe(null);
      });

      it("should handle negative numbers", () => {
        expect(multiply(-3, 5)).toBe(-15);
        expect(multiply(-3, -5)).toBe(15);
      });
    });

    describe("divide() - Division", () => {
      it("should divide two scalars", () => {
        expect(divide(10, 2)).toBe(5);
      });

      it("should broadcast scalar to array (left)", () => {
        const result = divide(12, [1, 2, 3]);
        expect(result).toEqual([12, 6, 4]);
      });

      it("should broadcast scalar to array (right)", () => {
        const result = divide([10, 20, 30], 2);
        expect(result).toEqual([5, 10, 15]);
      });

      it("should divide two arrays element-wise", () => {
        const result = divide([10, 20, 30], [2, 4, 5]);
        expect(result).toEqual([5, 5, 6]);
      });

      it("should handle division by zero (returns Infinity)", () => {
        expect(divide(10, 0)).toBe(Infinity);
      });

      it("should handle decimal division", () => {
        expect(divide(7, 2)).toBeCloseTo(3.5, 10);
      });

      it("should handle negative division", () => {
        expect(divide(-10, 2)).toBe(-5);
        expect(divide(10, -2)).toBe(-5);
        expect(divide(-10, -2)).toBe(5);
      });
    });

    describe("pow() - Power/Exponentiation", () => {
      it("should raise scalar to power", () => {
        expect(pow(2, 3)).toBe(8);
        expect(pow(5, 2)).toBe(25);
      });

      it("should broadcast scalar to array (base)", () => {
        const result = pow(2, [1, 2, 3, 4]);
        expect(result).toEqual([2, 4, 8, 16]);
      });

      it("should broadcast scalar to array (exponent)", () => {
        const result = pow([2, 3, 4], 2);
        expect(result).toEqual([4, 9, 16]);
      });

      it("should handle power of zero", () => {
        expect(pow(5, 0)).toBe(1);
        expect(pow(0, 5)).toBe(0);
      });

      it("should handle power of one", () => {
        expect(pow(5, 1)).toBe(5);
      });

      it("should handle fractional exponents (square root)", () => {
        expect(pow(9, 0.5)).toBeCloseTo(3, 10);
        expect(pow(27, 1/3)).toBeCloseTo(3, 10);
      });

      it("should handle negative base with integer exponent", () => {
        expect(pow(-2, 3)).toBe(-8);
        // The implementation uses special handling: (x >= 0.0) ? Math.pow(x, y) : -Math.pow(-x, y)
        // For -2^2: x=-2, so it returns -Math.pow(2, 2) = -4
        expect(pow(-2, 2)).toBe(-4);
      });

      it("should handle negative base with fractional exponent (special handling)", () => {
        // The implementation has special handling for negative x
        const result = pow(-8, 1/3);
        expect(result).toBeCloseTo(-2, 10);
      });

      it("should work with arrays element-wise", () => {
        const result = pow([2, 3, 4], [2, 2, 2]);
        expect(result).toEqual([4, 9, 16]);
      });
    });

    describe("broadcastBinary() - Custom operations", () => {
      it("should work with custom binary function", () => {
        const max = broadcastBinary((x: number, y: number) => Math.max(x, y));
        expect(max(5, 3)).toBe(5);
        expect(max([1, 5, 3], [4, 2, 6])).toEqual([4, 5, 6]);
      });

      it("should work with custom string concatenation", () => {
        const concat = broadcastBinary((x: string, y: string) => x + y);
        expect(concat("Hello", " World")).toBe("Hello World");
        expect(concat(["a", "b"], ["1", "2"])).toEqual(["a1", "b2"]);
      });
    });
  });

  describe("broadcastUnary() - Unary operations", () => {
    
    describe("sqrt() - Square root", () => {
      it("should calculate square root of scalar", () => {
        expect(sqrt(9)).toBe(3);
        expect(sqrt(16)).toBe(4);
        expect(sqrt(2)).toBeCloseTo(1.414, 3);
      });

      it("should broadcast to array", () => {
        const result = sqrt([4, 9, 16, 25]);
        expect(result).toEqual([2, 3, 4, 5]);
      });

      it("should handle zero", () => {
        expect(sqrt(0)).toBe(0);
      });

      it("should return NaN for negative numbers", () => {
        expect(sqrt(-1)).toBeNaN();
      });

      it("should handle decimal numbers", () => {
        expect(sqrt(0.25)).toBeCloseTo(0.5, 10);
      });
    });

    describe("abs() - Absolute value", () => {
      it("should return absolute value of positive number", () => {
        expect(abs(5)).toBe(5);
      });

      it("should return absolute value of negative number", () => {
        expect(abs(-5)).toBe(5);
      });

      it("should handle zero", () => {
        expect(abs(0)).toBe(0);
      });

      it("should broadcast to array", () => {
        const result = abs([-3, 5, -7, 0]);
        expect(result).toEqual([3, 5, 7, 0]);
      });

      it("should handle decimal numbers", () => {
        expect(abs(-3.14)).toBeCloseTo(3.14, 10);
      });

      it("should handle falsy values (special implementation)", () => {
        // The implementation returns falsy values unchanged
        expect(abs(null)).toBe(null);
      });
    });

    describe("exp() - Exponential (e^x)", () => {
      it("should calculate e^x for scalar", () => {
        expect(exp(0)).toBe(1);
        expect(exp(1)).toBeCloseTo(Math.E, 10);
      });

      it("should broadcast to array", () => {
        const result = exp([0, 1, 2]);
        expect(result[0]).toBeCloseTo(1, 10);
        expect(result[1]).toBeCloseTo(Math.E, 10);
        expect(result[2]).toBeCloseTo(Math.E * Math.E, 10);
      });

      it("should handle negative exponents", () => {
        expect(exp(-1)).toBeCloseTo(1 / Math.E, 10);
      });

      it("should handle large values", () => {
        expect(exp(10)).toBeCloseTo(22026.465794806718, 5);
      });
    });

    describe("lgamma() - Log gamma function", () => {
      it("should calculate log gamma for positive integers", () => {
        // lgamma(1) = log(0!) = log(1) = 0
        expect(lgamma(1)).toBeCloseTo(0, 10);
        // lgamma(2) = log(1!) = log(1) = 0
        expect(lgamma(2)).toBeCloseTo(0, 10);
        // lgamma(3) = log(2!) = log(2)
        expect(lgamma(3)).toBeCloseTo(Math.log(2), 10);
      });

      it("should broadcast to array", () => {
        const result = lgamma([1, 2, 3]);
        expect(result[0]).toBeCloseTo(0, 10);
        expect(result[1]).toBeCloseTo(0, 10);
        expect(result[2]).toBeCloseTo(Math.log(2), 10);
      });

      it("should handle decimal values", () => {
        // lgamma exists for positive real numbers
        const result = lgamma(1.5);
        expect(result).toBeDefined();
        expect(isFinite(result)).toBe(true);
      });
    });

    describe("square() - Squaring", () => {
      it("should square a positive number", () => {
        expect(square(5)).toBe(25);
        expect(square(3)).toBe(9);
      });

      it("should square a negative number", () => {
        expect(square(-5)).toBe(25);
        expect(square(-3)).toBe(9);
      });

      it("should handle zero", () => {
        expect(square(0)).toBe(0);
      });

      it("should broadcast to array", () => {
        const result = square([1, 2, 3, 4]);
        expect(result).toEqual([1, 4, 9, 16]);
      });

      it("should handle decimal numbers", () => {
        expect(square(2.5)).toBeCloseTo(6.25, 10);
      });

      it("should handle negative numbers in array", () => {
        const result = square([-2, -3, 4]);
        expect(result).toEqual([4, 9, 16]);
      });
    });

    describe("broadcastUnary() - Custom operations", () => {
      it("should work with custom unary function", () => {
        const double = broadcastUnary((x: number) => x * 2);
        expect(double(5)).toBe(10);
        expect(double([1, 2, 3])).toEqual([2, 4, 6]);
      });

      it("should work with custom string operation", () => {
        const toUpper = broadcastUnary((x: string) => x.toUpperCase());
        expect(toUpper("hello")).toBe("HELLO");
        expect(toUpper(["a", "b", "c"])).toEqual(["A", "B", "C"]);
      });
    });
  });

  describe("Edge cases and combined operations", () => {
    it("should handle chained operations", () => {
      const result = add(multiply([2, 3, 4], 2), 1);
      expect(result).toEqual([5, 7, 9]);
    });

    it("should handle empty arrays", () => {
      expect(add([], [])).toEqual([]);
      expect(sqrt([])).toEqual([]);
    });

    it("should maintain precision with multiple operations", () => {
      const result = divide(multiply(3, 7), 7);
      expect(result).toBeCloseTo(3, 10);
    });

    it("should handle very large array operations", () => {
      const largeArray = new Array(1000).fill(2);
      const result = square(largeArray);
      expect(result.length).toBe(1000);
      expect(result[0]).toBe(4);
      expect(result[999]).toBe(4);
    });
  });
});
