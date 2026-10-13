import { describe, expect, it, vi } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import { sequentialKeys } from "../helpers/buildDataView";
import { renderVisual, settingsWith, type SettingsOverrides } from "../helpers/renderVisual";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 52];
const data = { key: sequentialKeys(numerators.length), numerators };

describe("canvas settings", () => {
  it.each([
    { label: "a settings error", overrides: { x_axis: { xlimit_tick_count: -1 } }, numerators },
    { label: "a data error", overrides: {}, numerators: [-1, -2, -3, -4, -5, -6, -7, -8, -9] }
  ] satisfies { label: string; overrides: SettingsOverrides; numerators: number[] }[])("hides $label from the canvas only when asked", ({ overrides, numerators }) => {
    const host = createVisualHost({});
    const failed = vi.spyOn(host.eventService, "renderingFailed");
    const args = { key: data.key, numerators };
    const shown = renderVisual(settingsWith({ ...overrides, spc: { chart_type: "c" } }), args, { host });
    expect(shown.element.querySelector(".errormessage")).not.toBeNull();
    const hidden = renderVisual(settingsWith({ ...overrides, spc: { chart_type: "c" }, canvas: { show_errors: false } }), args, { host });
    expect(failed).toHaveBeenCalledTimes(2);
    expect(hidden.element.querySelector(".errormessage")).toBeNull();
    expect(hidden.element.querySelector(".dotsgroup")?.children ?? []).toHaveLength(0);
  });
});
