/**
 * Reference Test Datasets
 * 
 * Datasets from published SPC literature and guidelines.
 * These serve as golden references to validate statistical correctness.
 * 
 * Sources:
 * - NHS Making Data Count (NHS England)
 * - Montgomery's Introduction to Statistical Quality Control
 * - NHS England SPC Guidance
 */

/**
 * NHS Making Data Count - Example 1: A&E 4-hour waits
 * 
 * Source: NHS Making Data Count guidance
 * Chart Type: P chart (proportions)
 * Description: Percentage of patients seen within 4 hours in A&E
 */
export const nhsAE4Hour = {
  description: "NHS A&E 4-hour waits (P chart)",
  source: "NHS Making Data Count",
  chartType: "p",
  keys: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
  numerators: [920, 935, 940, 925, 930, 945, 938, 942, 928, 935, 940, 937],
  denominators: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000],
  expectedCL: 0.936,  // 93.6% as a proportion
  improvementDirection: "increase"
};

/**
 * NHS Making Data Count - Example 2: Hospital-acquired infections
 * 
 * Source: NHS Making Data Count guidance
 * Chart Type: C chart (counts)
 * Description: Monthly count of C. diff infections
 */
export const nhsHospitalInfections = {
  description: "C. diff infections (C chart)",
  source: "NHS Making Data Count",
  chartType: "c",
  keys: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  numerators: [8, 6, 7, 9, 7, 6, 8, 7, 6, 9, 7, 8],
  denominators: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  expectedCL: 7.3,  // Approximate centerline
  improvementDirection: "decrease"
};

/**
 * NHS Making Data Count - Example 3: Referral to treatment times
 * 
 * Source: NHS Making Data Count guidance
 * Chart Type: I chart (XmR)
 * Description: Average referral to treatment time in days
 */
export const nhsReferralTimes = {
  description: "Referral to treatment times (I chart)",
  source: "NHS Making Data Count",
  chartType: "i",
  keys: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", 
         "W11", "W12", "W13", "W14", "W15", "W16", "W17", "W18", "W19", "W20"],
  numerators: [45, 48, 46, 50, 47, 49, 51, 48, 50, 52, 
               49, 51, 53, 50, 52, 54, 51, 53, 55, 52],
  denominators: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  improvementDirection: "decrease"
};

/**
 * Montgomery Example 6.1 - Piston ring manufacturing
 * 
 * Source: Montgomery, D.C. "Introduction to Statistical Quality Control" (7th ed), Example 6.1
 * Chart Type: X-bar chart
 * Description: Inside diameter of piston rings (mm), sample size = 5
 */
export const montgomeryPistonRings = {
  description: "Piston ring diameter (X-bar chart)",
  source: "Montgomery Example 6.1",
  chartType: "xbar",
  keys: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10",
         "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20"],
  // Mean of each sample (5 measurements per sample)
  numerators: [74.030, 74.002, 74.019, 73.992, 74.008, 73.995, 73.988, 74.002, 73.998, 74.024,
               74.021, 74.005, 74.002, 74.019, 73.992, 74.009, 74.014, 73.994, 73.997, 74.015],
  // Standard deviation of each sample
  sampleStdDevs: [0.034, 0.027, 0.035, 0.028, 0.030, 0.032, 0.029, 0.031, 0.033, 0.028,
                  0.026, 0.035, 0.032, 0.027, 0.031, 0.029, 0.033, 0.030, 0.028, 0.034],
  sampleSizes: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  expectedCL: 74.004,  // Grand mean
  expectedLCL: 73.968,  // Approximate
  expectedUCL: 74.040   // Approximate
};

/**
 * Healthcare Example: Ward mortality rate
 * 
 * Chart Type: U chart (rates)
 * Description: Deaths per 1000 patient days
 */
export const wardMortalityRate = {
  description: "Ward mortality rate (U chart)",
  source: "Healthcare example",
  chartType: "u",
  keys: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12"],
  numerators: [12, 15, 10, 14, 11, 13, 16, 12, 14, 15, 11, 13],
  denominators: [5000, 5200, 4800, 5100, 4900, 5000, 5300, 4950, 5050, 5150, 4850, 5000],
  improvementDirection: "decrease"
};

/**
 * Manufacturing Example: Defects per unit
 * 
 * Chart Type: U chart
 * Description: Number of defects per 100 units inspected
 */
