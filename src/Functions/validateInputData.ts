import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import isNullOrUndefined from "./isNullOrUndefined";

export type ValidationT = { status: number, messages: string[], error?: string };

enum ValidationFailTypes {
  Valid = 0,
  DateMissing = 2,
  NumeratorMissing = 3,
  NumeratorNegative = 4,
  NumeratorNaN = 10,
  DenominatorMissing = 5,
  DenominatorNegative = 6,
  DenominatorLessThanNumerator = 7,
  DenominatorNaN = 11,
  DenominatorZero = 13,
  SDMissing = 8,
  SDNegative = 9,
  SDNaN = 12,
}

// Short alias for the enum — used as both a type and a value throughout this file
type V = ValidationFailTypes;
const V = ValidationFailTypes;

// row: per-observation message (shown in removal warnings)
// all: aggregate error when every observation fails with the same type
const validationMessages: Record<V, { row: string; all: string }> = {
  [V.Valid]:                        { row: "",                            all: "" },
  [V.DateMissing]:                  { row: "Date missing",                all: "All dates/IDs are missing or null!" },
  [V.NumeratorMissing]:             { row: "Numerator missing",           all: "All numerators are missing or null!" },
  [V.NumeratorNaN]:                 { row: "Numerator is not a number",   all: "All numerators are not numbers!" },
  [V.NumeratorNegative]:            { row: "Numerator negative",          all: "All numerators are negative!" },
  [V.DenominatorMissing]:           { row: "Denominator missing",         all: "All denominators missing or null!" },
  [V.DenominatorNaN]:               { row: "Denominator is not a number", all: "All denominators are not numbers!" },
  [V.DenominatorNegative]:          { row: "Denominator negative",        all: "All denominators are negative!" },
  [V.DenominatorZero]:              { row: "Denominator is zero",         all: "All denominators are zero!" },
  [V.DenominatorLessThanNumerator]: { row: "Denominator < numerator",     all: "All denominators are smaller than numerators!" },
  [V.SDMissing]:                    { row: "SD missing",                  all: "All SDs missing or null!" },
  [V.SDNaN]:                        { row: "SD is not a number",          all: "All SDs are not numbers!" },
  [V.SDNegative]:                   { row: "SD negative",                 all: "All SDs are negative!" },
};

// Validates a single data row. Guard clause order matters: null/undefined checks
// must precede Number.isFinite checks (Number.isFinite(null) === false would
// otherwise report "not a number" instead of "missing").
function validateInputDataImpl(
  key: string,
  numerator: number,
  denominator: number,
  xbar_sd: number,
  chart_type_props: derivedSettingsClass["chart_type_props"],
  check_denom: boolean
): V {
  if (isNullOrUndefined(key))
    return V.DateMissing;

  if (isNullOrUndefined(numerator))
    return V.NumeratorMissing;
  if (!Number.isFinite(numerator))
    return V.NumeratorNaN;
  if (chart_type_props.numerator_non_negative && numerator < 0)
    return V.NumeratorNegative;

  if (check_denom && isNullOrUndefined(denominator))
    return V.DenominatorMissing;
  if (check_denom && !Number.isFinite(denominator))
    return V.DenominatorNaN;
  if (check_denom && denominator < 0)
    return V.DenominatorNegative;
  if (check_denom && denominator === 0)
    return V.DenominatorZero;
  if (check_denom && chart_type_props.numerator_leq_denominator && denominator < numerator)
    return V.DenominatorLessThanNumerator;

  if (chart_type_props.needs_sd && isNullOrUndefined(xbar_sd))
    return V.SDMissing;
  if (chart_type_props.needs_sd && !Number.isFinite(xbar_sd))
    return V.SDNaN;
  if (chart_type_props.needs_sd && xbar_sd < 0)
    return V.SDNegative;

  return V.Valid;
}

export default function validateInputData(
  keys: string[],
  numerators: number[],
  denominators: number[],
  xbar_sds: number[],
  chart_type_props: derivedSettingsClass["chart_type_props"],
  idxs: number[]
): ValidationT {
  const n: number = idxs.length;
  if (n === 0) {
    return { status: 1, messages: [], error: "No valid data found!" };
  }

  const messages: string[] = [];
  const all_status: V[] = [];
  // needs_denominator (p, pp, u, etc.): always validate denominator
  const denom_required: boolean = chart_type_props.needs_denominator;
  // denominator_optional (i, mr, run, etc.): only validate rows where a denominator
  // value was actually provided. Without per-row checking, null rows on optional
  // charts would incorrectly fail with "Denominator missing".
  const denom_optional: boolean = chart_type_props.denominator_optional
                                  && !isNullOrUndefined(denominators)
                                  && denominators.length > 0;

  for (let i = 0; i < n; i++) {
    const idx = idxs[i];
    const check_denom = denom_required || (denom_optional && !isNullOrUndefined(denominators?.[idx]));
    const failType = validateInputDataImpl(
      keys[idx], numerators?.[idx], denominators?.[idx], xbar_sds?.[idx],
      chart_type_props, check_denom
    );
    messages.push(validationMessages[failType].row);
    all_status.push(failType);
  }

  // Determine overall status: if any row is valid, status=0 (partial data is usable).
  // If all rows failed: use a specific error when all failed for the same reason,
  // otherwise use a generic message.
  const failureTypes = new Set(all_status);
  const hasValidData = failureTypes.has(V.Valid);

  const validationRtn: ValidationT = {
    status: hasValidData ? 0 : 1,
    messages,
  };

  if (!hasValidData) {
    if (failureTypes.size === 1) {
      const commonType = failureTypes.values().next().value as V;
      validationRtn.error = validationMessages[commonType].all;
    } else {
      validationRtn.error = "No valid data found!";
    }
  }

  return validationRtn;
}
