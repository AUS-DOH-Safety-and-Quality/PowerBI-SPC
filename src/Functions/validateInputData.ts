import { isNullOrUndefined, validateRows, type RowRule, type RowValidation } from "powerbi-visuals-core/data";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

export type ValidationT = RowValidation;

// A row's message comes from its last failing block, so SD rules lead, then denominator, numerator and date
export default function validateInputData(keys: readonly (string | undefined)[],
                                          numerators: readonly (number | undefined)[],
                                          denominators: readonly (number | undefined)[] | undefined,
                                          xbar_sds: readonly (number | undefined)[] | undefined,
                                          chart_type_props: derivedSettingsClass["chart_type_props"]): ValidationT {
  const check_denom = chart_type_props.needs_denominator
    || (chart_type_props.denominator_optional && denominators !== undefined && denominators.length > 0);
  // Rules run in order, so a missing value is reported before its number checks; NaN keeps those false
  const at = (values: readonly (number | undefined)[] | undefined, i: number): number => values?.[i] ?? NaN;
  const rules: RowRule[] = [];
  if (chart_type_props.needs_sd) {
    rules.push(
      { fails: i => isNullOrUndefined(xbar_sds?.[i]), message: "SD missing", all: "All SDs missing or null!" },
      { fails: i => Number.isNaN(at(xbar_sds, i)) && !isNullOrUndefined(numerators[i]), message: "SD is not a number", all: "All SDs are not numbers!" },
      { fails: i => at(xbar_sds, i) < 0, message: "SD negative", all: "All SDs are negative!" }
    );
  }
  if (check_denom) {
    rules.push(
      { fails: i => isNullOrUndefined(denominators?.[i]), message: "Denominator missing", all: "All denominators missing or null!" },
      { fails: i => Number.isNaN(at(denominators, i)), message: "Denominator is not a number", all: "All denominators are not numbers!" },
      { fails: i => at(denominators, i) < 0, message: "Denominator negative", all: "All denominators are negative!" },
      {
        fails: i => chart_type_props.numerator_leq_denominator && !isNullOrUndefined(numerators[i]) && at(denominators, i) < at(numerators, i),
        message: "Denominator < numerator", all: "All denominators are smaller than numerators!"
      },
      {
        fails: i => chart_type_props.denominator_gt_one && at(denominators, i) <= 1,
        message: "Denominator <= 1", all: "All denominators are less than or equal to one!"
      }
    );
  }
  rules.push(
    { fails: i => isNullOrUndefined(numerators[i]), message: "Numerator missing", all: "All numerators are missing or null!" },
    { fails: i => Number.isNaN(at(numerators, i)), message: "Numerator is not a number", all: "All numerators are not numbers!" },
    { fails: i => chart_type_props.numerator_non_negative && at(numerators, i) < 0, message: "Numerator negative", all: "All numerators are negative!" },
    { fails: i => isNullOrUndefined(keys[i]), message: "Date missing", all: "All dates/IDs are missing or null!" }
  );
  return validateRows(keys.length, rules);
}
