import type { svgBaseType } from "../../visual"

/**
 * Inline function to be called by D3 for rendering the Variation - Improvement Low icon.
 * The code below is a translation from HTML to D3 syntax of the SVG file:
 * https://github.com/nhs-r-community/NHSRplotthedots/blob/main/inst/icons/variation/improvement_low.svg
 *
 * This function does not return a value, it is meant to be called as part of chaining D3 syntax
 *
 * @param selection The D3 parent object to which the icon's SVG code will be added
 */
export default function improvementLow(selection: svgBaseType): void {
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
            .attr("stroke","#0072C6")
            .attr("stroke-width","21")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
            .attr("stroke","#0072C6")
            .attr("stroke-width","20")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("text")
            .attr("fill", "#0072C6")
            .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
            .attr("font-weight", "700")
            .attr("font-size", "117")
            .attr("transform","translate(106.228 292)")
            .text("L")

  selection.append("path")
            .attr("d","M95.4025 162.857 141.063 143.281 144.597 151.525 98.9371 171.101Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M149.897 145.496 193.618 169.089 189.358 176.983 145.638 153.39Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M199.882 171.677 235.443 206.367 229.18 212.788 193.618 178.098Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

 selection.append("path")
            .attr("d","M238.113 209.566 284.671 192.233 287.8 200.639 241.243 217.972Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M76.5001 168.5C76.5001 156.902 85.6782 147.5 97.0001 147.5 108.322 147.5 117.5 156.902 117.5 168.5 117.5 180.098 108.322 189.5 97.0001 189.5 85.6782 189.5 76.5001 180.098 76.5001 168.5Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M123.5 150C123.5 138.678 132.678 129.5 144 129.5 155.322 129.5 164.5 138.678 164.5 150 164.5 161.322 155.322 170.5 144 170.5 132.678 170.5 123.5 161.322 123.5 150Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M170.5 168.5C170.5 156.902 179.902 147.5 191.5 147.5 203.098 147.5 212.5 156.902 212.5 168.5 212.5 180.098 203.098 189.5 191.5 189.5 179.902 189.5 170.5 180.098 170.5 168.5Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M217.5 214C217.5 202.678 226.902 193.5 238.5 193.5 250.098 193.5 259.5 202.678 259.5 214 259.5 225.322 250.098 234.5 238.5 234.5 226.902 234.5 217.5 225.322 217.5 214Z")
            .attr("stroke","#0072C6")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#0072C6")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M265.5 199C265.5 187.678 274.678 178.5 286 178.5 297.322 178.5 306.5 187.678 306.5 199 306.5 210.322 297.322 219.5 286 219.5 274.678 219.5 265.5 210.322 265.5 199Z")
            .attr("stroke","#0072C6")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#0072C6")
            .attr("fill-rule","evenodd")
}
