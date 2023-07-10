import iLimits from "./i"
import { pow } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import truncate from "../Functions/truncate";
import {LimitArgs} from "../Classes/chartObject";

function tLimits(args: LimitArgs): controlLimits {
  const inputData: dataObject = args.inputData;
  const val: number[] = pow(inputData.numerators, 1 / 3.6);
  const argsDataCopy: LimitArgs = args;
  argsDataCopy.inputData.numerators = val;
  argsDataCopy.inputData.denominators = null;
  const limits: controlLimits = iLimits(argsDataCopy);
  limits.targets = pow(limits.targets, 3.6);
  limits.values = pow(limits.values, 3.6);
  limits.ll99 = truncate(pow(limits.ll99, 3.6), {lower: 0});
  limits.ll95 = truncate(pow(limits.ll95, 3.6), {lower: 0});
  limits.ul95 = pow(limits.ul95, 3.6);
  limits.ul99 = pow(limits.ul99, 3.6);

  return limits;
}

export default tLimits;
