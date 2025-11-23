import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";
import { rep } from "../src/Functions";
import { expectError } from "./helpers/testHelpers";


const stringKeys: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const validNumerators: number[] = [742731.43, 263501, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34];

describe("Chart Errors", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const svgElement: Element = visualClassElement.querySelector('svg') as Element;

  it("Errors render", () => {
    visual.update({
      dataViews: [ buildDataView({ key: stringKeys }) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    expectError(svgElement, 'No Numerators passed!');

    visual.update({
      dataViews: [ buildDataView({ key: stringKeys, numerators: rep(<any>null, 7) }) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    expectError(svgElement, 'All numerators are missing or null!');

    visual.update({
      dataViews: [ buildDataView({ key: stringKeys, numerators: stringKeys }) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    expectError(svgElement, 'All numerators are not numbers!');

    visual.update({
      dataViews: [ buildDataView({ key: rep(<any>null, 7), numerators: validNumerators }) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    expectError(svgElement, 'All dates/IDs are missing or null!');
  });

  element.remove();
});
