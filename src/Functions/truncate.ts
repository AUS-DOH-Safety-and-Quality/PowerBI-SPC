type ScalarT<T extends number | number[]> = T extends number ? number : number[];

function truncate<T extends number | number[]>(
  val: T, limits: {lower?: number, upper?: number}
): T {
  console.log(limits)
  let rtn: T = val;
  if (limits.lower || limits.lower == 0) {
    if (Array.isArray(val)) {
      rtn = val.map(d => d < limits.lower ? limits.lower : d) as T;
    } else if (typeof val === "number") {
      rtn = (rtn < limits.lower ? limits.lower : rtn) as T;
    }
  }
  if (limits.upper) {
    if (Array.isArray(rtn)) {
      rtn = rtn.map(d => d > limits.upper ? limits.upper : d) as T;
    } else if (typeof rtn === "number") {
      rtn = (rtn > limits.upper ? limits.upper : rtn) as T;
    }
  }
  return rtn;
}

export default truncate;
