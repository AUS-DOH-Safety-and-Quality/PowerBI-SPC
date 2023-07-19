import iLimits from "./i"
import { pow } from "../Functions/BinaryFunctions";
import controlLimitsClass from "../Classes/controlLimitsClass";
import dataClass from "../Classes/dataClass";
import truncate from "../Functions/truncate";
import { LimitArgs } from "../Classes/viewModelClass";

export default function tLimits(args: LimitArgs): controlLimitsClass {
  const inputData: dataClass = args.inputData;
  const val: number[] = pow(inputData.numerators, 1 / 3.6);
  const argsDataCopy: LimitArgs = args;
  argsDataCopy.inputData.numerators = val;
  argsDataCopy.inputData.denominators = null;
  const limits: controlLimitsClass = iLimits(argsDataCopy);
  limits.targets = pow(limits.targets, 3.6);
  limits.values = pow(limits.values, 3.6);
  limits.ll99 = truncate(pow(limits.ll99, 3.6), {lower: 0});
  limits.ll95 = truncate(pow(limits.ll95, 3.6), {lower: 0});
  limits.ul95 = pow(limits.ul95, 3.6);
  limits.ul99 = pow(limits.ul99, 3.6);

  return limits;
}

