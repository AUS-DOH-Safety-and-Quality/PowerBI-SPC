import type powerbi from "powerbi-visuals-api";
import { describe, expect, it, vi } from "vitest";
import { createVisualHost, testDom } from "powerbi-visuals-utils-testutils";
import settingsClass from "../../src/Classes/settingsClass";
import settingsModel from "../../src/settings";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { updateType } from "powerbi-visuals-core/powerbi";
import { must } from "powerbi-visuals-core/testing";

function input() {
  return buildDataView({ key: ["A", "B", "C", "D", "E"], numerators: [1, 2, 3, 4, 5] });
}
function category(view: powerbi.DataView): powerbi.DataViewCategoryColumn {
  return must(must(view.categorical).categories)[0];
}

describe("selected settings integration", () => {
  it("rejects flagging against specification limits that are not shown", () => {
    const column = category(input());
    column.objects = [{ outliers: { astronomical: true, astronomical_limit: "Specification" } }, {}, {}, {}, {}];
    const settings = new settingsClass();
    settings.update(column, [[0, 1, 2, 3, 4]]);
    expect(settings.validationStatus).toMatchObject({ status: 1, error: "Flagging against specification limits requires the specification lines to be shown" });
    column.objects[0].lines = { show_specification: true };
    settings.update(column, [[0, 1, 2, 3, 4]]);
    expect(settings.validationStatus.status).toBe(0);
  });

  it("keeps interleaved group formatting and warning labels attached to their raw rows", () => {
    const element = testDom("500", "500");
    const host = createVisualHost({});
    const failed = vi.spyOn(host.eventService, "renderingFailed");
    const finished = vi.spyOn(host.eventService, "renderingFinished");
    const visual = new Visual({ element, host });
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const settings = createDefaultValues(settingsModel);
      settings.spc.chart_type = i % 2 === 0 ? "i" : "p";
      settings.spc.sig_figs = i % 2 === 0 ? 0 : 4;
      settings.scatter.size = i + 1;
      rows.push(settings);
    }
    rows[3].y_axis.ylimit_sig_figs = -1;
    const view = buildDataView({
      key: ["A0", "B0", "A1", "B1", "A2", "B2"],
      indicator: ["A", "B", "A", "B", "A", "B"],
      numerators: [1, 2, 2, 3, 3, 4], denominators: [10, 10, 10, 10, 10, 10]
    }, rows);
    try {
      visual.update({ dataViews: [view], viewport: { width: 500, height: 500 }, type: updateType.data });
      expect(failed).not.toHaveBeenCalled();
      expect(finished).toHaveBeenCalledOnce();
      expect(visual.viewModel.inputSettings.settings[0].spc.chart_type).toBe("i");
      expect(visual.viewModel.inputSettings.settings[1].spc.chart_type).toBe("p");
      expect(visual.viewModel.inputSettings.settings[1].spc.sig_figs).toBe(4);
      const first = visual.viewModel.inputData[0];
      const second = visual.viewModel.inputData[1];
      expect(first.scatter_formatting[0].size).toBe(1);
      expect(first.scatter_formatting[1].size).toBe(3);
      expect(second.scatter_formatting[0].size).toBe(2);
      expect(second.scatter_formatting[1].size).toBe(4);
      expect(first.warningMessage).toBe("");
      expect(second.warningMessage).toContain("Conditional formatting for Category B1 ignored due to: -1 is not a valid value for ylimit_sig_figs");
      expect(second.warningMessage).not.toContain("Category A1");
      expect(visual.viewModel.inputSettings.validationStatus.messages).toHaveLength(6);
    } finally {
      failed.mockRestore();
      finished.mockRestore();
      element.remove();
    }
  });
});
