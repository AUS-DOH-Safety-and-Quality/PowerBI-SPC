import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/build-data-view";
import buildSettings from "../helpers/build-settings";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

// Test data
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

describe("I-Median Moving Range Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("I-MM chart can be created and produces valid limits", () => {
    const settings = buildSettings({ "spc.chart_type": "i_mm" });
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    const limits: controlLimitsObject = visual.viewModel.controlLimits[0];

    // Basic structure
    expect(limits.keys.length).toBe(keys.length);
    expect(limits.values.length).toBe(keys.length);
    expect(limits.targets.length).toBe(keys.length);
    expect(limits.ul99.length).toBe(keys.length);
    expect(limits.ll99.length).toBe(keys.length);

    // i_mm uses median centreline
    const sorted = numerators.slice().sort((a, b) => a - b);
    const n = sorted.length;
    const expectedMedian = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    for (let i = 0; i < keys.length; i++) {
      expect(limits.targets[i]).toBeCloseTo(expectedMedian, 2);
    }

    // Limits should be constant
    for (let i = 1; i < keys.length; i++) {
      expect(limits.ul99[i]).toBeCloseTo(limits.ul99[0], 10);
      expect(limits.ll99[i]).toBeCloseTo(limits.ll99[0], 10);
    }

    // Limit ordering
    expect(limits.ll99[0]).toBeLessThan(limits.ll95[0]);
    expect(limits.ll95[0]).toBeLessThan(limits.ll68[0]);
    expect(limits.ll68[0]).toBeLessThan(limits.targets[0]);
    expect(limits.targets[0]).toBeLessThan(limits.ul68[0]);
    expect(limits.ul68[0]).toBeLessThan(limits.ul95[0]);
    expect(limits.ul95[0]).toBeLessThan(limits.ul99[0]);

    // Symmetric around median
    const upperDist = limits.ul99[0] - limits.targets[0];
    const lowerDist = limits.targets[0] - limits.ll99[0];
    expect(upperDist).toBeCloseTo(lowerDist, 5);

    // Values should match raw numerators
    for (let i = 0; i < keys.length; i++) {
      expect(limits.values[i]).toBeCloseTo(numerators[i], 5);
    }
  });

  it("I-MM should use median moving range (more robust than AMR)", () => {
    // Compare i_m (uses AMR) vs i_mm (uses MMR) -- they should produce
    // different sigma estimates and therefore different limit widths
    const settingsIM = buildSettings({ "spc.chart_type": "i_m" });
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators }, settingsIM) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });
    const imLimits: controlLimitsObject = visual.viewModel.controlLimits[0];

    const settingsIMM = buildSettings({ "spc.chart_type": "i_mm" });
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators }, settingsIMM) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });
    const immLimits: controlLimitsObject = visual.viewModel.controlLimits[0];

    // Both should have the same centreline (both use median)
    expect(immLimits.targets[0]).toBeCloseTo(imLimits.targets[0], 5);

    // But limit widths should differ (AMR vs MMR give different sigma)
    const imWidth = imLimits.ul99[0] - imLimits.ll99[0];
    const immWidth = immLimits.ul99[0] - immLimits.ll99[0];

    // AMR and MMR give different sigma estimates, so widths must differ
    expect(imWidth).toBeGreaterThan(0);
    expect(immWidth).toBeGreaterThan(0);
    expect(imWidth).not.toBeCloseTo(immWidth, 5);
  });

  element.remove();
});
