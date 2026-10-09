import type { settingsValueType } from "../../src/settings";

/** One qic() call and its limits, as written by qicharts2.R */
export type Qicharts2Case = {
  name: string;
  chart_type: settingsValueType["spc"]["chart_type"];
  multiplier: number;
  outliers_in_limits: boolean;
  num_points_subset: number | null;
  split_indexes: number[];
  keys: string[];
  numerators: number[];
  denominators: number[] | null;
  xbar_sds: number[] | null;
  expected: Record<"values" | "targets" | "ll99" | "ll95" | "ul95" | "ul99", (number | null)[]>;
};
