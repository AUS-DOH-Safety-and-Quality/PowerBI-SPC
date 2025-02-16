
var options_constructor = {
    element: spc.d3.select('body').node(),
    host: {
        createSelectionManager: () => ({
            registerOnSelectCallback: () => {},
            getSelectionIds: () => []
        }),
        createSelectionIdBuilder: () => ({
            withCategory: () => ({ createSelectionId: () => {} })
        }),
        tooltipService: {
            show: () => {},
            hide: () => {}
        },
        eventService: {
            renderingStarted: () => {},
            renderingFailed: () => {},
            renderingFinished: () => {}
        },
        colorPalette: {
            isHighContrast: false,
            foreground: { value: "black" },
            background: { value: "white" },
            foregroundSelected: { value: "black" },
            hyperlink: { value: "blue" }
        }
    }
};

var visual = new spc.Visual(options_constructor);

var options_update = {
    dataViews: [
        {
            categorical: {
                categories: [{
                    source: { roles: {"key": true}},
                    values: ["A", "B", "C"]
                }],
                values: [
                    {
                        source: { roles: {"numerators": true}},
                        values: [1, 2, 3]
                    }
                ]
            }
        }
    ] ,
    viewport: {
        "width":500,
        "height":500
    },
    type: 2
};
visual.update(options_update);
