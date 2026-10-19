import type { settingsValueType } from "../../src/settings";

/** One qic() call and its limits, as written by qicharts2.R; null expectations are lines qicharts2 does not report */
export type Qicharts2Case = {
  name: string;
  chart_type: settingsValueType["spc"]["chart_type"];
  multiplier: number;
  outliers_in_limits: boolean;
  num_points_subset: number | null;
  subset_points_from: settingsValueType["spc"]["subset_points_from"];
  split_indexes: number[];
  keys: (string | null)[];
  numerators: (number | null)[];
  denominators: (number | null)[] | null;
  xbar_sds: number[] | null;
  expected: Record<"values" | "target" | "ll99" | "ll95" | "ll68" | "ul68" | "ul95" | "ul99", (number | null)[]>;
};
