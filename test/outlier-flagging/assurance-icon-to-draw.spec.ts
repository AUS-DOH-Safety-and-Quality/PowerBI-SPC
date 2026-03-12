import assuranceIconToDraw from "../../src/Outlier Flagging/assuranceIconToDraw";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";
import type { defaultSettingsType } from "../../src/Classes/settingsClass";
import derivedSettingsClass from "../../src/Classes/derivedSettingsClass";

describe("assuranceIconToDraw", () => {
    // Helper to create mock control limits
    const createControlLimits = (ul99: number[], ll99: number[], alt_targets?: number[]): controlLimitsObject => ({
        keys: [],
        values: [],
        targets: [],
        alt_targets: alt_targets,
        ul99: ul99,
        ul95: [],
        ll95: [],
        ll99: ll99
    } as controlLimitsObject);

    // Helper to create mock settings
    const createSettings = (improvement_direction: string): defaultSettingsType => ({
        outliers: {
            improvement_direction: improvement_direction
        }
    } as defaultSettingsType);

    // Helper to create derived settings with control limits
    const createDerivedSettings = (has_control_limits: boolean): derivedSettingsClass => {
        const derived = new derivedSettingsClass();
        derived.chart_type_props = {
            has_control_limits: has_control_limits,
            name: "test",
            needs_denominator: false,
            denominator_optional: false,
            numerator_non_negative: false,
            numerator_leq_denominator: false,
            needs_sd: false,
            integer_num_den: false,
            value_name: "test",
            x_axis_use_date: false,
            date_name: "test"
        };
        return derived;
    };

    it("should return 'none' when chart type does not support control limits", () => {
        const controlLimits = createControlLimits([10], [0], [5]);
        const settings = createSettings("increase");
        const derivedSettings = createDerivedSettings(false);

        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

        expect(result).toBe("none");
    });

    it("should return 'none' when alternative target is null", () => {
        const controlLimits = createControlLimits([10], [0], undefined);
        const settings = createSettings("increase");
        const derivedSettings = createDerivedSettings(true);

        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

        expect(result).toBe("none");
    });

    it("should return 'none' when improvement direction is neutral", () => {
        const controlLimits = createControlLimits([10], [0], [5]);
        const settings = createSettings("neutral");
        const derivedSettings = createDerivedSettings(true);

        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

        expect(result).toBe("none");
    });

    describe("increase improvement direction", () => {
        it("should return 'consistentFail' when target is above upper limit", () => {
            const controlLimits = createControlLimits([10], [0], [15]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("consistentFail");
        });

        it("should return 'consistentPass' when target is below lower limit", () => {
            const controlLimits = createControlLimits([10], [0], [-5]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("consistentPass");
        });

        it("should return 'inconsistent' when target is within control limits", () => {
            const controlLimits = createControlLimits([10], [0], [5]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("inconsistent");
        });
    });

    describe("decrease improvement direction", () => {
        it("should return 'consistentPass' when target is above upper limit", () => {
            const controlLimits = createControlLimits([10], [0], [15]);
            const settings = createSettings("decrease");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("consistentPass");
        });

        it("should return 'consistentFail' when target is below lower limit", () => {
            const controlLimits = createControlLimits([10], [0], [-5]);
            const settings = createSettings("decrease");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("consistentFail");
        });

        it("should return 'inconsistent' when target is within control limits", () => {
            const controlLimits = createControlLimits([10], [0], [5]);
            const settings = createSettings("decrease");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("inconsistent");
        });
    });

    describe("boundary conditions", () => {
        it("should treat target exactly on upper limit as inconsistent", () => {
            const controlLimits = createControlLimits([10], [0], [10]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("inconsistent");
        });

        it("should treat target exactly on lower limit as inconsistent", () => {
            const controlLimits = createControlLimits([10], [0], [0]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            expect(result).toBe("inconsistent");
        });
    });

    describe("multiple data points (uses last value)", () => {
        it("should use the last value of control limits and alternative targets", () => {
            const controlLimits = createControlLimits([8, 9, 10], [2, 1, 0], [3, 4, 15]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            // Last alt_target is 15, last ul99 is 10 -> target above upper limit
            expect(result).toBe("consistentFail");
        });

        it("should handle last alternative target within limits", () => {
            const controlLimits = createControlLimits([8, 9, 10], [2, 1, 0], [15, 15, 5]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            // Last alt_target is 5, within [0, 10]
            expect(result).toBe("inconsistent");
        });
    });

    describe("negative control limits", () => {
        it("should work with negative control limits and targets", () => {
            const controlLimits = createControlLimits([0], [-10], [-15]);
            const settings = createSettings("increase");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            // Target -15 is below lower limit -10
            expect(result).toBe("consistentPass");
        });

        it("should handle negative target within negative control limits", () => {
            const controlLimits = createControlLimits([0], [-10], [-5]);
            const settings = createSettings("decrease");
            const derivedSettings = createDerivedSettings(true);

            const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

            // Target -5 is within [-10, 0]
            expect(result).toBe("inconsistent");
        });
    });
});
