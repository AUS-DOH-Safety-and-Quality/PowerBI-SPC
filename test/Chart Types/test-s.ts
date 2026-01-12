import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

const keys: string[] = ["2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01","2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01","2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01","2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01"];
const sds: number[] = [8.69,8.86,10.16,10.45,10.12,8.94,9.51,9.53,11.22,8.5,9.04,10.82,8.8,9.65,10.41,10.08,9.7,9.35,8.5,9.59,9.72,8.89,9.99,10.74,9.68,9.63,9.74,10.35,8.65,9.88,7.9,8.95,9.45,9.81,8.58,11.19];
const denominators: number[] = [52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78];

const ul99: number[] = [12.52,12.23,12.11,12.31,12.17,12.13,12.17,12.46,11.97,12.34,12.61,12.29,12.89,12.55,12.41,12.81,12.39,12.64,12.13,12.89,12.93,12.7,12.34,12.27,12.39,12.21,12.03,12.11,12.01,12.13,12.23,12.17,11.89,12.17,12.13,11.98];
const ul95: number[] = [11.56,11.37,11.29,11.42,11.33,11.3,11.33,11.52,11.19,11.44,11.62,11.41,11.81,11.58,11.49,11.76,11.47,11.64,11.3,11.81,11.84,11.68,11.44,11.4,11.47,11.35,11.23,11.29,11.22,11.3,11.37,11.33,11.14,11.33,11.3,11.2];
const ll95: number[] = [7.73,7.92,8,7.87,7.96,7.99,7.96,7.77,8.1,7.85,7.67,7.88,7.48,7.71,7.8,7.53,7.82,7.65,7.99,7.48,7.45,7.61,7.85,7.9,7.82,7.94,8.06,8,8.07,7.99,7.92,7.96,8.15,7.96,7.99,8.09];
const ll99: number[] = [6.77,7.06,7.18,6.98,7.12,7.16,7.12,6.83,7.32,6.95,6.68,7,6.4,6.74,6.88,6.48,6.9,6.65,7.16,6.4,6.36,6.59,6.95,7.02,6.9,7.08,7.26,7.18,7.28,7.16,7.06,7.12,7.4,7.12,7.16,7.31];

describe("S Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("S Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "s";
    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        numerators: sds,
        denominators: denominators
      },
      defaultSettingsCopy) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    const limits: controlLimitsObject = visual.viewModel.controlLimits[0];
    for (let i = 0; i < limits.keys.length; i++) {
      expect((limits.ul99 as number[])[i]).toBeCloseTo(ul99[i], 2);
      expect((limits.ul95 as number[])[i]).toBeCloseTo(ul95[i], 2);
      expect((limits.ll95 as number[])[i]).toBeCloseTo(ll95[i], 2);
      expect((limits.ll99 as number[])[i]).toBeCloseTo(ll99[i], 2);
    }
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
