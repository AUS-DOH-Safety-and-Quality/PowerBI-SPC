import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;
import isNullOrUndefined from "../../src/Functions/isNullOrUndefined";
import { type settingsValueType } from "../../src/settings";

function buildColumn(displayName: string, queryName: string, values: any[],
                      settings?: settingsValueType | (settingsValueType | undefined)[]): powerbi.DataViewCategoryColumn | powerbi.DataViewValueColumn {
  const roles = Object.fromEntries([[queryName, true]]);
  var type;
  switch(typeof values[0]) {
    case "string":
      type = ValueType.fromDescriptor({ text: true });
      break;
    case "number":
      type = ValueType.fromDescriptor({ numeric: true });
      break;
    default:
      type = ValueType.fromDescriptor({ text: true });
  }
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
    values: values,
    objects: objects as powerbi.DataViewObjects[]
  };
}

export default function buildDataView(args: {
                                        key?: string[], indicator?: string[], indicator2?: string[],
                                        // Additional named grouping columns, e.g. [{ name: "Cohort", values: [...] }]
                                        indicators?: { name: string, values: string[] }[],
                                        numerators?: any[], denominators?: any[], xbar_sds?: any[],
                                        groupings?: any[], tooltips?: any[], labels?: any[]
                                      },
                                      settings?: settingsValueType | (settingsValueType | undefined)[]): DataView {
  const metadata_columns: powerbi.DataViewMetadataColumn[] = [];
  const categories: powerbi.DataViewCategoryColumn[] = [];
  const values: powerbi.DataViewValueColumns = Object.assign([], { grouped: () => [] });

  if (!isNullOrUndefined(args?.key)) {
    const keyColumn = buildColumn("Category", "key", args.key as any[], settings);
    categories.push(keyColumn as powerbi.DataViewCategoryColumn);
    metadata_columns.push(keyColumn.source);
  }
  if (!isNullOrUndefined(args?.indicator)) {
    const indicatorColumn = buildColumn("Indicator", "indicator", args.indicator as any[]);
    categories.push(indicatorColumn as powerbi.DataViewCategoryColumn);
    metadata_columns.push(indicatorColumn.source);
  }
  if (!isNullOrUndefined(args?.indicator2)) {
    const indicatorColumn2 = buildColumn("Indicator 2", "indicator", args.indicator2 as any[]);
    categories.push(indicatorColumn2 as powerbi.DataViewCategoryColumn);
    metadata_columns.push(indicatorColumn2.source);
  }
  if (!isNullOrUndefined(args?.indicators)) {
    args.indicators!.forEach(ind => {
      const indicatorColumn = buildColumn(ind.name, "indicator", ind.values as any[]);
      categories.push(indicatorColumn as powerbi.DataViewCategoryColumn);
      metadata_columns.push(indicatorColumn.source);
    });
  }

  if (!isNullOrUndefined(args?.numerators)) {
    const valueColumn = buildColumn("Measure", "numerators", args.numerators as any[]);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.denominators)) {
    const valueColumn = buildColumn("Measure", "denominators", args.denominators as any[]);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.xbar_sds)) {
    const valueColumn = buildColumn("Measure", "xbar_sds", args.xbar_sds as any[]);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.groupings)) {
    const valueColumn = buildColumn("Measure", "groupings", args.groupings as any[]);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.tooltips)) {
    const valueColumn = buildColumn("Extra Tooltip", "tooltips", args.tooltips as any[]);
    values.push(valueColumn as powerbi.DataViewValueColumn);
    metadata_columns.push(valueColumn.source);
  }

  if (!isNullOrUndefined(args?.labels)) {
    const valueColumn = buildColumn("Labels", "labels", args.labels as any[]);
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
