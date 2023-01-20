import * as math from '@stdlib/math/base/special';

type ReturnT<InputT, BaseT> = InputT extends Array<any> ? BaseT[] : BaseT;

function broadcast_unary<ScalarInputT, ScalarReturnT>(fun: (x: ScalarInputT) => ScalarReturnT) {
  return function<T extends ScalarInputT | ScalarInputT[]>(y: T): ReturnT<T, ScalarReturnT> {
    if (Array.isArray(y)) {
      return (y as ScalarInputT[]).map((d: ScalarInputT) => fun(d)) as ReturnT<T, ScalarReturnT>;
    } else {
      return fun(y as Extract<T, ScalarInputT>) as ReturnT<T, ScalarReturnT>;
    }
  };
}

const sqrt = broadcast_unary(math.sqrt);
const abs = broadcast_unary((x: number) => (x ? math.abs(x) : x));
const exp = broadcast_unary(math.exp);
const lgamma = broadcast_unary(math.gammaln);
const square = broadcast_unary((x: number) => math.pow(x, 2));

export {
  sqrt,
  abs,
  exp,
  lgamma,
  square
};
