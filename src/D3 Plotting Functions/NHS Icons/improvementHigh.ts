import type { svgBaseType } from "../../visual"

/**
 * Inline function to be called by D3 for rendering the Variation - Improvement High icon.
 * The code below is a translation from HTML to D3 syntax of the SVG file:
 * https://github.com/nhs-r-community/NHSRplotthedots/blob/main/inst/icons/variation/improvement_high.svg
 *
 * This function does not return a value, it is meant to be called as part of chaining D3 syntax
 *
 * @param selection The D3 parent object to which the icon's SVG code will be added
 */

// ESLint errors due to number of lines in function, but would reduce readability to separate further

export default function improvementHigh(selection: svgBaseType): void {
  selection.append("g")
            .attr("clip-path","url(#clip2)")
            .append("g")
            .attr("clip-path","url(#clip3)")
            .attr("filter","url(#fx0)")
            .attr("transform","translate(16 25)")
            .append("g")
            .attr("clip-path","url(#clip4)")
            .append("path")
            .attr("d","M0 155.53C-1.9801e-14 69.6331 69.6331-1.9801e-14 155.53-3.96021e-14 241.427-7.92042e-14 311.06 69.6331 311.06 155.53 311.06 241.427 241.427 311.06 155.53 311.06 69.6331 311.06-9.90052e-14 241.427 0 155.53Z")
            .attr("stroke","#00B0F0")
            .attr("stroke-width","21")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 17.47 328.36)")

  selection.append("path")
            .attr("d","M0 151C-1.92243e-14 67.605 67.605-1.92243e-14 151-3.84486e-14 234.395-7.68973e-14 302 67.605 302 151 302 234.395 234.395 302 151 302 67.605 302-9.61216e-14 234.395 0 151Z")
            .attr("stroke","#00B0F0")
            .attr("stroke-width","20")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 38 340)")

  selection.append("text")
            .attr("fill", "#00B0F0")
            .attr("font-family", "Arial,Arial_MSFontService,sans-serif")
            .attr("font-weight", "700")
            .attr("font-size", "11.7")
            .attr("transform","translate(106.228 172) scale(10, 10)")
            .text("H")

  selection.append("rect")
            .attr("x","0")
            .attr("y","0")
            .attr("width","49.6797")
            .attr("height","8.97008")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("transform","matrix(0.919094 0.394039 0.394039 -0.919094 95.4025 215.096)")

  selection.append("rect")
            .attr("x","0")
            .attr("y","0")
            .attr("width","49.6797")
            .attr("height","8.97008")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("transform","matrix(0.880045 -0.47489 -0.47489 -0.880045 149.897 232.457)")

  selection.append("rect")
            .attr("x","0")
            .attr("y","0")
            .attr("width","49.6797")
            .attr("height","8.97008")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("transform","matrix(0.715824 -0.698281 -0.698281 -0.715824 199.882 206.276)")

  selection.append("rect")
            .attr("x","0")
            .attr("y","0")
            .attr("width","49.6797")
            .attr("height","8.97008")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("transform","matrix(0.937161 0.348898 0.348898 -0.937161 238.113 168.387)")

  selection.append("path")
            .attr("d","M0 21C-2.60992e-15 9.40202 9.17816-2.67358e-15 20.5-5.34716e-15 31.8218-1.06943e-14 41 9.40202 41 21 41 32.598 31.8218 42 20.5 42 9.17816 42-1.30496e-14 32.598 0 21Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 76.5001 231.5)")

  selection.append("path")
            .attr("d","M0 20.5C-2.60992e-15 9.17816 9.17816-2.60992e-15 20.5-5.21985e-15 31.8218-1.04397e-14 41 9.17816 41 20.5 41 31.8218 31.8218 41 20.5 41 9.17816 41-1.30496e-14 31.8218 0 20.5Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 123.5 249.5)")

  selection.append("path")
            .attr("d","M0 21C-2.67358e-15 9.40202 9.40202-2.67358e-15 21-5.34716e-15 32.598-1.06943e-14 42 9.40202 42 21 42 32.598 32.598 42 21 42 9.40202 42-1.33679e-14 32.598 0 21Z")
            .attr("stroke","#7F7F7F")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#7F7F7F")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 170.5 231.5)")

  selection.append("path")
            .attr("d","M0 20.5C-2.67358e-15 9.17816 9.40202-2.60992e-15 21-5.21985e-15 32.598-1.04397e-14 42 9.17816 42 20.5 42 31.8218 32.598 41 21 41 9.40202 41-1.33679e-14 31.8218 0 20.5Z")
            .attr("stroke","#00B0F0")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#00B0F0")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 217.5 185.5)")

  selection.append("path")
            .attr("d","M0 20.5C-2.60992e-15 9.17816 9.17816-2.60992e-15 20.5-5.21985e-15 31.8218-1.04397e-14 41 9.17816 41 20.5 41 31.8218 31.8218 41 20.5 41 9.17816 41-1.30496e-14 31.8218 0 20.5Z")
            .attr("stroke","#00B0F0")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#00B0F0")
            .attr("fill-rule","evenodd")
            .attr("transform","matrix(1 0 0 -1 265.5 200.5)")
}
