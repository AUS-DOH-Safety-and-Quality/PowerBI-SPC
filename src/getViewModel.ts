import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn
import DataViewValueColumn = powerbi.DataViewValueColumn
import * as d3 from "d3";
import * as mathjs from "mathjs";
import getLimitsArray from "../src/getLimitsArray";
import getTooltips from "../src/getTooltips";
import { ToolTips, ControlLimits } from "./Interfaces";

//Function to handle string-to-date conversions with JS's weird conventions
function str_to_dmy(text: string[]) {
    return text.map(d => new Date(d))
                .map(d => new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000)))
                .map(d => d.getUTCDate() + "/" + (d.getUTCMonth() + 1) + "/" + d.getUTCFullYear());
}

/**
 * Interfacing function between PowerBI data and visual rendering. Reads in
 * user-specified data, calculates the spc control limits to plot, and
 * packages into a format ready for plotting. This function is called on
 * each plot update (e.g., resizing, filtering).
 *
 * @param options  - VisualUpdateOptions object containing user data
 * @param settings - Object containing user-specified plot settings
 * @param host     - Reference to base IVisualHost object
 * 
 * @returns ViewModel object containing calculated limits and all
 *            data needed for plotting
*/
function getViewModel(options: VisualUpdateOptions, settings: any, host: IVisualHost) {
    let dv: DataView[] = options.dataViews;
    let data_type: string = settings.spc.data_type.value;
    let input_names: string[] = dv[0].metadata.columns.map(d => Object.keys(d.roles)[0]);

    let viewModel: any = {
        plotData: [],
        minLimit: 0,
        maxLimit: 0,
        target: 0,
        highlights: false
    };

    if(!dv
        || !dv[0]
        || !dv[0].categorical
        || !dv[0].categorical.categories
        || !dv[0].categorical.categories[0].source
        || !dv[0].categorical.values
        || !dv[0].metadata) {
            return viewModel;
    }

    // Get  categorical view of the data
    let view: DataViewCategorical = dv[0].categorical;

    if(!view.values[0]
        || !view.categories[0]
        || (data_type == "p" && !view.values[1])
        || (!(data_type == "xbar" || data_type == "s") && input_names.slice(-1)[0] == "groups")) {
            return viewModel;
    }

    let num_cat: number = (data_type == "xbar" || data_type == "s") ? view.categories.length - 1 : view.categories.length;

    // Get array of category values
    let key: DataViewCategoryColumn = view.categories[0];

    let valid_int: number[] = Array.from({length: num_cat}, (_, index) => index).reverse();
    let obs_len: number[] = Array.from({length: view.categories[0].values.length}, (_, index) => index);
    let key_grps: string[] = obs_len.map(idx => valid_int.map(i => view.categories[i].values[idx]).join(" "));

    // Get array of category values
    let categories: DataViewCategoryColumn = view.categories[1] ? view.categories[1] : view.categories[0];

    // Get numerator
    let numerator: DataViewValueColumn = view.values[0];

    // Get numerator
    let denominator: DataViewValueColumn = view.values[1];

    // Get groups of dots to highlight
    let highlights: powerbi.PrimitiveValue[] = numerator.highlights;

    let numerator_in: number[] = new Array();
    let denominator_in: number[] = new Array();
    var groups_in: string[];
    var key_in: string[];
    var key_valid: string[] = new Array();

    if(num_cat == 1 && view.categories[0].source.type.dateTime) {
        key_in = str_to_dmy(<string[]>(key.values));
    } else {
        key_in = key_grps;
    }

    if((data_type == "xbar" || data_type == "s")) {
        if(view.categories.slice(-1)[1].source.type.dateTime) {
            groups_in = str_to_dmy(<string[]>(view.categories.slice(-1)[1].values));
        } else {
            groups_in = <string[]>(view.categories.slice(-1)[1].values);
        }
    }

    (<number[]>numerator.values).map((d,idx) => {

        let valid: boolean = (d != null && key_in[idx] != null);
        
        if(data_type == "p" || data_type == "pp" ||
           data_type == "u" || data_type == "up" ||
           (((data_type == "i") || (data_type == "mr")) && denominator)) {
            valid = (valid && <number>denominator.values[idx] != null && <number>denominator.values[idx] > 0);
        }

        if(view.categories[1]) {
            valid = (valid && view.categories[1].values[idx] != null);
        }

        if(valid) {
            numerator_in.push(d);
            key_valid.push(key_in[idx]);
            if(denominator) {denominator_in.push(<number>denominator.values[idx]);}
        }
    })
    console.log("start1")
    let limitsArray: ControlLimits = getLimitsArray(data_type, key_valid, numerator_in, denominator_in, groups_in);
    let multiplier: number = settings.spc.multiplier.value;
    let prop_labels: boolean = data_type == "p" && multiplier == 1;
    let tooltipsArray: ToolTips[][] = getTooltips(data_type, limitsArray, numerator_in, denominator_in, prop_labels);
    let lab_vals: string[] =  ((data_type == "xbar") || (data_type == "s")) ? groups_in : key_valid;

    console.log("after1")
    // Loop over all input Category/Value pairs and push into ViewModel for plotting
    for (let i = 0; i < limitsArray.key.length;  i++) {
        viewModel.plotData.push({
            x: i+1,
            lower_limit: (<number>limitsArray.lowerLimit[i] * multiplier),
            upper_limit: (<number>limitsArray.upperLimit[i] * multiplier),
            ratio: (<number>limitsArray.value[i] * multiplier),
            // Check whether objects array exists with user-specified fill colours, apply those colours if so
            //   otherwise use default palette
            colour: settings.scatter.colour.value,
            // Create selection identity for each data point, to control cross-plot highlighting
            identity: host.createSelectionIdBuilder()
                          .withCategory(categories, i)
                          .createSelectionId(),
            // Check if highlights array exists, if it does, check if dot should
            //   be highlighted
            highlighted: highlights ? (highlights[i] ? true : false) : false,

            // Specify content to print in tooltip
            tooltips: tooltipsArray[i],
            tick_labels: (data_type == "t" || data_type == "g") ? [i+1, (i+1).toFixed(0)] : [i+1, <string>lab_vals[i]]
        });
    }
    let minLimit: number = d3.min(limitsArray.lowerLimit);
    let minPoint: number = d3.min(limitsArray.value);
    let maxLimit: number = d3.max(limitsArray.upperLimit);
    let maxPoint: number = d3.max(limitsArray.value);

    // Extract maximum value of input data and add to viewModel
    viewModel.minLimit = (mathjs.min([minLimit,minPoint]) - Math.abs(mathjs.min([minLimit,minPoint]))*0.1) * multiplier;
    viewModel.maxLimit = (mathjs.max([maxLimit,maxPoint]) + Math.abs(mathjs.max([maxLimit,maxPoint]))*0.1) * multiplier;

    viewModel.target = limitsArray.centerline * multiplier;

    // Flag whether any dots need to be highlighted
    viewModel.highlights = viewModel.plotData.filter(d => d.highlighted).length > 0;

    return viewModel;
}

export default getViewModel;
