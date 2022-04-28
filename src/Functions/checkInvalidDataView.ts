import powerbi from "powerbi-visuals-api";

function checkInvalidDataView(inputDV: powerbi.DataView[]): boolean {
  let flag1: boolean = !inputDV
    || !inputDV[0]
    || !inputDV[0].categorical
    || !inputDV[0].categorical.categories
    || !inputDV[0].categorical.values
    || !inputDV[0].metadata;

  if (flag1) {
    return flag1;
  }

  let flag2: boolean =
    !inputDV[0].categorical.categories[0].source
    || inputDV[0].categorical.values.length < 2

  if (flag2) {
    return flag2;
  }
  let flag3: boolean =
    !inputDV[0].categorical.values[0].source.roles.numerator
    || !inputDV[0].categorical.values[1].source.roles.denominator

  if (flag3) {
    return flag3;
  }

  let flag4: boolean =
    inputDV[0].categorical.values.some(d => d.values.length < 1)
    || inputDV[0].categorical.categories.some(d => d.values.length < 1);
  return flag4;
}

export default checkInvalidDataView;
