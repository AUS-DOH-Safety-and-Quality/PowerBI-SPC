import { sum } from "../D3 Plotting Functions/D3 Modules";
import { sqrt } from "../Functions/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Functions/BinaryFunctions";
import controlLimitsClass from "../Classes/controlLimitsClass";
import truncate from "../Functions/truncate";
import type dataClass from "../Classes/dataClass";
import type settingsClass from "../Classes/settingsClass";

export default function uLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  const cl: number = divide(sum(inputData.numerators),sum(inputData.denominators));
  const sigma: number[] = sqrt(divide(cl,inputData.denominators));

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: divide(inputData.numerators, inputData.denominators),
    numerators: inputData.numerators,
    denominators: inputData.denominators,
    targets: cl,
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: add(cl, multiply(2, sigma)),
    ul99: add(cl, multiply(3, sigma))
  })
}
