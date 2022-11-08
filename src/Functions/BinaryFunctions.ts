import * as math from '@stdlib/math/base/special';

type CommonType<T1, T2> = T1 | T2 extends number ? number : number[];

function broadcast_binary(fun: (x: number, y: number) => number) {
  return function<T1 extends number | number[],
                  T2 extends number | number[]>(x: T1, y: T2): CommonType<T1, T2> {
    if(Array.isArray(x) && Array.isArray(y)) {
      return x.map((d, idx) => fun(d, y[idx])) as CommonType<T1, T2>;
    } else if(Array.isArray(x) && !Array.isArray(y)) {
      return x.map((d) => fun(d, y)) as CommonType<T1, T2>;
    } else if(!Array.isArray(x) && Array.isArray(y)) {
      return y.map((d) => fun(x, d)) as CommonType<T1, T2>;
    } else if (typeof x === "number" && typeof y === "number") {
      return fun(x, y) as CommonType<T1, T2>;
    }
  };
}

const pow = broadcast_binary(math.pow);
const add = broadcast_binary((x, y) => x + y);
const subtract = broadcast_binary((x, y) => x - y);
const divide = broadcast_binary((x, y) => x / y);
const multiply = broadcast_binary((x, y) => x * y);

export {
  pow,
  subtract,
  add,
  divide,
  multiply
};
