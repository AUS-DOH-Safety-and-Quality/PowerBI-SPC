import { describe, expect, it } from "vitest";
import settingsModel, { defaultSettings } from "../../src/settings";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import settingsClass from "../../src/Classes/settingsClass";
import buildDataView from "../helpers/buildDataView";

describe("setting definitions", () => {
  it("preserves SPC defaults, optional values, and real formatting cards", () => {
    expect(Object.keys(settingsModel)).toEqual(Object.keys(defaultSettings));
    expect(Object.keys(settingsModel)).toHaveLength(12);
    expect(defaultSettings.x_axis.xlimit_show).toBe(true);
    expect(defaultSettings.x_axis.xlimit_tick_rotation).toBe(-35);
    expect(defaultSettings.spc.subset_rebaselines).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(settingsModel.spc.num_points_subset, "default")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(defaultSettings.spc, "num_points_subset")).toBe(true);
    expect(defaultSettings.spc.num_points_subset).toBeUndefined();
    const pane = new settingsClass().getFormattingModel();
    expect(pane.cards).toHaveLength(12);
    for (let i = 0; i < pane.cards.length; i++) {
      expect(pane.cards[i].displayName).toBeTruthy();
    }
  });

  it("keeps visual instances and interleaved indicator settings independent", () => {
    const first = createDefaultValues(settingsModel);
    const second = createDefaultValues(settingsModel);
    second.spc.chart_type = "p";
    second.spc.subset_rebaselines = true;
    const view = buildDataView(
      { key: ["A", "B", "C", "D"], numerators: [1, 2, 3, 4] },
      [first, second, first, second]
    );
    const settings = new settingsClass();
    const other = new settingsClass();
    settings.update(view.categorical!.categories![0], [[0, 2], [1, 3]]);
    expect(settings.settings[0].spc.chart_type).toBe("i");
    expect(settings.settings[1].spc.chart_type).toBe("p");
    expect(settings.settings[0].spc.subset_rebaselines).toBe(false);
    expect(settings.settings[1].spc.subset_rebaselines).toBe(true);
    settings.settings[0].canvas.lower_padding = 40;
    expect(settings.settings[1].canvas.lower_padding).toBe(10);
    expect(other.settings[0].canvas.lower_padding).toBe(10);
    expect(defaultSettings.canvas.lower_padding).toBe(10);
    expect(settingsModel.canvas.lower_padding.default).toBe(10);
  });
});
