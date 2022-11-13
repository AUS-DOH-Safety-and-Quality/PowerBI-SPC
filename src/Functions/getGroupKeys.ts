import settingsObject from "../Classes/settingsObject"
import viewModel from "../Classes/viewModel"

type groupKeysT = {
  keys: string[];
  colours: string[];
  widths: number[];
  types: string[];
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

  let l99_type: string = args.inputSettings.lines.type_99.value;
  let l95_type: string = args.inputSettings.lines.type_95.value;
  let target_type: string = args.inputSettings.lines.type_target.value;
  let main_type: string = args.inputSettings.lines.type_main.value;


  let inputKeys: string[] = args.viewModel
                                    .groupedLines
                                    .map(d => d[0]);

  let lineColours: string[] = [
    l99_colour, l95_colour, l95_colour, l99_colour,
    target_colour, main_colour
  ]

  let lineWidths: number[] = [
    l99_width, l95_width, l95_width, l99_width,
                  target_width, main_width
  ]

  let lineTypes: string[] = [
    l99_type, l95_type, l95_type, l99_type,
                  target_type, main_type
  ]

  return {
    keys: inputKeys ? inputKeys : lineColours,
    colours: lineColours,
    widths: lineWidths,
    types: lineTypes
  };
}

export default getGroupKeys;
export { groupKeysT }
