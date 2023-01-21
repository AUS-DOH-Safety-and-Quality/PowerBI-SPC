import broadcast_binary from "./BinaryFunctions"

function checkFlagDirection_impl(outlierStatus: string, flag_direction: string): string {
  if (flag_direction !== "both") {
    return outlierStatus === flag_direction ? outlierStatus : "none";
  } else {
    return outlierStatus;
  }
}

const checkFlagDirection = broadcast_binary(checkFlagDirection_impl);

export default checkFlagDirection;
