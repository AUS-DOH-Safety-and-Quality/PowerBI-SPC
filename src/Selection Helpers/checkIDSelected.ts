
/**
 * Check whether a given selection ID from current observations is
 *    present in the global list of selected observations
 * 
 * @param globalSelectionIds 
 * @param currentSelectionId 
 * @returns 
 */
function checkIDSelected(globalSelectionIds, currentSelectionId): boolean {
    if (!globalSelectionIds || !currentSelectionId) {
        return false;
    }

    return globalSelectionIds.some(d => {
        return d.includes(currentSelectionId);
    });
}

export default checkIDSelected;