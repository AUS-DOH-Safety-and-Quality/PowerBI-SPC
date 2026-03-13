/**
 * VAL-001: Validation of extracted input data
 *
 * Tests validateInputData() which checks individual data rows for:
 * - Missing/null keys, numerators, denominators, SDs
 * - Negative values where chart type forbids them
 * - NaN values
 * - Denominator < numerator constraint
 *
 * Each ValidationFailType (0-12) is exercised.
 */
import validateInputData from "../../src/Functions/validateInputData";
import type derivedSettingsClass from "../../src/Classes/derivedSettingsClass";

type ChartTypeProps = derivedSettingsClass["chart_type_props"];

// --- Helper to build chart_type_props for a given chart type ---

function buildChartTypeProps(chartType: string): ChartTypeProps {
  return {
    name: chartType,
    needs_denominator: ["p", "pp", "u", "up", "xbar", "s"].includes(chartType),
    denominator_optional: ["i", "i_m", "i_mm", "run", "mr"].includes(chartType),
    numerator_non_negative: ["p", "pp", "u", "up", "s", "c", "g", "t"].includes(chartType),
    numerator_leq_denominator: ["p", "pp"].includes(chartType),
    has_control_limits: !(["run"].includes(chartType)),
    needs_sd: ["xbar"].includes(chartType),
    integer_num_den: ["c", "p", "pp"].includes(chartType),
    value_name: chartType,
    x_axis_use_date: !(["g", "t"].includes(chartType)),
    date_name: !(["g", "t"].includes(chartType)) ? "Date" : "Event"
  };
}

// --- Shared test data ---

const validKeys: string[] = ["2024-01", "2024-02", "2024-03"];
const validNumerators: number[] = [10, 20, 30];
const validDenominators: number[] = [100, 200, 300];
const validSDs: number[] = [1.5, 2.0, 2.5];
const allIdxs: number[] = [0, 1, 2];

