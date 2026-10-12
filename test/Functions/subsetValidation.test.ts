import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass from "../../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import buildDataView, { sequentialKeys } from "../helpers/buildDataView";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48, 60, 66, 74, 84];

function update(spc: Partial<settingsValueType["spc"]>) {
  const settings: settingsValueType = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, chart_type: "i", ...spc }
  };
  const dataView = buildDataView({
    key: sequentialKeys(numerators.length),
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

// A fractional subset count is rejected by settings validation with a message,
// the same way as any other invalid setting value, instead of reaching an invalid array length.
describe("subset count validation", () => {
  it.each([2.5, 0])("rejects a subset count of %s with a validation message", count => {
    expect(update({ num_points_subset: count }).result).toEqual({
      status: false,
      type: "settings",
      error: `${count} is not a valid value for num_points_subset. Valid values are whole numbers, at least 1`
    });
  });

  it("accepts whole subset counts and unset counts", () => {
    const all = update({});
    const whole = update({ num_points_subset: 3, subset_points_from: "Start" });
    expect(all.result.status).toBe(true);
    expect(whole.result.status).toBe(true);
    expect(whole.viewModel.controlLimits[0].target[0]).not.toEqual(all.viewModel.controlLimits[0].target[0]);
  });
});
