import rep from "./rep";

export default function validateInputData(keys: string[], numerators: number[], denominators: number[], xbar_sds: number[], data_type: string): boolean[] {
  const denominatorConstraintRequired: string[] = ["p", "pp", "u", "up"];
  const denominatorRequired: string[] = ["p", "pp", "u", "up", "xbar", "s"];
  const denominatorOptional: string[] = ["i", "run", "mr"];

  const checkOptionalDenominator: boolean = denominatorOptional.includes(data_type) && !(denominators === null);
  if (checkOptionalDenominator) {
    denominatorConstraintRequired.push(data_type);
    denominatorRequired.push(data_type);
  }
  const numeratorNonNegativeRequired: string[] = ["p", "pp", "u", "up", "s", "c", "g", "t"];
  let validInputRows: boolean[] = rep(true, keys.length);
  keys.forEach((d, idx) => validInputRows[idx] &&= (d != null));
  if (!validInputRows.includes(true)) {
    throw("All dates/IDs are missing or null!")
  }

  numerators.forEach((d, idx) => validInputRows[idx] &&= (d != null));
  if (!validInputRows.includes(true)) {
    throw("All numerators are missing or null!")
  }
  if (numeratorNonNegativeRequired.includes(data_type)) {
    numerators.forEach((d, idx) => validInputRows[idx] &&= (d >= 0));
    if (!validInputRows.includes(true)) {
      throw("All numerators are negative!")
    }
  }

  if (denominatorRequired.includes(data_type)) {
    denominators.forEach((d, idx) => validInputRows[idx] &&= (d != null));
    if (!validInputRows.includes(true)) {
      throw("All denominators missing or null!")
    }
    denominators.forEach((d, idx) => validInputRows[idx] &&= (d >= 0));
    if (!validInputRows.includes(true)) {
      throw("All denominators are negative!")
    }
    if (denominatorConstraintRequired.includes(data_type)) {
      denominators.forEach((d, idx) => validInputRows[idx] &&= (d >= numerators[idx]));
      if (!validInputRows.includes(true)) {
        throw("All denominators are smaller than numerators!")
      }
    }
  }

  if (data_type === "xbar") {
    xbar_sds.forEach((d, idx) => validInputRows[idx] &&= (d != null));
    if (!validInputRows.includes(true)) {
      throw("All SDs missing or null!")
    }
    xbar_sds.forEach((d, idx) => validInputRows[idx] &&= (d >= 0));
    if (!validInputRows.includes(true)) {
      throw("All SDs are negative!")
    }
  }
  return validInputRows;
}
