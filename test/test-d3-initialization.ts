/**
 * Test Suite: D3 Initialization Functions
 * 
 * This test suite validates the SVG initialization functions that set up
 * the basic structure for rendering the SPC chart and NHS icons.
 * 
 * Functions tested:
 * - initialiseSVG: Creates the main SVG structure with groups for axes, lines, dots
 * - initialiseIconSVG: Sets up SVG structure for NHS icons with filters and clipping
 * - iconTransformSpec: Calculates positioning transform for icons
 */

import * as d3 from "../src/D3 Plotting Functions/D3 Modules";
import initialiseSVG from "../src/D3 Plotting Functions/initialiseSVG";
import initialiseIconSVG, { iconTransformSpec } from "../src/D3 Plotting Functions/initialiseIconSVG";
import type { svgBaseType } from "../src/visual";

describe("initialiseSVG", () => {
  let svg: svgBaseType;

  beforeEach(() => {
    // Create a fresh SVG element for each test
    svg = d3.select("body").append("svg") as svgBaseType;
  });

  afterEach(() => {
    // Clean up after each test
    svg.remove();
  });

  it("should create all required SVG groups and elements", () => {
    initialiseSVG(svg, false);

    // Verify all required elements are created
    expect(svg.select(".ttip-line-x").empty()).toBe(false);
    expect(svg.select(".ttip-line-y").empty()).toBe(false);
    expect(svg.select(".xaxisgroup").empty()).toBe(false);
    expect(svg.select(".xaxislabel").empty()).toBe(false);
    expect(svg.select(".yaxisgroup").empty()).toBe(false);
    expect(svg.select(".yaxislabel").empty()).toBe(false);
    expect(svg.select(".linesgroup").empty()).toBe(false);
    expect(svg.select(".dotsgroup").empty()).toBe(false);
  });

  it("should create tooltip lines as line elements", () => {
    initialiseSVG(svg, false);

    const ttipLineX = svg.select(".ttip-line-x");
    const ttipLineY = svg.select(".ttip-line-y");

    expect((ttipLineX.node() as Element).tagName).toBe("line");
    expect((ttipLineY.node() as Element).tagName).toBe("line");
  });

  it("should create axis groups as g elements", () => {
    initialiseSVG(svg, false);

    const xAxisGroup = svg.select(".xaxisgroup");
    const yAxisGroup = svg.select(".yaxisgroup");

    expect((xAxisGroup.node() as Element).tagName).toBe("g");
    expect((yAxisGroup.node() as Element).tagName).toBe("g");
  });

  it("should create axis labels as text elements", () => {
    initialiseSVG(svg, false);

    const xAxisLabel = svg.select(".xaxislabel");
    const yAxisLabel = svg.select(".yaxislabel");

    expect((xAxisLabel.node() as Element).tagName).toBe("text");
    expect((yAxisLabel.node() as Element).tagName).toBe("text");
  });

  it("should create lines and dots groups as g elements", () => {
    initialiseSVG(svg, false);

    const linesGroup = svg.select(".linesgroup");
    const dotsGroup = svg.select(".dotsgroup");

    expect((linesGroup.node() as Element).tagName).toBe("g");
    expect((dotsGroup.node() as Element).tagName).toBe("g");
  });

  it("should remove all children when removeAll is true", () => {
    // First add some elements
    svg.append("rect");
    svg.append("circle");
    svg.append("path");

    expect(svg.selectAll("*").size()).toBe(3);

    // Call with removeAll = true
    initialiseSVG(svg, true);

    // Should have 8 new elements (tooltip lines, groups, labels)
    // but no old elements
    expect(svg.selectAll("rect").size()).toBe(0);
    expect(svg.selectAll("circle").size()).toBe(0);
    expect(svg.selectAll("path").size()).toBe(0);
    expect(svg.selectAll("*").size()).toBe(8);
  });

  it("should preserve existing children when removeAll is false", () => {
    // First add some elements
    svg.append("rect");
    svg.append("circle");

    const initialCount = svg.selectAll("*").size();
    expect(initialCount).toBe(2);

    // Call with removeAll = false
    initialiseSVG(svg, false);

    // Should have old elements + 8 new elements
    const finalCount = svg.selectAll("*").size();
    expect(finalCount).toBe(initialCount + 8);
    expect(svg.selectAll("rect").size()).toBe(1);
    expect(svg.selectAll("circle").size()).toBe(1);
  });

  it("should be idempotent when called multiple times with removeAll=true", () => {
    initialiseSVG(svg, true);
    const firstCount = svg.selectAll("*").size();

    initialiseSVG(svg, true);
    const secondCount = svg.selectAll("*").size();

    expect(firstCount).toBe(secondCount);
    expect(firstCount).toBe(8);
  });
});

