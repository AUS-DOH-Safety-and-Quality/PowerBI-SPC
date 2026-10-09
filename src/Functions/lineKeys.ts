import { limitLineKeys } from "powerbi-visuals-core/settings";

/** Line names to their `createLineGroup` keys */
const lineKeys = {
  ...limitLineKeys,
  targets: "target",
  values: "main",
  alt_targets: "alt_target",
  speclimits_lower: "specification",
  speclimits_upper: "specification",
  trend_line: "trend"
} as const;

export type LineName = keyof typeof lineKeys;

export default lineKeys;
