import { describe, expect, it, vi } from "vitest";
import { testDom } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import type { plotData } from "../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";
import { keyedHost } from "powerbi-visuals-core/testing";
import addContextMenu from "../src/D3 Plotting Functions/addContextMenu";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];

function render(visual: Visual): void {
  const settings: settingsValueType = { ...defaultSettings, spc: { ...defaultSettings.spc, chart_type: "i" } };
  visual.update({
    dataViews: [buildDataView({ key: sequentialKeys(numerators.length), numerators }, settings)],
    viewport: { width: 500, height: 500 },
    type: 2
  });
}

function dotOpacity(element: HTMLElement, index: number): string {
  return element.querySelectorAll<SVGPathElement>(".dotsgroup path")[index].style.fillOpacity;
}

function points(visual: Visual): plotData[] {
  return visual.viewModel.plotPoints;
}

function contextMenu(clientX: number, clientY: number): MouseEvent {
  return new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX, clientY });
}

// Selection matching by key and the shared context-menu binding.
describe("Selection and context menu", () => {
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

  it("shows the context menu for points and the background, prevents the default menu and rebinds without duplicates", () => {
    const element = testDom("500", "500");
    const visual = new Visual({ element, host: keyedHost() });
    render(visual);
    const show = vi.spyOn(visual.selectionManager, "showContextMenu").mockResolvedValue({});
    const svg = element.querySelector("svg");
    const dot = element.querySelector(".dotsgroup path");
    if (svg === null || dot === null) {
      throw new Error("Missing chart elements");
    }
    const point = points(visual)[0];

    const onPoint = contextMenu(11, 22);
    dot.dispatchEvent(onPoint);
    expect(show).toHaveBeenCalledTimes(1);
    expect(show).toHaveBeenLastCalledWith(point.identity, { x: 11, y: 22 });
    expect(onPoint.defaultPrevented).toBe(true);

    const onBackground = contextMenu(3, 4);
    svg.dispatchEvent(onBackground);
    expect(show).toHaveBeenCalledTimes(2);
    expect(show).toHaveBeenLastCalledWith({}, { x: 3, y: 4 });
    expect(onBackground.defaultPrevented).toBe(true);

    const hidden = vi.spyOn(visual, "plotProperties", "get").mockReturnValue({ ...visual.plotProperties, displayPlot: false });
    visual.svg.call(addContextMenu, visual);
    const disabled = contextMenu(1, 1);
    dot.dispatchEvent(disabled);
    expect(show).toHaveBeenCalledTimes(2);
    expect(disabled.defaultPrevented).toBe(false);

    hidden.mockRestore();
    visual.svg.call(addContextMenu, visual);
    visual.svg.call(addContextMenu, visual);
    dot.dispatchEvent(contextMenu(5, 6));
    expect(show).toHaveBeenCalledTimes(3);
    expect(show).toHaveBeenLastCalledWith(point.identity, { x: 5, y: 6 });
  });
});
