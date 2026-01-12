import rep from "./rep";

type ArrayT<T> = T extends (infer U)[] ? U[] : T[];

/**
 * Repeats a value if it is a scalar, or returns the value as-is if it is an array.
 *
 * @param x - The value to repeat.
 * @param n - The number of times to repeat the value.
 * @returns An array containing the repeated value.
 */
export default function repIfScalar<T>(x: T, n: number): ArrayT<T> {
  if (Array.isArray(x)) {
    return x as ArrayT<T>;
  } else {
    return rep(x, n) as ArrayT<T>;
  }
}
