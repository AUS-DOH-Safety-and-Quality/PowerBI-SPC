export default function leastIndex<T>(array: T[], compareFn: (a: T, b: T) => number): number {
  if (array.length === 0) {
    return -1; // Return -1 if the array is empty
  }
  let leastIndex = 0;
  let leastValue = array[0];
  for (let i = 1; i < array.length; i++) {
    if (compareFn(array[i], leastValue) < 0) {
      leastValue = array[i];
      leastIndex = i;
    }
  }
  return leastIndex;
}
