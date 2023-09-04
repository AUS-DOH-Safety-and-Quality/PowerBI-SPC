import { mean } from "../D3 Plotting Functions/D3 Modules";
import { abs, diff, divide } from "../Functions";
import { controlLimitsClass, type dataClass, type defaultSettingsType } from "../Classes";

export default function mrLimits(inputData: dataClass, inputSettings: defaultSettingsType): controlLimitsClass {
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const consec_diff: number[] = abs(diff(ratio));
  const cl: number = mean(consec_diff);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys.slice(1),
    values: consec_diff.slice(1),
    numerators: useRatio ? inputData.numerators.slice(1) : undefined,
    denominators: useRatio ? inputData.denominators.slice(1) : undefined,
    targets: cl,
    ll99: 0,
    ll95: 0,
    ul95: (3.267 / 3) * 2 * cl,
    ul99: 3.267 * cl
  });
}
