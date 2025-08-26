import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";

const stringKeys: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const stringGrouping: string[] = ["A", "A", "A", "B", "B", "B", "B"];
const validNumerators: number[] = [742731.43, 263501, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34];

describe("Chart Initialisation", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const svgElement: Element = visualClassElement.querySelector('svg') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("Visual can be created", () => {
    // Expect that the visual element has been created
    expect(visualClassElement).toBeTruthy();

    // Expect that the visual element contains both an SVG for the chart and a div for the table
    expect(svgElement).toBeTruthy();
    expect(tableDivElement?.querySelector('table')).toBeTruthy();
  });

  it("SPC Chart can be created", () => {
    visual.update({
      dataViews: [ buildDataView({ key: stringKeys, numerators: validNumerators }) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });


    // If only numerators and dates are passed, the SPC chart should be visible and table hidden
    expect(svgElement.getAttribute('width')).toBe('500');
    expect(svgElement.getAttribute('height')).toBe('500');
    expect(tableDivElement.getAttribute('style')).toContain('height: 0%');
    expect(tableDivElement.getAttribute('style')).toContain('width: 0%');

    // Pass indicator groupings with data
    visual.update({
      dataViews: [ buildDataView({ key: stringKeys, indicator: stringGrouping, numerators: validNumerators }) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    // Expect that the table div element now has 100% height and width, while the SPC chart is hidden
    expect(svgElement.getAttribute('width')).toBe('0');
    expect(svgElement.getAttribute('height')).toBe('0');
    expect(tableDivElement.getAttribute('style')).toContain('height: 100%');
    expect(tableDivElement.getAttribute('style')).toContain('width: 100%');
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
