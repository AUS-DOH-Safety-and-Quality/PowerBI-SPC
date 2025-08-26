import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;
import { isNullOrUndefined } from "../../src/Functions";

function buildColumn(displayName: string, queryName: string, values: any[]) {
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
    values: values
  };
}

export default function buildDataView(args: { key?: string[], indicator?: string[], numerators?: any[] }): DataView {
  const metadata_columns: powerbi.DataViewMetadataColumn[] = [];
  const categories: powerbi.DataViewCategoryColumn[] = [];
  const values: powerbi.DataViewValueColumns = Object.assign([], { grouped: () => [] });

  if (!isNullOrUndefined(args?.key)) {
    const keyColumn = buildColumn("Category", "key", args.key as any[]);
    categories.push(keyColumn);
    metadata_columns.push(keyColumn.source);
  }
  if (!isNullOrUndefined(args?.indicator)) {
    const indicatorColumn = buildColumn("Indicator", "indicator", args.indicator as any[]);
    categories.push(indicatorColumn);
    metadata_columns.push(indicatorColumn.source);
  }

  if (!isNullOrUndefined(args?.numerators)) {
    const valueColumn = buildColumn("Measure", "numerators", args.numerators as any[]);
    values.push(valueColumn);
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
