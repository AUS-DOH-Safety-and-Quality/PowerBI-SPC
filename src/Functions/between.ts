function between<T>(x: T, lower: T, upper: T): boolean {
  return (lower ? (x >= lower) : true) && (upper ? (x <= upper) : true);
}

export default between;
