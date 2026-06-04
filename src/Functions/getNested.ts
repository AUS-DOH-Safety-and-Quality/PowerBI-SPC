import type { MergeUnions } from "../Settings Model/common";

export default function get<T extends object, K1 extends keyof T, K2 extends keyof MergeUnions<T[K1]>>(obj: T, key1: K1, key2: K2): MergeUnions<T[K1]>[K2] {
  return (obj[key1] as MergeUnions<T[K1]>)[key2];
}