describe("iconTransformSpec", () => {
  const svgWidth = 500;
  const svgHeight = 400;
  const scaling = 1.0;

  it("should position icon at top-left for 'Top Left' location", () => {
    const transform = iconTransformSpec(svgWidth, svgHeight, "Top Left", scaling, 0);
    
    expect(transform).toContain("scale(");
    expect(transform).toContain("translate(");
    // For "Top Left", x should be 0 * 378 = 0, y should be 0
    expect(transform).toContain("translate(0,");
  });

  it("should position icon at top-right for 'Top Right' location", () => {
    const transform = iconTransformSpec(svgWidth, svgHeight, "Top Right", scaling, 0);
    
    expect(transform).toContain("scale(");
    expect(transform).toContain("translate(");
    // For "Top Right", x should be negative (svg_width/scaling_factor - 378)
  });

  it("should position icon at bottom-left for 'Bottom Left' location", () => {
    const transform = iconTransformSpec(svgWidth, svgHeight, "Bottom Left", scaling, 0);
    
    expect(transform).toContain("scale(");
    expect(transform).toContain("translate(");
    // For "Bottom Left", x = 0, y should be svg_height/scaling_factor - 378
  });

  it("should position icon at bottom-right for 'Bottom Right' location", () => {
    const transform = iconTransformSpec(svgWidth, svgHeight, "Bottom Right", scaling, 0);
    
    expect(transform).toContain("scale(");
    expect(transform).toContain("translate(");
  });

  it("should position icon at center for 'Centre' location", () => {
    const transform = iconTransformSpec(svgWidth, svgHeight, "Centre", scaling, 0);
    
    expect(transform).toContain("scale(");
    expect(transform).toContain("translate(");
    // Center should use svg_width/2 and svg_height/2 calculations
  });

  it("should adjust position based on icon count", () => {
    const transform0 = iconTransformSpec(svgWidth, svgHeight, "Top Left", scaling, 0);
    const transform1 = iconTransformSpec(svgWidth, svgHeight, "Top Left", scaling, 1);
    const transform2 = iconTransformSpec(svgWidth, svgHeight, "Top Left", scaling, 2);
    
    // Each subsequent icon should be offset by 378 pixels
    expect(transform0).not.toBe(transform1);
    expect(transform1).not.toBe(transform2);
  });

  it("should apply scaling factor correctly", () => {
    const transform1x = iconTransformSpec(svgWidth, svgHeight, "Top Left", 1.0, 0);
    const transform2x = iconTransformSpec(svgWidth, svgHeight, "Top Left", 2.0, 0);
    
    // Different scaling should produce different transforms
    expect(transform1x).not.toBe(transform2x);
    
    // Scaling affects both the scale and translate values
    const scaling1 = 0.08 * (svgHeight / 378) * 1.0;
    const scaling2 = 0.08 * (svgHeight / 378) * 2.0;
    
    expect(transform1x).toContain(`scale(${scaling1})`);
    expect(transform2x).toContain(`scale(${scaling2})`);
  });

  it("should calculate scaling factor based on SVG height", () => {
    const transform400 = iconTransformSpec(svgWidth, 400, "Top Left", scaling, 0);
    const transform800 = iconTransformSpec(svgWidth, 800, "Top Left", scaling, 0);
    
    // Larger height should produce larger scaling factor
    expect(transform400).not.toBe(transform800);
  });
});

