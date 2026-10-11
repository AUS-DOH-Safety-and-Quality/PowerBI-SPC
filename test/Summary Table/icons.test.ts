import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { columnNames } from "../helpers/summaryTable";
import { rep } from "powerbi-visuals-core/math";
import { describe, it, expect } from "vitest";

// The first group flags an improvement (50) and a deterioration (-30) before its last point
const mixedValues: number[] = [10, 10, 11, 10, 9, 10, 50, 10, 11, 10, 9, 10, -30, 10, 10];
const stableValues: number[] = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 9];

function iconName(svg: Element): string | null {
  return svg.querySelector(".icongroup > g")!.getAttribute("class");
}

function contentHeight(cell: Element): number {
  const style = getComputedStyle(cell);
  return cell.getBoundingClientRect().height
    - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
    - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth);
}

describe("Summary Table - NHS icons", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const tableDivElement: Element = document.body.querySelector('.visual')!.querySelector('div') as Element;

  function render(groups: number, showIcons: boolean, variationScaling: number = 1): NodeListOf<Element> {
    const settings = JSON.parse(JSON.stringify(defaultSettings));
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.nhs_icons.flag_last_point = false;
    settings.nhs_icons.show_variation_icons = showIcons;
    settings.nhs_icons.show_assurance_icons = showIcons;
    settings.nhs_icons.variation_icons_scaling = variationScaling;
    settings.lines.show_alt_target = true;
    settings.lines.alt_target = 100;
    let keys: string[] = [];
    let indicator: string[] = [];
    let numerators: number[] = [];
    for (let g = 0; g < groups; g++) {
      const values = g === 0 ? mixedValues : stableValues;
      // Labels without break opportunities, so extra columns cannot wrap them onto a second line
      for (let i = 0; i < values.length; i++) {
        keys.push(`${g}_${i}`);
      }
      // The second group's label wraps, so rows differ in height
      const label: string = g === 0 ? "Mixed" : (g === 1 ? "Improving with a label long enough to wrap" : `Improving${g}`);
      indicator = indicator.concat(rep(label, values.length));
      numerators = numerators.concat(values);
    }
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    return tableDivElement.querySelectorAll('tbody tr');
  }

  it("draws every detected variation icon alongside the assurance icon", () => {
    const rows = render(2, true);
    const varIdx: number = columnNames(visual).indexOf("variation");
    const assIdx: number = columnNames(visual).indexOf("assurance");
    const expected: string[][] = [["improvementHigh", "concernLow"], ["commonCause"]];
    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('td');
      const variation = cells[varIdx].querySelectorAll('svg.rowsvg');
      const names: (string | null)[] = [];
      for (let i = 0; i < variation.length; i++) {
        names.push(iconName(variation[i]));
      }
      expect(names).toEqual(expected[r]);
      expect(visual.viewModel.groupedRows[r].variation_icons).toEqual(expected[r]);
      const assurance = cells[assIdx].querySelectorAll('svg.rowsvg');
      expect(assurance).toHaveLength(1);
      expect(iconName(assurance[0])).toBe("consistentFail");
    }
  });

  it.each([2, 40])("draws one icon size, filling the shortest row, on one line per row with %i groups", groups => {
    const rows = render(groups, true);
    expect(tableDivElement.scrollWidth).toBeLessThanOrEqual(tableDivElement.clientWidth);
    const size: number = rows[0].querySelector('svg.rowsvg')!.getBoundingClientRect().height;
    let shortest: number = Number.POSITIVE_INFINITY;
    let tallest: number = 0;
    for (let r = 0; r < rows.length; r++) {
      const icons = rows[r].querySelectorAll('svg.rowsvg');
      const top: number = icons[0].getBoundingClientRect().top;
      for (let i = 0; i < icons.length; i++) {
        const rect = icons[i].getBoundingClientRect();
        expect(rect.width).toBe(size);
        expect(rect.height).toBe(size);
        expect(rect.top).toBe(top);
      }
      const available: number = contentHeight(icons[0].parentElement!);
      shortest = Math.min(shortest, available);
      tallest = Math.max(tallest, available);
    }
    expect(tallest).toBeGreaterThan(shortest);
    expect(size).toBeCloseTo(shortest, 5);
  });

  it("keeps rows at their text height and scales icons by their setting", () => {
    const unscaled = render(40, true);
    const varIdx: number = columnNames(visual).indexOf("variation");
    const assIdx: number = columnNames(visual).indexOf("assurance");
    const unscaledVariation: number = unscaled[0].querySelectorAll('td')[varIdx].querySelector('svg')!.getBoundingClientRect().height;
    const unscaledAssurance: number = unscaled[0].querySelectorAll('td')[assIdx].querySelector('svg')!.getBoundingClientRect().height;
    const heights: number[] = [];
    for (let r = 0; r < unscaled.length; r++) {
      heights.push(unscaled[r].getBoundingClientRect().height);
    }
    const svgs = tableDivElement.querySelectorAll('svg.rowsvg');
    for (let i = 0; i < svgs.length; i++) {
      svgs[i].remove();
    }
    for (let r = 0; r < unscaled.length; r++) {
      expect(unscaled[r].getBoundingClientRect().height).toBe(heights[r]);
    }

    const scaled = render(40, true, 2);
    const variation = scaled[0].querySelectorAll('td')[varIdx].querySelectorAll('svg');
    for (let i = 0; i < variation.length; i++) {
      expect(variation[i].getBoundingClientRect().height).toBe(2 * unscaledVariation);
    }
    expect(scaled[0].querySelectorAll('td')[assIdx].querySelector('svg')!.getBoundingClientRect().height).toBe(unscaledAssurance);
  });

  it("lets text wrap again in cells that previously held icons", () => {
    render(2, true);
    const rows = render(2, false);
    const dateIdx: number = columnNames(visual).indexOf("latest_date");
    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('td');
      for (let c = 0; c < cells.length; c++) {
        expect(getComputedStyle(cells[c]).whiteSpace).toBe(c === dateIdx ? "nowrap" : "normal");
      }
    }
  });
});
