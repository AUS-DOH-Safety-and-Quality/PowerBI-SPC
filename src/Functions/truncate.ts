import broadcast_binary from "./BinaryFunctions"

function truncate_impl(val: number, limits: {lower?: number, upper?: number}): number {
  let rtn: number = val;
  if (limits.lower || limits.lower == 0) {
    rtn = (rtn < limits.lower ? limits.lower : rtn)
  }
  if (limits.upper) {
    rtn = (rtn > limits.upper ? limits.upper : rtn);
  }
  return rtn;
}

const truncate = broadcast_binary(truncate_impl)

export default truncate;
