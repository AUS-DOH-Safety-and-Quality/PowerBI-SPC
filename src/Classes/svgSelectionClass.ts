import * as d3 from "d3";
import svgObjectClass from "./svgObjectClass"
import viewModel from "./viewModelClass"

type SelectionAny = d3.Selection<any, any, any, any>;

class svgSelectionClass {
  tooltipLineSelection: SelectionAny;

  update(args: { svgObjects: svgObjectClass, viewModel: viewModel }) {
    if (args.viewModel.plotPoints) {
      this.tooltipLineSelection = args.svgObjects
                                      .tooltipLineGroup
                                      .selectAll(".ttip-line")
                                      .data(args.viewModel.plotPoints);
    } else {
      this.tooltipLineSelection = args.svgObjects
                                      .tooltipLineGroup
                                      .selectAll(".ttip-line");
    }
  }
}

export default svgSelectionClass
