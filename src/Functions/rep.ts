function rep<T>(x: T, n: number) : T[] {
  return Array.apply(null, Array(n)).map(() => x)
}

export default rep;
