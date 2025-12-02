/**
 * Edge Case Test Datasets
 * 
 * Datasets designed to test boundary conditions, error handling,
 * and unusual scenarios that might break the visual.
 */

/**
 * Empty dataset
 */
export const emptyDataset = {
  keys: [] as string[],
  numerators: [] as number[],
  denominators: [] as number[]
};

/**
 * Null and undefined values
 */
export const nullValues = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [10, null as any, 20, undefined as any, 30],
  denominators: [100, 100, null as any, 100, undefined as any]
};

/**
 * NaN values
 */
export const nanValues = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [10, NaN, 20, 30, NaN],
  denominators: [100, 100, 100, NaN, 100]
};

/**
 * Infinity values
 */
export const infinityValues = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [10, Infinity, 20, -Infinity, 30],
  denominators: [100, 100, 100, 100, 100]
};

/**
 * Negative values (invalid for most SPC charts)
 */
export const negativeValues = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [-10, 20, -30, 40, -50],
  denominators: [100, 100, 100, 100, 100]
};

/**
 * Zero denominators (division by zero)
 */
export const zeroDenominators = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [10, 20, 30, 40, 50],
  denominators: [0, 100, 0, 100, 0]
};

/**
 * Very large numbers (potential overflow)
 */
export const veryLargeNumbers = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [1e10, 2e10, 3e10, 4e10, 5e10],
  denominators: [1e12, 1e12, 1e12, 1e12, 1e12]
};

/**
 * Very small numbers (potential underflow)
 */
export const verySmallNumbers = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [1e-10, 2e-10, 3e-10, 4e-10, 5e-10],
  denominators: [1e-8, 1e-8, 1e-8, 1e-8, 1e-8]
};

/**
 * Single outlier (astronomical point)
 */
export const singleAstronomical = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [50, 51, 49, 52, 200, 50, 51, 49, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Multiple consecutive outliers
 */
export const multipleOutliers = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
  numerators: [50, 51, 150, 160, 170, 49, 50, 51, 180, 190, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Run of 8 points on one side (shift rule)
 */
export const runOf8Points = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  numerators: [50, 51, 60, 61, 62, 63, 64, 65, 66, 67, 50, 51, 49, 50, 51, 52],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Trend of 6 consecutive points
 */
export const trendOf6Points = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
  numerators: [45, 48, 51, 54, 57, 60, 63, 50, 51, 49, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * 2 out of 3 beyond 2-sigma
 */
export const twoOutOfThree = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [50, 75, 77, 50, 51, 49, 50, 78, 76, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * All values at lower bound
 */
export const allAtLowerBound = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * All values at upper bound
 */
export const allAtUpperBound = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Numerator exceeds denominator (invalid)
 */
export const numeratorExceedsDenominator = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [50, 110, 30, 120, 40],
  denominators: [100, 100, 100, 100, 100]
};

/**
 * Mixed data types (strings where numbers expected)
 */
export const mixedDataTypes = {
  keys: ["A", "B", "C", "D", "E"],
  numerators: [10, "20" as any, 30, "40" as any, 50],
  denominators: [100, 100, "100" as any, 100, "100" as any]
};

/**
 * Extremely skewed distribution
 */
export const extremelySkewed = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [1, 1, 1, 1, 1, 1, 1, 1, 1, 95],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Bimodal distribution
 */
export const bimodalDistribution = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
  numerators: [30, 31, 29, 32, 30, 31, 70, 71, 69, 72, 70, 71],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Alternating high and low values
 */
export const alternatingValues = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [30, 70, 30, 70, 30, 70, 30, 70, 30, 70],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Monotonically increasing
 */
export const monotonicIncrease = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Monotonically decreasing
 */
export const monotonicDecrease = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Single spike in otherwise flat data
 */
export const singleSpike = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [50, 50, 50, 50, 90, 50, 50, 50, 50, 50],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Step change (process shift)
 */
export const stepChange = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
  numerators: [40, 41, 39, 42, 40, 41, 60, 61, 59, 62, 60, 61],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Cyclical pattern
 */
export const cyclicalPattern = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  numerators: [50, 60, 70, 60, 50, 40, 50, 60, 70, 60, 50, 40, 50, 60, 70, 60],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Seasonal pattern
 */
export const seasonalPattern = {
  keys: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
         "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  numerators: [65, 60, 55, 50, 45, 40, 35, 40, 45, 50, 55, 60,
               66, 61, 56, 51, 46, 41, 36, 41, 46, 51, 56, 61],
  denominators: Array(24).fill(100)
};

/**
 * Random noise only (no signal)
 */
export const randomNoiseOnly = {
  keys: Array.from({ length: 30 }, (_, i) => `P${i + 1}`),
  numerators: [50.2, 49.8, 50.1, 49.9, 50.3, 49.7, 50.0, 50.2, 49.8, 50.1,
               49.9, 50.3, 49.7, 50.0, 50.2, 49.8, 50.1, 49.9, 50.3, 49.7,
               50.0, 50.2, 49.8, 50.1, 49.9, 50.3, 49.7, 50.0, 50.2, 49.8],
  denominators: Array(30).fill(100)
};

/**
 * Highly variable denominators (for p and u charts)
 */
export const highlyVariableDenominators = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [5, 50, 10, 100, 15, 75, 8, 40, 12, 60],
  denominators: [50, 500, 100, 1000, 150, 750, 80, 400, 120, 600]
};

/**
 * Very small denominators (high variance expected)
 */
export const verySmallDenominators = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [1, 2, 1, 0, 2, 1, 2, 1, 0, 1],
  denominators: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
};

