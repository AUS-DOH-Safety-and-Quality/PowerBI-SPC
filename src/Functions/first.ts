type ScalarT<T> = T extends (infer U)[] ? U : T;

/**
 * Returns the first element of an array or the input value itself
 *  if it's not an array.
 *
 * @template T - The type of the input value.
 * @param y - The input value.
 * @returns The first element of the array or the input value itself.
 */
export default function first<T>(y: T): ScalarT<T> {
  if (Array.isArray(y)) {
    return y[0] as ScalarT<T>;
  } else {
    return y as ScalarT<T>;
  }
}
