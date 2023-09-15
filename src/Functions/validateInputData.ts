import rep from "./rep";

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
  let status: string[] = rep("", keys.length);
  keys.forEach((d, idx) => status[idx] = (status[idx] === "" && d != null) ? "" : "Date missing");
  if (!status.some(d => d == "")) {
    throw("All dates/IDs are missing or null!")
  }

  numerators.forEach((d, idx) => status[idx] = (status[idx] === "" && d != null) ? "" : "Numerator missing");
  if (!status.some(d => d == "")) {
    throw("All numerators are missing or null!")
  }
  if (numeratorNonNegativeRequired.includes(data_type)) {
    numerators.forEach((d, idx) => status[idx] = (status[idx] === "" && d >= 0) ? "" : "Numerator negative");
    if (!status.some(d => d == "")) {
      throw("All numerators are negative!")
    }
  }

  if (denominatorRequired.includes(data_type)) {
    denominators.forEach((d, idx) => status[idx] = (status[idx] === "" && d != null) ? "" : "Denominator missing");
    if (!status.some(d => d == "")) {
      throw("All denominators missing or null!")
    }
    denominators.forEach((d, idx) => status[idx] = (status[idx] === "" && d >= 0) ? "" : "Denominator negative");
    if (!status.some(d => d == "")) {
      throw("All denominators are negative!")
    }
    if (denominatorConstraintRequired.includes(data_type)) {
      denominators.forEach((d, idx) => status[idx] = (status[idx] === "" && d >= numerators[idx]) ? "" : "Denominator < numerator");
      if (!status.some(d => d == "")) {
        throw("All denominators are smaller than numerators!")
      }
    }
  }

  if (data_type === "xbar") {
    xbar_sds.forEach((d, idx) => status[idx] = (status[idx] === "" && d != null) ? "" : "SD missing");
    if (!status.some(d => d == "")) {
      throw("All SDs missing or null!")
    }
    xbar_sds.forEach((d, idx) => status[idx] = (status[idx] === "" && d >=0) ? "" : "SD negative");
    if (!status.some(d => d == "")) {
      throw("All SDs are negative!")
    }
  }
  return status;
}
