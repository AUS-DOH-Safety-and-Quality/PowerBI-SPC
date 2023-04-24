import * as d3 from "d3";
import * as iconSVG from "../Icons"
type SelectionBase = d3.Selection<SVGGElement, unknown, null, undefined>;

class svgIconClass {
  iconGroup: SelectionBase;

  initialiseSVG(scaling_factor: number, offset: number, count: number): SelectionBase {
    let scale: string = "scale(" + scaling_factor + ")"
    let translate: string = "translate(" + count * (offset / scaling_factor) + ", 0)"
    let icon_group = this.iconGroup.append('g')
                                    .classed("icongroup", true)
                                    .attr("transform", scale + " " + translate)
    let icon_defs = icon_group.append("defs")
    let icon_defs_filter = icon_defs.append("filter")
                                    .attr("id", "fx0")
                                    .attr("x", "-10%")
                                    .attr("y", "-10%")
                                    .attr("width", "120%")
                                    .attr("height", "120%")
                                    .attr("filterUnits", "userSpaceOnUse")
                                    .attr("userSpaceOnUse", "userSpaceOnUse")
    let icon_comptrans = icon_defs_filter.append("feComponentTransfer")
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

    let icon_svg = icon_group.append("g")
                              .attr("clip-path","url(#clip1)")

    icon_svg.append("rect")
              .attr("x","0")
              .attr("y","0")
              .attr("width","378")
              .attr("height","378")
              .attr("fill","#FFFFFF")
    return icon_svg
  }

  drawIcons(svg_height: number): void {
    d3.selectAll(".icongroup").remove()
    let scaling_factor: number = 0.08 * (svg_height / 378)
    let offset: number = scaling_factor * 378

    let toDraw: string[] = ["commonCause", "commonCause"]
    toDraw.forEach((icon: string, idx: number) => {
      let icon_g: SelectionBase = this.initialiseSVG(scaling_factor, offset, idx)
      icon_g.call(iconSVG[icon as keyof typeof iconSVG])
    })
  }

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.iconGroup = svg.append("g");
  }
}
export default svgIconClass
