import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes";

const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
const numerators: number[] = [266501,264225,276532,281461,269071,261215,270409,279778,270483,270320,267923,271478,255353,256820,261835,259144,255910,260863,264465,260989];
const denominators: number[] = [280443,276823,291681,296155,282343,275888,283867,295251,284468,282529,279618,283932,266629,268091,276803,271578,266005,273520,278574,273772];

const ul99: number[] = [0.9657,0.9658,0.9654,0.9653,0.9656,0.9658,0.9656,0.9653,0.9656,0.9656,0.9657,0.9656,0.966,0.966,0.9658,0.9659,0.966,0.9658,0.9657,0.9658];
const ul95: number[] = [0.9614,0.9615,0.9612,0.9612,0.9614,0.9615,0.9614,0.9612,0.9614,0.9614,0.9614,0.9614,0.9616,0.9616,0.9615,0.9616,0.9616,0.9615,0.9614,0.9615];
const ll95: number[] = [0.9444,0.9443,0.9446,0.9446,0.9444,0.9443,0.9444,0.9446,0.9444,0.9444,0.9444,0.9444,0.9442,0.9442,0.9443,0.9442,0.9442,0.9443,0.9444,0.9443];
const ll99: number[] = [0.9401,0.940,0.9404,0.9405,0.9402,0.94,0.9402,0.9405,0.9402,0.9402,0.9401,0.9402,0.9398,0.9398,0.94,0.9399,0.9398,0.94,0.9401,0.94];

describe("U-Prime Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("U-Prime Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "up";
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
