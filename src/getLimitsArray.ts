import i_limits from "./Limit Calculations/i"
import p_limits from "./Limit Calculations/p"
import u_limits from "./Limit Calculations/u"
import c_limits from "./Limit Calculations/c"
import xbar_limits from "./Limit Calculations/xbar"
import uprime_limits from "./Limit Calculations/uprime"
import pprime_limits from "./Limit Calculations/pprime"
import run_limits from "./Limit Calculations/run"
import mr_limits from "./Limit Calculations/mr"
import s_limits from "./Limit Calculations/s"
import g_limits from "./Limit Calculations/g"
import t_limits from "./Limit Calculations/t"
import sr_limits from "./Limit Calculations/sr"

function getLimitsArray(chart_type: string, key: string[], numerator: number[],
                        denominator: number[], group: string[]): (string | number)[][] {
   if (chart_type == "i") {
      return i_limits(key, numerator, denominator);
    } else if (chart_type == "p") {
        return p_limits(key, numerator, denominator);
    } else if (chart_type == "u") {
        return u_limits(key, numerator, denominator);
    } else if (chart_type == "c") {
        return c_limits(key, numerator);
    } else if (chart_type == "xbar") {
        return xbar_limits(numerator, group);
    } else if (chart_type == "up") {
        return uprime_limits(key, numerator, denominator);
    } else if (chart_type == "pp") {
        return pprime_limits(key, numerator, denominator);
    } else if (chart_type == "run") {
        return run_limits(key, numerator, denominator);
    } else if (chart_type == "mr") {
        return mr_limits(key, numerator, denominator);
    } else if (chart_type == "s") {
        return s_limits(numerator, group);
    } else if (chart_type == "g") {
        return g_limits(key, numerator);
    } else if (chart_type == "t") {
        return t_limits(key, numerator);
    } else if (chart_type == "sr") {
        return sr_limits(key, numerator, denominator);
    }
}

export default getLimitsArray;
