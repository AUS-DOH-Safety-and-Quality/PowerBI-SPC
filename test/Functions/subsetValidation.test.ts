import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass from "../../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import buildDataView from "../helpers/buildDataView";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 60, 66, 74, 84];

function update(spc: Partial<settingsValueType["spc"]>) {
  const settings: settingsValueType = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, chart_type: "i", ...spc }
  };
  const dataView = buildDataView({
    key: numerators.map((_, i) => String(i + 1)),
    numerators
  }, settings);
  const viewModel = new viewModelClass();
  const result = viewModel.update({
    dataViews: [dataView],
    viewport: { width: 500, height: 500 },
    type: 2
  }, createVisualHost({}));
  return { viewModel, result };
}

// Core finding 16: a fractional subset count is rejected by settings validation with a message,
// the same way as any other invalid setting value, instead of reaching an invalid array length.
describe("subset count validation", () => {
  it("rejects a fractional subset count with a validation message", () => {
    const fractional = update({ num_points_subset: 2.5 });
    expect(fractional.result.status).toBe(false);
    expect(fractional.result.type).toBe("settings");
    expect(fractional.result.error).toBe("2.5 is not a valid value for num_points_subset. Valid values are whole numbers");
  });

  it("accepts whole subset counts and unset counts", () => {
    const all = update({});
    const whole = update({ num_points_subset: 3, subset_points_from: "Start" });
    expect(all.result.status).toBe(true);
    expect(whole.result.status).toBe(true);
    expect(whole.viewModel.controlLimits[0].targets[0]).not.toEqual(all.viewModel.controlLimits[0].targets[0]);
  });
});
