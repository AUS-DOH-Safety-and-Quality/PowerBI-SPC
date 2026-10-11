import { describe, expect, it } from "vitest";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 60, 66, 74, 84];

// Outside/inside on non-interval lines place labels above/below.
describe("line label positions", () => {
  it("places outside and inside labels on main and target lines with finite offsets", () => {
    const settings: settingsValueType = {
      ...defaultSettings,
      spc: { ...defaultSettings.spc, chart_type: "i" },
      lines: {
        ...defaultSettings.lines,
        plot_label_show_main: true, plot_label_position_main: "outside",
        plot_label_show_target: true, plot_label_position_target: "inside",
        plot_label_show_95: true, plot_label_position_95: "outside"
      }
    };
    const element = testDom("500", "500");
    const visual = new Visual({ element, host: createVisualHost({}) });
    visual.update({
      dataViews: [buildDataView({ key: sequentialKeys(numerators.length), numerators }, settings)],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const labels = element.querySelectorAll(".linesgroup text");
    expect(labels.length).toBeGreaterThan(0);
    for (let i = 0; i < labels.length; i++) {
      expect(labels[i].getAttribute("dy")).toMatch(/^-?\d+(\.\d+)?px$/);
    }
  });
});
