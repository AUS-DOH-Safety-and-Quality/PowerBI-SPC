import type powerbi from "powerbi-visuals-api";
type ISelectionId = powerbi.visuals.ISelectionId;

export default function identitySelected(identity: ISelectionId | ISelectionId[], selectionManager: powerbi.extensibility.ISelectionManager): boolean {
  const allSelectedIdentities = selectionManager.getSelectionIds() as ISelectionId[];
  var identity_selected = false;
  for (const selected of allSelectedIdentities) {
    if (Array.isArray(identity)) {
      for (const d of identity) {
        if (selected === d) {
          identity_selected = true;
          break;
        }
      }
    } else {
      if (selected === identity) {
        identity_selected = true;
        break;
      }
    }
  }
  return identity_selected;
}