describe("initialiseIconSVG", () => {
  let svg: svgBaseType;

  beforeEach(() => {
    svg = d3.select("body").append("svg") as svgBaseType;
  });

  afterEach(() => {
    svg.remove();
  });

  it("should create an icon group with the correct class", () => {
    initialiseIconSVG(svg, "testIcon");

    const iconGroup = svg.select(".icongroup");
    expect(iconGroup.empty()).toBe(false);
    expect((iconGroup.node() as Element).tagName).toBe("g");
  });

  it("should apply transform when transform_spec is provided", () => {
    const transformSpec = "scale(1.0) translate(100, 50)";
    initialiseIconSVG(svg, "testIcon", transformSpec);

    const iconGroup = svg.select(".icongroup");
    expect(iconGroup.attr("transform")).toBe(transformSpec);
  });

  it("should not apply transform when transform_spec is not provided", () => {
    initialiseIconSVG(svg, "testIcon");

    const iconGroup = svg.select(".icongroup");
    expect(iconGroup.attr("transform")).toBeNull();
  });

  it("should create defs element with filter", () => {
    initialiseIconSVG(svg, "testIcon");

    const defs = svg.select("defs");
    expect(defs.empty()).toBe(false);
    
    const filter = defs.select("filter");
    expect(filter.empty()).toBe(false);
    expect(filter.attr("id")).toBe("fx0");
  });

  it("should create filter with correct attributes", () => {
    initialiseIconSVG(svg, "testIcon");

    const filter = svg.select("filter#fx0");
    expect(filter.attr("x")).toBe("-10%");
    expect(filter.attr("y")).toBe("-10%");
    expect(filter.attr("width")).toBe("120%");
    expect(filter.attr("height")).toBe("120%");
    expect(filter.attr("filterUnits")).toBe("userSpaceOnUse");
  });

  it("should create feComponentTransfer with color channels", () => {
    initialiseIconSVG(svg, "testIcon");

    const filter = svg.select("filter#fx0");
    const componentTransfer = filter.select("feComponentTransfer");
    expect(componentTransfer.empty()).toBe(false);
    
    // Check all color channels are created
    expect(filter.select("feFuncR").empty()).toBe(false);
    expect(filter.select("feFuncG").empty()).toBe(false);
    expect(filter.select("feFuncB").empty()).toBe(false);
    expect(filter.select("feFuncA").empty()).toBe(false);
  });

  it("should create feGaussianBlur element", () => {
    initialiseIconSVG(svg, "testIcon");

    const blur = svg.select("feGaussianBlur");
    expect(blur.empty()).toBe(false);
    expect(blur.attr("stdDeviation")).toBe("1.77778 1.77778");
  });

  it("should create three clipPath elements", () => {
    initialiseIconSVG(svg, "testIcon");

    const clipPaths = svg.selectAll("clipPath");
    expect(clipPaths.size()).toBe(3);
    
    expect(svg.select("clipPath#clip1").empty()).toBe(false);
    expect(svg.select("clipPath#clip2").empty()).toBe(false);
    expect(svg.select("clipPath#clip3").empty()).toBe(false);
  });

  it("should create clip1 with rect element", () => {
    initialiseIconSVG(svg, "testIcon");

    const clip1 = svg.select("clipPath#clip1");
    const rect = clip1.select("rect");
    
    expect(rect.empty()).toBe(false);
    expect(rect.attr("x")).toBe("0");
    expect(rect.attr("y")).toBe("0");
    expect(rect.attr("width")).toBe("378");
    expect(rect.attr("height")).toBe("378");
  });

  it("should create clip2 with path element", () => {
    initialiseIconSVG(svg, "testIcon");

    const clip2 = svg.select("clipPath#clip2");
    const path = clip2.select("path");
    
    expect(path.empty()).toBe(false);
    expect(path.attr("d")).toContain("M189 38C105.605");
    expect(path.attr("fill-rule")).toBe("evenodd");
    expect(path.attr("clip-rule")).toBe("evenodd");
  });

  it("should create clip3 with rect element", () => {
    initialiseIconSVG(svg, "testIcon");

    const clip3 = svg.select("clipPath#clip3");
    const rect = clip3.select("rect");
    
    expect(rect.empty()).toBe(false);
    expect(rect.attr("x")).toBe("-2");
    expect(rect.attr("y")).toBe("-2");
    expect(rect.attr("width")).toBe("346");
    expect(rect.attr("height")).toBe("346");
  });

  it("should create icon-specific group with correct class", () => {
    initialiseIconSVG(svg, "commonCause");

    const iconSpecificGroup = svg.select(".commonCause");
    expect(iconSpecificGroup.empty()).toBe(false);
    expect(iconSpecificGroup.attr("clip-path")).toBe("url(#clip1)");
  });

  it("should create white background rect in icon group", () => {
    initialiseIconSVG(svg, "testIcon");

    const iconGroup = svg.select(".testIcon");
    const rect = iconGroup.select("rect");
    
    expect(rect.empty()).toBe(false);
    expect(rect.attr("x")).toBe("0");
    expect(rect.attr("y")).toBe("0");
    expect(rect.attr("width")).toBe("378");
    expect(rect.attr("height")).toBe("378");
    expect(rect.attr("fill")).toBe("#FFFFFF");
  });

  it("should handle multiple icon initializations", () => {
    initialiseIconSVG(svg, "icon1");
    initialiseIconSVG(svg, "icon2");
    initialiseIconSVG(svg, "icon3");

    const iconGroups = svg.selectAll(".icongroup");
    expect(iconGroups.size()).toBe(3);
    
    expect(svg.select(".icon1").empty()).toBe(false);
    expect(svg.select(".icon2").empty()).toBe(false);
    expect(svg.select(".icon3").empty()).toBe(false);
  });
});
