/**
 * Test Extension Plan - Session 5
 * Outlier Flagging & Rules Testing - Part 2 (Icon Determination)
 * 
 * Tests for icon determination and flag direction functions:
 * - checkFlagDirection.ts - Maps outlier status to improvement/deterioration
 * - variationIconsToDraw.ts - Determines variation icons based on outliers
 * - assuranceIconToDraw.ts - Determines assurance icon based on targets
 */

import checkFlagDirection from "../src/Outlier Flagging/checkFlagDirection";
import variationIconsToDraw from "../src/Outlier Flagging/variationIconsToDraw";
import assuranceIconToDraw from "../src/Outlier Flagging/assuranceIconToDraw";
import type { defaultSettingsType, outliersObject, controlLimitsObject, derivedSettingsClass } from "../src/Classes";

describe("Icon Determination and Flag Direction", () => {

  describe("checkFlagDirection() - Flag Direction Validation", () => {

    describe("Improvement direction: increase", () => {
      const flagSettings = {
        improvement_direction: "increase",
        process_flag_type: "both"
      };

      it("should map upper outlier to improvement", () => {
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("improvement");
      });

      it("should map lower outlier to deterioration", () => {
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("deterioration");
      });

      it("should map none to none", () => {
        const result = checkFlagDirection("none", flagSettings);
        expect(result).toBe("none");
      });
    });

    describe("Improvement direction: decrease", () => {
      const flagSettings = {
        improvement_direction: "decrease",
        process_flag_type: "both"
      };

      it("should map lower outlier to improvement", () => {
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("improvement");
      });

      it("should map upper outlier to deterioration", () => {
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("deterioration");
      });

      it("should map none to none", () => {
        const result = checkFlagDirection("none", flagSettings);
        expect(result).toBe("none");
      });
    });

    describe("Improvement direction: neutral", () => {
      const flagSettings = {
        improvement_direction: "neutral",
        process_flag_type: "both"
      };

      it("should map upper outlier to neutral_high", () => {
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("neutral_high");
      });

      it("should map lower outlier to neutral_low", () => {
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("neutral_low");
      });

      it("should map none to none", () => {
        const result = checkFlagDirection("none", flagSettings);
        expect(result).toBe("none");
      });
    });

    describe("Process flag type: improvement only", () => {
      it("should return improvement for upper when direction is increase", () => {
        const flagSettings = {
          improvement_direction: "increase",
          process_flag_type: "improvement"
        };
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("improvement");
      });

      it("should return none for lower when direction is increase and flag type is improvement", () => {
        const flagSettings = {
          improvement_direction: "increase",
          process_flag_type: "improvement"
        };
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("none");
      });

      it("should return improvement for lower when direction is decrease", () => {
        const flagSettings = {
          improvement_direction: "decrease",
          process_flag_type: "improvement"
        };
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("improvement");
      });

      it("should return none for upper when direction is decrease and flag type is improvement", () => {
        const flagSettings = {
          improvement_direction: "decrease",
          process_flag_type: "improvement"
        };
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("none");
      });
    });

    describe("Process flag type: deterioration only", () => {
      it("should return deterioration for lower when direction is increase", () => {
        const flagSettings = {
          improvement_direction: "increase",
          process_flag_type: "deterioration"
        };
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("deterioration");
      });

      it("should return none for upper when direction is increase and flag type is deterioration", () => {
        const flagSettings = {
          improvement_direction: "increase",
          process_flag_type: "deterioration"
        };
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("none");
      });

      it("should return deterioration for upper when direction is decrease", () => {
        const flagSettings = {
          improvement_direction: "decrease",
          process_flag_type: "deterioration"
        };
        const result = checkFlagDirection("upper", flagSettings);
        expect(result).toBe("deterioration");
      });

      it("should return none for lower when direction is decrease and flag type is deterioration", () => {
        const flagSettings = {
          improvement_direction: "decrease",
          process_flag_type: "deterioration"
        };
        const result = checkFlagDirection("lower", flagSettings);
        expect(result).toBe("none");
      });
    });

    describe("Broadcasting behavior", () => {
      it("should handle arrays of outlier statuses", () => {
        const flagSettings = {
          improvement_direction: "increase",
          process_flag_type: "both"
        };
        const outlierStatuses = ["upper", "lower", "none", "upper"];
        const result = checkFlagDirection(outlierStatuses, flagSettings);
        
        expect(result).toEqual(["improvement", "deterioration", "none", "improvement"]);
      });

      it("should broadcast flag settings across multiple statuses", () => {
        const flagSettings = {
          improvement_direction: "decrease",
          process_flag_type: "improvement"
        };
        const outlierStatuses = ["upper", "lower", "upper", "lower"];
        const result = checkFlagDirection(outlierStatuses, flagSettings);
        
        // Only lower should map to improvement, upper should be filtered to none
        expect(result).toEqual(["none", "improvement", "none", "improvement"]);
      });
    });

  });

  describe("variationIconsToDraw() - Variation Icon Selection", () => {

    // Helper to create minimal settings object
    function createSettings(improvement_direction: string, flag_last_point: boolean = false): defaultSettingsType {
      return {
        outliers: {
          improvement_direction: improvement_direction
        },
        nhs_icons: {
          flag_last_point: flag_last_point
        }
      } as defaultSettingsType;
    }

    // Helper to create outliers object
    function createOutliers(
      astpoint: string[],
      shift: string[],
      trend: string[],
      two_in_three: string[]
    ): outliersObject {
      return {
        astpoint: astpoint,
        shift: shift,
        trend: trend,
        two_in_three: two_in_three
      } as outliersObject;
    }

    describe("Common cause scenarios (no outliers)", () => {
      it("should return commonCause when no outliers detected", () => {
        const settings = createSettings("increase");
        const outliers = createOutliers(
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["commonCause"]);
      });
    });

    describe("Improvement direction: increase", () => {
      const settings = createSettings("increase");

      it("should return improvementHigh for improvement outliers", () => {
        const outliers = createOutliers(
          ["improvement", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["improvementHigh"]);
      });

      it("should return concernLow for deterioration outliers", () => {
        const outliers = createOutliers(
          ["deterioration", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["concernLow"]);
      });

      it("should return both icons when both improvement and deterioration present", () => {
        const outliers = createOutliers(
          ["improvement", "deterioration", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toContain("improvementHigh");
        expect(result).toContain("concernLow");
        expect(result.length).toBe(2);
      });
    });

    describe("Improvement direction: decrease", () => {
      const settings = createSettings("decrease");

      it("should return improvementLow for improvement outliers", () => {
        const outliers = createOutliers(
          ["improvement", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["improvementLow"]);
      });

      it("should return concernHigh for deterioration outliers", () => {
        const outliers = createOutliers(
          ["deterioration", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["concernHigh"]);
      });
    });

    describe("Improvement direction: neutral", () => {
      const settings = createSettings("neutral");

      it("should return neutralHigh for neutral_high outliers", () => {
        const outliers = createOutliers(
          ["neutral_high", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["neutralHigh"]);
      });

      it("should return neutralLow for neutral_low outliers", () => {
        const outliers = createOutliers(
          ["neutral_low", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["neutralLow"]);
      });

      it("should return both neutral icons when both present", () => {
        const outliers = createOutliers(
          ["neutral_high", "neutral_low", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toContain("neutralHigh");
        expect(result).toContain("neutralLow");
        expect(result.length).toBe(2);
      });
    });

    describe("Multiple rule types", () => {
      const settings = createSettings("increase");

      it("should check all rule types (astpoint, shift, trend, two_in_three)", () => {
        const outliers = createOutliers(
          ["none", "none", "none"],
          ["improvement", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["improvementHigh"]);
      });

      it("should detect outliers from trend rule", () => {
        const outliers = createOutliers(
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["deterioration", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["concernLow"]);
      });

      it("should detect outliers from two_in_three rule", () => {
        const outliers = createOutliers(
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["improvement", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["improvementHigh"]);
      });

      it("should aggregate outliers from multiple rules", () => {
        const outliers = createOutliers(
          ["improvement", "none", "none"],
          ["deterioration", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toContain("improvementHigh");
        expect(result).toContain("concernLow");
      });
    });

    describe("Flag last point only", () => {
      const settings = createSettings("increase", true);

      it("should only check last point when flag_last_point is true", () => {
        const outliers = createOutliers(
          ["improvement", "improvement", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        // Last point is "none", so should return commonCause
        expect(result).toEqual(["commonCause"]);
      });

      it("should detect last point improvement when flag_last_point is true", () => {
        const outliers = createOutliers(
          ["none", "none", "improvement"],
          ["none", "none", "none"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["improvementHigh"]);
      });

      it("should check all rules for last point when flag_last_point is true", () => {
        const outliers = createOutliers(
          ["none", "none", "none"],
          ["none", "none", "improvement"],
          ["none", "none", "none"],
          ["none", "none", "none"]
        );
        const result = variationIconsToDraw(outliers, settings);
        
        expect(result).toEqual(["improvementHigh"]);
      });
    });

  });

  describe("assuranceIconToDraw() - Assurance Icon Selection", () => {

    // Helper to create minimal control limits object
    function createControlLimits(
      ll99: number[],
      ul99: number[],
      alt_targets?: number[]
    ): controlLimitsObject {
      return {
        ll99: ll99,
        ul99: ul99,
        alt_targets: alt_targets
      } as controlLimitsObject;
    }

    // Helper to create minimal settings
    function createSettings(improvement_direction: string): defaultSettingsType {
      return {
        outliers: {
          improvement_direction: improvement_direction
        }
      } as defaultSettingsType;
    }

    // Helper to create derived settings
    function createDerivedSettings(has_control_limits: boolean): derivedSettingsClass {
      return {
        chart_type_props: {
          has_control_limits: has_control_limits
        }
      } as derivedSettingsClass;
    }

    describe("Chart types without control limits", () => {
      it("should return none for charts without control limits", () => {
        const controlLimits = createControlLimits([5, 5, 5], [15, 15, 15]);
        const settings = createSettings("increase");
        const derivedSettings = createDerivedSettings(false);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("none");
      });
    });

    describe("No alternative target scenarios", () => {
      const derivedSettings = createDerivedSettings(true);

      it("should return none when alt_targets is undefined", () => {
        const controlLimits = createControlLimits([5, 5, 5], [15, 15, 15]);
        const settings = createSettings("increase");
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("none");
      });

      it("should return none when last alt_target is null", () => {
        const controlLimits = createControlLimits([5, 5, 5], [15, 15, 15], [10, 10, null as any]);
        const settings = createSettings("increase");
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("none");
      });

      it("should return none when last alt_target is undefined", () => {
        const controlLimits = createControlLimits([5, 5, 5], [15, 15, 15], [10, 10, undefined as any]);
        const settings = createSettings("increase");
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("none");
      });
    });

    describe("Neutral improvement direction", () => {
      const derivedSettings = createDerivedSettings(true);
      const settings = createSettings("neutral");

      it("should return none when improvement direction is neutral", () => {
        const controlLimits = createControlLimits([5, 5, 5], [15, 15, 15], [10, 10, 20]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("none");
      });
    });

    describe("Improvement direction: increase", () => {
      const derivedSettings = createDerivedSettings(true);
      const settings = createSettings("increase");

      it("should return consistentPass when target is below lower limit", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [5, 5, 5]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("consistentPass");
      });

      it("should return consistentFail when target is above upper limit", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [25, 25, 25]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("consistentFail");
      });

      it("should return inconsistent when target is between limits", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [15, 15, 15]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("inconsistent");
      });

      it("should use only the last point for comparison", () => {
        // Target changes over time, but only last value matters
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [25, 15, 5]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        // Last target (5) is below last ll99 (10), so consistentPass
        expect(result).toBe("consistentPass");
      });

      it("should handle target exactly on lower limit as inconsistent", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [10, 10, 10]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("inconsistent");
      });

      it("should handle target exactly on upper limit as inconsistent", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [20, 20, 20]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("inconsistent");
      });
    });

    describe("Improvement direction: decrease", () => {
      const derivedSettings = createDerivedSettings(true);
      const settings = createSettings("decrease");

      it("should return consistentFail when target is below lower limit", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [5, 5, 5]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        // For decrease, lower is worse, so consistentFail
        expect(result).toBe("consistentFail");
      });

      it("should return consistentPass when target is above upper limit", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [25, 25, 25]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        // For decrease, higher is better, so consistentPass
        expect(result).toBe("consistentPass");
      });

      it("should return inconsistent when target is between limits", () => {
        const controlLimits = createControlLimits([10, 10, 10], [20, 20, 20], [15, 15, 15]);
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("inconsistent");
      });
    });

    describe("Edge cases", () => {
      const derivedSettings = createDerivedSettings(true);

      it("should handle negative limits and targets", () => {
        const controlLimits = createControlLimits([-20, -20, -20], [-10, -10, -10], [-25, -25, -25]);
        const settings = createSettings("increase");
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        // Target (-25) is below ll99 (-20), so consistentPass for increase
        expect(result).toBe("consistentPass");
      });

      it("should handle single point", () => {
        const controlLimits = createControlLimits([10], [20], [15]);
        const settings = createSettings("increase");
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        expect(result).toBe("inconsistent");
      });

      it("should handle varying limits over time", () => {
        const controlLimits = createControlLimits([5, 10, 15], [15, 20, 25], [10, 10, 30]);
        const settings = createSettings("increase");
        
        const result = assuranceIconToDraw(controlLimits, settings, derivedSettings);
        
        // Last target (30) is above last ul99 (25), so consistentFail
        expect(result).toBe("consistentFail");
      });
    });

  });

});
