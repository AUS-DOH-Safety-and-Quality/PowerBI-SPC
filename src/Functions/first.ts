type ScalarT<T> = T extends (infer U)[] ? U : T;

function first<T>(y: T): ScalarT<T> {
  if (Array.isArray(y)) {
    return y[0] as ScalarT<T>;
  } else {
    return y as ScalarT<T>;
  }
}

export default first;
