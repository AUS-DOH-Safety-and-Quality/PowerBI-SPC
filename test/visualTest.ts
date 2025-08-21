import powerbi from "powerbi-visuals-api";

import { ChartBuilder } from "./visualBuilder";
import { ChartDataBuilder } from "./visualData";

import DataView = powerbi.DataView;

describe("BarChart", () => {
  let visualBuilder: ChartBuilder;
  let dataView: DataView;
  let defaultDataViewBuilder: ChartDataBuilder;

  beforeEach(() => {
    visualBuilder = new ChartBuilder(500, 500);
    defaultDataViewBuilder = new ChartDataBuilder();
    dataView = defaultDataViewBuilder.getDataView();
  });

  it("root DOM element is created", () => {
    visualBuilder.updateRenderTimeout(dataView, () => {
       expect(document.body.contains(visualBuilder.mainElement)).toBeTruthy();
    });
  });
});
