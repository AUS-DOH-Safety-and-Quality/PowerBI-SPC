import {
  isNullOrUndefined, validateRows, missingRule, nanRule, negativeRule, ratioRule, quantity, valueAt, type RowRule, type RowValidation
} from "powerbi-visuals-core/data";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

export type ValidationT = RowValidation;

const sd = { name: "SD", plural: "SDs" } as const;

/** A row's message comes from its last failing block, so SD rules lead, then denominator, numerator and date */
export default function validateInputData(keys: readonly (string | undefined)[],
                                          numerators: readonly (number | undefined)[],
                                          denominators: readonly (number | undefined)[] | undefined,
                                          xbar_sds: readonly (number | undefined)[] | undefined,
                                          chart_type_props: derivedSettingsClass["chart_type_props"]): ValidationT {
  const check_denom = chart_type_props.needs_denominator
    || (chart_type_props.denominator_optional && denominators !== undefined && denominators.length > 0);
  const rules: RowRule[] = [];
  if (chart_type_props.needs_sd) {
    rules.push(
      missingRule(xbar_sds, sd),
      // A missing numerator is reported ahead of a non-numeric SD
      {
        fails: i => Number.isNaN(valueAt(xbar_sds, i)) && !isNullOrUndefined(numerators[i]),
        message: "SD is not a number",
        all: "All SDs are not numbers!"
      },
      negativeRule(xbar_sds, sd)
    );
  }
  if (check_denom) {
    rules.push(missingRule(denominators, quantity.denominator), nanRule(denominators, quantity.denominator),
               negativeRule(denominators, quantity.denominator));
    if (chart_type_props.numerator_leq_denominator) {
      rules.push(ratioRule(numerators, denominators));
    }
    if (chart_type_props.denominator_gt_one) {
      rules.push({
        fails: i => valueAt(denominators, i) <= 1,
        message: "Denominator <= 1",
        all: "All denominators are less than or equal to one!"
      });
    }
  }
  rules.push(missingRule(numerators, quantity.numerator), nanRule(numerators, quantity.numerator));
  if (chart_type_props.numerator_non_negative) {
    rules.push(negativeRule(numerators, quantity.numerator));
  }
  rules.push(missingRule(keys, { name: "Date", plural: "dates/IDs" }));
  return validateRows(keys.length, rules);
}
