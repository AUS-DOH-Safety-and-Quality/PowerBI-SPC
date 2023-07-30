import { broadcastBinary } from "../Functions"

export type truncateInputs = { lower?: number, upper?: number };

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
