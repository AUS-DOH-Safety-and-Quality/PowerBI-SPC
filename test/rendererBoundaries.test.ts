import { describe, expect, it, vi } from "vitest";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import { type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";
import { settingsWith } from "./helpers/renderVisual";
import { must } from "powerbi-visuals-core/testing";
import { updateType } from "powerbi-visuals-core/powerbi";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];
const keys = sequentialKeys(numerators.length);
const viewport = { width: 500, height: 500 };

function update(visual: Visual, settings: settingsValueType): void {
  visual.update({ dataViews: [buildDataView({ key: keys, numerators }, settings)], viewport, type: updateType.data });
}

function render(element: HTMLElement, settings: settingsValueType, host = createVisualHost({})): Visual {
  const visual = new Visual({ element, host });
  update(visual, settings);
  return visual;
}

describe("renderer boundaries", () => {
  it("draws a download link that exports the table rows as CSV", () => {
    const host = createVisualHost({});
    const exportVisualsContent = vi.fn<(content: string) => void>();
    Object.assign(host, { downloadService: { exportVisualsContent } });
    const element = testDom("500", "500");
    const visual = render(element, settingsWith({ download_options: { show_button: true } }), host);
    const button = must(element.querySelector<SVGTextElement>(".download-btn-group"));
    expect(button.textContent).toBe("Download");
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(exportVisualsContent).toHaveBeenCalledTimes(1);
    const lines: string[] = exportVisualsContent.mock.calls[0][0].split("\n");
    expect(lines[0].startsWith("date,numerator,denominator,value,")).toBe(true);
    expect(lines).toHaveLength(keys.length + 1);
    // An individuals chart without denominators leaves the numerator and denominator columns blank
    expect(lines[1].split(",").slice(0, 4)).toEqual(["1", "", "", "10"]);
    update(visual, settingsWith({}));
    expect(element.querySelector(".download-btn-group")).toBeNull();
    element.remove();
  });
});
