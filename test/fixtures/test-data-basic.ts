/**
 * Basic Test Datasets
 * 
 * Provides simple, reusable datasets for unit testing.
 * These datasets are designed to be straightforward and easy to understand.
 */

/**
 * Simple ascending sequence
 */
export const simpleAscending = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  denominators: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
};

/**
 * Simple descending sequence
 */
export const simpleDescending = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  denominators: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
};

/**
 * Constant values (no variation)
 */
export const constantValues = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  denominators: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
};

/**
 * All zeros
 */
export const allZeros = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  denominators: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
};

/**
 * Single data point
 */
export const singlePoint = {
  keys: ["A"],
  numerators: [42],
  denominators: [100]
};

/**
 * Two data points
 */
export const twoPoints = {
  keys: ["A", "B"],
  numerators: [5, 10],
  denominators: [10, 10]
};

/**
 * Small dataset with mild variation (typical SPC data)
 */
export const smallVariation = {
  keys: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  numerators: [48, 52, 49, 51, 50, 48, 53, 49, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Dataset with an outlier
 */
export const withOutlier = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [50, 51, 49, 52, 100, 50, 51, 49, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Dataset with a shift (run on one side of centerline)
 */
export const withShift = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  numerators: [50, 51, 49, 52, 60, 62, 61, 63, 64, 65, 62, 61, 63, 50, 51, 49],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Dataset with a trend
 */
export const withTrend = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
  numerators: [45, 47, 48, 50, 52, 54, 56, 58, 60, 50, 51, 49, 50, 51, 50, 49],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Variable denominators (for p and u charts)
 */
export const variableDenominators = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [5, 12, 8, 15, 20, 18, 10, 14, 16, 12],
  denominators: [50, 100, 75, 120, 150, 130, 80, 110, 125, 95]
};

/**
 * Large sample size (for testing performance and rendering)
 */
export const largeSample = {
  keys: Array.from({ length: 100 }, (_, i) => `P${i + 1}`),
  numerators: Array.from({ length: 100 }, () => Math.floor(Math.random() * 20) + 40),
  denominators: Array.from({ length: 100 }, () => 100)
};

/**
 * Grouped data (multiple indicators)
 */
export const groupedData = {
  keys: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  indicators: ["Ward A", "Ward A", "Ward A", "Ward A", "Ward A", "Ward A", 
               "Ward B", "Ward B", "Ward B", "Ward B", "Ward B", "Ward B"],
  numerators: [45, 48, 50, 52, 49, 51, 55, 58, 60, 62, 59, 61],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Time series data with dates
 */
export const timeSeriesData = {
  keys: ["2024-01-01", "2024-01-08", "2024-01-15", "2024-01-22", "2024-01-29",
         "2024-02-05", "2024-02-12", "2024-02-19", "2024-02-26", "2024-03-04"],
  numerators: [48, 52, 49, 51, 50, 48, 53, 49, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Extreme variance (wide range of values)
 */
export const extremeVariance = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [10, 90, 20, 80, 30, 70, 40, 60, 50, 50],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Nearly zero values (small proportions)
 */
export const nearlyZero = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [1, 0, 1, 2, 1, 0, 1, 1, 2, 1],
  denominators: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]
};

/**
 * Nearly 100% values (high proportions)
 */
export const nearlyFull = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [98, 99, 99, 98, 99, 98, 99, 99, 98, 98],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};

/**
 * Mixed positive and negative changes (for XmR charts)
 */
export const mixedChanges = {
  keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  numerators: [50, 55, 48, 52, 49, 54, 47, 53, 50, 51],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
};
