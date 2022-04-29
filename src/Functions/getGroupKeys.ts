import settingsObject from "../Classes/settingsObject"
import viewModel from "../Classes/viewModel"

type groupKeysT = {
  keys: string[];
  colours: string[];
  widths: number[];
}

function getGroupKeys(args: { inputSettings: settingsObject,
                              viewModel: viewModel}): groupKeysT {
  let l99_width: number = args.inputSettings.lines.width_99.value;
  let l95_width: number = args.inputSettings.lines.width_95.value;
  let target_width: number = args.inputSettings.lines.width_target.value;
  let main_width: number = args.inputSettings.lines.width_main.value;
  let l99_colour: string = args.inputSettings.lines.colour_99.value;
  let l95_colour: string = args.inputSettings.lines.colour_95.value;
  let target_colour: string = args.inputSettings.lines.colour_target.value;
  let main_colour: string = args.inputSettings.lines.colour_main.value;

  let inputKeys: string[] = args.viewModel
                                    .groupedLines
                                    .map(d => d.key);

  let lineColours: string[] = [
    l99_colour, l95_colour, l95_colour, l99_colour,
    target_colour, main_colour
  ]

  let lineWidths: number[] = [
    l99_width, l95_width, l95_width, l99_width,
                  target_width, main_width
  ]

  return {
    keys: inputKeys,
    colours: lineColours,
    widths: lineWidths
  };
}

export default getGroupKeys;
export { groupKeysT }
