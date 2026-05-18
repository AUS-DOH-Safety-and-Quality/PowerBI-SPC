/**
 * Groups an array of objects by a specified key. This is a backwards-compatible
 * implementation of the ES2026 Object.groupBy method.
 *
 * @param data The array of objects to group.
 * @param key The key to group the objects by.
 * @returns An array of tuples, where each tuple contains a key and an array of objects with that key.
 */
export default function groupBy<T extends Object>(data: T[], key: string): Array<[string, T[]]> {
  const groupedData = new Map<any, T[]>();
  for (let i = 0; i < data.length; i++) {
    const item: T = data[i];
    const keyValue = item[key as keyof T];
    if (!groupedData.has(keyValue)) {
        groupedData.set(keyValue, []);
    }
    groupedData.get(keyValue)?.push(item);
  }
  return Array.from(groupedData);
}
