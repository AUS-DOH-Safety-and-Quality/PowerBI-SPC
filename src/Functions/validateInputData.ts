import derivedSettingsClass from "../Classes/derivedSettingsClass";
import isNullOrUndefined from "./isNullOrUndefined";

export type ValidationT = { status: number, messages: string[], error?: string };

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
  SDNaN = 12
}

function validateInputDataImpl(key: string,
                              numerator: number,
                              denominator: number,
                              xbar_sd: number,
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
  }

  if (isNaN(numerator)) {
    rtn.message = "Numerator is not a number";
    rtn.type = ValidationFailTypes.NumeratorNaN;
  }

  if (chart_type_props.numerator_non_negative && numerator < 0) {
    rtn.message = "Numerator negative";
    rtn.type = ValidationFailTypes.NumeratorNegative;
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
    } else if (chart_type_props.numerator_leq_denominator && denominator < numerator) {
      rtn.message = "Denominator < numerator";
      rtn.type = ValidationFailTypes.DenominatorLessThanNumerator;
    }
  }

  if (chart_type_props.needs_sd) {
    if (isNullOrUndefined(xbar_sd)) {
      rtn.message = "SD missing";
      rtn.type = ValidationFailTypes.SDMissing;
    } else if (isNaN(xbar_sd)) {
      rtn.message = "SD is not a number";
      rtn.type = ValidationFailTypes.SDNaN;
    } else if (xbar_sd < 0) {
      rtn.message = "SD negative";
      rtn.type = ValidationFailTypes.SDNegative;
    }
  }
  return rtn;
}

// ESLint errors due to number of lines in function, but would reduce readability to separate further

export default function validateInputData(keys: string[],
                                          numerators: number[],
                                          denominators: number[],
                                          xbar_sds: number[],
                                          chart_type_props: derivedSettingsClass["chart_type_props"],
                                          idxs: number[]): { status: number, messages: string[], error?: string } {
  let allSameType: boolean = false;
  let messages: string[] = new Array<string>();
  let all_status: ValidationFailTypes[] = new Array<ValidationFailTypes>();
  const check_denom = chart_type_props.needs_denominator
                      || (chart_type_props.denominator_optional && !isNullOrUndefined(denominators) && denominators.length > 0);
  const n: number = idxs.length;
  for (let i = 0; i < n; i++) {
    const validation = validateInputDataImpl(keys[i], numerators?.[i], denominators?.[i], xbar_sds?.[i], chart_type_props,  check_denom);
    messages.push(validation.message);
    all_status.push(validation.type);
  }

  let allSameTypeSet = new Set(all_status);
  allSameType = allSameTypeSet.size === 1;
  let commonType = Array.from(allSameTypeSet)[0];

  let validationRtn: ValidationT = {
    status: (allSameType && commonType !== ValidationFailTypes.Valid) ? 1 : 0,
    messages: messages
  };

  // If all data has failed, but for different reasons, return a generic error
  if (validationRtn.status === 0) {
    const allInvalid: boolean = all_status.every(d => d !== ValidationFailTypes.Valid);
    if (allInvalid) {
      validationRtn.status = 1; // All data invalid
      validationRtn.error = "No valid data found!";
      return validationRtn;
    }
  }

  if (allSameType && commonType !== ValidationFailTypes.Valid) {
    switch(commonType) {
      case ValidationFailTypes.GroupingMissing: {
        validationRtn.error = "Grouping missing"
        break;
      }
      case ValidationFailTypes.DateMissing: {
        validationRtn.error = "All dates/IDs are missing or null!"
        break;
      }
      case ValidationFailTypes.NumeratorMissing: {
        validationRtn.error = "All numerators are missing or null!"
        break;
      }
      case ValidationFailTypes.NumeratorNaN: {
        validationRtn.error = "All numerators are not numbers!"
        break;
      }
      case ValidationFailTypes.NumeratorNegative: {
        validationRtn.error = "All numerators are negative!"
        break;
      }
      case ValidationFailTypes.DenominatorMissing: {
        validationRtn.error = "All denominators missing or null!"
        break;
      }
      case ValidationFailTypes.DenominatorNaN: {
        validationRtn.error = "All denominators are not numbers!"
        break;
      }
      case ValidationFailTypes.DenominatorNegative: {
        validationRtn.error = "All denominators are negative!"
        break;
      }
      case ValidationFailTypes.DenominatorLessThanNumerator: {
        validationRtn.error = "All denominators are smaller than numerators!";
        break;
      }
      case ValidationFailTypes.SDMissing: {
        validationRtn.error = "All SDs missing or null!";
        break;
      }
      case ValidationFailTypes.SDNaN: {
        validationRtn.error = "All SDs are not numbers!";
        break;
      }
      case ValidationFailTypes.SDNegative: {
        validationRtn.error = "All SDs are negative!";
        break;
      }
    }
  }
  return validationRtn;
}
