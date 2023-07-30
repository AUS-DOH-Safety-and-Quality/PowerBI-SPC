import { median } from "../D3 Plotting Functions/D3 Modules";
import { divide } from "../Functions/broadcastBinary";
import controlLimitsClass from "../Classes/controlLimitsClass";
import type dataClass from "../Classes/dataClass";
import type settingsClass from "../Classes/settingsClass";

export default function runLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const cl: number = median(ratio);
  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? inputData.numerators : undefined,
    denominators: useRatio ? inputData.denominators : undefined,
    targets: cl
  });
}
