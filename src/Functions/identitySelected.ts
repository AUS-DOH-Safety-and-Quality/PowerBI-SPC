import type powerbi from "powerbi-visuals-api";
type ISelectionId = powerbi.visuals.ISelectionId;

export default function identitySelected(identity: ISelectionId | ISelectionId[], selectionManager: powerbi.extensibility.ISelectionManager): boolean {
  const allSelectedIdentities = selectionManager.getSelectionIds() as ISelectionId[];
  if (Array.isArray(identity)) {
    return identity.some((d) => allSelectedIdentities.some((e) => e.includes(d)));
  } else {
    return allSelectedIdentities.some((d) => d.includes(identity));
  }
}
