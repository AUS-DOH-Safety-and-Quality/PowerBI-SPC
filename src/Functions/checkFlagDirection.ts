import broadcast_binary from "./BinaryFunctions"

function checkFlagDirection_impl(outlierStatus: string, flagSettings: {process_flag_type: string, improvement_direction: string}): string {
  if (outlierStatus === "none") {
    return outlierStatus;
  }

  let increaseDirectionMap: Record<string, string> = {
    "upper" : "improvement",
    "lower" : "deterioration"
  }
  let decreaseDirectionMap: Record<string, string> = {
    "lower" : "improvement",
    "upper" : "deterioration"
  }
  let flagDirectionMap: Record<string, string> = {
    "increase" : increaseDirectionMap[outlierStatus],
    "decrease" : decreaseDirectionMap[outlierStatus]
  }

  let mappedFlag: string = flagDirectionMap[flagSettings.improvement_direction];

  if (flagSettings.process_flag_type !== "both") {
    return mappedFlag === flagSettings.process_flag_type ? mappedFlag : "none";
  } else {
    return mappedFlag;
  }
}

const checkFlagDirection = broadcast_binary(checkFlagDirection_impl);

export default checkFlagDirection;
