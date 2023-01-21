import broadcast_binary from "./BinaryFunctions"

function checkFlagDirection_impl(outlierStatus: string, flag_direction: string): string {
  if (flag_direction !== "both") {
    return outlierStatus === flag_direction ? outlierStatus : "none";
  } else {
    return outlierStatus;
  }
}

function determineFlagDirection(process_flag_type: string, improvement_direction: string): string {
  let improveFlagDirectionMap: { [key: string] : string } = {
    "increase" : "upper",
    "decrease" : "lower"
  }
  let deteriorateFlagDirectionMap: { [key: string] : string } = {
    "increase" : "lower",
    "decrease" : "upper"
  }

  if (process_flag_type === "both") {
    return process_flag_type;
  } else if (process_flag_type === "improvement") {
    return improveFlagDirectionMap[improvement_direction];
  } else if (process_flag_type === "deterioration") {
    return deteriorateFlagDirectionMap[improvement_direction];
  } else {
    return "";
  }
}

const checkFlagDirection = broadcast_binary(checkFlagDirection_impl);

export { determineFlagDirection }
export default checkFlagDirection;
