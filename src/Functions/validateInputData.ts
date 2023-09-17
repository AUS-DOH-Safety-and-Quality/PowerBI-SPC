import rep from "./rep";
import { validationErrorClass } from "../Classes";

export default function validateInputData(keys: string[], numerators: number[], denominators: number[], xbar_sds: number[], data_type: string): string[] {
  const denominatorConstraintRequired: string[] = ["p", "pp", "u", "up"];
  const denominatorRequired: string[] = ["p", "pp", "u", "up", "xbar", "s"];
  const denominatorOptional: string[] = ["i", "run", "mr"];

  const checkOptionalDenominator: boolean = denominatorOptional.includes(data_type) && !(denominators === null);
  if (checkOptionalDenominator) {
    denominatorConstraintRequired.push(data_type);
    denominatorRequired.push(data_type);
  }
  const numeratorNonNegativeRequired: string[] = ["p", "pp", "u", "up", "s", "c", "g", "t"];
  const status: string[] = rep("", keys.length);
  keys.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d != null) ? "" : "Date missing") : status[idx]);
  if (!status.some(d => d == "")) {
    throw(new validationErrorClass("All dates/IDs are missing or null!"))
  }

  numerators.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d != null) ? "" : "Numerator missing") : status[idx]);
  if (!status.some(d => d == "")) {
    throw(new validationErrorClass("All numerators are missing or null!"))
  }
  if (numeratorNonNegativeRequired.includes(data_type)) {
    numerators.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d >= 0) ? "" : "Numerator negative") : status[idx]);
    if (!status.some(d => d == "")) {
      throw(new validationErrorClass("All numerators are negative!"))
    }
  }

  if (denominatorRequired.includes(data_type)) {
    denominators.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d != null) ? "" : "Denominator missing") : status[idx]);
    if (!status.some(d => d == "")) {
      throw(new validationErrorClass("All denominators missing or null!"))
    }
    denominators.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d >= 0) ? "" : "Denominator negative") : status[idx]);
    if (!status.some(d => d == "")) {
      throw(new validationErrorClass("All denominators are negative!"))
    }
    if (denominatorConstraintRequired.includes(data_type)) {
      denominators.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d >= numerators[idx]) ? "" : "Denominator < numerator") : status[idx]);
      if (!status.some(d => d == "")) {
        throw(new validationErrorClass("All denominators are smaller than numerators!"))
      }
    }
  }

  if (data_type === "xbar") {
    xbar_sds.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d != null) ? "" : "SD missing") : status[idx]);
    if (!status.some(d => d == "")) {
      throw(new validationErrorClass("All SDs missing or null!"))
    }
    xbar_sds.forEach((d, idx) => status[idx] = status[idx] === "" ? ((d >=0) ? "" : "SD negative") : status[idx]);
    if (!status.some(d => d == "")) {
      throw(new validationErrorClass("All SDs are negative!"))
    }
  }
  return status;
}
