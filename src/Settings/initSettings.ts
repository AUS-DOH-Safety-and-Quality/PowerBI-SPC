
function initSettings() {
    return {
        axispad: {
            x: {
                padding: {
                    default: 50,
                    value: 50
                },
                end_padding: {
                    default: 10,
                    value: 10
                }
            },
            y: {
                padding: {
                    default: 50,
                    value: 50
                },
                end_padding: {
                    default: 10,
                    value: 10
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
                default: 3,
                value: 3
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
                default: 2,
                value: 2
            },
            width_main: {
                default: 1,
                value: 1
            },
            width_target: {
                default: 1.5,
                value: 1.5
            },
            colour_99: {
                default: "#6495ED",
                value: "#6495ED"
            },
            colour_main: {
                default: "#000000",
                value: "#000000"
            },
            colour_target: {
                default: "#6495ED",
                value: "#6495ED"
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
