import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";

/**
 * Function for updating an internal object of plot settings with
 *   user-specified settings
 * 
 * @param settings        - Existing settings object to update
 * @param objects         - List of settings objects to get values from
 */
function updateSettings(settings, objects) {
    settings.funnel.data_type.value = dataViewObjects.getValue(
        objects, {
            objectName: "funnel",
            propertyName: "data_type"
        },
        settings.funnel.data_type.default
    )
    settings.funnel.multiplier.value = dataViewObjects.getValue(
        objects, {
            objectName: "funnel",
            propertyName: "multiplier"
        },
        settings.funnel.multiplier.default
    )
    settings.scatter.size.value = dataViewObjects.getValue(
        objects, {
            objectName: "scatter",
            propertyName: "size"
        },
        settings.scatter.size.default
    )
    settings.scatter.colour.value = dataViewObjects.getFillColor(
        objects, {
            objectName: "scatter",
            propertyName: "colour"
        },
        settings.scatter.colour.default
    )
    settings.scatter.opacity.value = dataViewObjects.getValue(
        objects, {
            objectName: "scatter",
            propertyName: "opacity"
        },
        settings.scatter.opacity.default
    )
    settings.scatter.opacity_unselected.value = dataViewObjects.getValue(
        objects, {
            objectName: "scatter",
            propertyName: "opacity_unselected"
        },
        settings.scatter.opacity_unselected.default
    )
    settings.lines.width_99.value = dataViewObjects.getValue(
        objects, {
            objectName: "lines",
            propertyName: "width_99"
        },
        settings.lines.width_99.default
    )
    settings.lines.width_main.value = dataViewObjects.getValue(
        objects, {
            objectName: "lines",
            propertyName: "width_main"
        },
        settings.lines.width_main.default
    )
    settings.lines.width_target.value = dataViewObjects.getValue(
        objects, {
            objectName: "lines",
            propertyName: "width_target"
        },
        settings.lines.width_target.default
    )
    settings.lines.colour_99.value = dataViewObjects.getFillColor(
        objects, {
            objectName: "lines",
            propertyName: "colour_99"
        },
        settings.lines.colour_99.default
    )
    settings.lines.colour_main.value = dataViewObjects.getFillColor(
        objects, {
            objectName: "lines",
            propertyName: "colour_main"
        },
        settings.lines.colour_main.default
    )
    settings.lines.colour_target.value = dataViewObjects.getFillColor(
        objects, {
            objectName: "lines",
            propertyName: "colour_target"
        },
        settings.lines.colour_target.default
    )
}

export default updateSettings;