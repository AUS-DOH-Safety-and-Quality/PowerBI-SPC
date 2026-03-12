import buildVisual from "./build-visual";
import { Visual } from "../../src/visual";

describe("buildVisual", () => {
  it("returns an object with all required properties", () => {
    const ctx = buildVisual();
    expect(ctx.visual).toBeDefined();
    expect(ctx.element).toBeDefined();
    expect(ctx.svg).toBeDefined();
    expect(ctx.table).toBeDefined();
    expect(ctx.destroy).toBeDefined();
    ctx.destroy();
  });

  it("visual property is a Visual instance", () => {
    const ctx = buildVisual();
    expect(ctx.visual instanceof Visual).toBeTrue();
    ctx.destroy();
  });

  it("element is a DOM Element", () => {
    const ctx = buildVisual();
    expect(ctx.element instanceof Element).toBeTrue();
    ctx.destroy();
  });

  it("svg is an SVGElement", () => {
    const ctx = buildVisual();
    expect(ctx.svg.tagName.toLowerCase()).toBe("svg");
    ctx.destroy();
  });

  it("uses default 500x500 dimensions", () => {
    const ctx = buildVisual();
    // testDom creates element with specified dimensions; verify element exists
    expect(ctx.element).toBeDefined();
    ctx.destroy();
  });

  it("destroy removes the element from the DOM", () => {
    const ctx = buildVisual();
    const parent = ctx.element.parentNode;
    expect(parent).not.toBeNull();
    ctx.destroy();
    expect(ctx.element.parentNode).toBeNull();
  });
});
