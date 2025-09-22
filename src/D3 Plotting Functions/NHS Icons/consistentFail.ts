import type { svgBaseType } from "../../visual"

/**
 * Inline function to be called by D3 for rendering the Assurance - Fail icon.
 * The code below is a translation from HTML to D3 syntax of the SVG file:
 * https://github.com/nhs-r-community/NHSRplotthedots/blob/main/inst/icons/assurance/fail.svg
 *
 * This function does not return a value, it is meant to be called as part of chaining D3 syntax
 *
 * @param selection The D3 parent object to which the icon's SVG code will be added
 */
export default function consistentFail(selection: svgBaseType): void {
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
            .attr("stroke","#FF6600")
            .attr("stroke-width","21")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
            .attr("stroke","#FF6600")
            .attr("stroke-width","20")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("text")
            .attr("fill", "#FF6600")
            .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
            .attr("font-weight", "700")
            .attr("font-size", "11.7")
            .attr("transform","translate(155.851 158) scale(10, 10)")
            .text("F")

  selection.append("path")
            .attr("d","M38.5001 185.5 340.862 185.5")
            .attr("stroke","#FF6600")
            .attr("stroke-width","8.66667")
            .attr("stroke-miterlimit","8")
            .attr("stroke-dasharray","26 8.66667")
            .attr("fill","none")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M72.5001 238.762C89.0456 218.168 107.725 200.801 129.638 200.507 152.134 201.459 176.57 238.689 192.563 241.313 206.31 244.118 205.897 217.733 212.814 216.659 217.563 215.414 220.151 238.182 233.066 240.463 248.557 243.786 291.62 234.385 302.5 236.212")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","10.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","none")
            .attr("fill-rule","evenodd")
}
