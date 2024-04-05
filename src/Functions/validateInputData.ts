import { derivedSettingsClass } from "../Classes";
import rep from "./rep";

export type ValidationT = { status: number, messages: string[], error?: string };

// ESLint errors due to number of lines in function, but would reduce readability to separate further
/* eslint-disable */
export default function validateInputData(keys: string[],
                                          numerators: number[],
                                          denominators: number[],
                                          xbar_sds: number[],
                                          groupings: string[],
                                          chart_type_props: derivedSettingsClass["chart_type_props"]): { status: number, messages: string[], error?: string } {

  const check_optional: boolean = chart_type_props.denominator_optional && !(denominators === null || denominators === undefined);

  const validationRtn: ValidationT = { status: 0, messages: rep("", keys.length) };

  if (!(groupings === null || groupings === undefined)) {
    groupings.forEach((d, idx) => {
      validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                    ? ((d != null) ? "" : "Grouping missing")
                                    : validationRtn.messages[idx]
    });
  }
  keys.forEach((d, idx) => {
    validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                  ? ((d != null) ? "" : "Date missing")
                                  : validationRtn.messages[idx]});
  if (!validationRtn.messages.some(d => d == "")) {
    validationRtn.status = 1;
    validationRtn.error = "All dates/IDs are missing or null!";
    return validationRtn;
  }

  numerators.forEach((d, idx) => {
    validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                  ? ((d != null) ? "" : "Numerator missing")
                                  : validationRtn.messages[idx]});
  if (!validationRtn.messages.some(d => d == "")) {
    validationRtn.status = 1;
    validationRtn.error = "All numerators are missing or null!";
    return validationRtn;
  }
  if (chart_type_props.numerator_non_negative) {
    numerators.forEach((d, idx) => {
      validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                    ? ((d >= 0) ? "" : "Numerator negative")
                                    : validationRtn.messages[idx]});
    if (!validationRtn.messages.some(d => d == "")) {
      validationRtn.status = 1;
      validationRtn.error = "All numerators are negative!";
      return validationRtn;
    }
  }

  if (chart_type_props.needs_denominator || check_optional) {
    denominators.forEach((d, idx) => {
      validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                    ? ((d != null) ? "" : "Denominator missing")
                                    : validationRtn.messages[idx]});
    if (!validationRtn.messages.some(d => d == "")) {
      validationRtn.status = 1;
      validationRtn.error = "All denominators missing or null!";
      return validationRtn;
    }
    denominators.forEach((d, idx) => {
      validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                    ? ((d >= 0) ? "" : "Denominator negative")
                                    : validationRtn.messages[idx]});
    if (!validationRtn.messages.some(d => d == "")) {
      validationRtn.status = 1;
      validationRtn.error = "All denominators are negative!";
      return validationRtn;
    }
    if (chart_type_props.numerator_leq_denominator) {
      denominators.forEach((d, idx) => {
        validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                      ? ((d >= numerators[idx]) ? "" : "Denominator < numerator")
                                      : validationRtn.messages[idx]});
      if (!validationRtn.messages.some(d => d == "")) {
        validationRtn.status = 1;
        validationRtn.error = "All denominators are smaller than numerators!";
        return validationRtn;
      }
    }
  }

  if (chart_type_props.needs_sd) {
    xbar_sds.forEach((d, idx) => {
      validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                    ? ((d != null) ? "" : "SD missing")
                                    : validationRtn.messages[idx]});
    if (!validationRtn.messages.some(d => d == "")) {
      validationRtn.status = 1;
      validationRtn.error = "All SDs missing or null!";
      return validationRtn;
    }
    xbar_sds.forEach((d, idx) => {
      validationRtn.messages[idx] = validationRtn.messages[idx] === ""
                                    ? ((d >=0) ? "" : "SD negative")
                                    : validationRtn.messages[idx]});
    if (!validationRtn.messages.some(d => d == "")) {
      validationRtn.status = 1;
      validationRtn.error = "All SDs are negative!";
      return validationRtn;
    }
  }
  return validationRtn;
}
/* eslint-enable */
