import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/build-data-view";
import buildSettings from "../helpers/build-settings";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

// Test data: same dataset as i-chart test for comparability
const keys: string[] = [
  "2020-01-01","2020-02-01","2020-03-01","2020-04-01","2020-05-01",
  "2020-06-01","2020-07-01","2020-08-01","2020-09-01","2020-10-01",
  "2020-11-01","2020-12-01","2021-01-01","2021-02-01","2021-03-01",
  "2021-04-01","2021-05-01","2021-06-01"
];
const numerators: number[] = [
  12, 15, 11, 18, 14, 13, 16, 19, 12, 14,
  17, 11, 15, 13, 16, 18, 12, 14
];

describe("I-Median Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("I-Median chart can be created and produces valid limits", () => {
    const settings = buildSettings({ "spc.chart_type": "i" });
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    const iLimits: controlLimitsObject = visual.viewModel.controlLimits[0];

    // Now test i_m (median centreline)
    const settingsIM = buildSettings({ "spc.chart_type": "i_m" });
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators }, settingsIM) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    const imLimits: controlLimitsObject = visual.viewModel.controlLimits[0];

    // Basic structure checks
    expect(imLimits.keys.length).toBe(keys.length);
    expect(imLimits.values.length).toBe(keys.length);
    expect(imLimits.targets.length).toBe(keys.length);
    expect(imLimits.ul99.length).toBe(keys.length);
    expect(imLimits.ll99.length).toBe(keys.length);

    // i_m uses median centreline -- verify it equals median of data
    const sorted = numerators.slice().sort((a, b) => a - b);
    const n = sorted.length;
    const expectedMedian = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    // All targets should equal the median
    for (let i = 0; i < keys.length; i++) {
      expect(imLimits.targets[i]).toBeCloseTo(expectedMedian, 2);
    }

    // Limits should be constant (same for all points)
    for (let i = 1; i < keys.length; i++) {
      expect(imLimits.ul99[i]).toBeCloseTo(imLimits.ul99[0], 10);
      expect(imLimits.ll99[i]).toBeCloseTo(imLimits.ll99[0], 10);
    }

    // Limit ordering: ll99 < ll95 < ll68 < target < ul68 < ul95 < ul99
    expect(imLimits.ll99[0]).toBeLessThan(imLimits.ll95[0]);
    expect(imLimits.ll95[0]).toBeLessThan(imLimits.ll68[0]);
    expect(imLimits.ll68[0]).toBeLessThan(imLimits.targets[0]);
    expect(imLimits.targets[0]).toBeLessThan(imLimits.ul68[0]);
    expect(imLimits.ul68[0]).toBeLessThan(imLimits.ul95[0]);
    expect(imLimits.ul95[0]).toBeLessThan(imLimits.ul99[0]);

    // Limits should be symmetric around median
    const upperDist = imLimits.ul99[0] - imLimits.targets[0];
    const lowerDist = imLimits.targets[0] - imLimits.ll99[0];
    expect(upperDist).toBeCloseTo(lowerDist, 5);

    // i_m centreline (median=14) should differ from i-chart centreline (mean≈14.17)
    expect(imLimits.targets[0]).not.toBeCloseTo(iLimits.targets[0], 2);

    // Values should match raw numerators
    for (let i = 0; i < keys.length; i++) {
      expect(imLimits.values[i]).toBeCloseTo(numerators[i], 5);
    }
  });

  element.remove();
});
