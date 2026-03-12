import variationIconsToDraw from "../../src/Outlier Flagging/variationIconsToDraw";
import type { outliersObject } from "../../src/Classes/viewModelClass";
import type { defaultSettingsType } from "../../src/Classes/settingsClass";

describe("variationIconsToDraw", () => {
    // Helper to create mock outliers object
    const createOutliers = (
        astpoint: string[],
        shift: string[],
        trend: string[],
        two_in_three: string[]
    ): outliersObject => ({
        astpoint,
        shift,
        trend,
        two_in_three
    } as outliersObject);

    // Helper to create mock settings
    const createSettings = (improvement_direction: string, flag_last_point: boolean): defaultSettingsType => ({
        outliers: {
            improvement_direction: improvement_direction
        },
        nhs_icons: {
            flag_last_point: flag_last_point
        }
    } as defaultSettingsType);

    describe("no outliers detected", () => {
        it("should return 'commonCause' when no outliers are present", () => {
            const outliers = createOutliers(
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["commonCause"]);
        });
    });

    describe("improvement direction: increase", () => {
        it("should return 'improvementHigh' when improvement is detected", () => {
            const outliers = createOutliers(
                ["improvement", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["improvementHigh"]);
        });

        it("should return 'concernLow' when deterioration is detected", () => {
            const outliers = createOutliers(
                ["deterioration", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["concernLow"]);
        });

        it("should return both icons when both improvement and deterioration present", () => {
            const outliers = createOutliers(
                ["improvement", "none", "none"],
                ["deterioration", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toContain("improvementHigh");
            expect(result).toContain("concernLow");
            expect(result.length).toBe(2);
        });
    });

    describe("improvement direction: decrease", () => {
        it("should return 'improvementLow' when improvement is detected", () => {
            const outliers = createOutliers(
                ["improvement", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("decrease", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["improvementLow"]);
        });

        it("should return 'concernHigh' when deterioration is detected", () => {
            const outliers = createOutliers(
                ["deterioration", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("decrease", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["concernHigh"]);
        });
    });

    describe("improvement direction: neutral", () => {
        it("should return 'neutralLow' when neutral_low is detected", () => {
            const outliers = createOutliers(
                ["neutral_low", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("neutral", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["neutralLow"]);
        });

        it("should return 'neutralHigh' when neutral_high is detected", () => {
            const outliers = createOutliers(
                ["neutral_high", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("neutral", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["neutralHigh"]);
        });

        it("should return both neutral icons when both directions detected", () => {
            const outliers = createOutliers(
                ["neutral_low", "neutral_high", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("neutral", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toContain("neutralLow");
            expect(result).toContain("neutralHigh");
            expect(result.length).toBe(2);
        });
    });

    describe("multiple outlier types", () => {
        it("should detect outliers from all four detection methods", () => {
            const outliers = createOutliers(
                ["improvement", "none", "none"],
                ["none", "improvement", "none"],
                ["none", "none", "improvement"],
                ["improvement", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            // All contribute to improvementHigh
            expect(result).toEqual(["improvementHigh"]);
        });

        it("should combine different detection methods with different directions", () => {
            const outliers = createOutliers(
                ["improvement", "none", "none"],
                ["deterioration", "none", "none"],
                ["improvement", "none", "none"],
                ["deterioration", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toContain("improvementHigh");
            expect(result).toContain("concernLow");
            expect(result.length).toBe(2);
        });
    });

    describe("flag_last_point option", () => {
        it("should only check last point when flag_last_point is true", () => {
            const outliers = createOutliers(
                ["improvement", "improvement", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", true);

            const result = variationIconsToDraw(outliers, settings);

            // Last point is "none" for all, so commonCause
            expect(result).toEqual(["commonCause"]);
        });

        it("should detect outlier in last point when flag_last_point is true", () => {
            const outliers = createOutliers(
                ["none", "none", "improvement"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", true);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["improvementHigh"]);
        });

        it("should check all points when flag_last_point is false", () => {
            const outliers = createOutliers(
                ["improvement", "improvement", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["improvementHigh"]);
        });

        it("should check last point across all detection methods when flag_last_point is true", () => {
            const outliers = createOutliers(
                ["none", "none", "improvement"],
                ["none", "none", "deterioration"],
                ["none", "none", "improvement"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", true);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toContain("improvementHigh");
            expect(result).toContain("concernLow");
            expect(result.length).toBe(2);
        });
    });

    describe("edge cases", () => {
        it("should handle single point arrays", () => {
            const outliers = createOutliers(
                ["improvement"],
                ["none"],
                ["none"],
                ["none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["improvementHigh"]);
        });

        it("should handle empty arrays", () => {
            const outliers = createOutliers([], [], [], []);
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toEqual(["commonCause"]);
        });

        it("should deduplicate icon types", () => {
            const outliers = createOutliers(
                ["improvement", "improvement", "improvement"],
                ["improvement", "improvement", "improvement"],
                ["improvement", "improvement", "improvement"],
                ["improvement", "improvement", "improvement"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            // Should only return one instance of improvementHigh
            expect(result).toEqual(["improvementHigh"]);
        });

        it("should handle all four variation types simultaneously", () => {
            const outliers = createOutliers(
                ["improvement", "none", "none"],
                ["deterioration", "none", "none"],
                ["neutral_low", "none", "none"],
                ["neutral_high", "none", "none"]
            );
            const settings = createSettings("neutral", false);

            const result = variationIconsToDraw(outliers, settings);

            expect(result).toContain("improvement");
            expect(result).toContain("concern");
            expect(result).toContain("neutralLow");
            expect(result).toContain("neutralHigh");
            expect(result.length).toBe(4);
        });
    });

    describe("improvement vs deterioration mapping", () => {
        it("should correctly invert suffixes for deterioration in increase direction", () => {
            const outliers = createOutliers(
                ["deterioration", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("increase", false);

            const result = variationIconsToDraw(outliers, settings);

            // increase + deterioration -> concernLow (inverted)
            expect(result).toEqual(["concernLow"]);
        });

        it("should correctly invert suffixes for deterioration in decrease direction", () => {
            const outliers = createOutliers(
                ["deterioration", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"],
                ["none", "none", "none"]
            );
            const settings = createSettings("decrease", false);

            const result = variationIconsToDraw(outliers, settings);

            // decrease + deterioration -> concernHigh (inverted)
            expect(result).toEqual(["concernHigh"]);
        });
    });
});
