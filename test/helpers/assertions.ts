/**
 * Custom Jasmine Matchers and Assertion Helpers
 * 
 * Provides reusable assertion patterns for SPC testing.
 */

/**
 * Default tolerance for floating-point comparisons
 */
export const DEFAULT_TOLERANCE = 0.0001;

/**
 * Tolerance for control limit comparisons (more lenient)
 */
export const LIMIT_TOLERANCE = 0.01;

/**
 * Assert that a value is approximately equal to an expected value
 */
export function assertApproximately(
  actual: number,
  expected: number,
  tolerance: number = DEFAULT_TOLERANCE,
  message?: string
): void {
  const diff = Math.abs(actual - expected);
  const msg = message || `Expected ${actual} to be approximately ${expected} (±${tolerance})`;
  expect(diff).toBeLessThan(tolerance, msg);
}

/**
 * Assert that an array of values are all approximately equal to expected values
 */
export function assertArrayApproximately(
  actual: number[],
  expected: number[],
  tolerance: number = DEFAULT_TOLERANCE,
  message?: string
): void {
  expect(actual.length).toBe(expected.length, "Arrays must have same length");
  
  for (let i = 0; i < actual.length; i++) {
    const diff = Math.abs(actual[i] - expected[i]);
    const msg = message || `At index ${i}: Expected ${actual[i]} to be approximately ${expected[i]} (±${tolerance})`;
    expect(diff).toBeLessThan(tolerance, msg);
  }
}

/**
 * Assert that control limit results have expected structure
 */
export function assertControlLimitsStructure(limits: any): void {
  expect(limits).toBeDefined("Control limits should be defined");
  expect(limits.values).toBeDefined("Control limits should have values array");
  expect(limits.ll99).toBeDefined("Control limits should have ll99 array");
  expect(limits.ll95).toBeDefined("Control limits should have ll95 array");
  expect(limits.ll68).toBeDefined("Control limits should have ll68 array");
  expect(limits.cl).toBeDefined("Control limits should have cl array");
  expect(limits.ul68).toBeDefined("Control limits should have ul68 array");
  expect(limits.ul95).toBeDefined("Control limits should have ul95 array");
  expect(limits.ul99).toBeDefined("Control limits should have ul99 array");
}

/**
 * Assert that all arrays in control limits have the same length
 */
export function assertControlLimitsLength(limits: any, expectedLength: number): void {
  assertControlLimitsStructure(limits);
  
  expect(limits.values.length).toBe(expectedLength, "values array length");
  expect(limits.ll99.length).toBe(expectedLength, "ll99 array length");
  expect(limits.ll95.length).toBe(expectedLength, "ll95 array length");
  expect(limits.ll68.length).toBe(expectedLength, "ll68 array length");
  expect(limits.cl.length).toBe(expectedLength, "cl array length");
  expect(limits.ul68.length).toBe(expectedLength, "ul68 array length");
  expect(limits.ul95.length).toBe(expectedLength, "ul95 array length");
  expect(limits.ul99.length).toBe(expectedLength, "ul99 array length");
}

/**
 * Assert that control limits follow expected ordering: ll99 < ll95 < ll68 < cl < ul68 < ul95 < ul99
 */
export function assertControlLimitsOrdering(limits: any, index: number = 0): void {
  const ll99 = limits.ll99[index];
  const ll95 = limits.ll95[index];
  const ll68 = limits.ll68[index];
  const cl = limits.cl[index];
  const ul68 = limits.ul68[index];
  const ul95 = limits.ul95[index];
  const ul99 = limits.ul99[index];
  
  // Skip null values (some charts produce null limits for edge cases)
  if (ll99 !== null && ll95 !== null) {
    expect(ll99).toBeLessThanOrEqual(ll95, `At index ${index}: ll99 should be <= ll95`);
  }
  if (ll95 !== null && ll68 !== null) {
    expect(ll95).toBeLessThanOrEqual(ll68, `At index ${index}: ll95 should be <= ll68`);
  }
  if (ll68 !== null && cl !== null) {
    expect(ll68).toBeLessThanOrEqual(cl, `At index ${index}: ll68 should be <= cl`);
  }
  if (cl !== null && ul68 !== null) {
    expect(cl).toBeLessThanOrEqual(ul68, `At index ${index}: cl should be <= ul68`);
  }
  if (ul68 !== null && ul95 !== null) {
    expect(ul68).toBeLessThanOrEqual(ul95, `At index ${index}: ul68 should be <= ul95`);
  }
  if (ul95 !== null && ul99 !== null) {
    expect(ul95).toBeLessThanOrEqual(ul99, `At index ${index}: ul95 should be <= ul99`);
  }
}

/**
 * Assert that centerline is approximately constant across all points
 */
export function assertConstantCenterline(
  limits: any,
  expectedCL?: number,
  tolerance: number = LIMIT_TOLERANCE
): void {
  assertControlLimitsStructure(limits);
  
  const centerlines = limits.cl;
  const firstCL = centerlines[0];
  
  if (expectedCL !== undefined) {
    assertApproximately(firstCL, expectedCL, tolerance, `Centerline should be approximately ${expectedCL}`);
  }
  
  // Check all centerlines are approximately the same
  for (let i = 1; i < centerlines.length; i++) {
    assertApproximately(
      centerlines[i],
      firstCL,
      tolerance,
      `All centerlines should be constant. Centerline at index ${i} differs from first centerline`
    );
  }
}

/**
 * Assert that all values in an array are valid numbers (not NaN, not Infinity)
 */
export function assertAllValidNumbers(values: any[], message?: string): void {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined) {
      const msg = message || `Value at index ${i} should be a valid number`;
      expect(Number.isFinite(value)).toBe(true, `${msg} (got ${value})`);
    }
  }
}

