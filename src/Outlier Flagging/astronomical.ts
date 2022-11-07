import between from "../Functions/between"

function astronomical(val: number[], ll99: number[], ul99: number[]): boolean[] {
  return val.map((d, i) => {
    return !between(d, ll99[i], ul99[i]);
  });
}

export default astronomical
