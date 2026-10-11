import commonCause from "./commonCause"
import concernHigh from "./concernHigh"
import concernLow from "./concernLow"
import improvementHigh from "./improvementHigh"
import improvementLow from "./improvementLow"
import neutralHigh from "./neutralHigh"
import neutralLow from "./neutralLow"
import consistentFail from "./consistentFail"
import consistentPass from "./consistentPass"
import inconsistent from "./inconsistent"

export const nhsIcons = {
  // Variation
  commonCause,
  concernHigh,
  concernLow,
  improvementHigh,
  improvementLow,
  neutralHigh,
  neutralLow,
  // Assurance
  consistentFail,
  consistentPass,
  inconsistent
};

export type NhsIconName = keyof typeof nhsIcons;

export function isNhsIcon(name: string): name is NhsIconName {
  return Object.prototype.hasOwnProperty.call(nhsIcons, name);
}
