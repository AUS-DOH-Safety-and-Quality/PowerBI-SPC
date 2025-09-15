export default function calculateTrendLine(values: number[]): number[] {
  const n: number = values.length;
  if (n === 0) return [];
  let sumY = 0;
  let sumX = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendLine: number[] = [];
  for (let i = 0; i < n; i++) {
    trendLine.push(slope * (i + 1) + intercept);
  }
  return trendLine;
}
