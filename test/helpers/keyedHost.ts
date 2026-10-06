import type powerbi from "powerbi-visuals-api";
import { createVisualHost, createSelectionId } from "powerbi-visuals-utils-testutils";

type IVisualHost = powerbi.extensibility.visual.IVisualHost;
type ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;

// The stock test host keys every identity "", so selection matching by key needs distinct keys per row
export default function keyedHost(): IVisualHost {
  const host = createVisualHost({});
  host.createSelectionIdBuilder = (): ISelectionIdBuilder => {
    let key = "";
    const builder: ISelectionIdBuilder = {
      withCategory(categoryColumn, index) { key += `${categoryColumn.source.displayName}[${index}];`; return builder; },
      withSeries() { return builder; },
      withMeasure(measureId) { key += `measure(${measureId});`; return builder; },
      withMatrixNode() { return builder; },
      withTable(_table, rowIndex) { key += `row[${rowIndex}];`; return builder; },
      createSelectionId: () => createSelectionId(key)
    };
    return builder;
  };
  return host;
}