export const defectsPerUnit = {
  description: "Defects per unit (U chart)",
  source: "Manufacturing example",
  chartType: "u",
  keys: ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8", "Day9", "Day10"],
  numerators: [18, 22, 15, 20, 17, 19, 23, 16, 21, 18],
  denominators: [100, 120, 90, 115, 95, 105, 125, 88, 110, 100],
  improvementDirection: "decrease"
};

/**
 * Rare Events Example: Time between adverse events
 * 
 * Chart Type: T chart
 * Description: Days between medication errors
 */
export const timeBetweenErrors = {
  description: "Time between medication errors (T chart)",
  source: "Healthcare example",
  chartType: "t",
  keys: ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10",
         "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20"],
  numerators: [12, 8, 15, 20, 10, 18, 14, 22, 16, 11,
               25, 13, 19, 17, 9, 21, 15, 12, 18, 14],
  denominators: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  improvementDirection: "increase"
};

/**
 * Rare Events Example: Number of days between falls
 * 
 * Chart Type: G chart
 * Description: Number of patient days between patient falls
 */
export const daysBetweenFalls = {
  description: "Days between patient falls (G chart)",
  source: "Healthcare example",
  chartType: "g",
  keys: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10",
         "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20"],
  numerators: [45, 32, 58, 67, 41, 52, 48, 73, 55, 38,
               80, 44, 61, 50, 35, 69, 46, 42, 59, 47],
  denominators: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  improvementDirection: "increase"
};

/**
 * Run Chart Example: Median-based analysis
 * 
 * Chart Type: Run chart
 * Description: Patient satisfaction scores (0-100)
 */
export const patientSatisfaction = {
  description: "Patient satisfaction scores (Run chart)",
  source: "Healthcare example",
  chartType: "run",
  keys: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10",
         "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19", "M20"],
  numerators: [82, 85, 83, 87, 84, 86, 88, 85, 87, 89,
               86, 88, 90, 87, 89, 91, 88, 90, 92, 89],
  denominators: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
                100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  expectedMedian: 87.5,  // Actual median of the numerator values (not divided)
  improvementDirection: "increase"
};

/**
 * Large Sample Proportions Example: P' chart
 * 
 * Chart Type: P' chart (with large-sample correction)
 * Description: Surgical site infections with large sample sizes
 */
export const surgicalInfections = {
  description: "Surgical site infections (P' chart)",
  source: "Healthcare example",
  chartType: "pp",
  keys: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12"],
  numerators: [45, 52, 48, 55, 50, 53, 47, 51, 49, 54, 48, 52],
  denominators: [5000, 5200, 4800, 5300, 4900, 5100, 4700, 4950, 5050, 5250, 4850, 5000],
  improvementDirection: "decrease"
};

/**
 * Sample Standard Deviation Example: S chart
 * 
 * Chart Type: S chart
 * Description: Within-sample variability of blood pressure readings
 */
export const bloodPressureVariability = {
  description: "Blood pressure variability (S chart)",
  source: "Healthcare example",
  chartType: "s",
  keys: ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7", "Day8", "Day9", "Day10"],
  // Standard deviations
  numerators: [8.5, 7.2, 9.1, 7.8, 8.3, 7.5, 8.8, 7.9, 8.1, 7.6],
  sampleSizes: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  improvementDirection: "decrease"
};

/**
 * Moving Range Example: MR chart
 * 
 * Chart Type: MR chart
 * Description: Moving ranges of individual measurements
 */
export const temperatureMovingRange = {
  description: "Temperature moving ranges (MR chart)",
  source: "Manufacturing example",
  chartType: "mr",
  keys: ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10",
         "H11", "H12", "H13", "H14", "H15", "H16", "H17", "H18", "H19", "H20"],
  numerators: [98.6, 98.8, 98.5, 98.7, 98.6, 98.9, 98.7, 98.6, 98.8, 98.5,
               98.7, 98.6, 98.8, 98.7, 98.9, 98.6, 98.7, 98.8, 98.6, 98.7],
  denominators: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
};

/**
 * All reference datasets in one collection for easy iteration
 */
export const allReferenceDatasets = [
  nhsAE4Hour,
  nhsHospitalInfections,
  nhsReferralTimes,
  montgomeryPistonRings,
  wardMortalityRate,
  defectsPerUnit,
  timeBetweenErrors,
  daysBetweenFalls,
  patientSatisfaction,
  surgicalInfections,
  bloodPressureVariability,
  temperatureMovingRange
];
