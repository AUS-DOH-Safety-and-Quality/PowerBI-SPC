export default function checkValidInput(numerator: number, denominator: number | null, xbar_sd: number | null, data_type: string): boolean {
  const denominatorConstraintRequired: string[] = ["p", "pprime", "u", "uprime"];
  const denominatorRequired: string[] = ["p", "pprime", "u", "uprime", "xbar", "s"];
  const denominatorConstraintForRunIChart: string[] = ["i", "run"];
  const numeratorValid: boolean = numerator !== null && numerator !== undefined;
  const denominatorValid: boolean = denominatorRequired.includes(data_type)
    ? denominator !== null && denominator !== undefined && denominator > 0
    : true;
  const proportionDenominatorValid: boolean = denominatorConstraintRequired.includes(data_type)
    ? (numerator <= (denominator as number))
    : true;
  const runIChartDenominatorValid: boolean
    = (denominatorConstraintForRunIChart.includes(data_type) && !(denominator === null))
    ? (denominator != 0)
    : true;
  const xbarSDValid: boolean = data_type === "xbar" ? xbar_sd !== null && xbar_sd > 0 : true;
  return numeratorValid && denominatorValid && proportionDenominatorValid && runIChartDenominatorValid && xbarSDValid;
}

