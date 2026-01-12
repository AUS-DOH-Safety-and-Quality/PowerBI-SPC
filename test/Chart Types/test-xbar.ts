import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

const keys: string[] = ["2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01","2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01","2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01","2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01"];
const numerators: number[] = [66.88,68.76,67.75,67.05,67.2,67.43,69.23,71.12,67.63,69.97,66.67,67.76,69.32,66.04,67.61,69.69,67.62,67.31,68.41,64.73,68.28,69.34,66.53,66.67,67.27,67.69,67.6,67.29,68.47,66.82,68.87,66.75,67.41,69.87,68.19,66.04];
const denominators: number[] = [52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78];
const xbar_sds: number[] = [8.69,8.86,10.16,10.45,10.12,8.94,9.51,9.53,11.22,8.5,9.04,10.82,8.8,9.65,10.41,10.08,9.7,9.35,8.5,9.59,9.72,8.89,9.99,10.74,9.68,9.63,9.74,10.35,8.65,9.88,7.9,8.95,9.45,9.81,8.58,11.19];

const ul99: number[] = [71.83,71.43,71.27,71.55,71.34,71.29,71.34,71.75,71.06,71.58,71.95,71.52,72.34,71.87,71.68,72.24,71.65,71.99,71.29,72.34,72.4,72.09,71.58,71.49,71.65,71.4,71.15,71.27,71.13,71.29,71.43,71.34,70.96,71.34,71.29,71.08];
const ul95: number[] = [70.48,70.22,70.11,70.3,70.16,70.13,70.16,70.43,69.97,70.32,70.57,70.28,70.83,70.51,70.39,70.76,70.36,70.6,70.13,70.83,70.87,70.66,70.32,70.26,70.36,70.2,70.03,70.11,70.02,70.13,70.22,70.16,69.91,70.16,70.13,69.99];
const ll95: number[] = [65.11,65.38,65.48,65.3,65.43,65.47,65.43,65.16,65.62,65.27,65.03,65.32,64.76,65.08,65.21,64.84,65.23,65,65.47,64.76,64.73,64.94,65.27,65.34,65.23,65.39,65.56,65.48,65.58,65.47,65.38,65.43,65.69,65.43,65.47,65.6];
const ll99: number[] = [63.76,64.16,64.33,64.04,64.25,64.3,64.25,63.84,64.53,64.01,63.64,64.08,63.25,63.72,63.91,63.36,63.95,63.6,64.3,63.25,63.19,63.51,64.01,64.11,63.95,64.19,64.44,64.33,64.47,64.3,64.16,64.25,64.63,64.25,64.3,64.51];

describe("xbar Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("Xbar Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "xbar";
    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        numerators: numerators,
        denominators: denominators,
        xbar_sds: xbar_sds
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
