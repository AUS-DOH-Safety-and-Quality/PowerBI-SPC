import rep from "./rep";

export type ValidationT = { status: number, messages: string[], error?: string };

// ESLint errors due to number of lines in function, but would reduce readability to separate further
/* eslint-disable */
export default function validateInputData(keys: string[],
                                          numerators: number[],
                                          denominators: number[],
                                          xbar_sds: number[],
                                          groupings: string[],
                                          data_type: string): { status: number, messages: string[], error?: string } {
  const denominatorConstraintRequired: string[] = ["p", "pp", "u", "up"];
  const denominatorRequired: string[] = ["p", "pp", "u", "up", "xbar", "s"];
  const denominatorOptional: string[] = ["i", "run", "mr"];

  const checkOptionalDenominator: boolean = denominatorOptional.includes(data_type) && !(denominators === null || denominators === undefined);
  if (checkOptionalDenominator) {
    denominatorRequired.push(data_type);
  }
  const numeratorNonNegativeRequired: string[] = ["p", "pp", "u", "up", "s", "c", "g", "t"];

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
  if (numeratorNonNegativeRequired.includes(data_type)) {
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

  if (denominatorRequired.includes(data_type)) {
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
    if (denominatorConstraintRequired.includes(data_type)) {
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

  if (data_type === "xbar") {
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
