import * as math from '@stdlib/math/base/special';

function broadcast_unary(fun: (x: any) => any) {
    return function(x: any) {
        if(Array.isArray(x)) {
            return x.map(d => fun(d));
        } else {
            return fun(x);
        }
    };
}

function broadcast_binary(fun: (x: any, y:any) => any) {
    return function(x: any, y: any) {
        if(Array.isArray(x) && Array.isArray(y)) {
            return x.map((d, idx) => fun(d, y[idx]));
        } else if(Array.isArray(x) && !Array.isArray(y)) {
            return x.map((d) => fun(d, y));
        } else if(!Array.isArray(x) && Array.isArray(y)) {
            return y.map((d) => fun(x, d));
        } else {
            return fun(x, y);
        }
    };
}

function diff(x: number[]): number[] {
    var consec_diff: number[] = new Array<number>(x.length - 1);
    for (let i = 1; i < x.length;  i++) {
        consec_diff[(i-1)] = (x[i] - x[(i-1)]);
    }
    return consec_diff;
}

const sqrt = broadcast_unary(math.sqrt);
const abs = broadcast_unary(math.abs);
const exp = broadcast_unary(math.exp);
const lgamma = broadcast_unary(math.gammaln);
const pow = broadcast_binary(math.pow);
const add = broadcast_binary((x, y) => x + y);
const subtract = broadcast_binary((x, y) => x - y);
const divide = broadcast_binary((x, y) => x / y);
const multiply = broadcast_binary((x, y) => x * y);

function isDate(x: any): boolean {
    return (Object.prototype.toString.call(x) == "[object Date]");
}

function rep(x: number, n: number) : number[] {
    return Array.apply(null, Array(n)).map(d => x)
}

export { sqrt };
export { pow };
export { subtract };
export { add };
export { divide };
export { multiply };
export { lgamma };
export { diff };
export { abs };
export { exp };
export { isDate };
export { rep };
