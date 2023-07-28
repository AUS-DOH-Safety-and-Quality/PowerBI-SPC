import { type svgBaseType } from "../../visual"

/**
 * Inline function to be called by D3 for rendering the Assurance - Iconsistent icon.
 * The code below is a translation from HTML to D3 syntax of the SVG file:
 * https://github.com/nhs-r-community/NHSRplotthedots/blob/main/inst/icons/assurance/inconsistent.svg
 *
 * This function does not return a value, it is meant to be called as part of chaining D3 syntax
 *
 * @param selection The D3 parent object to which the icon's SVG code will be added
 */
export default function inconsistent(selection: svgBaseType): void {
  selection.append("g")
            .attr("clip-path","url(#clip2)")
            .append("g")
            .attr("clip-path","url(#clip3)")
            .attr("filter","url(#fx0)")
            .attr("transform","translate(16 25)")
            .append("g")
            .attr("clip-path","url(#clip4)")
            .append("path")
            .attr("d","M17.47 173.345C17.47 87.1637 87.1031 17.3 173 17.3 258.897 17.3 328.53 87.1637 328.53 173.345 328.53 259.526 258.897 329.39 173 329.39 87.1031 329.39 17.47 259.526 17.47 173.345Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","21")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M38 189.5C38 105.829 105.605 38 189 38 272.395 38 340 105.829 340 189.5 340 273.171 272.395 341 189 341 105.605 341 38 273.171 38 189.5Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","20")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("text")
            .attr("fill", "#7F7F7F")
            .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
            .attr("font-weight", "700")
            .attr("font-size", "117")
            .attr("transform","translate(155.851 158)")
            .text("?")

  selection.append("path")
            .attr("d","M38.5001 222.5 340.862 222.5")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","8.66667")
            .attr("stroke-miterlimit","8")
            .attr("stroke-dasharray","26 8.66667")
            .attr("fill","none")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M72.5001 239.762C89.0456 219.168 107.725 201.801 129.638 201.507 152.134 202.459 176.57 239.689 192.563 242.313 206.31 245.118 205.897 218.733 212.814 217.659 217.563 216.414 220.151 239.182 233.066 241.463 248.557 244.786 291.62 235.385 302.5 237.212")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","10.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","none")
            .attr("fill-rule","evenodd")
}
