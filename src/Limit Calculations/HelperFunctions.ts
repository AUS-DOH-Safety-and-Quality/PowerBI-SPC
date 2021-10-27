import * as rmath from "lib-r-math.js";
import * as mathjs from "mathjs";

const sqrt = rmath.R.multiplex(Math.sqrt);
const pow = rmath.R.multiplex(Math.pow);

function subtract_tmp(x: number, y:number): number {
    return x - y;
}

const subtract = rmath.R.multiplex(subtract_tmp);

function add_tmp(x: number, y:number): number {
    return x + y;
}

const add = rmath.R.multiplex(add_tmp);

function diff(x: number[]): number[] {
    var consec_diff: number[] = new Array<number>(x.length - 1);
    for (let i = 1; i < x.length;  i++) {
        consec_diff[(i-1)] = (x[i] - x[(i-1)]);
    }
    return consec_diff;
}

const abs = rmath.R.multiplex(mathjs.abs);

const exp = rmath.R.multiplex(Math.exp);

function isDate(x: any): boolean {
    return (Object.prototype.toString.call(x) == "[object Date]");
}

function rep(x: number, n: number) : number[] {
    return rmath.R.seq()()(1, n).map(() => x);
}

export { sqrt };
export { pow };
export { subtract };
export { add };
export { diff };
export { abs };
export { exp };
export { isDate };
export { rep };
