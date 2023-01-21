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
  let flagDirectionMap: { [key: string] : string } = {
    "both" : process_flag_type,
    "improvement" : improveFlagDirectionMap[improvement_direction],
    "deterioration" : deteriorateFlagDirectionMap[improvement_direction]
  }

  return flagDirectionMap[process_flag_type];
}

const checkFlagDirection = broadcast_binary(checkFlagDirection_impl);

export { determineFlagDirection }
export default checkFlagDirection;
