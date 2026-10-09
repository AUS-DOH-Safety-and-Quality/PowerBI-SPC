import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

import { isNullOrUndefined } from "powerbi-visuals-core/data";
import type { PrimitiveValue } from "powerbi-visuals-core/powerbi";
import { cells } from "powerbi-visuals-core/testing";
import { type settingsValueType } from "../../src/settings";

function buildColumn(displayName: string, queryName: string, values: PrimitiveValue[],
                      settings?: settingsValueType | (settingsValueType | undefined)[]): powerbi.DataViewCategoryColumn | powerbi.DataViewValueColumn {
  const roles = Object.fromEntries([[queryName, true]]);
  const type: powerbi.ValueTypeDescriptor = typeof values[0] === "number" ? { numeric: true } : { text: true };
  // A single settings object is repeated across every row; an array is passed through as-is (per-row settings)
  const objects: (settingsValueType | undefined)[] = Array.isArray(settings)
    ? settings
    : values.map(() => settings);
  return {
    source: {
      displayName: displayName,
      queryName: queryName,
      type: type,
      roles: roles,
    },
    values: cells(values),
    objects: objects as powerbi.DataViewObjects[]
  };
}

export default function buildDataView(args: {
                                        key?: PrimitiveValue[], indicator?: string[], indicator2?: string[],
                                        // Additional named grouping columns, e.g. [{ name: "Cohort", values: [...] }]
                                        indicators?: { name: string, values: string[] }[],
                                        numerators?: PrimitiveValue[], denominators?: PrimitiveValue[], xbar_sds?: PrimitiveValue[],
                                        groupings?: PrimitiveValue[], tooltips?: PrimitiveValue[], labels?: PrimitiveValue[]
                                      },
                                      settings?: settingsValueType | (settingsValueType | undefined)[]): DataView {
  const metadata_columns: powerbi.DataViewMetadataColumn[] = [];
  const categories: powerbi.DataViewCategoryColumn[] = [];
  const values: powerbi.DataViewValueColumns = Object.assign([], { grouped: () => [] });

  if (!isNullOrUndefined(args?.key)) {
    const keyColumn = buildColumn("Category", "key", args.key, settings);
    categories.push(keyColumn as powerbi.DataViewCategoryColumn);
    metadata_columns.push(keyColumn.source);
  }
  if (!isNullOrUndefined(args?.indicator)) {
    const indicatorColumn = buildColumn("Indicator", "indicator", args.indicator);
    categories.push(indicatorColumn as powerbi.DataViewCategoryColumn);
    metadata_columns.push(indicatorColumn.source);
  }
  if (!isNullOrUndefined(args?.indicator2)) {
    const indicatorColumn2 = buildColumn("Indicator 2", "indicator", args.indicator2);
    categories.push(indicatorColumn2 as powerbi.DataViewCategoryColumn);
    metadata_columns.push(indicatorColumn2.source);
  }
  if (!isNullOrUndefined(args?.indicators)) {
    args.indicators!.forEach(ind => {
      const indicatorColumn = buildColumn(ind.name, "indicator", ind.values);
      categories.push(indicatorColumn as powerbi.DataViewCategoryColumn);
      metadata_columns.push(indicatorColumn.source);
    });
  }

  if (!isNullOrUndefined(args?.numerators)) {
    const valueColumn = buildColumn("Measure", "numerators", args.numerators);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.denominators)) {
    const valueColumn = buildColumn("Measure", "denominators", args.denominators);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.xbar_sds)) {
    const valueColumn = buildColumn("Measure", "xbar_sds", args.xbar_sds);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.groupings)) {
    const valueColumn = buildColumn("Measure", "groupings", args.groupings);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.tooltips)) {
    const valueColumn = buildColumn("Extra Tooltip", "tooltips", args.tooltips);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.labels)) {
    const valueColumn = buildColumn("Labels", "labels", args.labels);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  return {
    categorical: {
      categories: categories,
      values: values,
    },
    metadata: {
      columns: metadata_columns
    }
  }
}
