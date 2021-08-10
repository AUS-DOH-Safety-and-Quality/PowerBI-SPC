function getTooltips(data_type, limitsArray, numerator_values, denominator_values) {

    var val_name: string;

    if(data_type == "xbar") {
        val_name = "Group Mean"
    } else if(data_type == "s") {
        val_name = "Group SD"
    } else if(data_type == "c") {
        val_name = "Count"
    } else if(data_type == "t") {
        val_name = "Time"
    } else if(data_type == "g") {
        val_name = "Non-Events"
    } else if(data_type == "i" ||
              data_type == "run") {
        if(denominator_values  == null){
            val_name = "Observation"
        } else {
            val_name = "Ratio"
        }
    } else if(data_type == "mr") {
        if(denominator_values  == null){
            val_name = "Moving Range"
        } else {
            val_name = "Moving Range of Ratios"
        }
    } else if(data_type == "p" ||
              data_type == "pp") {
        val_name = "Proportion"
    } else {
        val_name = "Rate"
    }

    var inc_numdem: boolean = (data_type != "xbar" && data_type != "s" &&
                               data_type != "t" && data_type != "g" &&
                               data_type != "c");

    return limitsArray.map(
        (d, idx) => {
            let base =  [{
                    displayName: "Date:",
                    value: <string>d[0]
                },{
                    displayName: val_name + ":",
                    value: (d[1] == null) ? "" : (<number>d[1]).toFixed(2)
                }]

            if(inc_numdem && numerator_values != null && denominator_values != null) {
                base = base.concat(
                    [{
                        displayName: "Numerator:",
                        value: (<number>numerator_values[idx]).toFixed(2)
                    },{
                        displayName: "Denominator:",
                        value: (<number>denominator_values[idx]).toFixed(2)
                    }]
                )
            }

            if(data_type == "xbar" || data_type == "s") {
                base = base.concat(
                    [{
                        displayName: "Group N",
                        value: (<number>(d[5])).toFixed(2)
                    }]
                )
            }
            
            return base;
        }
    )
}

export default getTooltips;