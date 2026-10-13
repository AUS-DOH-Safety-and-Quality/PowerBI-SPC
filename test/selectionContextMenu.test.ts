import { describe, expect, it } from "vitest";
import { testDom } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import type { plotData } from "../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";
import { keyedHost } from "powerbi-visuals-core/testing";
import { updateType } from "powerbi-visuals-core/powerbi";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];

function render(visual: Visual): void {
  const settings: settingsValueType = { ...defaultSettings, spc: { ...defaultSettings.spc, chart_type: "i" } };
  visual.update({
    dataViews: [buildDataView({ key: sequentialKeys(numerators.length), numerators }, settings)],
    viewport: { width: 500, height: 500 },
    type: updateType.data
  });
}

function dotOpacity(element: HTMLElement, index: number): string {
  return element.querySelectorAll<SVGPathElement>(".dotsgroup path")[index].style.fillOpacity;
}

function points(visual: Visual): plotData[] {
  return visual.viewModel.plotPoints;
}

describe("Selection matching by key", () => {
  it("keeps a selected point highlighted after a data update rebuilds identities", async () => {
    const element = testDom("500", "500");
    const visual = new Visual({ element, host: keyedHost() });
    render(visual);
    const before = points(visual)[2];
    expect(before.identity.getKey()).not.toBe(points(visual)[0].identity.getKey());
    await visual.selectionManager.select(before.identity);
    visual.updateHighlighting();
    expect(dotOpacity(element, 2)).toBe(String(before.aesthetics.opacity_selected));
    expect(dotOpacity(element, 0)).toBe(String(before.aesthetics.opacity_unselected));

    render(visual);
    const after = points(visual)[2];
    expect(after.identity).not.toBe(before.identity);
    expect(after.identity.getKey()).toBe(before.identity.getKey());
    expect(dotOpacity(element, 2)).toBe(String(after.aesthetics.opacity_selected));
    expect(dotOpacity(element, 0)).toBe(String(after.aesthetics.opacity_unselected));
    expect(dotOpacity(element, 7)).toBe(String(after.aesthetics.opacity_unselected));
  });
});
