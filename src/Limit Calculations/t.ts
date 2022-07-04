import iLimits from "./i"
import { pow } from "../Function Broadcasting/BinaryFunctions";
import controlLimits from "../Type Definitions/controlLimits";
import dataObject from "../Classes/dataObject";
import truncate from "../Functions/truncate";

function tLimits(inputData: dataObject): controlLimits {
  let val: number[] = pow(inputData.numerators, 1 / 3.6);
  let inputDataCopy = inputData;
  inputDataCopy.numerators = val;
  inputDataCopy.denominators = null;
  let limits: controlLimits = iLimits(inputDataCopy);
  limits.targets = pow(limits.targets, 3.6);
  limits.values = pow(limits.values, 3.6);
  limits.ll99 = truncate(pow(limits.ll99, 3.6), {lower: 0});
  limits.ll95 = truncate(pow(limits.ll95, 3.6), {lower: 0});
  limits.ul95 = pow(limits.ul95, 3.6);
  limits.ul99 = pow(limits.ul99, 3.6);

  return limits;
}

export default tLimits;
