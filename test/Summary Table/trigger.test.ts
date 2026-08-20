import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import rep from "../../src/Functions/rep";
import { describe, it, expect } from "vitest";

// S Chart dataset (36 points) - used for the "chart only" case
const sKeys: string[] = ["2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01","2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01","2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01","2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01"];
const sSds: number[] = [8.69,8.86,10.16,10.45,10.12,8.94,9.51,9.53,11.22,8.5,9.04,10.82,8.8,9.65,10.41,10.08,9.7,9.35,8.5,9.59,9.72,8.89,9.99,10.74,9.68,9.63,9.74,10.35,8.65,9.88,7.9,8.95,9.45,9.81,8.58,11.19];
const sDenominators: number[] = [52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78];

// T Chart dataset (67 points) - used for the single-indicator forced table case
const tKeys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67"];
const tNumerators: number[] = [16,20,5,13,1,26,46,12,12,5,19,4,3,15,14,9,8,15,21,6,3,1,56,117,1,33,9,9,19,12,1,16,13,18,1,35,16,5,21,38,3,25,3,11,13,20,9,3,8,21,24,38,8,13,9,1,30,23,3,7,22,19,11,31,6,1,1];

// U Chart dataset (24 points) - split into two indicator groups for the auto-grouping case
const uKeys: string[] = ["2015-01-01","2015-02-01","2015-03-01","2015-04-01","2015-05-01","2015-06-01","2015-07-01","2015-08-01","2015-09-01","2015-10-01","2015-11-01","2015-12-01","2016-01-01","2016-02-01","2016-03-01","2016-04-01","2016-05-01","2016-06-01","2016-07-01","2016-08-01","2016-09-01","2016-10-01","2016-11-01","2016-12-01"];
const uNumerators: number[] = [575,521,585,528,507,519,457,505,494,512,543,506,509,521,549,531,509,528,419,512,495,513,454,490];
const uDenominators: number[] = [310466.8333,282346.7917,309089.7083,287977.3333,297743.375,286988.25,261120.3333,268720.75,284437.875,290449.5,288104.4583,279961.375,289803.9583,275950.5833,290824.4583,285495.75,282515.2083,273927.875,253085.625,262410.7083,275529.25,282405.0833,259530.7917,256235.4583];

// P-Prime Chart dataset (20 points) - used for the "indicator present but constant" case
const ppKeys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
const ppNumerators: number[] = [266501,264225,276532,281461,269071,261215,270409,279778,270483,270320,267923,271478,255353,256820,261835,259144,255910,260863,264465,260989];
const ppDenominators: number[] = [280443,276823,291681,296155,282343,275888,283867,295251,284468,282529,279618,283932,266629,268091,276803,271578,266005,273520,278574,273772];

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

describe("Summary Table - what triggers grouped/forced table rendering", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const svgElement: Element = visualClassElement.querySelector('svg') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("Single indicator, show_table off: renders the chart, not the table", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "s";
    visual.update({
      dataViews: [ buildDataView({ key: sKeys, numerators: sSds, denominators: sDenominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.showGrouped).toBe(false);
    expect(svgElement.getAttribute('width')).toBe('500');
    expect(svgElement.getAttribute('height')).toBe('500');
    expect(tableDivElement.getAttribute('style')).toContain('width: 0%');
    expect(tableDivElement.getAttribute('style')).toContain('height: 0%');
  });

  it("Single indicator with show_table=true forces a per-point summary table", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "t";
    settings.spc.outliers_in_limits = false;
    settings.summary_table.show_table = true;
    visual.update({
      dataViews: [ buildDataView({ key: tKeys, numerators: tNumerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.showGrouped).toBe(false);
    expect(svgElement.getAttribute('width')).toBe('0');
    expect(tableDivElement.getAttribute('style')).toContain('width: 100%');
    expect(tableDivElement.getAttribute('style')).toContain('height: 100%');
    expect(visual.viewModel.tableColumns[0][0]).toEqual({ name: "date", label: "Date" });
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(tKeys.length);
  });

  it("More than one indicator group automatically forces a grouped table, even with show_table=false", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "u";
    settings.spc.multiplier = 10000;
    settings.summary_table.show_table = false;
    const indicator: string[] = rep("Region North", 12).concat(rep("Region South", 12));
    visual.update({
      dataViews: [ buildDataView({ key: uKeys, indicator: indicator, numerators: uNumerators, denominators: uDenominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.showGrouped).toBe(true);
    expect(svgElement.getAttribute('width')).toBe('0');
    expect(tableDivElement.getAttribute('style')).toContain('width: 100%');

    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);
    const indicatorCellValues: (string | null)[] = rows.map(tr => tr.querySelector('td')!.textContent);
    expect(indicatorCellValues.sort()).toEqual(["Region North", "Region South"]);
  });

  it("Indicator column present but constant across all rows does not trigger grouping", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "pp";
    const indicator: string[] = rep("Only One Site", ppKeys.length);
    visual.update({
      dataViews: [ buildDataView({ key: ppKeys, indicator: indicator, numerators: ppNumerators, denominators: ppDenominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.showGrouped).toBe(false);
    expect(svgElement.getAttribute('width')).toBe('500');
    expect(tableDivElement.getAttribute('style')).toContain('width: 0%');
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
