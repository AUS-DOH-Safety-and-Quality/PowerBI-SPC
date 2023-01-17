import * as d3 from "d3";
import svgObjectClass from "./svgObjectClass"
import viewModel from "./viewModel"

type SelectionAny = d3.Selection<any, any, any, any>;

class svgSelectionClass {
  dotSelection: SelectionAny;
  lineSelection: SelectionAny;
  listeningRectSelection: SelectionAny;
  tooltipLineSelection: SelectionAny;

  update(args: { svgObjects: svgObjectClass,
                      viewModel: viewModel }) {
    this.dotSelection =  args.svgObjects
                              .dotGroup
                              .selectAll(".dot")
                              .data(args.viewModel.plotPoints);

    this.lineSelection = args.svgObjects
                              .lineGroup
                              .selectAll(".line")
                              .data(args.viewModel.groupedLines);

    this.listeningRectSelection = args.svgObjects
                                      .listeningRect
                                      .selectAll(".obs-sel")
                                      .data(args.viewModel.plotPoints);
    this.tooltipLineSelection = args.svgObjects
                                    .tooltipLineGroup
                                    .selectAll(".ttip-line")
                                    .data(args.viewModel.plotPoints);
  }
}

export default svgSelectionClass
