const logPi: number = 1.1447298858494001741434273513530587116472948129153115715136230714;
const log2Pi: number = 1.8378770664093454835606594728112352797227949472755668256343030809;

/**
 * Calculates the natural logarithm of the Gamma function using the Lanczos
 * approximation.
 *
 * @param {number} x - The input value to calculate the lgamma for.
 * @returns {number} The natural logarithm of the Gamma function at x.
 */
export default function lgamma(x: number): number {
  // Lanczos coefficients for g=7, n=9
  const lanczosCoefficients: number[] = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (Number.isNaN(x)) {
    throw new Error("Input must be a valid number.");
  }

  if (x <= 0 && Number.isInteger(x)) {
    throw new Error("lgamma is undefined for non-positive integers.");
  }

  // Reflection formula for negative x
  if (x < 0.5) {
    return logPi - Math.log(Math.sin(Math.PI * x)) - lgamma(1 - x);
  }

  x -= 1;
  let a: number = lanczosCoefficients[0];
  const g: number = 7;
  const t: number = x + g + 0.5;

  for (let i = 1; i < lanczosCoefficients.length; i++) {
    a += lanczosCoefficients[i] / (x + i);
  }

  return 0.5 * log2Pi +
          (x + 0.5) * Math.log(t) -
          t +
          Math.log(a);
}
