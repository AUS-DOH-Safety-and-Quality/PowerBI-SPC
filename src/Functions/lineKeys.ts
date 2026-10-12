import { standardLineKeys } from "powerbi-visuals-core/settings";

/** Line names to their `createLineGroup` keys */
const lineKeys = {
  ...standardLineKeys,
  values: "main",
  speclimits_lower: "specification",
  speclimits_upper: "specification",
  trend_line: "trend"
} as const;

export type LineName = keyof typeof lineKeys;

export default lineKeys;
