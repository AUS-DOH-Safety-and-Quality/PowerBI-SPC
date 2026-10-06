import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";

export type ValidationT = { status: 0; messages: string[] } | { status: 1; messages: string[]; error: string };

const enum ValidationFailTypes {
  Valid = 0,
  GroupingMissing = 1,
  DateMissing = 2,
  NumeratorMissing = 3,
  NumeratorNegative = 4,
  DenominatorMissing = 5,
  DenominatorNegative = 6,
  DenominatorLessThanNumerator = 7,
  SDMissing = 8,
  SDNegative = 9,
  NumeratorNaN = 10,
  DenominatorNaN = 11,
  SDNaN = 12,
  DenominatorLessThanOne = 13
}

function validateInputDataImpl(key: string | undefined,
                              numerator: number | undefined,
                              denominator: number | undefined,
                              xbar_sd: number | undefined,
                              chart_type_props: derivedSettingsClass["chart_type_props"],
                              check_denom: boolean): { message: string, type: ValidationFailTypes }  {

  const rtn = { message: "", type: ValidationFailTypes.Valid };
  if (isNullOrUndefined(key)) {
    rtn.message = "Date missing";
    rtn.type = ValidationFailTypes.DateMissing;
  }

  if (isNullOrUndefined(numerator)) {
    rtn.message = "Numerator missing";
    rtn.type = ValidationFailTypes.NumeratorMissing;
  } else {
    if (isNaN(numerator)) {
      rtn.message = "Numerator is not a number";
      rtn.type = ValidationFailTypes.NumeratorNaN;
    }

    if (chart_type_props.numerator_non_negative && numerator < 0) {
      rtn.message = "Numerator negative";
      rtn.type = ValidationFailTypes.NumeratorNegative;
    }
  }

  if (check_denom) {
    if (isNullOrUndefined(denominator)) {
      rtn.message = "Denominator missing";
      rtn.type = ValidationFailTypes.DenominatorMissing;
    } else if (isNaN(denominator)) {
      rtn.message = "Denominator is not a number";
      rtn.type = ValidationFailTypes.DenominatorNaN;
    } else if (denominator < 0) {
      rtn.message = "Denominator negative";
      rtn.type = ValidationFailTypes.DenominatorNegative;
    } else if (chart_type_props.numerator_leq_denominator && !isNullOrUndefined(numerator) && denominator < numerator) {
      rtn.message = "Denominator < numerator";
      rtn.type = ValidationFailTypes.DenominatorLessThanNumerator;
    } else if (chart_type_props.denominator_gt_one && denominator <= 1) {
      rtn.message = "Denominator <= 1"
      rtn.type = ValidationFailTypes.DenominatorLessThanOne
    }
  }

  if (chart_type_props.needs_sd) {
    if (isNullOrUndefined(xbar_sd)) {
      rtn.message = "SD missing";
      rtn.type = ValidationFailTypes.SDMissing;
    } else if (isNaN(xbar_sd) && !isNullOrUndefined(numerator)) {
      rtn.message = "SD is not a number";
      rtn.type = ValidationFailTypes.SDNaN;
    } else if (xbar_sd < 0) {
      rtn.message = "SD negative";
      rtn.type = ValidationFailTypes.SDNegative;
    }
  }
  return rtn;
}

export default function validateInputData(keys: readonly (string | undefined)[],
                                          numerators: readonly (number | undefined)[],
                                          denominators: readonly (number | undefined)[] | undefined,
                                          xbar_sds: readonly (number | undefined)[] | undefined,
                                          chart_type_props: derivedSettingsClass["chart_type_props"]): ValidationT {
  const messages = new Array<string>(keys.length);
  const check_denom = chart_type_props.needs_denominator
    || (chart_type_props.denominator_optional && denominators !== undefined && denominators.length > 0);
  let anyValid = false;
  let allSameType = true;
  let commonType: ValidationFailTypes | undefined;
  for (let i = 0; i < keys.length; i++) {
    const validation = validateInputDataImpl(keys[i], numerators[i], denominators?.[i], xbar_sds?.[i], chart_type_props, check_denom);
    messages[i] = validation.message;
    if (i === 0) commonType = validation.type;
    else if (validation.type !== commonType) allSameType = false;
    if (validation.type === ValidationFailTypes.Valid) anyValid = true;
  }
  if (anyValid) return { status: 0, messages };
  const errors = ["", "Grouping missing", "All dates/IDs are missing or null!",
    "All numerators are missing or null!", "All numerators are negative!",
    "All denominators missing or null!", "All denominators are negative!",
    "All denominators are smaller than numerators!", "All SDs missing or null!", "All SDs are negative!",
    "All numerators are not numbers!", "All denominators are not numbers!", "All SDs are not numbers!",
    "All denominators are less than or equal to one!"];
  return { status: 1, messages, error: allSameType && commonType !== undefined ? errors[commonType] : "No valid data found!" };
}
