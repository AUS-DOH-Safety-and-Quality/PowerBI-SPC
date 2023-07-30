import { broadcastBinary } from "../Functions"

const checkFlagDirection = broadcastBinary(
  (outlierStatus: string, flagSettings: {process_flag_type: string, improvement_direction: string}): string => {
    if (outlierStatus === "none") {
      return outlierStatus;
    }

    const increaseDirectionMap: Record<string, string> = {
      "upper" : "improvement",
      "lower" : "deterioration"
    }
    const decreaseDirectionMap: Record<string, string> = {
      "lower" : "improvement",
      "upper" : "deterioration"
    }
    const neutralDirectionMap: Record<string, string> = {
      "lower" : "neutral_low",
      "upper" : "neutral_high"
    }
    const flagDirectionMap: Record<string, string> = {
      "increase" : increaseDirectionMap[outlierStatus],
      "decrease" : decreaseDirectionMap[outlierStatus],
      "neutral"  : neutralDirectionMap[outlierStatus]
    }

    const mappedFlag: string = flagDirectionMap[flagSettings.improvement_direction];

    if (flagSettings.process_flag_type !== "both") {
      return mappedFlag === flagSettings.process_flag_type ? mappedFlag : "none";
    } else {
      return mappedFlag;
    }
  }
);

export default checkFlagDirection;
