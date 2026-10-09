import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass, { type plotData } from "../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView from "./helpers/buildDataView";

describe("specification limit tooltips", () => {
  it("labels the limits with the configured upper and lower prefixes", () => {
    const settings: settingsValueType = {
      ...defaultSettings,
      lines: {
        ...defaultSettings.lines, show_specification: true, specification_lower: 0, specification_upper: 100,
        ttip_label_specification_prefix_upper: "Max ", ttip_label_specification_prefix_lower: "Min "
      }
    };
    const dataView = buildDataView({ key: ["1", "2", "3", "4"], numerators: [10, 12, 16, 22] }, settings);
    const viewModel = new viewModelClass();
    const result = viewModel.update({ dataViews: [dataView], viewport: { width: 500, height: 500 }, type: 2 }, createVisualHost({}));
    expect(result.status).toBe(true);
    const tooltip = (viewModel.plotPoints[0] as plotData[])[0].tooltip;
    expect(tooltip).toContainEqual(expect.objectContaining({ displayName: "Max specification Limit" }));
    expect(tooltip).toContainEqual(expect.objectContaining({ displayName: "Min specification Limit" }));
  });
});
