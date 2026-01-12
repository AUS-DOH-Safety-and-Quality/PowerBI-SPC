import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
const numerators: number[] = [266501,264225,276532,281461,269071,261215,270409,279778,270483,270320,267923,271478,255353,256820,261835,259144,255910,260863,264465,260989];
const denominators: number[] = [280443,276823,291681,296155,282343,275888,283867,295251,284468,282529,279618,283932,266629,268091,276803,271578,266005,273520,278574,273772];

const ul99: number[] = [96.567,96.5753,96.5421,96.5326,96.5627,96.5775,96.5593,96.5345,96.5579,96.5623,96.5689,96.5591,96.5996,96.5961,96.5753,96.5877,96.6012,96.583,96.5713,96.5824];
const ul95: number[] = [96.1413,96.1469,96.1247,96.1184,96.1384,96.1483,96.1362,96.1197,96.1353,96.1382,96.1426,96.1361,96.1631,96.1607,96.1469,96.1551,96.1641,96.152,96.1442,96.1516];
const ll95: number[] = [94.4386,94.4331,94.4552,94.4615,94.4415,94.4316,94.4438,94.4603,94.4447,94.4418,94.4374,94.4439,94.4169,94.4192,94.4331,94.4248,94.4158,94.4279,94.4358,94.4283];
const ll99: number[] = [94.013,94.0046,94.0378,94.0473,94.0173,94.0025,94.0207,94.0454,94.022,94.0177,94.0111,94.0208,93.9803,93.9839,94.0046,93.9923,93.9788,93.9969,94.0087,93.9975];

describe("P-Prime Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("P-Prime Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "pp";
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
