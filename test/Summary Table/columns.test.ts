import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { describe, it, expect } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

const cKeys: string[] = ["2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01","2014-07-01","2014-08-01","2014-09-01","2014-10-01","2014-11-01","2014-12-01","2015-01-01","2015-02-01","2015-03-01","2015-04-01","2015-05-01","2015-06-01","2015-07-01","2015-08-01","2015-09-01","2015-10-01"];
const cNumerators: number[] = [17,12,27,20,20,18,22,19,19,24,17,16,24,19,19,22,25,19,17,6,25,17,11,14,9,11,7,13,5,5,3,5,9,4,5,9];

const uKeys: string[] = ["2015-01-01","2015-02-01","2015-03-01","2015-04-01","2015-05-01","2015-06-01","2015-07-01","2015-08-01","2015-09-01","2015-10-01","2015-11-01","2015-12-01","2016-01-01","2016-02-01","2016-03-01","2016-04-01","2016-05-01","2016-06-01","2016-07-01","2016-08-01","2016-09-01","2016-10-01","2016-11-01","2016-12-01"];
const uNumerators: number[] = [575,521,585,528,507,519,457,505,494,512,543,506,509,521,549,531,509,528,419,512,495,513,454,490];
const uDenominators: number[] = [310466.8333,282346.7917,309089.7083,287977.3333,297743.375,286988.25,261120.3333,268720.75,284437.875,290449.5,288104.4583,279961.375,289803.9583,275950.5833,290824.4583,285495.75,282515.2083,273927.875,253085.625,262410.7083,275529.25,282405.0833,259530.7917,256235.4583];

const pKeys: string[] = ["2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01","2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01","2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01","2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01"];
const pNumerators: number[] = [14,12,15,8,16,11,12,14,16,17,5,11,13,10,14,5,12,10,11,5,10,8,11,12,11,18,18,21,14,15,18,22,17,16,20,15];
const pDenominators: number[] = [52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78];

const gKeys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67"];
const gNumerators: number[] = [23,39,15,34,1,49,98,29,27,13,45,7,10,27,24,14,20,38,44,11,10,3,113,183,3,47,18,18,33,15,2,38,27,27,1,52,23,7,26,82,5,49,5,17,24,44,26,2,27,46,55,97,22,22,20,4,60,51,7,21,66,36,25,72,15,5,3];

const xbarKeys: string[] = ["2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01","2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01","2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01","2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01"];
const xbarNumerators: number[] = [66.88,68.76,67.75,67.05,67.2,67.43,69.23,71.12,67.63,69.97,66.67,67.76,69.32,66.04,67.61,69.69,67.62,67.31,68.41,64.73,68.28,69.34,66.53,66.67,67.27,67.69,67.6,67.29,68.47,66.82,68.87,66.75,67.41,69.87,68.19,66.04];
const xbarDenominators: number[] = [52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78];
const xbarSds: number[] = [8.69,8.86,10.16,10.45,10.12,8.94,9.51,9.53,11.22,8.5,9.04,10.82,8.8,9.65,10.41,10.08,9.7,9.35,8.5,9.59,9.72,8.89,9.99,10.74,9.68,9.63,9.74,10.35,8.65,9.88,7.9,8.95,9.45,9.81,8.58,11.19];

