import { mean } from "../D3 Plotting Functions/D3 Modules";
import diff from "../Functions/diff"
import { abs } from "../Functions/broadcastUnary"
import { divide } from "../Functions/broadcastBinary";
import controlLimitsClass from "../Classes/controlLimitsClass";
import type dataClass from "../Classes/dataClass";
import type settingsClass from "../Classes/settingsClass";

export default function mrLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const consec_diff: number[] = abs(diff(ratio));
  const cl: number = mean(consec_diff);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: consec_diff,
    numerators: useRatio ? inputData.numerators : undefined,
    denominators: useRatio ? inputData.denominators : undefined,
    targets: cl,
    ll99: 0,
    ll95: 0,
    ul95: (3.267 / 3) * 2 * cl,
    ul99: 3.267 * cl
  });
}
