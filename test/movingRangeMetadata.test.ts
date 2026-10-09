import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass from "../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../src/settings";
import buildDataView, { sequentialKeys } from "./helpers/buildDataView";
import findBy from "./helpers/findBy";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];

// A moving-range point carries the metadata of the observation ending the range,
// so every per-row input joins through the returned key's position, not the shortened result index.
describe("moving-range per-row metadata", () => {
  it("joins formatting, targets, specification limits, labels and tooltips through the ending observation", () => {
    const rows = new Array<settingsValueType>(numerators.length);
    for (let i = 0; i < rows.length; i++) {
      rows[i] = {
        ...defaultSettings,
        spc: { ...defaultSettings.spc, chart_type: "mr" },
        scatter: { ...defaultSettings.scatter, colour: `#00000${i}` },
        lines: {
          ...defaultSettings.lines, show_alt_target: true, show_specification: true,
          alt_target: 100 + i, specification_lower: i, specification_upper: 200 + i, width_99: i + 1
        }
      };
    }
    const keys = new Array<string>(numerators.length);
    const labels = new Array<string>(numerators.length);
    const tooltips = new Array<string>(numerators.length);
    for (let i = 0; i < numerators.length; i++) {
      keys[i] = String(i + 1);
      labels[i] = `L${i}`;
      tooltips[i] = `T${i}`;
    }
    const dataView = buildDataView({ key: keys, numerators, labels, tooltips }, rows);
    dataView.metadata.objects = { split_indexes_storage: { split_indexes: "[3]" } };
    const viewModel = new viewModelClass();
    const result = viewModel.update({ dataViews: [dataView], viewport: { width: 500, height: 500 }, type: 2 }, createVisualHost({}));
    expect(result.status).toBe(true);

    const points = viewModel.plotPoints;
    const positions = new Array<number>(points.length);
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      positions[i] = point.x;
      expect(point.aesthetics.colour).toBe(`#00000${point.x}`);
      expect(point.table_row.alt_target).toBe(100 + point.x);
      expect(point.table_row.speclimits_lower).toBe(point.x);
      expect(point.table_row.speclimits_upper).toBe(200 + point.x);
      expect(point.label.text_value).toBe(`L${point.x}`);
      expect(point.tooltip).toContainEqual({ displayName: "Extra Tooltip", value: `T${point.x}` });
    }
    expect(positions).toEqual([1, 2, 3, 5, 6, 7]);
    expect(viewModel.controlLimits[0].alt_targets).toEqual([101, 102, 103, 105, 106, 107]);

    const lines = viewModel.groupedLines;
    expect(lines.length).toBeGreaterThan(0);
    for (let i = 0; i < lines.length; i++) {
      const data = lines[i][1];
      for (let j = 0; j < data.length; j++) {
        expect(data[j].aesthetics.width_99).toBe(data[j].x + 1);
      }
    }
  });

  // Outlier groups and rebaseline gaps follow the shortened result, not input positions.
  it("groups outlier rules and rebaseline gaps by the returned points of each segment", () => {
    const observations = [10, 14, 12, 15, 30, 31, 33, 36, 40];
    const settings: settingsValueType = {
      ...defaultSettings,
      spc: { ...defaultSettings.spc, chart_type: "mr" },
      outliers: { ...defaultSettings.outliers, trend: true, trend_n: 4 }
    };
    const dataView = buildDataView({ key: sequentialKeys(observations.length), numerators: observations }, settings);
    dataView.metadata.objects = { split_indexes_storage: { split_indexes: "[3]" } };
    const viewModel = new viewModelClass();
    viewModel.update({ dataViews: [dataView], viewport: { width: 500, height: 500 }, type: 2 }, createVisualHost({}));

    expect(viewModel.groupStartEndIndexes[0]).toEqual([[0, 3], [3, 7]]);
    // Second segment's moving ranges 1, 2, 3, 4 form a four-point trend only when grouped by result position
    const trend = viewModel.outliers[0].trend;
    expect(trend.slice(0, 3)).toEqual(["none", "none", "none"]);
    expect(trend.slice(3)).not.toEqual(["none", "none", "none", "none"]);
    const gaps: number[] = [];
    const values = findBy(viewModel.groupedLines, 0, "values");
    if (values === undefined) {
      throw new Error("Missing main line");
    }
    for (let i = 0; i < values[1].length; i++) {
      if (values[1][i].line_value === undefined) {
        gaps.push(values[1][i].x);
      }
    }
    expect(gaps).toEqual([5]);
  });
});
