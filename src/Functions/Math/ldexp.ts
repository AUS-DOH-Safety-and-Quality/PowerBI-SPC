/**
 * Calculates the value of x multiplied by 2 raised to the power of exp: x * (2^exp)
 *
 * @param x Mantissa
 * @param exp Exponent
 * @returns The result of x multiplied by 2 raised to the power of exp
 */
export default function ldexp(x: number, exp: number): number {
  return x * Math.pow(2, exp);
}
