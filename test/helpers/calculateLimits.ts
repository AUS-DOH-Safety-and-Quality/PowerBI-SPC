import { expect } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass, { type controlLimitsObject, type viewModelValidationT } from "../../src/Classes/viewModelClass";
import type { settingsValueType } from "../../src/settings";
import buildDataView, { sequentialKeys } from "./buildDataView";

export type LimitInputs = {
  keys?: string[];
  numerators: number[];
  denominators?: number[];
  xbar_sds?: number[];
  groupings?: string[];
};

/** A view model updated from the inputs, with click splits supplied as the stored 0-based segment ends */
export function updateViewModel(settings: settingsValueType, inputs: LimitInputs, splitIndexes: number[] = []): { viewModel: viewModelClass; result: viewModelValidationT } {
  const dataView = buildDataView({
    key: inputs.keys ?? sequentialKeys(inputs.numerators.length),
    numerators: inputs.numerators,
    denominators: inputs.denominators,
    xbar_sds: inputs.xbar_sds,
    groupings: inputs.groupings
  }, settings);
  dataView.metadata.objects = {
    split_indexes_storage: { split_indexes: JSON.stringify(splitIndexes) }
  };
  const viewModel = new viewModelClass();
  const result = viewModel.update({
    dataViews: [dataView],
    viewport: { width: 500, height: 500 },
    type: 2
  }, createVisualHost({}));
  return { viewModel, result };
}

/** Control limits from a successful view model update */
export default function calculateLimits(settings: settingsValueType, inputs: LimitInputs, splitIndexes: number[] = []): controlLimitsObject {
  const updated = updateViewModel(settings, inputs, splitIndexes);
  expect(updated.result.status).toBe(true);
  return updated.viewModel.controlLimits[0];
}
