export default function sinpi(x: number): number {
  if (Number.isNaN(x) || !Number.isFinite(x)) {
    return NaN;
  }
  let r: number = x % 2;
  if (r <= -1) {
    r += 2;
  } else if (r > 1) {
    r -= 2;
  }
  if (r === 0 || r === 1) {
    return 0;
  }
  if (r === 0.5) {
    return 1;
  }
  if (r === -0.5) {
    return -1;
  }
  return Math.sin(Math.PI * r);
}