/**
 * Very large denominators (low variance expected)
 */
export const veryLargeDenominators = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [5000, 5050, 4950, 5100, 4900, 5000, 5050, 4950, 5100, 4900],
  denominators: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000]
};

/**
 * Duplicate keys (time periods)
 */
export const duplicateKeys = {
  keys: ["Jan", "Jan", "Feb", "Feb", "Mar", "Mar"],
  numerators: [50, 55, 48, 52, 49, 51],
  denominators: [100, 100, 100, 100, 100, 100]
};

/**
 * Missing keys (gaps in time series)
 */
export const missingKeys = {
  keys: ["Jan", "Feb", /* Mar missing */ "Apr", "May", /* Jun missing */ "Jul"],
  numerators: [50, 51, 49, 52, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100]
};

/**
 * Non-sequential keys (out of order)
 */
export const nonSequentialKeys = {
  keys: ["Mar", "Jan", "Feb", "May", "Apr", "Jul", "Jun"],
  numerators: [50, 51, 49, 52, 50, 51, 48],
  denominators: [100, 100, 100, 100, 100, 100, 100]
};

/**
 * Special characters in keys
 */
export const specialCharactersInKeys = {
  keys: ["Key-1", "Key_2", "Key 3", "Key@4", "Key#5"],
  numerators: [50, 51, 49, 52, 50],
  denominators: [100, 100, 100, 100, 100]
};

/**
 * All edge case datasets in one collection
 */
export const allEdgeCases = {
  emptyDataset,
  nullValues,
  nanValues,
  infinityValues,
  negativeValues,
  zeroDenominators,
  veryLargeNumbers,
  verySmallNumbers,
  singleAstronomical,
  multipleOutliers,
  runOf8Points,
  trendOf6Points,
  twoOutOfThree,
  allAtLowerBound,
  allAtUpperBound,
  numeratorExceedsDenominator,
  mixedDataTypes,
  extremelySkewed,
  bimodalDistribution,
  alternatingValues,
  monotonicIncrease,
  monotonicDecrease,
  singleSpike,
  stepChange,
  cyclicalPattern,
  seasonalPattern,
  randomNoiseOnly,
  highlyVariableDenominators,
  verySmallDenominators,
  veryLargeDenominators,
  duplicateKeys,
  missingKeys,
  nonSequentialKeys,
  specialCharactersInKeys
};
