import assuranceIconToDraw from "../../src/Outlier Flagging/assuranceIconToDraw";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";
import type { settingsValueType } from "../../src/settings";
import derivedSettingsClass from "../../src/Classes/derivedSettingsClass";
import { settingsWith } from "../helpers/renderVisual";
import { describe, it, expect } from "vitest";

describe("assuranceIconToDraw", () => {
    const blanks = (n: number): (number | undefined)[] => new Array<number | undefined>(n).fill(undefined);

    const createControlLimits = (ul99: number[], ll99: number[], alt_target: (number | undefined)[]): controlLimitsObject => {
        const n = ul99.length;
        const keys = new Array<controlLimitsObject["keys"][number]>(n);
        const values = new Array<number>(n);
        for (let i = 0; i < n; i++) {
            keys[i] = { x: i, id: i, label: String(i) };
            values[i] = (ul99[i] + ll99[i]) / 2;
        }
        return {
            keys,
            values,
            numerators: blanks(n),
            denominators: blanks(n),
            target: blanks(n),
            ll99,
            ll95: blanks(n),
            ll68: blanks(n),
            ul68: blanks(n),
            ul95: blanks(n),
            ul99,
            count: blanks(n),
            alt_target,
            speclimits_lower: blanks(n),
            speclimits_upper: blanks(n),
            trend_line: blanks(n)
        };
    };

    const createSettings = (
        improvement_direction: settingsValueType["outliers"]["improvement_direction"],
        show_alt_target = true
    ): settingsValueType => settingsWith({
        outliers: { improvement_direction },
        lines: { show_alt_target }
    });

    const createDerivedSettings = (has_control_limits: boolean): derivedSettingsClass =>
        new derivedSettingsClass(settingsWith({ spc: { chart_type: has_control_limits ? "i" : "run" } }).spc);

    it("should return 'none' when chart type does not support control limits", () => {
        const controlLimits = createControlLimits([10], [0], [5]);
        const settings = createSettings("increase");
        const derivedSettings = createDerivedSettings(false);

        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);

        expect(result).toBe("none");
    });

    it("should return 'none' when the alternative target line is hidden", () => {
        const controlLimits = createControlLimits([10], [0], [5]);
        const settings = createSettings("increase", false);
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
