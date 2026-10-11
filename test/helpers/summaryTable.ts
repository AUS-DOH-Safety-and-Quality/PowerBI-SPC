import type { plotDataGrouped } from "../../src/Classes/viewModelClass";
import type { Visual } from "../../src/visual";

export function columnNames(visual: Visual): string[] {
  const columns = visual.viewModel.tableColumns[0];
  const names = new Array<string>(columns.length);
  for (let i = 0; i < columns.length; i++) {
    names[i] = columns[i].name;
  }
  return names;
}

export function columnValues(rows: plotDataGrouped[], column: string): string[] {
  const values = new Array<string>(rows.length);
  for (let i = 0; i < rows.length; i++) {
    values[i] = rows[i].table_row[column];
  }
  return values;
}

export function groupedRow(rows: plotDataGrouped[], indicator: string): plotDataGrouped {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].table_row["Indicator"] === indicator) {
      return rows[i];
    }
  }
  throw new Error(`Missing grouped row ${indicator}`);
}

/** Rendered body row whose first cell is the indicator name */
export function tableRow(table: Element, indicator: string): Element {
  const rows = table.querySelectorAll("tbody tr");
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].querySelector("td")!.textContent === indicator) {
      return rows[i];
    }
  }
  throw new Error(`Missing table row ${indicator}`);
}
