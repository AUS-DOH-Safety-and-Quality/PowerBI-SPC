import iLimits from "./i"
import { pow } from "../Functions/BinaryFunctions";
import controlLimitsClass from "../Classes/controlLimitsClass";
import dataClass from "../Classes/dataClass";
import truncate from "../Functions/truncate";
import settingsClass from "../Classes/settingsClass";

export default function tLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  const val: number[] = pow(inputData.numerators, 1 / 3.6);
  const inputDataCopy: dataClass = JSON.parse(JSON.stringify(inputData));
  inputDataCopy.numerators = val;
  inputDataCopy.denominators = new Array<number>();
  const limits: controlLimitsClass = iLimits(inputDataCopy, inputSettings);
  limits.targets = pow(limits.targets, 3.6);
  limits.values = pow(limits.values, 3.6);
  limits.ll99 = truncate(pow(limits.ll99, 3.6), {lower: 0});
  limits.ll95 = truncate(pow(limits.ll95, 3.6), {lower: 0});
  limits.ul95 = pow(limits.ul95, 3.6);
  limits.ul99 = pow(limits.ul99, 3.6);

  return limits;
}

