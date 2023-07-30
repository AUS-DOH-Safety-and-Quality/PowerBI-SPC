import type { svgBaseType } from "../../visual"

/**
 * Inline function to be called by D3 for rendering the Variation - Neutral Low icon.
 * The code below is a translation from HTML to D3 syntax of the SVG file:
 * https://github.com/nhs-r-community/NHSRplotthedots/blob/main/inst/icons/variation/neutral_low.svg
 *
 * This function does not return a value, it is meant to called as part of chaining D3 syntax
 *
 * @param selection The D3 parent object to which the icon's SVG code will be added
 */
export default function neutralLow(selection: svgBaseType): void {
  selection.append("g")
            .attr("clip-path","url(#clip2)")
            .append("g")
            .attr("clip-path","url(#clip3)")
            .attr("filter","url(#fx0)")
            .attr("transform","translate(16 25)")
            .append("g")
            .attr("clip-path","url(#clip4)")
            .append("path")
            .attr("d","M17.47 172.83C17.47 86.9332 87.1031 17.3 173 17.3 258.897 17.3 328.53 86.9332 328.53 172.83 328.53 258.727 258.897 328.36 173 328.36 87.1031 328.36 17.47 258.727 17.47 172.83Z")
            .attr("stroke","#8000C0")
            .attr("stroke-width","21")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
            .attr("stroke","#8000C0")
            .attr("stroke-width","20")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M135.708 103.652 212.075 180.02 240.359 151.735 258.273 258.273 151.735 240.359 180.02 212.075 103.652 135.708Z")
            .attr("fill","#8000C0")
            .attr("fill-rule","evenodd")
}
