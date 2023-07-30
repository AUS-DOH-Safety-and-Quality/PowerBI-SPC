import { rep } from "../Functions";

type ArrayT<T> = T extends (infer U)[] ? U[] : T[];

export default function repIfScalar<T>(x: T, n: number): ArrayT<T> {
  if (Array.isArray(x)) {
    return x as ArrayT<T>;
  } else {
    return rep(x, n) as ArrayT<T>;
  }
}
