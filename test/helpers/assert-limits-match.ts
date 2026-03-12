import type { controlLimitsObject } from "../../src/Classes/viewModelClass";

type ExpectedLimits = {
  targets?: number[];
  values?: number[];
  ul99?: number[];
  ul95?: number[];
  ul68?: number[];
  ll68?: number[];
  ll95?: number[];
  ll99?: number[];
};

/**
 * Asserts that actual control limits match expected values within a given precision.
 * Replaces the repeated for-loop pattern in chart type tests.
 *
 * @param actual - The controlLimitsObject returned by a limit calculation.
 * @param expected - Object containing expected arrays for each limit line.
 *   Only provided keys are checked; omitted keys are skipped.
 * @param precision - Number of decimal places for toBeCloseTo comparison.
 *   Default: 2 (matches existing test precision).
 */
export default function assertLimitsMatch(
  actual: controlLimitsObject,
  expected: ExpectedLimits,
  precision: number = 2
): void {
  const n = actual.keys.length;

  for (const [key, expectedValues] of Object.entries(expected)) {
    const actualValues = actual[key as keyof controlLimitsObject] as number[];

    expect(actualValues).toBeDefined();
    expect(actualValues.length).toBe(n);

    for (let i = 0; i < n; i++) {
      expect(actualValues[i]).toBeCloseTo(
        (expectedValues as number[])[i],
        precision
      );
    }
  }
}
