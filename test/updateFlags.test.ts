import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";
import { describe, it, expect } from "vitest";
import { updateType, combineUpdateTypes } from "powerbi-visuals-core/powerbi";

const keys: string[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const first: number[] = [742731.43, 263501, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34];
const second = new Array<number>(first.length);
for (let i = 0; i < first.length; i++) {
  second[i] = first[i] * 2;
}

// Any update carrying the Data bit rebuilds settings and data, including combined
// Data | Resize (6) and All (62) updates; a Resize-only update (4) reuses the existing observations.
describe("combined update types", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element, host: createVisualHost({}) });

  it("rebuilds data on combined updates and reuses it on resize-only updates", () => {
    visual.update({ dataViews: [buildDataView({ key: keys, numerators: first })], viewport: { width: 500, height: 500 }, type: updateType.data });
    expect(visual.viewModel.inputData[0].limitInputArgs.numerators).toEqual(first);

    visual.update({ dataViews: [buildDataView({ key: keys, numerators: second })], viewport: { width: 600, height: 400 }, type: combineUpdateTypes([updateType.data, updateType.resize]) });
    expect(visual.viewModel.inputData[0].limitInputArgs.numerators).toEqual(second);

    visual.update({ dataViews: [buildDataView({ key: keys, numerators: first })], viewport: { width: 300, height: 300 }, type: updateType.resize });
    expect(visual.viewModel.inputData[0].limitInputArgs.numerators).toEqual(second);

    visual.update({ dataViews: [buildDataView({ key: keys, numerators: first })], viewport: { width: 500, height: 500 }, type: updateType.all });
    expect(visual.viewModel.inputData[0].limitInputArgs.numerators).toEqual(first);
  });
});
