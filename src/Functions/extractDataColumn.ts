import powerbi from "powerbi-visuals-api"
import DataViewValueColumn = powerbi.DataViewValueColumn;
import DataViewValueColumns = powerbi.DataViewValueColumns;
import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import settingsObject from "../Classes/settingsObject";
import dateToFormattedString from "./dateToFormattedString";
type TargetT = number[] | string[] | number | string;

function extractDataColumn<T extends TargetT>(inputView: DataViewCategorical,
                                              name: string,
                                              inputSettings?: settingsObject): T {
  let columnRaw: DataViewValueColumn;
  if (name === "key") {
    const columnRawTmp: DataViewValueColumn[] = (inputView.categories as DataViewCategoryColumn[]).filter(viewColumn => {
      return viewColumn.source.roles ? viewColumn.source.roles[name] : false;
    });

    // If a 'Date Hierarchy' type is passed then there will be multiple 'key" entries
    if (columnRawTmp.length > 1) {
      return columnRawTmp[columnRawTmp.length - 1].values.map((lastKeyValue: string, index) => {
        let concatKey: string = lastKeyValue;
        for (let i = (columnRawTmp.length - 2); i >= 0; i--) {
          concatKey += " " + columnRawTmp[i].values[index];
        }
        return concatKey;
      }) as Extract<T, string[]>;
    } else {
      columnRaw = columnRawTmp[0];
    }
    if (columnRaw.source.type.dateTime) {
      return dateToFormattedString(<Date[]>columnRaw.values, inputSettings.dates) as Extract<T, string[]>;
    } else {
      return <string[]>columnRaw.values as Extract<T, string[]>;
    }
  } else {
    columnRaw = (inputView.values as DataViewValueColumns).filter(viewColumn => {
      return viewColumn.source.roles ? viewColumn.source.roles[name] : false;
    })[0];

    return (columnRaw ? columnRaw.values : null) as T;
  }
}

export default extractDataColumn;