/**
 * Assert that all values in control limits are valid (no NaN or Infinity, except null is allowed)
 */
export function assertControlLimitsValid(limits: any): void {
  assertControlLimitsStructure(limits);
  
  const arrays = ['values', 'll99', 'll95', 'll68', 'cl', 'ul68', 'ul95', 'ul99'];
  
  for (const arrayName of arrays) {
    const arr = limits[arrayName];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (value !== null && value !== undefined) {
        expect(Number.isFinite(value)).toBe(
          true,
          `${arrayName}[${i}] should be a valid number or null (got ${value})`
        );
      }
    }
  }
}

/**
 * Assert that an outlier flags array has expected structure
 */
export function assertOutlierFlagsStructure(flags: any[]): void {
  expect(Array.isArray(flags)).toBe(true, "Outlier flags should be an array");
  
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    expect(typeof flag).toBe("number", `Flag at index ${i} should be a number`);
    expect([0, 1, -1]).toContain(flag, `Flag at index ${i} should be 0, 1, or -1 (got ${flag})`);
  }
}

/**
 * Assert that an SVG element exists and has expected structure
 */
export function assertSVGElement(element: any, expectedTag?: string): void {
  expect(element).toBeDefined("SVG element should be defined");
  expect(element.tagName).toBeDefined("SVG element should have a tagName");
  
  if (expectedTag) {
    expect(element.tagName.toLowerCase()).toBe(
      expectedTag.toLowerCase(),
      `SVG element should be a ${expectedTag}`
    );
  }
}

/**
 * Assert that an SVG element has a specific attribute
 */
export function assertSVGAttribute(element: any, attributeName: string, expectedValue?: any): void {
  assertSVGElement(element);
  
  const actualValue = element.getAttribute(attributeName);
  expect(actualValue).not.toBeNull(`SVG element should have ${attributeName} attribute`);
  
  if (expectedValue !== undefined) {
    expect(actualValue).toBe(
      String(expectedValue),
      `SVG element ${attributeName} should be ${expectedValue}`
    );
  }
}

/**
 * Assert that an array has a specific length
 */
export function assertArrayLength(arr: any[], expectedLength: number, message?: string): void {
  const msg = message || `Array should have length ${expectedLength}`;
  expect(arr.length).toBe(expectedLength, msg);
}

/**
 * Assert that a value is within a specified range (inclusive)
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  message?: string
): void {
  const msg = message || `Value ${value} should be between ${min} and ${max}`;
  expect(value).toBeGreaterThanOrEqual(min, msg);
  expect(value).toBeLessThanOrEqual(max, msg);
}

/**
 * Assert that all values in an array are within a specified range
 */
export function assertAllInRange(
  values: number[],
  min: number,
  max: number,
  message?: string
): void {
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined) {
      assertInRange(value, min, max, message || `Value at index ${i}`);
    }
  }
}

/**
 * Assert that a value is null or undefined
 */
export function assertNullOrUndefined(value: any, message?: string): void {
  const msg = message || "Value should be null or undefined";
  expect(value === null || value === undefined).toBe(true, msg);
}

/**
 * Assert that no elements in an array are null or undefined
 */
export function assertNoNullsOrUndefined(values: any[], message?: string): void {
  for (let i = 0; i < values.length; i++) {
    const msg = message || `Value at index ${i} should not be null or undefined`;
    expect(values[i] !== null && values[i] !== undefined).toBe(true, msg);
  }
}

/**
 * Assert that a proportion (0-1) or percentage (0-100) is valid
 */
export function assertValidProportion(
  value: number,
  isPercentage: boolean = false,
  message?: string
): void {
  const max = isPercentage ? 100 : 1;
  const msg = message || `Value should be a valid ${isPercentage ? 'percentage' : 'proportion'}`;
  assertInRange(value, 0, max, msg);
}

/**
 * Assert that arrays have values in ascending order
 */
export function assertAscendingOrder(values: number[], message?: string): void {
  for (let i = 1; i < values.length; i++) {
    const msg = message || `Value at index ${i} should be >= value at index ${i - 1}`;
    expect(values[i]).toBeGreaterThanOrEqual(values[i - 1], msg);
  }
}

/**
 * Assert that arrays have values in descending order
 */
export function assertDescendingOrder(values: number[], message?: string): void {
  for (let i = 1; i < values.length; i++) {
    const msg = message || `Value at index ${i} should be <= value at index ${i - 1}`;
    expect(values[i]).toBeLessThanOrEqual(values[i - 1], msg);
  }
}

/**
 * Assert that standard deviation is non-negative
 */
export function assertValidStdDev(stdDev: number, message?: string): void {
  const msg = message || "Standard deviation should be non-negative";
  expect(stdDev).toBeGreaterThanOrEqual(0, msg);
}

/**
 * Assert that variance is non-negative
 */
export function assertValidVariance(variance: number, message?: string): void {
  const msg = message || "Variance should be non-negative";
  expect(variance).toBeGreaterThanOrEqual(0, msg);
}

/**
 * Custom matcher: toBeApproximately
 */
export const customMatchers: jasmine.CustomMatcherFactories = {
  toBeApproximately: function(): jasmine.CustomMatcher {
    return {
      compare: function(actual: number, expected: number, tolerance: number = DEFAULT_TOLERANCE) {
        const diff = Math.abs(actual - expected);
        const pass = diff < tolerance;
        
        return {
          pass: pass,
          message: `Expected ${actual} to be approximately ${expected} (±${tolerance}), but difference was ${diff}`
        };
      }
    };
  }
};
