export default function extractValues<T>(valuesArray: T[], indexArray: number[]): T[] {
  if (valuesArray) {
    return valuesArray.filter((_,idx) => indexArray.indexOf(idx) != -1)
  } else {
    return [];
  }
}
