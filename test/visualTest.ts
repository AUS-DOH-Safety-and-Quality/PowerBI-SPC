import powerbi from "powerbi-visuals-api";

import { ChartBuilder } from "./visualBuilder";
import { ChartDataBuilder } from "./visualData";

describe("Chart", () => {
  let visualBuilder: ChartBuilder;
  let dataView: powerbi.DataView;
  let defaultDataViewBuilder: ChartDataBuilder;

  beforeEach(() => {
    visualBuilder = new ChartBuilder(500, 500);
    defaultDataViewBuilder = new ChartDataBuilder();
    dataView = defaultDataViewBuilder.getDataView();
  });

  it("root DOM element is created", () => {
    visualBuilder.update(dataView);
    const visualClassElement = document.body.querySelector('.visual');
    expect(visualClassElement).toBeTruthy();
  });
});
