import between from "../Functions/between"

function astronomical(flag_direction: string, val: number[], ll99: number[], ul99: number[]): boolean[] {
  return val.map((d, i) => {
    if (!between(d, ll99[i], ul99[i])) {
      if (flag_direction === "both") {
        return true;
      } else if (flag_direction == "upper") {
        return d > ul99[i];
      } else if (flag_direction == "lower") {
        return d < ll99[i];
      }
    } else {
      return false;
    }
  });
}

export default astronomical
