/**
 * Extracts values from valuesArray at the specified indices in indexArray.
 * If valuesArray is null or undefined, returns an empty array.
 *
 * @template T The type of the values in the valuesArray.
 * @param valuesArray The array of values to extract from.
 * @param indexArray The array of indices specifying which values to extract.
 * @returns An array of extracted values.
 */
export default function extractValues<T>(valuesArray: T[], indexArray: number[]): T[] {
  if (valuesArray) {
    const n: number = indexArray.length;
    let result: T[] = new Array<T>(n);
    for (let i = 0; i < n; i++) {
      result[i] = valuesArray[indexArray[i]];
    }
    return result;
  } else {
    return [];
  }
}
