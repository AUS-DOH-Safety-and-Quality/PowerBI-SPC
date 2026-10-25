import { at } from "powerbi-visuals-core/util";
/** qicharts2 convention: mean subgroup SD for a constant subgroup size (Montgomery 6.29), pooled otherwise (6.31). */
export default function withinGroupSd(group_sd: readonly number[], count_per_group: readonly number[], subset_points: readonly number[]): number {
  let varying: boolean = false;
  for (let i = 1; i < count_per_group.length; i++) {
    if (count_per_group[i] !== count_per_group[0]) {
      varying = true;
      break;
    }
  }

  const n_sub: number = subset_points.length;
  let sd_sum: number = 0;
  let weight_sum: number = 0;
  for (let i = 0; i < n_sub; i++) {
    const point = at(subset_points, i);
    const curr_sd: number = at(group_sd, point);
    if (varying) {
      const Nm1: number = at(count_per_group, point) - 1;
      sd_sum += Nm1 * curr_sd * curr_sd;
      weight_sum += Nm1;
    } else {
      sd_sum += curr_sd;
      weight_sum += 1;
    }
  }
  return varying ? Math.sqrt(sd_sum / weight_sum) : sd_sum / weight_sum;
}
