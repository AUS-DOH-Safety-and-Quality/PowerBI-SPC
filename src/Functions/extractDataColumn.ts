import powerbi from "powerbi-visuals-api"
import DataViewValueColumn = powerbi.DataViewValueColumn;
import DataViewValueColumns = powerbi.DataViewValueColumns;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import settingsObject from "../Classes/settingsObject";
import dateFormat from "../Classes/dateFormat";
import stringToDMY from "./stringToDMY";
import { settingsInData } from "../Classes/settingsGroups"

function extractDataColumn<T extends number[] | string[] | number | string>(inputView: DataViewCategorical, name: string, inputSettings?: settingsObject): T {
  let columnRaw: DataViewValueColumn;
  if (name !== "key") {
    columnRaw = (inputView.values as DataViewValueColumns).filter(viewColumn => {
      return viewColumn.source.roles ? viewColumn.source.roles[name] : false;
    })[0];
    if (Object.keys(settingsInData).includes(name)) {
      let settingsGroup: string = settingsInData[name];
      return (columnRaw ? columnRaw.values[0] : inputSettings[settingsGroup][name].value) as T
    } else {
      return (columnRaw ? columnRaw.values : null) as T;
    }
  } else {
    columnRaw = (inputView.categories as DataViewCategoryColumn[]).filter(viewColumn => {
      return viewColumn.source.roles ? viewColumn.source.roles[name] : false;
    })[0];
    let date_format: dateFormat = JSON.parse(inputSettings.x_axis.xlimit_date_format.value);
    let vals: string[] = <string[]>columnRaw.values;
    return (columnRaw.source.type.dateTime ? stringToDMY(vals, date_format) : vals) as Extract<T, string[]>;
  }
}

export default extractDataColumn;
