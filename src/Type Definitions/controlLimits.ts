import plotKey from "./plotKey"

type controlLimits = {
  keys: plotKey[];
  values: number[];
  targets: number[];
  ll99: number[];
  ll95: number[];
  ul95: number[];
  ul99: number[];
  count?: number[];
}

export default controlLimits
