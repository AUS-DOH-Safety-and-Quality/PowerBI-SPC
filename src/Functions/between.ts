function between<T>(x: T, lower: T, upper: T): boolean {
  return (x >= lower) && (x <= upper);
}

export default between;
