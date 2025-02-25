export * as d3 from "./D3 Plotting Functions/D3 Modules";

export { default as defaultSettings } from './defaultSettings';
export {
  textOptions,
  lineOptions,
  iconOptions,
  colourOptions,
  borderOptions,
  labelOptions
} from './validSettingValues';
export * from './Classes';
export * from './Functions';
export * from './D3 Plotting Functions';
export * from './Limit Calculations'
export * from './Outlier Flagging'
export { Visual } from './visual';

// Headless use needs a dummy DOM implementation
export { parseHTML } from "linkedom"
