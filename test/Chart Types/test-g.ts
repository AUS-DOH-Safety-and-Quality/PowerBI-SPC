import powerbi from "powerbi-visuals-api";
import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { controlLimitsObject } from "../../src/Classes/viewModelClass";

const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67"];
const numerators: number[] = [23,39,15,34,1,49,98,29,27,13,45,7,10,27,24,14,20,38,44,11,10,3,113,183,3,47,18,18,33,15,2,38,27,27,1,52,23,7,26,82,5,49,5,17,24,44,26,2,27,46,55,97,22,22,20,4,60,51,7,21,66,36,25,72,15,5,3];


const ul99: number[] = [128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17,128.17];
const ul95: number[] = [96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01,96.01];
const ll95: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const ll99: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

describe("G Chart Test", () => {
  const element = testDom("500", "500");
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });

  it("G Chart can be created", () => {
    let defaultSettingsCopy = JSON.parse(JSON.stringify(defaultSettings));
    defaultSettingsCopy.spc.chart_type = "g";
    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        numerators: numerators
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
