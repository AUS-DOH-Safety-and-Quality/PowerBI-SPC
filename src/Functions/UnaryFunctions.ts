import * as math from '@stdlib/math/base/special';

function broadcast_unary(fun: (x: number) => number) {
  return function<T extends number | number[]>(y: T): T {
    if (typeof y === "number") {
      return fun(y) as T;
    } else if (Array.isArray(y)) {
      return y.map(d => fun(d)) as T;
    }
  };
}

const sqrt = broadcast_unary(math.sqrt);
const abs = broadcast_unary(math.abs);
const exp = broadcast_unary(math.exp);
const lgamma = broadcast_unary(math.gammaln);
const square = broadcast_unary(d => math.pow(d, 2));

export {
  sqrt,
  abs,
  exp,
  lgamma,
  square
};
