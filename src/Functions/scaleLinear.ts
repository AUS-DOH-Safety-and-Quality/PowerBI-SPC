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

  return scale;
}
