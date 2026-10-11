import type powerbi from "powerbi-visuals-api";
import type { UpdateOptions, ValidatedDataView } from "powerbi-visuals-core/powerbi";
import type viewModelClass from "../src/Classes/viewModelClass";
import type { plotData, plotDataGrouped, LimitSeries, controlLimitsObject } from "../src/Classes/viewModelClass";
import type derivedSettingsClass from "../src/Classes/derivedSettingsClass";
import extractInputData from "../src/Functions/extractInputData";
import type { settingsValueType } from "../src/settings";
import type { NhsIconName } from "../src/D3 Plotting Functions/NHS Icons";
import type { LineName } from "../src/Functions/lineKeys";
import type { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";

declare const viewModel: viewModelClass;
declare const visual: Visual;
declare const settings: settingsValueType;
declare const derived: derivedSettingsClass;
declare const dataView: powerbi.DataView;
declare const validated: ValidatedDataView<"numerators">;
declare const limits: controlLimitsObject;

/** Plot points and grouped table rows are separate, typed series */
const point: plotData = viewModel.plotPoints[0];
const row: plotDataGrouped = viewModel.groupedRows[0];
// @ts-expect-error Grouped rows hold formatted text, never numbers.
const numeric: number = row.table_row.value;
const assurance: plotDataGrouped["table_row"]["assurance"] = "none";
// @ts-expect-error The icon columns only ever name a drawable icon.
const icon: NhsIconName = "improvement";

// Chart types, limit series and line names are closed unions
// @ts-expect-error Unknown chart types never reach the limit functions.
settings.spc.chart_type = "x";
// @ts-expect-error Keys are not a numeric series.
const series: LimitSeries = "keys";
// @ts-expect-error Every line name maps to a settings key.
const line: LineName = "ll50";

// Test flags ride on the host's update options without a cast
visual.update({
  dataViews: [buildDataView({ key: ["A"], numerators: [1] })],
  viewport: { width: 1, height: 1 },
  type: 2,
  headless: true
});
const options: UpdateOptions = { dataViews: [], viewport: { width: 1, height: 1 }, type: 2 };

// Fixture cells may be blank, but never objects
buildDataView({ key: ["A", null], numerators: [1, undefined] });
// @ts-expect-error Cells are Power BI primitives.
buildDataView({ key: [{}] });

// Extraction only accepts a view Core has validated, and reads its required roles without a check
extractInputData(validated, settings, derived, [], [0], new Map());
// @ts-expect-error Raw data views must pass validateDataView first.
extractInputData(dataView, settings, derived, [], [0], new Map());
const numerators: powerbi.DataViewValueColumn[] = validated.values.numerators;

/** Every limit series exists; only its cells may be blank */
const ll99: (number | undefined)[] = limits.ll99;
// @ts-expect-error Cells are blank where the chart or settings define no value.
const firstLimit: number = limits.ll99[0];
/** Row annotations are always row-aligned arrays; the any* flags say whether the role carried data */
const labels: (string | undefined)[] = viewModel.inputData[0].labels;
const anyLabels: boolean = viewModel.inputData[0].anyLabels;

void [point, numeric, assurance, icon, series, line, options, numerators, ll99, firstLimit, labels, anyLabels];
