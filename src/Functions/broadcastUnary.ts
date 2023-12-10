import gammaln from "@stdlib/math-base-special-gammaln";

type ReturnT<InputT, BaseT> = InputT extends Array<any> ? BaseT[] : BaseT;

/**
 * Applies a unary function to a scalar input or an array of scalar inputs.
 *
 * @template ScalarInputT The type of the scalar input.
 * @template ScalarReturnT The type of the scalar return value.
 * @param {function} fun The unary function to apply.
 * @returns {function} A function that accepts a scalar input or an array of
 *                    scalar inputs and applies the unary function to each
 *                    element.
 */
export default function broadcastUnary<ScalarInputT, ScalarReturnT>(fun: (x: ScalarInputT) => ScalarReturnT) {
  return function<T extends ScalarInputT | ScalarInputT[]>(y: T): ReturnT<T, ScalarReturnT> {
    if (Array.isArray(y)) {
      return (y as ScalarInputT[]).map((d: ScalarInputT) => fun(d)) as ReturnT<T, ScalarReturnT>;
    } else {
      return fun(y as Extract<T, ScalarInputT>) as ReturnT<T, ScalarReturnT>;
    }
  };
}

export const sqrt = broadcastUnary(Math.sqrt);
export const abs = broadcastUnary((x: number): number => (x ? Math.abs(x) : x));
export const exp = broadcastUnary(Math.exp);
export const lgamma = broadcastUnary(gammaln);
export const square = broadcastUnary((x: number): number => Math.pow(x, 2));
