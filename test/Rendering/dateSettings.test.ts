import { describe, expect, it } from "vitest";
import type { settingsValueType } from "../../src/settings";
import type { Visual } from "../../src/visual";
import { columnNames } from "../helpers/summaryTable";
import { must, renderVisual, settingsWith } from "../helpers/renderVisual";

const dates = [new Date(2024, 0, 15), new Date(2024, 1, 3), new Date(2024, 2, 9), new Date(2024, 3, 22), new Date(2024, 4, 6)];
const numerators = [10, 12, 9, 14, 11];

/** A visual keyed by a single date column */
function renderDates(settings: settingsValueType): Visual {
  return renderVisual(settings, { key: dates, numerators }, {
    prepare: dataView => {
      must(dataView.categorical?.categories)[0].source.type = { dateTime: true, temporal: { paddedDateTableDate: true } };
    }
  }).visual;
}

function labels(visual: Visual): string[] {
  const ticks = visual.viewModel.tickLabels;
  const result = new Array<string>(ticks.length);
  for (let i = 0; i < ticks.length; i++) {
    result[i] = ticks[i].label;
  }
  return result;
}

describe("date settings", () => {
  it.each([
    { label: "defaults", dates: {}, expected: ["15/01/2024", "03/02/2024"] },
    { label: "US locale", dates: { date_format_locale: "en-US" }, expected: ["01/15/2024", "02/03/2024"] },
    { label: "short names", dates: { date_format_day: "Thurs DD", date_format_month: "Mon", date_format_year: "YY", date_format_delim: "-" },
      expected: ["Mon 15-Jan-24", "Sat 03-Feb-24"] },
    { label: "long US names", dates: { date_format_day: "Thursday DD", date_format_month: "Month", date_format_delim: " ", date_format_locale: "en-US" },
      expected: ["Monday January 15 2024", "Saturday February 03 2024"] },
    { label: "a blank day", dates: { date_format_day: "(blank)", date_format_month: "Month", date_format_delim: " " },
      expected: ["January 2024", "February 2024"] },
    { label: "a blank month and year", dates: { date_format_month: "(blank)", date_format_year: "(blank)" }, expected: ["15", "03"] }
  ] as const)("formats date keys with $label", ({ dates, expected }) => {
    const visual = renderDates(settingsWith({ dates }));
    expect(labels(visual).slice(0, 2)).toEqual(expected);
  });

  it("shows the formatted dates on the x axis, in the tooltip and in the table", () => {
    const formats = { date_format_day: "Thurs DD", date_format_month: "Mon", date_format_delim: " " } as const;
    const chart = renderDates(settingsWith({ dates: formats }));
    const expected = ["Mon 15 Jan 2024", "Sat 03 Feb 2024", "Sat 09 Mar 2024", "Mon 22 Apr 2024", "Mon 06 May 2024"];
    expect(labels(chart)).toEqual(expected);
    // Ticks between observations are left unlabelled
    const ticks = chart.svg.node()?.querySelectorAll(".xaxisgroup .tick text") ?? [];
    let labelled = 0;
    for (let i = 0; i < ticks.length; i++) {
      if (ticks[i].textContent !== "") {
        expect(expected).toContain(ticks[i].textContent);
        labelled++;
      }
    }
    expect(labelled).toBeGreaterThan(1);
    expect(chart.viewModel.plotPoints[1].tooltip[0]).toEqual({ displayName: "Date", value: "Sat 03 Feb 2024" });

    const table = renderDates(settingsWith({ dates: formats, summary_table: { show_table: true } }));
    const dateIdx = columnNames(table).indexOf("date");
    const rows = table.tableDiv.node()?.querySelectorAll("tbody tr") ?? [];
    expect(rows).toHaveLength(dates.length);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].querySelectorAll("td")[dateIdx].textContent).toBe(expected[i]);
    }
  });

  it.each(["g", "t"] as const)("numbers the events of a %s chart instead of formatting dates", chart_type => {
    const visual = renderDates(settingsWith({ spc: { chart_type }, dates: { date_format_locale: "en-US" } }));
    expect(labels(visual)).toEqual(["0", "1", "2", "3", "4"]);
    expect(visual.viewModel.plotPoints[1].tooltip[0]).toEqual({ displayName: "Event", value: "1" });
  });
});
