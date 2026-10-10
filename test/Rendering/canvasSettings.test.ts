import { describe, expect, it, vi } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import { sequentialKeys } from "../helpers/buildDataView";
import { must, renderVisual, settingsWith, type SettingsOverrides } from "../helpers/renderVisual";

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

  it("insets the plot by each padding and reserves room for the axis titles", () => {
    const padding = { left_padding: 80, right_padding: 70, upper_padding: 60, lower_padding: 90 };
    const plain = renderVisual(settingsWith({ canvas: padding }), data).visual.plotProperties;
    expect(plain.xScale.range()).toEqual([80, 430]);
    expect(plain.yScale.range()).toEqual([410, 60]);

    const titled = renderVisual(settingsWith({
      canvas: padding,
      x_axis: { xlimit_label: "X", xlimit_label_size: 12 },
      y_axis: { ylimit_label: "Y", ylimit_label_size: 14 }
    }), data);
    const frame = titled.visual.plotProperties;
    expect(frame.xScale.range()).toEqual([80 + 14, 430]);
    expect(frame.yScale.range()).toEqual([410 - 12, 60]);
    const dots = titled.element.querySelectorAll(".dotsgroup path");
    for (let i = 0; i < dots.length; i++) {
      const match = must(must(dots[i].getAttribute("transform")).match(/translate\(([^,]+), ([^)]+)\)/));
      expect(Number(match[1])).toBeGreaterThanOrEqual(94);
      expect(Number(match[1])).toBeLessThanOrEqual(430);
      expect(Number(match[2])).toBeGreaterThanOrEqual(60);
      expect(Number(match[2])).toBeLessThanOrEqual(398);
    }
  });

  // Tick labels drawn past the canvas edge push the plot inwards on the next draw
  it("grows a small padding to fit overflowing tick labels", () => {
    const frame = renderVisual(settingsWith({ canvas: { left_padding: 0, lower_padding: 0 } }), data).visual.plotProperties;
    expect(frame.xAxis.start_padding).toBeGreaterThan(0);
    expect(frame.yAxis.start_padding).toBeGreaterThan(0);
    expect(frame.xAxis.end_padding).toBe(10);
    expect(frame.yAxis.end_padding).toBe(10);
  });
});
