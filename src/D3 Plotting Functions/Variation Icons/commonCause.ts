import { type svgBaseType } from "../../visual";

/**
 * Inline function to be called by D3 for rendering the Variation - Common Cause icon.
 * The code below is a translation from HTML to D3 syntax of the SVG file:
 * https://github.com/nhs-r-community/NHSRplotthedots/blob/main/inst/icons/variation/common_cause.svg
 *
 * This function does not return a value, it is meant to be called as part of chaining D3 syntax
 *
 * @param selection The D3 parent object to which the icon's SVG code will be added
 */
export default function commonCause(selection: svgBaseType): void {
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
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","21")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M38 189C38 105.605 105.605 38 189 38 272.395 38 340 105.605 340 189 340 272.395 272.395 340 189 340 105.605 340 38 272.395 38 189Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","20")
            .attr("stroke-miterlimit","8")
            .attr("fill","#FFFFFF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M106.903 196.084 144.607 228.433 138.766 235.241 101.062 202.892Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M146.159 218.909 179.921 159.846 187.708 164.298 153.946 223.361Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M198.708 154.94 239.365 214.134 231.971 219.212 191.314 160.019Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M238.825 216.117 285.383 198.784 288.512 207.19 241.954 224.523Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M76.5001 195C76.5001 183.678 85.6782 174.5 97.0001 174.5 108.322 174.5 117.5 183.678 117.5 195 117.5 206.322 108.322 215.5 97.0001 215.5 85.6782 215.5 76.5001 206.322 76.5001 195Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M123.5 233C123.5 221.678 132.678 212.5 144 212.5 155.322 212.5 164.5 221.678 164.5 233 164.5 244.322 155.322 253.5 144 253.5 132.678 253.5 123.5 244.322 123.5 233Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M170.5 153.5C170.5 141.902 179.902 132.5 191.5 132.5 203.098 132.5 212.5 141.902 212.5 153.5 212.5 165.098 203.098 174.5 191.5 174.5 179.902 174.5 170.5 165.098 170.5 153.5Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M217.5 221.5C217.5 209.902 226.902 200.5 238.5 200.5 250.098 200.5 259.5 209.902 259.5 221.5 259.5 233.098 250.098 242.5 238.5 242.5 226.902 242.5 217.5 233.098 217.5 221.5Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")

  selection.append("path")
            .attr("d","M265.5 206.5C265.5 194.902 274.678 185.5 286 185.5 297.322 185.5 306.5 194.902 306.5 206.5 306.5 218.098 297.322 227.5 286 227.5 274.678 227.5 265.5 218.098 265.5 206.5Z")
            .attr("stroke","#BFBFBF")
            .attr("stroke-width","2.66667")
            .attr("stroke-miterlimit","8")
            .attr("fill","#BFBFBF")
            .attr("fill-rule","evenodd")
}
