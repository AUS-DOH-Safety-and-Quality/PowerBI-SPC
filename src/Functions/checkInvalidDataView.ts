import powerbi from "powerbi-visuals-api";

export default function checkInvalidDataView(inputDV: powerbi.DataView[]): boolean {
  const flag1: boolean = !inputDV
    || !inputDV[0]
    || !inputDV[0].categorical
    || !inputDV[0].categorical.categories
    || !inputDV[0].categorical.values
    || !inputDV[0].metadata;

  if (flag1) {
    return flag1;
  }

  const inputView: powerbi.DataViewCategorical = inputDV[0].categorical as powerbi.DataViewCategorical;
  const inputCategories: powerbi.DataViewCategoryColumn[] = inputView.categories as powerbi.DataViewCategoryColumn[];
  const inputValues: powerbi.DataViewValueColumns = inputView.values as powerbi.DataViewValueColumns;

  if (!inputCategories[0].source) {
    return true;
  }

  if (!(inputValues[0].source.roles as Record<string, boolean>).numerators) {
    return true;
  }

  return inputValues.some(d => d.values.length < 1) || inputCategories.some(d => d.values.length < 1);
}
