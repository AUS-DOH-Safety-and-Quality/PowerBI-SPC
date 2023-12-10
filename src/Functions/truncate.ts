import { broadcastBinary } from "../Functions"

export type truncateInputs = { lower?: number, upper?: number };

/**
 * Truncates a number or array of numbers within specified limits.
 * @param val The number or array of numbers to be truncated.
 * @param limits The limits for truncation.
 * @returns The truncated number or array of numbers.
 */
const truncate = broadcastBinary(
  (val: number, limits: truncateInputs): number => {
    let rtn: number = val;
    if (limits.lower || limits.lower == 0) {
      rtn = (rtn < limits.lower ? limits.lower : rtn)
    }
    if (limits.upper) {
      rtn = (rtn > limits.upper ? limits.upper : rtn);
    }
    return rtn;
  }
)

export default truncate;
