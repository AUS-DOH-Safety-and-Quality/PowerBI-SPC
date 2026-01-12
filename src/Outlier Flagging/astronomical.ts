import between from "../Functions/between"

export default function astronomical(val: number[], ll99: number[], ul99: number[]): string[] {
  return val.map((d, i) => {
    if (!between(d, ll99[i], ul99[i])) {
      return d > ul99[i] ? "upper" : "lower";
    } else {
      return "none";
    }
  });
}
