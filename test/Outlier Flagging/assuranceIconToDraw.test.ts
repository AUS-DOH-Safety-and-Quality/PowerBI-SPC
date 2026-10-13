import assuranceIconToDraw from "../../src/Outlier Flagging/assuranceIconToDraw";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";
import type { settingsValueType } from "../../src/settings";
import derivedSettingsClass from "../../src/Classes/derivedSettingsClass";
import { settingsWith } from "../helpers/renderVisual";
import { describe, it, expect } from "vitest";

type Limits = (number | undefined)[];

describe("assuranceIconToDraw", () => {
    const blanks = (n: number): (number | undefined)[] => new Array<number | undefined>(n).fill(undefined);

    const createControlLimits = (ul99: Limits, ll99: Limits, alt_target: Limits): controlLimitsObject => {
        const n = ul99.length;
        const keys = new Array<controlLimitsObject["keys"][number]>(n);
        for (let i = 0; i < n; i++) {
            keys[i] = { x: i, id: i, label: String(i) };
        }
        return {
            keys,
            values: new Array<number>(n).fill(0),
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

    it.each<{
        name: string;
        ul99: Limits;
        ll99: Limits;
        alt_target: Limits;
        direction?: settingsValueType["outliers"]["improvement_direction"];
        show_alt_target?: boolean;
        chart_type?: settingsValueType["spc"]["chart_type"];
        expected: ReturnType<typeof assuranceIconToDraw>;
    }>([
        { name: "a chart without control limits", ul99: [10], ll99: [0], alt_target: [5], chart_type: "run", expected: "none" },
        { name: "a hidden alt. target", ul99: [10], ll99: [0], alt_target: [5], show_alt_target: false, expected: "none" },
        { name: "a neutral direction", ul99: [10], ll99: [0], alt_target: [5], direction: "neutral", expected: "none" },
        { name: "an increase target above the limits", ul99: [10], ll99: [0], alt_target: [15], expected: "consistentFail" },
        { name: "an increase target below the limits", ul99: [10], ll99: [0], alt_target: [-5], expected: "consistentPass" },
        { name: "an increase target within the limits", ul99: [10], ll99: [0], alt_target: [5], expected: "inconsistent" },
        { name: "a decrease target above the limits", ul99: [10], ll99: [0], alt_target: [15], direction: "decrease", expected: "consistentPass" },
        { name: "a decrease target below the limits", ul99: [10], ll99: [0], alt_target: [-5], direction: "decrease", expected: "consistentFail" },
        { name: "a decrease target within the limits", ul99: [10], ll99: [0], alt_target: [5], direction: "decrease", expected: "inconsistent" },
        { name: "a target on the upper limit", ul99: [10], ll99: [0], alt_target: [10], expected: "inconsistent" },
        { name: "a target on the lower limit", ul99: [10], ll99: [0], alt_target: [0], expected: "inconsistent" },
        { name: "a last target above the last limits", ul99: [8, 9, 10], ll99: [2, 1, 0], alt_target: [3, 4, 15], expected: "consistentFail" },
        { name: "a last target within the last limits", ul99: [8, 9, 10], ll99: [2, 1, 0], alt_target: [15, 15, 5], expected: "inconsistent" },
        { name: "a target below negative limits", ul99: [0], ll99: [-10], alt_target: [-15], expected: "consistentPass" },
        { name: "a target within negative limits", ul99: [0], ll99: [-10], alt_target: [-5], direction: "decrease", expected: "inconsistent" },
        { name: "an undefined last alt. target", ul99: [10, 10], ll99: [0, 0], alt_target: [15, undefined], expected: "none" },
        { name: "an undefined last upper limit", ul99: [10, undefined], ll99: [0, 0], alt_target: [15, 15], expected: "none" },
        { name: "an undefined last lower limit", ul99: [10, 10], ll99: [0, undefined], alt_target: [-5, -5], expected: "none" }
    ])("returns '$expected' for $name", ({ ul99, ll99, alt_target, direction = "increase", show_alt_target = true, chart_type = "i", expected }) => {
        const settings = settingsWith({ outliers: { improvement_direction: direction }, lines: { show_alt_target } });
        const derivedSettings = new derivedSettingsClass(settingsWith({ spc: { chart_type } }).spc);
        expect(assuranceIconToDraw(createControlLimits(ul99, ll99, alt_target), settings, derivedSettings)).toBe(expected);
    });
});
