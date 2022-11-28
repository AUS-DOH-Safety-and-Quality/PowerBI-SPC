function checkValidInput(numerator: number, denominator: number, xbar_sd: number, data_type: string): boolean {
  let denominatorConstraintRequired: string[] = ["p", "pprime", "u", "uprime"];
  let denominatorRequired: string[] = ["p", "pprime", "u", "uprime", "xbar", "s"];
  let denominatorConstraintForRunIChart: string[] = ["i", "run"];
  let numeratorValid: boolean = numerator !== null && numerator !== undefined;
  let denominatorValid: boolean = denominatorRequired.includes(data_type)
    ? denominator !== null && denominator !== undefined && denominator > 0
    : true;
  let proportionDenominatorValid: boolean = denominatorConstraintRequired.includes(data_type)
    ? (numerator <= denominator)
    : true;
  let runIChartDenominatorValid: boolean
    = (denominatorConstraintForRunIChart.includes(data_type) && !(denominator === null))
    ? (denominator != 0)
    : true;
  let xbarSDValid: boolean = data_type === "xbar" ? xbar_sd !== null && xbar_sd > 0 : true;
  return numeratorValid && denominatorValid && proportionDenominatorValid && runIChartDenominatorValid && xbarSDValid;
}

export default checkValidInput;
