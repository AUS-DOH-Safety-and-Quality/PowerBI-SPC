function diff(x: number[]): number[] {
  let consec_diff: number[] = new Array<number>(x.length - 1);
  for (let i = 1; i < x.length;  i++) {
    consec_diff[(i-1)] = (x[i] - x[(i-1)]);
  }
  return [null].concat(consec_diff);
}

export default diff;
