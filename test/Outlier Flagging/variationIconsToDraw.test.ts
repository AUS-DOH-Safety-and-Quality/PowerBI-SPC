import variationIconsToDraw from "../../src/Outlier Flagging/variationIconsToDraw";
import type { outliersObject } from "../../src/Classes/viewModelClass";
import type { settingsValueType } from "../../src/settings";
import type { FlagDirection } from "powerbi-visuals-core/data";
import { settingsWith } from "../helpers/renderVisual";
import { describe, it, expect } from "vitest";

describe("variationIconsToDraw", () => {
    const none: FlagDirection[] = ["none", "none", "none"];

    const createOutliers = (
        astpoint: FlagDirection[],
        shift: FlagDirection[] = none,
        trend: FlagDirection[] = none,
        two_in_three: FlagDirection[] = none
    ): outliersObject => ({
        astpoint,
        shift,
        trend,
        two_in_three
    });

    const createSettings = (
        improvement_direction: settingsValueType["outliers"]["improvement_direction"],
        flag_last_point: boolean
    ): settingsValueType => settingsWith({
        outliers: { improvement_direction },
        nhs_icons: { flag_last_point }
    });

    it("returns 'commonCause' when no point is flagged", () => {
        expect(variationIconsToDraw(createOutliers(none), createSettings("increase", false))).toEqual(["commonCause"]);
    });

    it("names the icon by the flag and the improvement direction", () => {
        const cases = [
            { direction: "increase", flag: "improvement", icon: "improvementHigh" },
            { direction: "increase", flag: "deterioration", icon: "concernLow" },
            { direction: "decrease", flag: "improvement", icon: "improvementLow" },
            { direction: "decrease", flag: "deterioration", icon: "concernHigh" },
            { direction: "neutral", flag: "neutral_low", icon: "neutralLow" },
            { direction: "neutral", flag: "neutral_high", icon: "neutralHigh" }
        ] as const;
        for (let i = 0; i < cases.length; i++) {
            const outliers = createOutliers([cases[i].flag, "none", "none"]);
            const result = variationIconsToDraw(outliers, createSettings(cases[i].direction, false));
            expect(result, `${cases[i].direction} ${cases[i].flag}`).toEqual([cases[i].icon]);
        }
    });

    it("lists each kind of flag once, improvement before concern and low before high", () => {
        const opposing = createOutliers(none, ["none", "deterioration", "none"], ["improvement", "none", "none"]);
        expect(variationIconsToDraw(opposing, createSettings("increase", false))).toEqual(["improvementHigh", "concernLow"]);
        const neutral = createOutliers(["neutral_high", "none", "none"], ["none", "neutral_low", "none"]);
        expect(variationIconsToDraw(neutral, createSettings("neutral", false))).toEqual(["neutralLow", "neutralHigh"]);
    });

    it("counts flags from all four patterns alike", () => {
        const patterns = [
            createOutliers(["none", "improvement", "none"]),
            createOutliers(none, ["none", "improvement", "none"]),
            createOutliers(none, none, ["none", "improvement", "none"]),
            createOutliers(none, none, none, ["none", "improvement", "none"]),
            createOutliers(["improvement", "improvement", "improvement"], ["improvement", "improvement", "improvement"],
                           ["improvement", "improvement", "improvement"], ["improvement", "improvement", "improvement"])
        ];
        for (let i = 0; i < patterns.length; i++) {
            expect(variationIconsToDraw(patterns[i], createSettings("increase", false)), `case ${i}`).toEqual(["improvementHigh"]);
        }
    });

    it("considers only the last point when flag_last_point is set", () => {
        const earlier = createOutliers(["improvement", "improvement", "none"]);
        expect(variationIconsToDraw(earlier, createSettings("increase", true))).toEqual(["commonCause"]);
        const last = createOutliers(["none", "none", "improvement"], ["none", "none", "deterioration"]);
        expect(variationIconsToDraw(last, createSettings("increase", true))).toEqual(["improvementHigh", "concernLow"]);
    });

    it("considers every point when flag_last_point is off", () => {
        const earlier = createOutliers(["improvement", "none", "none"], ["none", "deterioration", "none"]);
        expect(variationIconsToDraw(earlier, createSettings("decrease", false))).toEqual(["improvementLow", "concernHigh"]);
    });
});
