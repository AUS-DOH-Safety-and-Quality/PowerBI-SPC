import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

const keys: string[] = ["2015-01-01","2015-02-01","2015-03-01","2015-04-01","2015-05-01","2015-06-01","2015-07-01","2015-08-01","2015-09-01","2015-10-01","2015-11-01","2015-12-01","2016-01-01","2016-02-01","2016-03-01","2016-04-01","2016-05-01","2016-06-01","2016-07-01","2016-08-01","2016-09-01","2016-10-01","2016-11-01","2016-12-01"];
const numerators: number[] = [575,521,585,528,507,519,457,505,494,512,543,506,509,521,549,531,509,528,419,512,495,513,454,490];
const denominators: number[] = [310466.8333,282346.7917,309089.7083,287977.3333,297743.375,286988.25,261120.3333,268720.75,284437.875,290449.5,288104.4583,279961.375,289803.9583,275950.5833,290824.4583,285495.75,282515.2083,273927.875,253085.625,262410.7083,275529.25,282405.0833,259530.7917,256235.4583];

const ul99: number[] = [20.5349,20.6467,20.5401,20.623,20.5836,20.6271,20.7428,20.7071,20.6378,20.6129,20.6225,20.657,20.6155,20.6745,20.6113,20.6334,20.646,20.6835,20.7823,20.7366,20.6764,20.6465,20.7505,20.7666];
const ul95: number[] = [19.7685,19.8431,19.772,19.8273,19.801,19.83,19.9071,19.8833,19.8371,19.8205,19.8269,19.8499,19.8223,19.8616,19.8195,19.8342,19.8426,19.8676,19.9334,19.903,19.8628,19.8429,19.9122,19.923];
const ll95: number[] = [16.703,16.6284,16.6995,16.6442,16.6705,16.6415,16.5644,16.5882,16.6344,16.651,16.6446,16.6216,16.6493,16.6099,16.652,16.6373,16.6289,16.6039,16.5381,16.5685,16.6087,16.6286,16.5593,16.5485];
const ll99: number[] = [15.9366,15.8248,15.9314,15.8485,15.8879,15.8444,15.7287,15.7644,15.8337,15.8586,15.849,15.8145,15.856,15.797,15.8602,15.8381,15.8255,15.788,15.6892,15.7349,15.7951,15.825,15.721,15.7049];

describe("U Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("U Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "u";
    defaultSettingsCopy.spc.multiplier = 10000;
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
      expect((limits.ul99 as number[])[i]).toBeCloseTo(ul99[i], 4);
      expect((limits.ul95 as number[])[i]).toBeCloseTo(ul95[i], 4);
      expect((limits.ll95 as number[])[i]).toBeCloseTo(ll95[i], 4);
      expect((limits.ll99 as number[])[i]).toBeCloseTo(ll99[i], 4);
    }
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
