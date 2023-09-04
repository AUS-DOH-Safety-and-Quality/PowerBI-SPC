export default function checkValidInput(numerator: number, denominator: number, xbar_sd: number, data_type: string): boolean {
  const denominatorConstraintRequired: string[] = ["p", "pp", "u", "up"];
  const denominatorRequired: string[] = ["p", "pp", "u", "up", "xbar", "s"];
  const denominatorOptional: string[] = ["i", "run", "mr"];
  const checkOptionalDenominator: boolean = denominatorOptional.includes(data_type) && !(denominator === null);
  if (checkOptionalDenominator) {
    denominatorConstraintRequired.push(data_type);
    denominatorRequired.push(data_type);
  }
  const numeratorNonNegativeRequired: string[] = ["p", "pp", "u", "up", "s", "c", "g", "t"];
  
  const numeratorValid: boolean = numerator !== null && numerator !== undefined;
  const denominatorValid: boolean
    = denominatorRequired.includes(data_type)
    ? denominator !== null && denominator !== undefined && denominator >= 0
    : true;
  const numeratorNegativeValid: boolean
    = numeratorNonNegativeRequired.includes(data_type) 
    ? numerator >= 0
    : true;
  const proportionDenominatorValid: boolean
    = denominatorConstraintRequired.includes(data_type)
    ? (numerator <= denominator)
    : true;

  const xbarSDValid: boolean = data_type === "xbar" ? xbar_sd !== null && xbar_sd >= 0 : true;
  return numeratorValid && denominatorValid && proportionDenominatorValid && xbarSDValid && numeratorNegativeValid;
}

