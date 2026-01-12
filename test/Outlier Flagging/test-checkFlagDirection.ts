import checkFlagDirection from "../../src/Outlier Flagging/checkFlagDirection";

describe("checkFlagDirection", () => {
    it("should return 'none' when outlierStatus is 'none'", () => {
        const flagSettings = { process_flag_type: "both", improvement_direction: "increase" };
        const result = checkFlagDirection("none", flagSettings);
        expect(result).toBe("none");
    });

    describe("improvement direction: increase", () => {
        it("should map 'upper' to 'improvement' with increase direction", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "increase" };
            const result = checkFlagDirection("upper", flagSettings);
            expect(result).toBe("improvement");
        });

        it("should map 'lower' to 'deterioration' with increase direction", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "increase" };
            const result = checkFlagDirection("lower", flagSettings);
            expect(result).toBe("deterioration");
        });
    });

    describe("improvement direction: decrease", () => {
        it("should map 'lower' to 'improvement' with decrease direction", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "decrease" };
            const result = checkFlagDirection("lower", flagSettings);
            expect(result).toBe("improvement");
        });

        it("should map 'upper' to 'deterioration' with decrease direction", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "decrease" };
            const result = checkFlagDirection("upper", flagSettings);
            expect(result).toBe("deterioration");
        });
    });

    describe("improvement direction: neutral", () => {
        it("should map 'lower' to 'neutral_low' with neutral direction", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "neutral" };
            const result = checkFlagDirection("lower", flagSettings);
            expect(result).toBe("neutral_low");
        });

        it("should map 'upper' to 'neutral_high' with neutral direction", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "neutral" };
            const result = checkFlagDirection("upper", flagSettings);
            expect(result).toBe("neutral_high");
        });
    });

    describe("process_flag_type filtering", () => {
        it("should return 'improvement' when flag type is 'improvement' and matches", () => {
            const flagSettings = { process_flag_type: "improvement", improvement_direction: "increase" };
            const result = checkFlagDirection("upper", flagSettings);
            expect(result).toBe("improvement");
        });

        it("should return 'none' when flag type is 'improvement' but result is deterioration", () => {
            const flagSettings = { process_flag_type: "improvement", improvement_direction: "increase" };
            const result = checkFlagDirection("lower", flagSettings);
            expect(result).toBe("none");
        });

        it("should return 'deterioration' when flag type is 'deterioration' and matches", () => {
            const flagSettings = { process_flag_type: "deterioration", improvement_direction: "increase" };
            const result = checkFlagDirection("lower", flagSettings);
            expect(result).toBe("deterioration");
        });

        it("should return 'none' when flag type is 'deterioration' but result is improvement", () => {
            const flagSettings = { process_flag_type: "deterioration", improvement_direction: "increase" };
            const result = checkFlagDirection("upper", flagSettings);
            expect(result).toBe("none");
        });

        it("should return both improvement and deterioration when flag type is 'both'", () => {
            const flagSettingsIncrease = { process_flag_type: "both", improvement_direction: "increase" };

            expect(checkFlagDirection("upper", flagSettingsIncrease)).toBe("improvement");
            expect(checkFlagDirection("lower", flagSettingsIncrease)).toBe("deterioration");
        });
    });

    describe("combined scenarios", () => {
        it("should handle decrease direction with improvement flag type", () => {
            const flagSettings = { process_flag_type: "improvement", improvement_direction: "decrease" };

            expect(checkFlagDirection("lower", flagSettings)).toBe("improvement");
            expect(checkFlagDirection("upper", flagSettings)).toBe("none");
        });

        it("should handle decrease direction with deterioration flag type", () => {
            const flagSettings = { process_flag_type: "deterioration", improvement_direction: "decrease" };

            expect(checkFlagDirection("upper", flagSettings)).toBe("deterioration");
            expect(checkFlagDirection("lower", flagSettings)).toBe("none");
        });

        it("should handle neutral direction with both flag type", () => {
            const flagSettings = { process_flag_type: "both", improvement_direction: "neutral" };

            expect(checkFlagDirection("upper", flagSettings)).toBe("neutral_high");
            expect(checkFlagDirection("lower", flagSettings)).toBe("neutral_low");
        });

        it("should filter neutral flags when flag type is not 'both'", () => {
            const flagSettingsImprovement = { process_flag_type: "improvement", improvement_direction: "neutral" };
            const flagSettingsDeterioration = { process_flag_type: "deterioration", improvement_direction: "neutral" };

            // neutral_high and neutral_low don't match 'improvement' or 'deterioration'
            expect(checkFlagDirection("upper", flagSettingsImprovement)).toBe("none");
            expect(checkFlagDirection("lower", flagSettingsImprovement)).toBe("none");
            expect(checkFlagDirection("upper", flagSettingsDeterioration)).toBe("none");
            expect(checkFlagDirection("lower", flagSettingsDeterioration)).toBe("none");
        });
    });

    describe("edge cases", () => {
        it("should handle all combinations of increase direction", () => {
            const flagSettingsBoth = { process_flag_type: "both", improvement_direction: "increase" };
            const flagSettingsImprovement = { process_flag_type: "improvement", improvement_direction: "increase" };
            const flagSettingsDeterioration = { process_flag_type: "deterioration", improvement_direction: "increase" };

            expect(checkFlagDirection("upper", flagSettingsBoth)).toBe("improvement");
            expect(checkFlagDirection("upper", flagSettingsImprovement)).toBe("improvement");
            expect(checkFlagDirection("upper", flagSettingsDeterioration)).toBe("none");

            expect(checkFlagDirection("lower", flagSettingsBoth)).toBe("deterioration");
            expect(checkFlagDirection("lower", flagSettingsImprovement)).toBe("none");
            expect(checkFlagDirection("lower", flagSettingsDeterioration)).toBe("deterioration");
        });

        it("should handle all combinations of decrease direction", () => {
            const flagSettingsBoth = { process_flag_type: "both", improvement_direction: "decrease" };
            const flagSettingsImprovement = { process_flag_type: "improvement", improvement_direction: "decrease" };
            const flagSettingsDeterioration = { process_flag_type: "deterioration", improvement_direction: "decrease" };

            expect(checkFlagDirection("lower", flagSettingsBoth)).toBe("improvement");
            expect(checkFlagDirection("lower", flagSettingsImprovement)).toBe("improvement");
            expect(checkFlagDirection("lower", flagSettingsDeterioration)).toBe("none");

            expect(checkFlagDirection("upper", flagSettingsBoth)).toBe("deterioration");
            expect(checkFlagDirection("upper", flagSettingsImprovement)).toBe("none");
            expect(checkFlagDirection("upper", flagSettingsDeterioration)).toBe("deterioration");
        });

        it("should always return 'none' for outlierStatus='none' regardless of settings", () => {
            expect(checkFlagDirection("none", { process_flag_type: "both", improvement_direction: "increase" })).toBe("none");
            expect(checkFlagDirection("none", { process_flag_type: "improvement", improvement_direction: "decrease" })).toBe("none");
            expect(checkFlagDirection("none", { process_flag_type: "deterioration", improvement_direction: "neutral" })).toBe("none");
        });
    });
});
