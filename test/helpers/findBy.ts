export default function findBy<T, K extends keyof T>(items: readonly T[], key: K, value: T[K]): T | undefined {
  for (let i = 0; i < items.length; i++) {
    if (items[i][key] === value) {
      return items[i];
    }
  }
  return undefined;
}
