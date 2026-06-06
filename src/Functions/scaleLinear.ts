// Adapted from the tickSpec function in the d3-array package
function tickSpec(start: number, stop: number, count: number) {
  const step: number = (stop - start) / count;
  const power: number = Math.floor(Math.log10(step));
  const error: number = step / Math.pow(10, power);
  const factor: number = error >= 7.07 ? 10 : error >= 3.16 ? 5 : error >= 1.41 ? 2 : 1;

  let i1: number;
  let i2: number;
  let inc: number;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) {
    return tickSpec(start, stop, count * 2);
  }
  if (inc < 0) {
    inc = 1 / (-inc);
  }
  return [i1, i2, inc];
}

type returnT<T, U> = T extends Array<any> ? U : T;

export default function scaleLinear() {
  let domain: [number, number] = [0, 1];
  let range: [number, number] = [0, 1];

  function scale(x: number) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    return r0 + (r1 - r0) * ((x - d0) / (d1 - d0));
  };

  scale.domain = function<T>(newDomain: T): returnT<T, typeof scale> {
    if (!newDomain) {
      return domain.slice() as returnT<T, typeof scale>;
    }
    domain = newDomain as [number, number];
    return scale as returnT<T, typeof scale>;
  }

  scale.range = function<T>(newRange: T): returnT<T, typeof scale>{
    if (!newRange) {
      return range.slice() as returnT<T, typeof scale>;
    }
    range = newRange as [number, number];
    return scale as returnT<T, typeof scale>;
  }

  scale.invert = function(y: number): number {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    return d0 + (d1 - d0) * ((y - r0) / (r1 - r0));
  }

  scale.copy = function(): typeof scale {
    const newScale = scaleLinear();
    newScale.domain(domain);
    newScale.range(range);
    return newScale;
  }

  scale.ticks = function(count: number): number[] {
    const [d0, d1]: number[] = domain;
    count ??= 10;
    if (count <= 0) {
      return [];
    }
    if (d0 === d1) {
      return [d0];
    }

    const [i1, i2, inc] = tickSpec(d0, d1, count);
    if (!(i2 >= i1)) return [];
    const n = i2 - i1 + 1
    const ticks = new Array<number>(n);
    for (let i = 0; i < n; ++i) {
      ticks[i] = (i1 + i) * inc;
    }
    return ticks;
  }

  return scale;
}