describe("validateInputData (VAL-001)", () => {

  // ---- Happy paths ----

  describe("Valid data", () => {
    it("returns status 0 for valid I-chart data (no denominators)", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData(validKeys, validNumerators, [], [], props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it("returns status 0 for valid P-chart data (with denominators)", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(validKeys, validNumerators, validDenominators, [], props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it("returns status 0 for valid XBar-chart data (with SDs)", () => {
      const props = buildChartTypeProps("xbar");
      const result = validateInputData(validKeys, validNumerators, validDenominators, validSDs, props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it("returns status 0 when some rows are invalid but not all", () => {
      const props = buildChartTypeProps("i");
      const keys = ["2024-01", null as any, "2024-03"];
      const result = validateInputData(keys, validNumerators, [], [], props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.messages[1]).toBe("Date missing");
    });
  });

  // ---- DateMissing (type 2) ----

  describe("DateMissing", () => {
    it("returns error when ALL keys are null", () => {
      const props = buildChartTypeProps("i");
      const nullKeys = [null, null, null] as any as string[];
      const result = validateInputData(nullKeys, validNumerators, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All dates/IDs are missing or null!");
    });

    it("returns error when ALL keys are undefined", () => {
      const props = buildChartTypeProps("i");
      const undefinedKeys = [undefined, undefined, undefined] as any as string[];
      const result = validateInputData(undefinedKeys, validNumerators, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All dates/IDs are missing or null!");
    });
  });

  // ---- NumeratorMissing (type 3) ----

  describe("NumeratorMissing", () => {
    it("returns error when ALL numerators are null", () => {
      const props = buildChartTypeProps("i");
      const nullNums = [null, null, null] as any as number[];
      const result = validateInputData(validKeys, nullNums, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are missing or null!");
    });
  });

  // ---- NumeratorNaN (type 10) ----

  describe("NumeratorNaN", () => {
    it("returns error when ALL numerators are NaN", () => {
      const props = buildChartTypeProps("i");
      const nanNums = [NaN, NaN, NaN];
      const result = validateInputData(validKeys, nanNums, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are not numbers!");
    });
  });

  // ---- NumeratorNegative (type 4) ----

  describe("NumeratorNegative", () => {
    it("returns error for P-chart when ALL numerators are negative", () => {
      const props = buildChartTypeProps("p");
      const negNums = [-1, -2, -3];
      const result = validateInputData(validKeys, negNums, validDenominators, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are negative!");
    });

    it("does NOT flag negative numerators for I-chart (allows negatives)", () => {
      const props = buildChartTypeProps("i");
      const negNums = [-1, -2, -3];
      const result = validateInputData(validKeys, negNums, [], [], props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it("returns error for C-chart when ALL numerators are negative", () => {
      const props = buildChartTypeProps("c");
      const negNums = [-1, -2, -3];
      const result = validateInputData(validKeys, negNums, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are negative!");
    });
  });

  // ---- DenominatorMissing (type 5) ----

  describe("DenominatorMissing", () => {
    it("returns error for P-chart when ALL denominators are null", () => {
      const props = buildChartTypeProps("p");
      const nullDenoms = [null, null, null] as any as number[];
      const result = validateInputData(validKeys, validNumerators, nullDenoms, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators missing or null!");
    });

    it("does NOT check denominators for I-chart without denominators supplied", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData(validKeys, validNumerators, [], [], props, allIdxs);
      expect(result.status).toBe(0);
    });

    it("checks denominators for I-chart when denominators ARE supplied (denominator_optional)", () => {
      const props = buildChartTypeProps("i");
      const nullDenoms = [null, null, null] as any as number[];
      const result = validateInputData(validKeys, validNumerators, nullDenoms, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators missing or null!");
    });
  });

  // ---- DenominatorNaN (type 11) ----

  describe("DenominatorNaN", () => {
    it("returns error for P-chart when ALL denominators are NaN", () => {
      const props = buildChartTypeProps("p");
      const nanDenoms = [NaN, NaN, NaN];
      const result = validateInputData(validKeys, validNumerators, nanDenoms, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators are not numbers!");
    });
  });

  // ---- DenominatorNegative (type 6) ----

  describe("DenominatorNegative", () => {
    it("returns error for P-chart when ALL denominators are negative", () => {
      const props = buildChartTypeProps("p");
      const negDenoms = [-100, -200, -300];
      const result = validateInputData(validKeys, validNumerators, negDenoms, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators are negative!");
    });
  });

  // ---- DenominatorLessThanNumerator (type 7) ----

  describe("DenominatorLessThanNumerator", () => {
    it("returns error for P-chart when ALL denominators < numerators", () => {
      const props = buildChartTypeProps("p");
      const smallDenoms = [1, 2, 3];
      const bigNums = [10, 20, 30];
      const result = validateInputData(validKeys, bigNums, smallDenoms, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators are smaller than numerators!");
    });

    it("does NOT check denom < num for U-chart when denominators >= numerators", () => {
      const props = buildChartTypeProps("u");
      const result = validateInputData(validKeys, validNumerators, validDenominators, [], props, allIdxs);
      expect(result.status).toBe(0);
    });
  });

  // ---- SDMissing (type 8) ----

  describe("SDMissing", () => {
    it("returns error for XBar-chart when ALL SDs are null", () => {
      const props = buildChartTypeProps("xbar");
      const nullSDs = [null, null, null] as any as number[];
      const result = validateInputData(validKeys, validNumerators, validDenominators, nullSDs, props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All SDs missing or null!");
    });

    it("does NOT check SDs for I-chart", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData(validKeys, validNumerators, [], [null, null, null] as any, props, allIdxs);
      expect(result.status).toBe(0);
    });
  });

  // ---- SDNaN (type 12) ----

  describe("SDNaN", () => {
    it("returns error for XBar-chart when ALL SDs are NaN", () => {
      const props = buildChartTypeProps("xbar");
      const nanSDs = [NaN, NaN, NaN];
      const result = validateInputData(validKeys, validNumerators, validDenominators, nanSDs, props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All SDs are not numbers!");
    });
  });

  // ---- SDNegative (type 9) ----

  describe("SDNegative", () => {
    it("returns error for XBar-chart when ALL SDs are negative", () => {
      const props = buildChartTypeProps("xbar");
      const negSDs = [-1, -2, -3];
      const result = validateInputData(validKeys, validNumerators, validDenominators, negSDs, props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All SDs are negative!");
    });
  });

  // ---- Mixed invalid data (no single common type) ----

  describe("Mixed invalid data", () => {
    it("returns generic 'No valid data found' when all rows fail for different reasons", () => {
      const props = buildChartTypeProps("p");
      // Row 0: null key (DateMissing), Row 1: null numerator (NumeratorMissing), Row 2: negative numerator (NumeratorNegative)
      const keys = [null, "2024-02", "2024-03"] as any as string[];
      const nums = [10, null, -5] as any as number[];
      const denoms = [100, 200, 300];
      const result = validateInputData(keys, nums, denoms, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("No valid data found!");
    });
  });

  // ---- Per-row message tracking ----

  describe("Per-row messages", () => {
    it("returns correct per-row messages for mixed valid/invalid data", () => {
      const props = buildChartTypeProps("i");
      const keys = ["2024-01", null as any, "2024-03"];
      const nums = [10, 20, null as any];
      const result = validateInputData(keys, nums, [], [], props, allIdxs);
      expect(result.messages).toEqual(["", "Date missing", "Numerator missing"]);
    });
  });

  describe("Validation priority (if-else correctness)", () => {
    it("undefined numerators should report 'missing', not 'not a number'", () => {
      // BUG 3 exposure: independent if blocks cause !isFinite(undefined)=true
      // to overwrite the earlier isNullOrUndefined(undefined)=true result
      const props = buildChartTypeProps("i");
      const undefinedNums = [undefined, undefined, undefined] as any as number[];
      const result = validateInputData(validKeys, undefinedNums, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are missing or null!");
    });

    it("null numerators trigger NumeratorMissing (isFinite(null)=true, no overwrite)", () => {
      const props = buildChartTypeProps("i");
      const nullNums = [null, null, null] as any as number[];
      const result = validateInputData(validKeys, nullNums, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are missing or null!");
    });

    it("-Infinity numerator should report 'not a number', not 'negative'", () => {
      // BUG 4 exposure: -Infinity < 0 is true, so the negative check
      // overwrites the !isFinite check when numerator_non_negative is set
      const props = buildChartTypeProps("p"); // numerator_non_negative = true
      const negInfNums = [-Infinity, -Infinity, -Infinity];
      const result = validateInputData(validKeys, negInfNums, validDenominators, [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are not numbers!");
    });

    it("-Infinity numerator on I-chart (no non-negative check) reports 'not a number'", () => {
      const props = buildChartTypeProps("i"); // numerator_non_negative = false
      const negInfNums = [-Infinity, -Infinity, -Infinity];
      const result = validateInputData(validKeys, negInfNums, [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are not numbers!");
    });
  });

  // ---- Cross-section priority: key error should not be overwritten by later sections ----

  describe("Cross-section priority (BUG 8: inter-section overwrite)", () => {
    it("null key + null numerator should report 'Date missing', not 'Numerator missing'", () => {
      // BUG 8: key check (line 30) and numerator check (line 35) are independent ifs.
      // If both key and numerator are null, the numerator check overwrites DateMissing.
      const props = buildChartTypeProps("i");
      const result = validateInputData(
        [null as any], [null as any], [], [], props, [0]
      );
      expect(result.status).toBe(1);
      // First problem should win — key is checked first, so "Date missing" should stick
      expect(result.error).toBe("All dates/IDs are missing or null!");
    });

    it("null key + null denominator should report 'Date missing', not 'Denominator missing'", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(
        [null as any], [10], [null as any], [], props, [0]
      );
      expect(result.status).toBe(1);
      expect(result.error).toBe("All dates/IDs are missing or null!");
    });

    it("null numerator + null denominator should report 'Numerator missing', not 'Denominator missing'", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(
        ["2024-01"], [null as any], [null as any], [], props, [0]
      );
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are missing or null!");
    });
  });

  // ---- idxs parameter: selective row validation ----

  describe("idxs parameter (selective row validation)", () => {
    it("validates only rows specified by idxs", () => {
      const props = buildChartTypeProps("i");
      // 5 data points, but only validate rows 0 and 2
      const keys = ["2024-01", null as any, "2024-03", null as any, "2024-05"];
      const nums = [10, 20, 30, 40, 50];
      const result = validateInputData(keys, nums, [], [], props, [0, 2]);
      // Only rows 0 and 2 should be validated — both are valid
      expect(result.status).toBe(0);
      expect(result.messages.length).toBe(2);
      expect(result.messages).toEqual(["", ""]);
    });

    it("skips invalid rows not in idxs", () => {
      const props = buildChartTypeProps("i");
      // Row 1 has null key, but we only validate rows 0 and 2
      const keys = ["2024-01", null as any, "2024-03"];
      const nums = [10, 20, 30];
      const result = validateInputData(keys, nums, [], [], props, [0, 2]);
      expect(result.status).toBe(0);
      expect(result.messages).toEqual(["", ""]);
    });

    it("idxs controls which rows are checked, not just count", () => {
      const props = buildChartTypeProps("i");
      // Row 0 is valid, row 1 has null key, row 2 is valid
      const keys = ["2024-01", null as any, "2024-03"];
      const nums = [10, 20, 30];
      // Pass idxs [1] — should validate row 1 (the null key)
      const result = validateInputData(keys, nums, [], [], props, [1]);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All dates/IDs are missing or null!");
    });
  });

  // ---- Edge: single data point ----

  describe("Edge cases", () => {
    it("handles single data point (valid)", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData(["2024-01"], [42], [], [], props, [0]);
      expect(result.status).toBe(0);
    });

    it("handles single data point (invalid)", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData([null as any], [42], [], [], props, [0]);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All dates/IDs are missing or null!");
    });
  });

  // ---- Infinity values rejected (BUG-2 fix) ----

  describe("Infinity values", () => {
    it("rejects Infinity numerator", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData(validKeys, [Infinity, Infinity, Infinity], [], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All numerators are not numbers!");
    });

    it("rejects -Infinity denominator for P-chart", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(validKeys, validNumerators, [-Infinity, -Infinity, -Infinity], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators are not numbers!");
    });

    it("rejects Infinity SD for XBar-chart", () => {
      const props = buildChartTypeProps("xbar");
      const result = validateInputData(validKeys, validNumerators, validDenominators, [Infinity, Infinity, Infinity], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All SDs are not numbers!");
    });

    it("flags per-row message for single Infinity numerator", () => {
      const props = buildChartTypeProps("i");
      const result = validateInputData(validKeys, [10, Infinity, 30], [], [], props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.messages[1]).toBe("Numerator is not a number");
    });

    it("rejects +Infinity denominator for P-chart", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(validKeys, validNumerators, [Infinity, Infinity, Infinity], [], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All denominators are not numbers!");
    });

    it("rejects -Infinity SD for XBar-chart", () => {
      const props = buildChartTypeProps("xbar");
      const result = validateInputData(validKeys, validNumerators, validDenominators, [-Infinity, -Infinity, -Infinity], props, allIdxs);
      expect(result.status).toBe(1);
      expect(result.error).toBe("All SDs are not numbers!");
    });
  });

  // ---- Array boundary conditions ----

  describe("Array boundary conditions", () => {
    it("handles empty idxs array: reports no valid data (vacuous truth)", () => {
      // With zero rows, Array.every() returns true vacuously, so the function
      // correctly reports "No valid data found!" — there is no valid data.
      const props = buildChartTypeProps("i");
      const result = validateInputData(validKeys, validNumerators, [], [], props, []);
      expect(result.status).toBe(1);
      expect(result.error).toBe("No valid data found!");
      expect(result.messages.length).toBe(0);
    });

    it("handles denominators shorter than numerators without crashing", () => {
      // When denominators array is shorter, accessing out-of-bounds yields undefined
      const props = buildChartTypeProps("p");
      const shortDenoms = [100]; // Only 1 element, but 3 rows
      const result = validateInputData(validKeys, validNumerators, shortDenoms, [], props, allIdxs);
      // Rows 1 and 2 have undefined denominators → should be caught as missing
      expect(result.messages[1]).toBe("Denominator missing");
      expect(result.messages[2]).toBe("Denominator missing");
    });

    it("handles SDs shorter than numerators without crashing", () => {
      const props = buildChartTypeProps("xbar");
      const shortSDs = [1.5]; // Only 1 element, but 3 rows
      const result = validateInputData(validKeys, validNumerators, validDenominators, shortSDs, props, allIdxs);
      expect(result.messages[1]).toBe("SD missing");
      expect(result.messages[2]).toBe("SD missing");
    });
  });

  // ---- DenominatorZero (type 13) ----

  describe("DenominatorZero", () => {
    it("rejects all-zero denominators with correct error message (not 'negative')", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(validKeys, validNumerators, [0, 0, 0], [], props, allIdxs);
      expect(result.status).toBe(1);
      // BUG 1 exposure: should say "zero", not "negative"
      expect(result.error).toBe("All denominators are zero!");
    });

    it("flags per-row message for single zero denominator", () => {
      const props = buildChartTypeProps("p");
      const result = validateInputData(validKeys, validNumerators, [100, 0, 300], [], props, allIdxs);
      expect(result.status).toBe(0);
      expect(result.messages[1]).toBe("Denominator is zero");
    });
  });
});
