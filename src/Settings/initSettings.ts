
function initSettings() {
    return {
        axispad: {
            x: {
                padding: {
                    default: 50,
                    value: 50
                }
            },
            y: {
                padding: {
                    default: 50,
                    value: 50
                }
            }
        },
        spc: {
            data_type: {
                default: "i",
                value: "i"
            },
            multiplier: {
                default: 1,
                value: 1
            }
        },
        scatter: {
            size: {
                default: 4,
                value: 4
            },
            colour: {
                default: "#000000",
                value: "#000000"
            },
            opacity: {
                default: 1,
                value: 1
            },
            opacity_unselected: {
                default: 0.2,
                value: 0.2
            }
        },
        lines: {
            width_99: {
                default: 3,
                value: 3
            },
            width_main: {
                default: 1.5,
                value: 1.5
            },
            width_target: {
                default: 1.5,
                value: 1.5
            },
            colour_99: {
                default: "#4682B4",
                value: "#4682B4"
            },
            colour_main: {
                default: "#000000",
                value: "#000000"
            },
            colour_target: {
                default: "#4682B4",
                value: "#4682B4"
            }
        },
        axis: {
            xlimit_label: {
                default: null,
                value: null
            },
            ylimit_label: {
                default: null,
                value: null
            },
            ylimit_l: {
                default: null,
                value: null
            },
            ylimit_u: {
                default: null,
                value: null
            },
            xlimit_l: {
                default: null,
                value: null
            },
            xlimit_u: {
                default: null,
                value: null
            }
        }
    }
}

export default initSettings
