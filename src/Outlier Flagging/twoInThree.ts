import sum from "../Functions/sum";

export default function twoInThree(val: number[], ll95: number[], ul95: number[], highlight_series: boolean): string[] {
  const outside95: number[] = val.map((d, i) => {
    return d > ul95[i] ? 1 : (d < ll95[i] ? -1 : 0);
  });
  const lagged_sign_sum: number[] = outside95.map((_, i) => {
    return sum(outside95.slice(Math.max(0, i - 2), i + 1));
  })
  const two_in_three_detected: string[] = lagged_sign_sum.map(d => {
    if (Math.abs(d) >= 2) {
      return d >= 2 ? "upper" : "lower";
    } else {
      return "none";
    }
  })

  for (let i: number = 0; i < two_in_three_detected.length; i++) {
    if (two_in_three_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - 2); j--) {
        // Only highlight points exceeding the 95% limits (unless requested)
        if (outside95[j] !== 0 || highlight_series) {
          two_in_three_detected[j] = two_in_three_detected[i];
        }
      }
      if (outside95[i] === 0 && !highlight_series) {
        two_in_three_detected[i] = "none";
      }
    }
  }

  return two_in_three_detected;
}
