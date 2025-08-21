import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

import { testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;

export class ChartDataBuilder extends TestDataViewBuilder {
  public static CategoryColumn: string = "category";
  public static MeasureColumn: string = "measure";
  public valuesCategory: string[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  public valuesMeasure: number[] = [
    742731.43, 162066.43, 283085.78, 300263.49, 376074.57, 814724.34, 570921.34,
  ];

  public getDataView(columnNames?: string[]): DataView {
    let dataView: any = this.createCategoricalDataViewBuilder(
      [
        {
          source: {
            displayName: "Category",
            queryName: ChartDataBuilder.CategoryColumn,
            type: ValueType.fromDescriptor({ text: true }),
            roles: {
              key: true,
            },
          },
          values: this.valuesCategory,
        },
      ],
      [
        {
          source: {
            displayName: "Measure",
            isMeasure: true,
            queryName: ChartDataBuilder.MeasureColumn,
            type: ValueType.fromDescriptor({ numeric: true }),
            roles: {
              numerators: true,
            },
          },
          values: this.valuesMeasure,
        },
      ],
      columnNames as string[]
    ).build();

    // there's client side computed maxValue
    let maxLocal = 0;
    this.valuesMeasure.forEach((item) => {
      if (item > maxLocal) {
        maxLocal = item;
      }
    });
    (<any>dataView).categorical.values[0].maxLocal = maxLocal;

    return dataView;
  }
}
