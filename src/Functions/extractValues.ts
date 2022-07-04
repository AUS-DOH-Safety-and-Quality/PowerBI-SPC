function extractValues<T>(valuesArray: T[], indexArray: number[]): T[] {
  if (valuesArray) {
    return valuesArray.filter((d,idx) => indexArray.indexOf(idx) != -1)
  } else {
    return [];
  }
}

export default extractValues;
