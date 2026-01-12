import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

const keys: string[] = ["2010-01-01","2010-02-01","2010-03-01","2010-04-01","2010-05-01","2010-06-01","2010-07-01","2010-08-01","2010-09-01","2010-10-01","2010-11-01","2010-12-01","2011-01-01","2011-02-01","2011-03-01","2011-04-01","2011-05-01"];
const numerators: number[] = [5,7,5,7,7,5,4,9,8,13,8,7,8,7,12,11,8];
const denominators: number[] = [113,132,121,134,116,131,93,138,182,157,100,103,146,108,153,141,134];

const values: number[] = [0.0088,0.0117,0.0109,0.0081,0.0222,0.0048,0.0222,0.0213,0.0388,0.0028,0.012,0.0132,0.01,0.0136,4e-04,0.0183]
const ul99: number[] = [0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448,0.0448];
const ul95: number[] = [0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298,0.0298];
const ll95: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const ll99: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

describe("MR Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("MR Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "mr";
    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        numerators: numerators,
        denominators: denominators
      },
      defaultSettingsCopy) ],
      viewport: { width: 500, height: 500 },
      type: powerbi.VisualUpdateType.Data
    });

    const limits: controlLimitsObject = visual.viewModel.controlLimits[0];
    for (let i = 0; i < limits.keys.length; i++) {
      expect((limits.values as number[])[i]).toBeCloseTo(values[i], 4);
      expect((limits.ul99 as number[])[i]).toBeCloseTo(ul99[i], 4);
      expect((limits.ul95 as number[])[i]).toBeCloseTo(ul95[i], 4);
      expect((limits.ll95 as number[])[i]).toBeCloseTo(ll95[i], 4);
      expect((limits.ll99 as number[])[i]).toBeCloseTo(ll99[i], 4);
    }
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
