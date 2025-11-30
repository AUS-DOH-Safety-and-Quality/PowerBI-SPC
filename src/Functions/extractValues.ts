/**
 * Extracts values from an array at specified indices.
 * Optimized to O(n) using a Set for index lookup instead of O(n²) with indexOf.
 * 
 * @param valuesArray - The source array to extract values from
 * @param indexArray - Array of indices to extract
 * @returns Array of values at the specified indices
 */
export default function extractValues<T>(valuesArray: T[], indexArray: number[]): T[] {
  if (!valuesArray || !indexArray || indexArray.length === 0) {
    return [];
  }
  // Use Set for O(1) lookup instead of O(n) indexOf
  const indexSet = new Set(indexArray);
  return valuesArray.filter((_, idx) => indexSet.has(idx));
}
