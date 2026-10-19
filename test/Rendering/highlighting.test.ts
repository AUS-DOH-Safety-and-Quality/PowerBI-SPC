import type powerbi from "powerbi-visuals-api";
import { describe, expect, it } from "vitest";
import { cells, keyedHost, must } from "powerbi-visuals-core/testing";
import { renderVisual, settingsWith } from "../helpers/renderVisual";
import { sequentialKeys, type DataViewArgs } from "../helpers/buildDataView";
import { tableRow } from "../helpers/summaryTable";

const numerators = [10, 12, 16, 22, 30, 34, 40, 48];

/** Power BI sends the highlighted rows' values and null for the rest when another visual filters the data */
function highlighting(highlights: (number | null)[] | undefined): (dataView: powerbi.DataView) => void {
  return dataView => {
    if (highlights !== undefined) {
      must(must(dataView.categorical).values)[0].highlights = cells(highlights);
    }
  };
}

function dotOpacities(element: HTMLElement): { fill: string; stroke: string }[] {
  const dots = element.querySelectorAll<SVGPathElement>(".dotsgroup path");
  const opacities = new Array<{ fill: string; stroke: string }>(dots.length);
  for (let i = 0; i < dots.length; i++) {
    opacities[i] = { fill: dots[i].style.fillOpacity, stroke: dots[i].style.strokeOpacity };
  }
  return opacities;
}

function lineOpacities(element: HTMLElement): string[] {
  const groups = element.querySelectorAll<SVGGElement>(".linesgroup > g");
  const opacities = new Array<string>(groups.length);
  for (let i = 0; i < groups.length; i++) {
    opacities[i] = groups[i].style.strokeOpacity;
  }
  return opacities;
}

describe("highlighting from another visual", () => {
  const settings = settingsWith({
    spc: { chart_type: "i" },
    scatter: { opacity: 0.9, opacity_selected: 0.7, opacity_unselected: 0.15 },
    lines: {
      opacity_main: 0.8, opacity_unselected_main: 0.25, opacity_target: 0.8, opacity_unselected_target: 0.25,
      opacity_99: 0.8, opacity_unselected_99: 0.25, opacity_95: 0.8, opacity_unselected_95: 0.25
    }
  });

  it("fades the dots and lines not highlighted by the host, and restores them when the highlight clears", () => {
    const highlights: (number | null)[] = [null, 12, null, null, 30, null, null, null];
    let current: (number | null)[] | undefined = highlights;
    const rendered = renderVisual(settings, { key: sequentialKeys(numerators.length), numerators }, {
      prepare: dataView => highlighting(current)(dataView)
    });
    const faded = dotOpacities(rendered.element);
    expect(faded).toHaveLength(numerators.length);
    for (let i = 0; i < faded.length; i++) {
      const expected = highlights[i] === null ? "0.15" : "0.7";
      expect(faded[i], `dot ${i}`).toEqual({ fill: expected, stroke: expected });
    }
    const lines = lineOpacities(rendered.element);
    expect(lines.length).toBeGreaterThan(0);
    for (let i = 0; i < lines.length; i++) {
      expect(lines[i]).toBe("0.25");
    }

    current = undefined;
    rendered.update(settings);
    const restored = dotOpacities(rendered.element);
    for (let i = 0; i < restored.length; i++) {
      expect(restored[i]).toEqual({ fill: "0.9", stroke: "0.9" });
    }
    const restoredLines = lineOpacities(rendered.element);
    for (let i = 0; i < restoredLines.length; i++) {
      expect(restoredLines[i]).toBe("0.8");
    }
  });

  it("treats a highlighted value of zero as highlighted", () => {
    const rendered = renderVisual(settings, { key: sequentialKeys(3), numerators: [0, 5, 0] }, {
      prepare: highlighting([0, null, null])
    });
    expect(dotOpacities(rendered.element)).toEqual([
      { fill: "0.7", stroke: "0.7" }, { fill: "0.15", stroke: "0.15" }, { fill: "0.15", stroke: "0.15" }
    ]);
  });
});

describe("summary table row opacity", () => {
  const settings = settingsWith({
    spc: { chart_type: "i" },
    summary_table: { table_opacity: 0.95, table_opacity_selected: 0.6, table_opacity_unselected: 0.1 }
  });
  const grouped: DataViewArgs = {
    key: [...sequentialKeys(4), ...sequentialKeys(4)],
    numerators: [5, 6, 5, 7, 8, 9, 8, 10],
    indicator: ["A", "A", "A", "A", "B", "B", "B", "B"]
  };

  function rowOpacity(element: HTMLElement, indicator: string): string {
    const row = tableRow(must(element.querySelector("table")), indicator);
    if (!(row instanceof HTMLTableRowElement)) {
      throw new Error(`Row ${indicator} is not a table row`);
    }
    return row.style.opacity;
  }

  it("uses the selected opacity for a group the host highlights and the unselected opacity for the others", () => {
    const rendered = renderVisual(settings, grouped, { host: keyedHost(), prepare: highlighting([null, null, null, null, 8, null, null, null]) });
    expect(rowOpacity(rendered.element, "A")).toBe("0.1");
    expect(rowOpacity(rendered.element, "B")).toBe("0.6");
  });

  it("uses the default opacity until a row is selected, then the selected opacity for that group", async () => {
    const rendered = renderVisual(settings, grouped, { host: keyedHost() });
    expect(rowOpacity(rendered.element, "A")).toBe("0.95");
    expect(rowOpacity(rendered.element, "B")).toBe("0.95");

    const rows = rendered.visual.viewModel.groupedRows;
    await rendered.visual.selectionManager.select(rows[1].identity[2]);
    rendered.visual.updateHighlighting();
    expect(rowOpacity(rendered.element, "A")).toBe("0.1");
    expect(rowOpacity(rendered.element, "B")).toBe("0.6");

    await rendered.visual.selectionManager.clear();
    rendered.visual.updateHighlighting();
    expect(rowOpacity(rendered.element, "A")).toBe("0.95");
    expect(rowOpacity(rendered.element, "B")).toBe("0.95");
  });
});
