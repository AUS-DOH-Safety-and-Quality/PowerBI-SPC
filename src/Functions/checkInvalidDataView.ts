import powerbi from "powerbi-visuals-api";

function checkInvalidDataView(inputDV: powerbi.DataView[]): boolean {
  let flag1: boolean = !inputDV
    || !inputDV[0]
    || !inputDV[0].categorical
    || !inputDV[0].categorical.categories
    || !inputDV[0].categorical.values
    || !inputDV[0].metadata;

  console.log("flag1")
  if (flag1) {
    return flag1;
  }

  let flag2: boolean =
    !inputDV[0].categorical.categories[0].source
    || inputDV[0].categorical.values.length < 2

  console.log("flag2: ", flag2);
  if (flag2) {
    return flag2;
  }
  let flag3: boolean =
    !inputDV[0].categorical.values[0].source.roles.numerators
    || !inputDV[0].categorical.values[1].source.roles.denominators

  console.log("flag3: " + flag3)
  if (flag3) {
    return flag3;
  }

  console.log("flag4")
  let flag4: boolean =
    inputDV[0].categorical.values.some(d => d.values.length < 1)
    || inputDV[0].categorical.categories.some(d => d.values.length < 1);
  return flag4;
}

export default checkInvalidDataView;
