import type { viewModelClass } from "../Classes";

export default function assuranceIconToDraw(viewModel: viewModelClass): string {
  const imp_direction: string = viewModel.inputSettings.settings.outliers.improvement_direction;
  const N: number = viewModel.controlLimits.ll99.length - 1;
  const alt_target: number = viewModel.controlLimits?.alt_targets?.[N];

  if (alt_target === null || imp_direction === "neutral") {
    return "none";
  }

  const impDirectionIncrease: boolean = imp_direction === "increase";

  if (alt_target > viewModel.controlLimits.ul99[N]) {
    return impDirectionIncrease ? "consistentFail" : "consistentPass";
  } else if (alt_target < viewModel.controlLimits.ll99[N]) {
    return impDirectionIncrease ? "consistentPass" : "consistentFail";
  } else {
    return "inconsistent";
  }
}
