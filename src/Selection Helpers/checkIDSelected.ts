import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

/**
 * Check whether a given selection ID from current observations is
 *    present in the global list of selected observations
 * 
 * @param globalSelectionIds 
 * @param currentSelectionId 
 * @returns 
 */
function checkIDSelected(globalSelectionIds: ISelectionId[],
                         currentSelectionId: ISelectionId): boolean {
    if (!globalSelectionIds || !currentSelectionId) {
        return false;
    }

    return globalSelectionIds.some(d => {
        return d.includes(currentSelectionId);
    });
}

export default checkIDSelected;