import * as d3 from "d3";

type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

/**
 * This method initialises a plotting space for rendering a given NHS SVG icon.
 * The method uses the current number of the icon (i.e., whether it's the first,
 * second, etc.) to appropriately place the plotting space.
 *
 * This method is intended to be called inline, followed by a call to the appropriate
 * icon rendering function from the "Icons" folder.
 *
 */
export default function initialiseIconSVG(selection: SelectionBase, icon_name: string, svg_width: number, svg_height: number, location: string, scaling: number, count: number): void {
  const scaling_factor: number = (0.08 * (svg_height / 378)) * scaling
  const scale: string = `scale(${scaling_factor})`
  const icon_x: number = location.includes("Right")
                          ? (svg_width / scaling_factor) - (378 + (count * 378))
                          : (count * 378);
  const icon_y: number = location.includes("Bottom")
                          ? (svg_height / scaling_factor) - 378
                          : 0;

  const icon_group = selection.append('g')
                                  .classed("icongroup", true)
                                  .attr("transform", `${scale} translate(${icon_x}, ${icon_y})`)

  const icon_defs = icon_group.append("defs")
  const icon_defs_filter = icon_defs.append("filter")
                                  .attr("id", "fx0")
                                  .attr("x", "-10%")
                                  .attr("y", "-10%")
                                  .attr("width", "120%")
                                  .attr("height", "120%")
                                  .attr("filterUnits", "userSpaceOnUse")
                                  .attr("userSpaceOnUse", "userSpaceOnUse")
  const icon_comptrans = icon_defs_filter.append("feComponentTransfer")
                                        .attr("color-interpolation-filters","sRGB")
  icon_comptrans.append("feFuncR")
                .attr("type","discrete")
                .attr("tableValues","0 0")
  icon_comptrans.append("feFuncG")
                .attr("type","discrete")
                .attr("tableValues","0 0")
  icon_comptrans.append("feFuncB")
                .attr("type","discrete")
                .attr("tableValues","0 0")
  icon_comptrans.append("feFuncA")
                .attr("type","linear")
                .attr("slope","0.4")
                .attr("intercept","0")

  icon_defs_filter.append("feGaussianBlur")
                  .attr("stdDeviation", "1.77778 1.77778")

  icon_defs.append("clipPath")
            .attr("id", "clip1")
            .append("rect")
            .attr("x","0")
            .attr("y","0")
            .attr("width","378")
            .attr("height","378")

  icon_defs.append("clipPath")
            .attr("id", "clip2")
            .append("path")
            .attr("d","M189 38C105.605 38 38 105.605 38 189 38 272.395 105.605 340 189 340 272.395 340 340 272.395 340 189 340 105.605 272.395 38 189 38ZM5.63264e-06 5.63264e-06 378 5.63264e-06 378 378 5.63264e-06 378Z")
            .attr("fill-rule","evenodd")
            .attr("clip-rule","evenodd")

  icon_defs.append("clipPath")
            .attr("id", "clip3")
            .append("rect")
            .attr("x","-2")
            .attr("y","-2")
            .attr("width","346")
            .attr("height","346")

  icon_group.append("g")
            .classed(icon_name, true)
            .attr("clip-path","url(#clip1)")
            .append("rect")
            .attr("x","0")
            .attr("y","0")
            .attr("width","378")
            .attr("height","378")
            .attr("fill","#FFFFFF")
}