describe("Summary Table - column presence, order and content driven by settings", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("C Chart, default settings: grouped table shows the standard default column set in order", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "c";
    const indicator: string[] = cKeys.map((_, i) => i < 18 ? "Ward 1" : "Ward 2");
    visual.update({
      dataViews: [ buildDataView({ key: cKeys, indicator: indicator, numerators: cNumerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames).toEqual([
      "Indicator", "latest_date", "value", "numerator", "denominator",
      "target", "ucl99", "ucl95", "lcl95", "lcl99"
    ]);

    const headerLabels: (string | null)[] = Array.from(tableDivElement.querySelectorAll('.table-header th text')).map(d => d.textContent);
    expect(headerLabels).toEqual(visual.viewModel.tableColumns[0].map(c => c.label));

    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    rows.forEach(row => expect(row.querySelectorAll('td').length).toBe(colNames.length));

    const ward1Row = rows.find(r => r.querySelector('td')!.textContent === "Ward 1")!;
    const ward2Row = rows.find(r => r.querySelector('td')!.textContent === "Ward 2")!;
    expect(ward1Row.querySelectorAll('td')[1].textContent).toBe(cKeys[17]);
    expect(ward2Row.querySelectorAll('td')[1].textContent).toBe(cKeys[35]);
  });

  it("U Chart: disabling numerator/denominator tooltips removes those columns", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "u";
    settings.spc.multiplier = 10000;
    settings.spc.ttip_show_numerator = false;
    settings.spc.ttip_show_denominator = false;
    const indicator: string[] = uKeys.map((_, i) => i < 12 ? "Region North" : "Region South");
    visual.update({
      dataViews: [ buildDataView({ key: uKeys, indicator: indicator, numerators: uNumerators, denominators: uDenominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames).not.toContain("numerator");
    expect(colNames).not.toContain("denominator");
    expect(colNames).toContain("value");

    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    rows.forEach(row => expect(row.querySelectorAll('td').length).toBe(colNames.length));
  });

  it("P Chart: numerator/denominator columns render integer-formatted values, and percentage labelling is applied to the value column", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "p";
    const indicator: string[] = pKeys.map((_, i) => i < 18 ? "Site A" : "Site B");
    visual.update({
      dataViews: [ buildDataView({ key: pKeys, indicator: indicator, numerators: pNumerators, denominators: pDenominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const numIdx: number = colNames.indexOf("numerator");
    const denIdx: number = colNames.indexOf("denominator");
    const valIdx: number = colNames.indexOf("value");
    expect(numIdx).toBeGreaterThanOrEqual(0);
    expect(denIdx).toBeGreaterThanOrEqual(0);

    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    const siteARow = rows.find(r => r.querySelector('td')!.textContent === "Site A")!;
    const siteBRow = rows.find(r => r.querySelector('td')!.textContent === "Site B")!;

    // Numerator/denominator formatting for p-charts uses 0 decimal places (integer_num_den = true)
    expect(siteARow.querySelectorAll('td')[numIdx].textContent).toBe(pNumerators[17].toFixed(0));
    expect(siteARow.querySelectorAll('td')[denIdx].textContent).toBe(pDenominators[17].toFixed(0));
    expect(siteBRow.querySelectorAll('td')[numIdx].textContent).toBe(pNumerators[35].toFixed(0));
    expect(siteBRow.querySelectorAll('td')[denIdx].textContent).toBe(pDenominators[35].toFixed(0));

    // Default p-chart percentage labelling appends a '%' suffix to the value column
    expect(siteARow.querySelectorAll('td')[valIdx].textContent).toMatch(/%$/);
    expect(siteBRow.querySelectorAll('td')[valIdx].textContent).toMatch(/%$/);

    const expectedSiteAValue: string = (pNumerators[17] / pDenominators[17] * 100).toFixed(2) + "%";
    expect(siteARow.querySelectorAll('td')[valIdx].textContent).toBe(expectedSiteAValue);
  });

  it("G Chart: enabling variation and assurance icons adds icon columns rendered as SVGs, and extra tooltip measures add a further column", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "g";
    settings.nhs_icons.show_variation_icons = true;
    settings.outliers.astronomical = true;
    settings.nhs_icons.show_assurance_icons = true;
    settings.lines.show_alt_target = true;
    settings.lines.alt_target = 10;
    const indicator: string[] = gKeys.map((_, i) => i < 33 ? "Team Alpha" : "Team Beta");
    const tooltips: string[] = gKeys.map((_, i) => i < 33 ? "Alpha note" : "Beta note");
    visual.update({
      dataViews: [ buildDataView({ key: gKeys, indicator: indicator, numerators: gNumerators, tooltips: tooltips }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames).toContain("variation");
    expect(colNames).toContain("assurance");
    expect(colNames).toContain("Extra Tooltip");

    const varIdx: number = colNames.indexOf("variation");
    const assIdx: number = colNames.indexOf("assurance");
    const ttipIdx: number = colNames.indexOf("Extra Tooltip");

    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    rows.forEach(row => {
      const cells: Element[] = Array.from(row.querySelectorAll('td'));
      expect(cells[varIdx].querySelector('svg.rowsvg')).toBeTruthy();
      expect(cells[assIdx].querySelector('svg.rowsvg')).toBeTruthy();
    });

    const alphaRow = rows.find(r => r.querySelector('td')!.textContent === "Team Alpha")!;
    const betaRow = rows.find(r => r.querySelector('td')!.textContent === "Team Beta")!;
    expect(alphaRow.querySelectorAll('td')[ttipIdx].textContent).toBe("Alpha note");
    expect(betaRow.querySelectorAll('td')[ttipIdx].textContent).toBe("Beta note");
  });

  it("Xbar Chart, single indicator with show_table=true: outlier-flag columns follow the outliers settings", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "xbar";
    settings.summary_table.show_table = true;
    settings.outliers.shift = true;
    settings.outliers.trend = true;
    visual.update({
      dataViews: [ buildDataView({ key: xbarKeys, numerators: xbarNumerators, denominators: xbarDenominators, xbar_sds: xbarSds }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames).toContain("shift");
    expect(colNames).toContain("trend");
    expect(colNames).not.toContain("astpoint");
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(xbarKeys.length);
  });

  it("Two grouping columns (indicator + indicator2) both appear as separate table columns", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    const keys: string[] = ["1","2","3","4","5","6","7","8"];
    const numerators: number[] = [10, 11, 9, 12, 20, 21, 19, 22];
    const indicator: string[] = ["A", "A", "A", "A", "B", "B", "B", "B"];
    const indicator2: string[] = ["X", "X", "Y", "Y", "X", "X", "Y", "Y"];
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, indicator2: indicator2, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.indicatorVarNames).toEqual(["Indicator", "Indicator 2"]);
    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames.slice(0, 2)).toEqual(["Indicator", "Indicator 2"]);
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(4);
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
