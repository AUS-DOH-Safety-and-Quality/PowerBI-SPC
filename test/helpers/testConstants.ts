/**
 * Test Constants
 * 
 * Test-specific constants that are not duplicated from source code.
 * 
 * Note: Chart types, improvement directions, and other domain constants
 * should be imported from source files where they are defined to avoid duplication.
 */

/**
 * Common tolerance values for floating-point comparisons
 */
export const TOLERANCE = {
  STRICT: 0.0001,      // For precise mathematical operations
  NORMAL: 0.001,       // For typical calculations
  RELAXED: 0.01,       // For control limits
  VERY_RELAXED: 0.1    // For visual/rendering comparisons
} as const;

/**
 * Common dataset sizes for testing
 */
export const DATASET_SIZES = {
  TINY: 5,
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 100,
  VERY_LARGE: 500,
  HUGE: 1000,
  MAXIMUM: 10000
} as const;

/**
 * Performance thresholds (in milliseconds)
 * These are test-specific expectations, not from source code
 */
export const PERFORMANCE_TARGETS = {
  CALCULATION: {
    SMALL: 10,      // < 10ms for 10 points
    MEDIUM: 50,     // < 50ms for 100 points
    LARGE: 200,     // < 200ms for 1000 points
    HUGE: 2000      // < 2s for 10000 points
  },
  RENDERING: {
    INITIAL_SMALL: 100,   // < 100ms for initial render of 100 points
    INITIAL_LARGE: 500,   // < 500ms for initial render of 500 points
    UPDATE_SMALL: 50,     // < 50ms for update of 100 points
    UPDATE_LARGE: 200,    // < 200ms for update of 500 points
    RESIZE: 30,           // < 30ms for resize
    SELECTION: 10         // < 10ms for selection update
  },
  OUTLIER_DETECTION: {
    SMALL: 50,      // < 50ms for 100 points
    MEDIUM: 100,    // < 100ms for 100 points (relaxed for CI)
    LARGE: 200,     // < 200ms for 1000 points
    HUGE: 1000      // < 1s for 10000 points
  }
} as const;

/**
 * Default PowerBI viewport sizes for testing
 */
export const VIEWPORT_SIZES = {
  TINY: { width: 100, height: 100 },
  SMALL: { width: 400, height: 300 },
  MEDIUM: { width: 800, height: 600 },
  LARGE: { width: 1200, height: 800 },
  VERY_LARGE: { width: 1920, height: 1080 },
  HUGE: { width: 3000, height: 2000 }
} as const;

/**
 * Common test patterns for outlier detection validation
 */
export const TEST_PATTERNS = {
  // Patterns that should trigger astronomical rule
  ASTRONOMICAL: {
    ABOVE: [50, 51, 49, 200, 50, 51],  // One point far above
    BELOW: [50, 51, 49, 0, 50, 51]     // One point far below
  },
  
  // Patterns that should trigger shift rule (8+ on one side)
  SHIFT: {
    ABOVE: [60, 61, 62, 63, 64, 65, 66, 67, 50, 51],
    BELOW: [40, 39, 38, 37, 36, 35, 34, 33, 50, 51]
  },
  
  // Patterns that should trigger trend rule (6+ increasing/decreasing)
  TREND: {
    INCREASING: [45, 48, 51, 54, 57, 60, 50, 51],
    DECREASING: [60, 57, 54, 51, 48, 45, 50, 51]
  },
  
  // Pattern that should trigger two-in-three rule
  TWO_IN_THREE: {
    ABOVE: [50, 75, 76, 50, 51],
    BELOW: [50, 25, 24, 50, 51]
  }
} as const;

/**
 * Common denominators for testing
 */
export const COMMON_DENOMINATORS = {
  CONSTANT_100: Array(20).fill(100),
  CONSTANT_1000: Array(20).fill(1000),
  CONSTANT_1: Array(20).fill(1),  // For counts and individual charts
  VARIABLE: [50, 100, 75, 120, 90, 110, 85, 105, 95, 115],
  SMALL: Array(20).fill(10),
  LARGE: Array(20).fill(10000)
} as const;

/**
 * Test run configuration
 */
export const TEST_CONFIG = {
  PERFORMANCE_ITERATIONS: 10,  // Number of iterations for performance tests
  TIMEOUT: 30000,              // Test timeout in milliseconds
  STRESS_TEST_CYCLES: 50       // Number of cycles for stress tests
} as const;
