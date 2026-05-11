/**
 * Checks the flag direction based on the outlier status and flag settings.
 *
 * @param outlierStatus - The outlier status.
 * @param flagSettings - The flag settings object containing process_flag_type
 *                         and improvement_direction.
 * @returns The flag direction based on the outlier status and flag settings.
 */
export default function checkFlagDirection(outlierStatus: string, flagSettings: {process_flag_type: string, improvement_direction: string}): string {
  if (outlierStatus === "none") {
    return outlierStatus;
  }

  const increaseDirectionMap = {
    "upper" : "improvement",
    "lower" : "deterioration"
  } as const;

  const decreaseDirectionMap = {
    "lower" : "improvement",
    "upper" : "deterioration"
  } as const;

  const neutralDirectionMap = {
    "lower" : "neutral_low",
    "upper" : "neutral_high"
  } as const;

  const flagDirectionMap = {
    "increase" : increaseDirectionMap[outlierStatus as keyof typeof increaseDirectionMap],
    "decrease" : decreaseDirectionMap[outlierStatus as keyof typeof decreaseDirectionMap],
    "neutral"  : neutralDirectionMap[outlierStatus as keyof typeof neutralDirectionMap]
  } as const;

  const mappedFlag: string = flagDirectionMap[flagSettings.improvement_direction as keyof typeof flagDirectionMap];

  if (flagSettings.process_flag_type !== "both") {
    return mappedFlag === flagSettings.process_flag_type ? mappedFlag : "none";
  } else {
    return mappedFlag;
  }
}
