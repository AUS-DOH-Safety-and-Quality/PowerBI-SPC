/**
 * Authoritative SPC control chart constant reference values.
 *
 * Web-validated 2026-03-12 against multiple independent sources:
 *   - r-bar.net XbarS Constants table (4dp precision, n=2..30)
 *     https://r-bar.net/control-chart-constants-tables-explanations/
 *   - QualityAmerica Control Chart Constants table
 *     https://qualityamerica.com/LSS-Knowledge-Center/statisticalprocesscontrol/control_chart_constants.php
 *   - MIT AIAG SPC reference (ControlChartConstantsAndFormulae.pdf)
 *     https://web.mit.edu/2.810/www/files/readings/ControlChartConstantsAndFormulae.pdf
 *   - Montgomery, "Introduction to Statistical Quality Control", Table VI
 *
 * These values are the single source of truth for test assertions.
 * Any test needing published SPC constants should import from here.
 */

/**
 * c4: Bias correction factor for sample standard deviation.
 * Formula: c4(n) = sqrt(2/(n-1)) * Gamma(n/2) / Gamma((n-1)/2)
 * Source: r-bar.net Bias Correction Constants table (4 decimal places).
 */
export const PUBLISHED_C4: Record<number, number> = {
  2:  0.7979,
  3:  0.8862,
  4:  0.9213,
  5:  0.9400,
  6:  0.9515,
  7:  0.9594,
  8:  0.9650,
  9:  0.9693,
  10: 0.9727,
  11: 0.9754,
  12: 0.9776,
  13: 0.9794,
  14: 0.9810,
  15: 0.9823,
  16: 0.9835,
  17: 0.9845,
  18: 0.9854,
  19: 0.9862,
  20: 0.9869,
  21: 0.9876,
  22: 0.9882,
  23: 0.9887,
  24: 0.9892,
  25: 0.9896,
};

/**
 * A3: X-bar chart control limit factor (sigma-based).
 * Formula: A3(n) = 3 / (c4(n) * sqrt(n))
 * Source: r-bar.net XbarS Constants table (4 decimal places).
 */
export const PUBLISHED_A3: Record<number, number> = {
  2:  2.6587,
  3:  1.9544,
  4:  1.6281,
  5:  1.4273,
  6:  1.2871,
  7:  1.1819,
  8:  1.0991,
  9:  1.0317,
  10: 0.9754,
  11: 0.9274,
  12: 0.8859,
  13: 0.8495,
  14: 0.8173,
  15: 0.7885,
  16: 0.7626,
  17: 0.7391,
  18: 0.7176,
  19: 0.6979,
  20: 0.6797,
  21: 0.6629,
  22: 0.6473,
  23: 0.6327,
  24: 0.6191,
  25: 0.6063,
};

/**
 * B3: Lower control limit factor for S-chart (at k=3 sigma).
 * Formula: B3(n, k=3) = 1 - 3 * c5(n) / c4(n)
 * Source: r-bar.net XbarS Constants table (4 decimal places).
 *
 * NOTE: Published tables typically floor negative values to 0.
 * These are the RAW mathematical values (can be negative for small n).
 * The r-bar.net page confirms: B3(5) = -0.0889 -> floored to 0 in tables.
 */
export const PUBLISHED_B3_K3: Record<number, number> = {
  2:  -1.2665,  // raw; published tables show 0
  3:  -0.5682,  // raw; published tables show 0
  4:  -0.2660,  // raw; published tables show 0
  5:  -0.0890,  // raw; published tables show 0 (r-bar.net confirms -0.0889)
  6:   0.0304,
  7:   0.1177,
  8:   0.1851,
  9:   0.2391,
  10:  0.2837,
  11:  0.3213,
  12:  0.3535,
  13:  0.3816,
  14:  0.4062,
  15:  0.4282,
  16:  0.4479,
  17:  0.4657,
  18:  0.4818,
  19:  0.4966,
  20:  0.5102,
  21:  0.5228,
  22:  0.5344,
  23:  0.5452,
  24:  0.5553,
  25:  0.5648,
};

/**
 * B4: Upper control limit factor for S-chart (at k=3 sigma).
 * Formula: B4(n, k=3) = 1 + 3 * c5(n) / c4(n)
 * Source: r-bar.net XbarS Constants table (4 decimal places).
 *
 * Identity: B3(n) + B4(n) = 2 for all n.
 */
export const PUBLISHED_B4_K3: Record<number, number> = {
  2:  3.2665,
  3:  2.5682,
  4:  2.2660,
  5:  2.0890,
  6:  1.9696,
  7:  1.8823,
  8:  1.8149,
  9:  1.7609,
  10: 1.7163,
  11: 1.6787,
  12: 1.6465,
  13: 1.6184,
  14: 1.5938,
  15: 1.5718,
  16: 1.5521,
  17: 1.5343,
  18: 1.5182,
  19: 1.5034,
  20: 1.4898,
  21: 1.4772,
  22: 1.4656,
  23: 1.4548,
  24: 1.4447,
  25: 1.4352,
};

/** Precision levels for test assertions against published values */
export const PRECISION = {
  /** c4 values are published at 4 decimal places */
  C4: 4,
  /** A3 values are published at 4 decimal places */
  A3: 4,
  /** B3/B4 values are published at 4 decimal places */
  B3_B4: 4,
} as const;
