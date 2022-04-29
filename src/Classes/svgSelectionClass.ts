import * as d3 from "d3";

type SelectionAny = d3.Selection<any, any, any, any>;

class svgSelectionClass {
  dotSelection: SelectionAny;
  lineSelection: SelectionAny;
  listeningRectSelection: SelectionAny;
  tooltipLineSelection: SelectionAny;
}

export default svgSelectionClass
