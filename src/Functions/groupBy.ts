export default function groupBy<T>(data: T[], key: string): Array<[string, T[]]> {
    const groupedData = new Map<any, T[]>();
    data.forEach(item => {
        const keyValue = item[key];
        if (!groupedData.has(keyValue)) {
            groupedData.set(keyValue, []);
        }
        groupedData.get(keyValue)?.push(item);
    });
    return Array.from(groupedData);
}
