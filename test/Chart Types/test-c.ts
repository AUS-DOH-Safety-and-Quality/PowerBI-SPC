import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes";

const keys: string[] = ["2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01","2014-07-01","2014-08-01","2014-09-01","2014-10-01","2014-11-01","2014-12-01","2015-01-01","2015-02-01","2015-03-01","2015-04-01","2015-05-01","2015-06-01","2015-07-01","2015-08-01","2015-09-01","2015-10-01"];
const numerators: number[] = [17,12,27,20,20,18,22,19,19,24,17,16,24,19,19,22,25,19,17,6,25,17,11,14,9,11,7,13,5,5,3,5,9,4,5,9];
const groupings: number[] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2];

const ul99: number[] = [31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,31.68,15.07,15.07,15.07,15.07,15.07,15.07,15.07,15.07,15.07,15.07,15.07,15.07];
const ul95: number[] = [27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,27.36,12.41,12.41,12.41,12.41,12.41,12.41,12.41,12.41,12.41,12.41,12.41,12.41];
const ll95: number[] = [10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,10.06,1.76,1.76,1.76,1.76,1.76,1.76,1.76,1.76,1.76,1.76,1.76,1.76];
const ll99: number[] = [5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,5.73,0,0,0,0,0,0,0,0,0,0,0,0];

describe("C Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("C Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "c";
    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        numerators: numerators,
        groupings: groupings
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
