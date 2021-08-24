import * as d3 from "d3";
import * as mathjs from "mathjs";
import getLimitsArray from "../src/getLimitsArray";
import getTooltips from "../src/getTooltips";

//Function to handle string-to-date conversions with JS's weird conventions
function str_to_dmy(text: string[]) {
    return text.map(d => new Date(d))
                .map(d => new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000)))
                .map(d => d.getUTCDate() + "/" + (d.getUTCMonth() + 1) + "/" + d.getUTCFullYear());
}

/**
 * Interfacing function between PowerBI data and visual rendering. Reads in
 * user-specified data, calculates the funnel control limits to plot, and
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
function getViewModel(options, settings, host) {
    let dv = options.dataViews;

    let viewModel = {
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
    let view = dv[0].categorical;

    if(!view.categories[0]) {
        return viewModel;
    }

    // Get array of category values
    let key = view.categories[0];

    // Get array of category values
    let categories = view.categories[1] ? view.categories[1] : view.categories[0];

    // Get numerator
    let numerator = view.values[0];

    // Get numerator
    let denominator = view.values[1];

    // Get groups of dots to highlight
    let highlights = [];

    let data_type = settings.funnel.data_type.value;

    let numerator_in: number[] = new Array();
    let denominator_in: number[] = new Array();
    var groups_in: string[];
    var key_in: string[];
    var key_valid: string[] = new Array();

    if(view.categories[0].source.type.dateTime) {
        key_in = str_to_dmy(<string[]>(key.values));
    } else {
        key_in = <string[]>key.values;
    }

    if(view.categories[1]) {
        if(view.categories[1].source.type.dateTime) {
            groups_in = str_to_dmy(<string[]>(view.categories[1]));
        } else {
            groups_in = <string[]>view.categories[1].values;
        }
    }

    (<number[]>numerator.values).map((d,idx) => {
        var valid: boolean;
        
        valid = (d != null && key_in[idx] != null);
        
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
            if(denominator) {denominator_in.push(denominator.values[idx]);}
        }
    })

    let limitsArray = getLimitsArray(data_type, key_valid, numerator_in, denominator_in, groups_in);

    let tooltipsArray = getTooltips(data_type, limitsArray, numerator_in, denominator_in);
    let lab_vals: string[] =  ((data_type == "xbar") || (data_type == "s")) ? groups_in : key_valid;
    let multiplier = settings.funnel.multiplier.value;

    // Loop over all input Category/Value pairs and push into ViewModel for plotting
    for (let i = 0; i < limitsArray.length;  i++) {
        viewModel.plotData.push({
            x: i+1,
            lower_limit:<number>(limitsArray[i][3] * multiplier),
            upper_limit: <number>(limitsArray[i][4]* multiplier),
            ratio: <number>(limitsArray[i][1]* multiplier),
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
            tick_labels: [i+1, <string>lab_vals[i]]
        });
    }

    let minLimit: number = <number><unknown>(d3.min(limitsArray.map(d => d[3])));
    let minPoint: number = <number><unknown>(d3.min(limitsArray.map(d => d[1])));
    let maxLimit: number = <number><unknown>(d3.max(limitsArray.map(d => d[4])));
    let maxPoint: number = <number><unknown>(d3.max(limitsArray.map(d => d[1])));

    // Extract maximum value of input data and add to viewModel
    viewModel.minLimit = (mathjs.min([minLimit,minPoint]) - mathjs.min([minLimit,minPoint])*0.1) * multiplier;
    viewModel.maxLimit = (mathjs.max([maxLimit,maxPoint]) + mathjs.max([maxLimit,maxPoint])*0.1) * multiplier;

    viewModel.target = <number>limitsArray[0][2] * multiplier;

    // Flag whether any dots need to be highlighted
    viewModel.highlights = viewModel.plotData.filter(d => d.highlighted).length > 0;

    return viewModel;
}

export default getViewModel;