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

function getLimitsArray(chart_type: string, key: string[], numerator: number[], denominator: number[], group: string[]): (string | number)[][] {
    var limitFunction;
   if (chart_type == "i") {
        limitFunction = i_limits;
    } else if (chart_type == "p") {
        limitFunction = p_limits;
    } else if (chart_type == "u") {
        limitFunction = u_limits;
    } else if (chart_type == "c") {
        limitFunction = c_limits;
    } else if (chart_type == "xbar") {
        limitFunction = xbar_limits;
    } else if (chart_type == "up") {
        limitFunction = uprime_limits;
    } else if (chart_type == "pp") {
        limitFunction = pprime_limits;
    } else if (chart_type == "run") {
        limitFunction = run_limits;
    } else if (chart_type == "mr") {
        limitFunction = mr_limits;
    } else if (chart_type == "s") {
        limitFunction = s_limits;
    } else if (chart_type == "g") {
        limitFunction = g_limits;
    } else if (chart_type == "t") {
        limitFunction = t_limits;
    } else if (chart_type == "sr") {
        limitFunction = sr_limits;
    }
    
    return limitFunction(key, numerator, denominator, group);
}

export default getLimitsArray;