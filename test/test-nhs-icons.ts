/**
 * Test Suite: NHS Icons SVG Rendering
 * 
 * This test suite validates that all NHS icons render correctly with proper
 * SVG structure and attributes.
 * 
 * Icons tested:
 * - Variation icons: commonCause, concernHigh, concernLow, improvementHigh, improvementLow, neutralHigh, neutralLow
 * - Assurance icons: consistentFail, consistentPass, inconsistent
 */

import * as d3 from "../src/D3 Plotting Functions/D3 Modules";
import * as nhsIcons from "../src/D3 Plotting Functions/NHS Icons";
import type { svgBaseType } from "../src/visual";

describe("NHS Icons", () => {
  let svg: svgBaseType;

  beforeEach(() => {
    // Create a fresh SVG element for each test
    svg = d3.select("body").append("svg") as svgBaseType;
  });

  afterEach(() => {
    // Clean up after each test
    svg.remove();
  });

  describe("Variation Icons", () => {
    it("should render commonCause icon with expected SVG elements", () => {
      nhsIcons.commonCause(svg);

      // Common cause icon should have paths and circles
      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
      
      // Check that at least one path has the expected fill color
      let hasGreyFill = false;
      paths.each(function() {
        const fill = d3.select(this).attr("fill");
        if (fill === "#A6A6A6" || fill === "#FFFFFF") {
          hasGreyFill = true;
        }
      });
      expect(hasGreyFill).toBe(true);
    });

    it("should render concernHigh icon with expected SVG elements", () => {
      nhsIcons.concernHigh(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render concernLow icon with expected SVG elements", () => {
      nhsIcons.concernLow(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render improvementHigh icon with expected SVG elements", () => {
      nhsIcons.improvementHigh(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render improvementLow icon with expected SVG elements", () => {
      nhsIcons.improvementLow(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render neutralHigh icon with expected SVG elements", () => {
      nhsIcons.neutralHigh(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render neutralLow icon with expected SVG elements", () => {
      nhsIcons.neutralLow(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });
  });

  describe("Assurance Icons", () => {
    it("should render consistentFail icon with expected SVG elements", () => {
      nhsIcons.consistentFail(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render consistentPass icon with expected SVG elements", () => {
      nhsIcons.consistentPass(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });

    it("should render inconsistent icon with expected SVG elements", () => {
      nhsIcons.inconsistent(svg);

      const paths = svg.selectAll("path");
      expect(paths.size()).toBeGreaterThan(0);
    });
  });

  describe("Icon Structure Validation", () => {
    it("should render commonCause with circular outer ring", () => {
      nhsIcons.commonCause(svg);

      // Check for circular path with expected attributes
      const paths = svg.selectAll("path");
      let hasCircularPath = false;
      
      paths.each(function() {
        const d = d3.select(this).attr("d");
        // Check if path definition contains circular elements (C commands for curves)
        if (d && d.includes("C") && d.includes("189")) {
          hasCircularPath = true;
        }
      });
      
      expect(hasCircularPath).toBe(true);
    });

    it("should apply stroke attributes correctly", () => {
      nhsIcons.commonCause(svg);

      const paths = svg.selectAll("path");
      let hasStrokedPath = false;
      
      paths.each(function() {
        const stroke = d3.select(this).attr("stroke");
        if (stroke) {
          hasStrokedPath = true;
        }
      });
      
      expect(hasStrokedPath).toBe(true);
    });

    it("should apply fill attributes correctly", () => {
      nhsIcons.commonCause(svg);

      const paths = svg.selectAll("path");
      let hasFilledPath = false;
      
      paths.each(function() {
        const fill = d3.select(this).attr("fill");
        if (fill) {
          hasFilledPath = true;
        }
      });
      
      expect(hasFilledPath).toBe(true);
    });

    it("should render multiple icons without conflict", () => {
      nhsIcons.commonCause(svg);
      const firstIconPaths = svg.selectAll("path").size();

      nhsIcons.improvementHigh(svg);
      const secondIconPaths = svg.selectAll("path").size();

      // Second icon should add more paths
      expect(secondIconPaths).toBeGreaterThan(firstIconPaths);
    });
  });

  describe("Icon Dimensions", () => {
    it("should use consistent coordinate system (378x378)", () => {
      nhsIcons.commonCause(svg);

      // Check that path coordinates are within expected range
      const paths = svg.selectAll("path");
      let hasValidCoordinates = false;
      
      paths.each(function() {
        const d = d3.select(this).attr("d");
        // Check if coordinates reference values around 378 (icon viewBox size)
        if (d && (d.includes("378") || d.includes("189"))) { // 189 is center
          hasValidCoordinates = true;
        }
      });
      
      expect(hasValidCoordinates).toBe(true);
    });

    it("should use proper stroke widths", () => {
      nhsIcons.commonCause(svg);

      const paths = svg.selectAll("path");
      let hasValidStrokeWidth = false;
      
      paths.each(function() {
        const strokeWidth = d3.select(this).attr("stroke-width");
        if (strokeWidth && parseFloat(strokeWidth) > 0) {
          hasValidStrokeWidth = true;
        }
      });
      
      expect(hasValidStrokeWidth).toBe(true);
    });
  });

  describe("Icon Colors", () => {
    it("should use appropriate variation colors for common cause (grey)", () => {
      nhsIcons.commonCause(svg);

      const paths = svg.selectAll("path");
      let hasGreyColor = false;
      
      paths.each(function() {
        const fill = d3.select(this).attr("fill");
        const stroke = d3.select(this).attr("stroke");
        if (fill === "#A6A6A6" || stroke === "#A6A6A6") {
          hasGreyColor = true;
        }
      });
      
      expect(hasGreyColor).toBe(true);
    });

    it("should use white background for icons", () => {
      nhsIcons.commonCause(svg);

      const paths = svg.selectAll("path");
      let hasWhiteFill = false;
      
      paths.each(function() {
        const fill = d3.select(this).attr("fill");
        if (fill === "#FFFFFF") {
          hasWhiteFill = true;
        }
      });
      
      expect(hasWhiteFill).toBe(true);
    });
  });

  describe("Icon Export Validation", () => {
    it("should export all variation icons", () => {
      expect(typeof nhsIcons.commonCause).toBe("function");
      expect(typeof nhsIcons.concernHigh).toBe("function");
      expect(typeof nhsIcons.concernLow).toBe("function");
      expect(typeof nhsIcons.improvementHigh).toBe("function");
      expect(typeof nhsIcons.improvementLow).toBe("function");
      expect(typeof nhsIcons.neutralHigh).toBe("function");
      expect(typeof nhsIcons.neutralLow).toBe("function");
    });

    it("should export all assurance icons", () => {
      expect(typeof nhsIcons.consistentFail).toBe("function");
      expect(typeof nhsIcons.consistentPass).toBe("function");
      expect(typeof nhsIcons.inconsistent).toBe("function");
    });

    it("should export exactly 10 icon functions", () => {
      const iconKeys = Object.keys(nhsIcons);
      // Should have 7 variation + 3 assurance = 10 icons
      expect(iconKeys.length).toBe(10);
    });
  });
});
