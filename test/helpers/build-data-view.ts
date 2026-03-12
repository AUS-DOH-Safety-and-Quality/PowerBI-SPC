import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;
import isNullOrUndefined from "../../src/Functions/isNullOrUndefined";
import { defaultSettingsType } from "../../src/settings";

function buildColumn(displayName: string, queryName: string, values: any[], settings?: defaultSettingsType): powerbi.DataViewCategoryColumn | powerbi.DataViewValueColumn {
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
  return {
    source: {
      displayName: displayName,
      queryName: queryName,
      type: type,
      roles: roles,
    },
    values: values,
    objects: [settings as powerbi.DataViewObjects]
  };
}

export default function buildDataView(args: { key?: string[], indicator?: string[], numerators?: any[], denominators?: any[], xbar_sds?: any[], groupings?: any[] },
                                      settings?: defaultSettingsType): DataView {
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
