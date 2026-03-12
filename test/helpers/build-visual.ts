import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";

export type VisualTestContext = {
  visual: Visual;
  element: Element;
  svg: Element;
  table: Element;
  destroy: () => void;
};

/**
 * Creates a Visual instance with associated DOM elements for testing.
 * Encapsulates the boilerplate of testDom + Visual constructor + DOM queries.
 *
 * @param width - Viewport width in pixels (default: 500).
 * @param height - Viewport height in pixels (default: 500).
 * @returns A VisualTestContext with the visual, DOM elements, and a destroy cleanup function.
 */
export default function buildVisual(width: number = 500, height: number = 500): VisualTestContext {
  const element = testDom(String(width), String(height));
  const visual = new Visual({
    element: element,
    host: createVisualHost({})
  });
  const visualClassElement = document.body.querySelector('.visual') as Element;
  const svgElement = visualClassElement.querySelector('svg') as Element;
  const tableDivElement = visualClassElement.querySelector('div') as Element;

  return {
    visual: visual,
    element: element,
    svg: svgElement,
    table: tableDivElement,
    destroy: () => element.remove()
  };
}
