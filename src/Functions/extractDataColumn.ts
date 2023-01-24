import powerbi from "powerbi-visuals-api"
import DataViewValueColumn = powerbi.DataViewValueColumn;
import DataViewValueColumns = powerbi.DataViewValueColumns;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import settingsObject from "../Classes/settingsObject";
import dateFormat from "../Classes/dateFormat";
import dateToFormattedString from "./dateToFormattedString";
import { settingsInData } from "../Classes/settingsGroups"

type TargetT = number[] | string[] | number | string;

function extractDataColumn<T extends TargetT>(inputView: DataViewCategorical,
                                              name: string,
                                              inputSettings?: settingsObject): T {
  let columnRaw: DataViewValueColumn;
  if (name === "key") {
    columnRaw = (inputView.categories as DataViewCategoryColumn[]).filter(viewColumn => {
      return viewColumn.source.roles ? viewColumn.source.roles[name] : false;
    })[0];
    if (columnRaw.source.type.dateTime) {
      let date_format: dateFormat = JSON.parse(inputSettings.x_axis.xlimit_date_format.value);
      return dateToFormattedString(<Date[]>columnRaw.values, date_format) as Extract<T, string[]>;
    } else {
      return <string[]>columnRaw.values as Extract<T, string[]>;
    }
  } else {
    columnRaw = (inputView.values as DataViewValueColumns).filter(viewColumn => {
      return viewColumn.source.roles ? viewColumn.source.roles[name] : false;
    })[0];
    if (Object.keys(settingsInData).includes(name)) {
      return (columnRaw ? columnRaw.values[0] : inputSettings[settingsInData[name]][name].value) as T
    } else {
      return (columnRaw ? columnRaw.values : null) as T;
    }
  }
}

export default extractDataColumn;
