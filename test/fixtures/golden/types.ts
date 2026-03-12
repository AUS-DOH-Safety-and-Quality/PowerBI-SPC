/**
 * Golden dataset fixture types for cross-validation of SPC limit calculations.
 *
 * Each JSON fixture contains inputs and expected outputs for a single chart type
 * and scenario. Expected values are generated from an independent reference
 * implementation (R qicharts2 or manual calculation) and serve as ground truth.
 */

/** Metadata about the golden dataset's provenance */
export type GoldenMetadata = {
  /** SPC chart type identifier matching the limit function export name */
  chart_type: string;
  /** Human-readable scenario description */
  scenario: string;
  /** Source software and version (e.g., "qicharts2 0.7.4, R 4.3.1") */
  source: string;
  /** Statistical reference text */
  reference: string;
  /** ISO date when this fixture was generated */
  generated_date: string;
  /** Decimal places for toBeCloseTo comparison */
  precision: number;
};

/** Input data fed to the limit calculation function via buildControlLimitsArgs */
export type GoldenInputs = {
  keys: string[];
  numerators: number[];
  denominators?: number[] | null;
  xbar_sds?: number[] | null;
  subset_points?: number[] | null;
  outliers_in_limits?: boolean;
};

/**
 * Expected limit calculation outputs.
 * Array lengths match output keys (n for most charts, n-1 for MR chart).
 * Only include keys that the chart type produces (run chart omits limit arrays).
 */
export type GoldenExpected = {
  targets: number[];
  values?: number[];
  ul99?: number[];
  ul95?: number[];
  ul68?: number[];
  ll68?: number[];
  ll95?: number[];
  ll99?: number[];
};

/** Complete golden dataset fixture */
export type GoldenDataset = {
  metadata: GoldenMetadata;
  inputs: GoldenInputs;
  expected: GoldenExpected;
};
