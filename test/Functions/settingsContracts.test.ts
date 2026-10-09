import type powerbi from "powerbi-visuals-api";
import { describe, expect, it, vi } from "vitest";
import { createVisualHost, testDom } from "powerbi-visuals-utils-testutils";
import settingsClass from "../../src/Classes/settingsClass";
import settingsModel, { defaultSettings } from "../../src/settings";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";

function input() {
  return buildDataView({ key: ["A", "B", "C", "D", "E"], numerators: [1, 2, 3, 4, 5] });
}
function category(view: powerbi.DataView): powerbi.DataViewCategoryColumn {
  return view.categorical!.categories![0];
}

describe("selected settings integration", () => {
  it("uses Core's typed indicator groups without merging numeric and text values", () => {
    const element = testDom("500", "500");
    const host = createVisualHost({});
    const visual = new Visual({ element, host });
    const view = buildDataView({ key: ["A", "B", "C", "D"], numerators: [1, 10, 3, 14] });
    view.categorical!.categories!.push({ source: { displayName: "Indicator", roles: { indicator: true } },
      values: [1, "1", 1, "1"] });
    try {
      visual.update({ dataViews: [view], viewport: { width: 500, height: 500 }, type: 2 });
      expect(visual.viewModel.inputData).toHaveLength(2);
      expect(visual.viewModel.inputData[0].limitInputArgs.numerators).toEqual([1, 3]);
      expect(visual.viewModel.inputData[1].limitInputArgs.numerators).toEqual([10, 14]);
    } finally {
      element.remove();
    }
  });

  it("uses each group's first requested row and only selected warnings", () => {
    const view = input();
    view.categorical!.categories![0].objects = [
      { spc: { sig_figs: 0 } }, { spc: { sig_figs: 4 } },
      { spc: { sig_figs: -1 } }, {}, { spc: { sig_figs: 2 }, y_axis: { ylimit_sig_figs: -1 } }
    ];
    const settings = new settingsClass();
    settings.update(category(view), [[4, 2], [1]]);
    expect(settings.settings[0].spc.sig_figs).toBe(2);
    expect(settings.settings[1].spc.sig_figs).toBe(4);
    expect(settings.settings[0].y_axis.ylimit_sig_figs).toBeUndefined();
    expect(settings.validationStatus.messages).toHaveLength(3);
    expect(settings.validationStatus.messages[0][0]).toContain("ylimit_sig_figs");
    expect(settings.validationStatus.messages[1][0]).toContain("sig_figs");
    expect(settings.validationStatus.messages[2]).toEqual([]);
    expect(settings.validationStatus.status).toBe(0);
  });

  it("detects all selected rows invalid despite valid unselected rows, then resets", () => {
    const view = input();
    view.categorical!.categories![0].objects = [
      {}, {}, { spc: { sig_figs: -1 } }, { spc: { sig_figs: Infinity } }, {}
    ];
    const settings = new settingsClass();
    settings.update(category(view), [[3], [2]]);
    expect(settings.validationStatus.status).toBe(1);
    expect(settings.validationStatus.error).toContain("Infinity");
    expect(settings.validationStatus.messages).toHaveLength(2);
    settings.update(category(input()), [[4], [1]]);
    expect(settings.validationStatus).toEqual({ status: 0, messages: [[], []] });
    expect(settings.settings[0].spc.sig_figs).toBe(defaultSettings.spc.sig_figs);
  });

  it("keeps empty groups independent", () => {
    const settings = new settingsClass();
    settings.update(category(input()), [[], [4]]);
    settings.settings[0].canvas.lower_padding = 25;
    expect(settings.settings[1].canvas.lower_padding).toBe(10);
    expect(settings.validationStatus.messages).toEqual([[]]);
    expect(settings.getFormattingModel().cards).toHaveLength(12);
  });

  it("rejects flagging against specification limits that are not shown", () => {
    const view = input();
    view.categorical!.categories![0].objects = [{ outliers: { astronomical: true, astronomical_limit: "Specification" } }, {}, {}, {}, {}];
    const settings = new settingsClass();
    settings.update(category(view), [[0, 1, 2, 3, 4]]);
    expect(settings.validationStatus).toMatchObject({ status: 1, error: "Flagging against specification limits requires the specification lines to be shown" });
    view.categorical!.categories![0].objects[0].lines = { show_specification: true };
    settings.update(category(view), [[0, 1, 2, 3, 4]]);
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
      visual.update({ dataViews: [view], viewport: { width: 500, height: 500 }, type: 2 });
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

it("preserves blank limit tooltip prefixes through settings reading and rendering", () => {
  const element = testDom("500", "500");
  const host = createVisualHost({});
  const failed = vi.spyOn(host.eventService, "renderingFailed");
  const finished = vi.spyOn(host.eventService, "renderingFinished");
  const visual = new Visual({ element, host });
  const settings = createDefaultValues(settingsModel);
  settings.lines.show_95 = true;
  settings.lines.ttip_show_95 = true;
  settings.lines.ttip_label_95_prefix_lower = "";
  settings.lines.ttip_label_95_prefix_upper = "";
  const view = buildDataView({ key: ["A", "B", "C"], numerators: [1, 2, 3] }, settings);
  try {
    visual.update({ dataViews: [view], viewport: { width: 500, height: 500 }, type: 2 });
    expect(failed).not.toHaveBeenCalled();
    expect(finished).toHaveBeenCalledOnce();
    expect(visual.viewModel.inputSettings.settings[0].lines.ttip_label_95_prefix_lower).toBe("");
    const tooltip = visual.viewModel.plotPoints[0].tooltip;
    let matchingLimits = 0;
    for (let i = 0; i < tooltip.length; i++) {
      if (tooltip[i].displayName === "95% Limit") matchingLimits++;
      expect(tooltip[i].displayName).not.toBe("Lower 95% Limit");
      expect(tooltip[i].displayName).not.toBe("Upper 95% Limit");
    }
    expect(matchingLimits).toBe(2);
    expect(visual.viewModel.inputSettings.validationStatus).toEqual({ status: 0, messages: [[], [], []] });
  } finally {
    failed.mockRestore();
    finished.mockRestore();
    element.remove();
  }
});
