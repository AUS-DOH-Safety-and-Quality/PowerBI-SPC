import {defaultSettingsType} from "./settingsClass"

export default class derivedSettingsClass {
  multiplier: number
  percentLabels: boolean

  update(inputSettings: defaultSettingsType) {
    const chartType: string = inputSettings.spc.chart_type;
    const pChartType: boolean = ["p", "pp"].includes(chartType);
    const percentSettingString: string = inputSettings.spc.perc_labels;
    let multiplier: number = inputSettings.spc.multiplier;
    let percentLabels: boolean;

    if (percentSettingString === "Yes") {
      multiplier = 100
    }

    if (pChartType) {
      multiplier = multiplier === 1 ? 100 : multiplier
    }

    if (percentSettingString === "Automatic") {
      percentLabels = pChartType && multiplier === 100;
    } else {
      percentLabels = percentSettingString === "Yes";
    }

    this.multiplier = multiplier
    this.percentLabels = percentLabels
  }
}
