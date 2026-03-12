import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/build-data-view";
import buildSettings from "../helpers/build-settings";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

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

describe("Run Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  let limits: controlLimitsObject;

  beforeAll(() => {
    const settings = buildSettings({ "spc.chart_type": "run" });
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });
    limits = visual.viewModel.controlLimits[0];
  });

  afterAll(() => {
    element.remove();
  });

  it("Run chart can be created", () => {
    expect(limits.keys.length).toBe(keys.length);
    expect(limits.values.length).toBe(keys.length);
    expect(limits.targets.length).toBe(keys.length);

    for (let i = 0; i < keys.length; i++) {
      expect(limits.values[i]).toBeCloseTo(numerators[i], 5);
    }
  });

  it("Run chart uses median as centreline", () => {
    const sorted = numerators.slice().sort((a, b) => a - b);
    const n = sorted.length;
    const expectedMedian = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    for (let i = 0; i < keys.length; i++) {
      expect(limits.targets[i]).toBeCloseTo(expectedMedian, 2);
    }
  });

  it("Run chart has no control limits", () => {
    expect(limits.ul99).toBeUndefined();
    expect(limits.ll99).toBeUndefined();
    expect(limits.ul95).toBeUndefined();
    expect(limits.ll95).toBeUndefined();
  });
});
