import type powerbi from "powerbi-visuals-api";
import type { PrimitiveValue } from "powerbi-visuals-core/powerbi";
import { buildDataView as build, type DataViewColumnInput } from "powerbi-visuals-core/testing";
import type { settingsValueType } from "../../src/settings";

export { sequentialKeys } from "powerbi-visuals-core/testing";

export type DataViewArgs = {
  key?: PrimitiveValue[];
  indicator?: string[];
  indicator2?: string[];
  indicators?: { name: string; values: string[] }[];
  numerators?: PrimitiveValue[];
  denominators?: PrimitiveValue[];
  xbar_sds?: PrimitiveValue[];
  groupings?: PrimitiveValue[];
  tooltips?: PrimitiveValue[];
  namedTooltips?: { name: string; values: PrimitiveValue[] }[];
  labels?: PrimitiveValue[];
};

const measures = ["numerators", "denominators", "xbar_sds", "groupings"] as const;

/** The report's columns by role, named as the SPC tests expect them */
export default function buildDataView(args: DataViewArgs, settings?: settingsValueType | (settingsValueType | undefined)[]): powerbi.DataView {
  const categories: DataViewColumnInput[] = [];
  const values: DataViewColumnInput[] = [];
  if (args.key !== undefined) {
    categories.push({ role: "key", values: args.key, displayName: "Category" });
  }
  if (args.indicator !== undefined) {
    categories.push({ role: "indicator", values: args.indicator, displayName: "Indicator" });
  }
  if (args.indicator2 !== undefined) {
    categories.push({ role: "indicator", values: args.indicator2, displayName: "Indicator 2" });
  }
  if (args.indicators !== undefined) {
    for (let i = 0; i < args.indicators.length; i++) {
      categories.push({ role: "indicator", values: args.indicators[i].values, displayName: args.indicators[i].name });
    }
  }
  for (let m = 0; m < measures.length; m++) {
    const measure = args[measures[m]];
    if (measure !== undefined) {
      values.push({ role: measures[m], values: measure, displayName: "Measure" });
    }
  }
  if (args.tooltips !== undefined) {
    values.push({ role: "tooltips", values: args.tooltips, displayName: "Extra Tooltip" });
  }
  if (args.namedTooltips !== undefined) {
    for (let i = 0; i < args.namedTooltips.length; i++) {
      values.push({ role: "tooltips", values: args.namedTooltips[i].values, displayName: args.namedTooltips[i].name });
    }
  }
  if (args.labels !== undefined) {
    values.push({ role: "labels", values: args.labels, displayName: "Labels" });
  }
  return build({ categories, values }, settings);
}
