---
title: "Pattern Detection Configuration & Aesthetics"
---

SPC patterns can be displayed and formatted in this section.

## Type of Change to Flag
This setting determines whether improvement and deterioration are both flagged, or only one of these directions are flagged. These apply across all the enabled patterns. The various options can be selected in the drop down menu:

- **Both** - Both improvement and deterioration patterns are highlighted (default)
- **Improvement** - Only improvement patterns are highlighted
- **Deterioration** - Only deterioration patterns are highlighted

To use these with the conditional formatting, the values must be set to only **both**, **improvement** and **deterioration** respectively.

This setting should be used in conjunction with the **Improvement Direction** setting below. With a **Neutral** improvement direction there is no improvement or deterioration to choose between, so patterns on both sides are always highlighted.

## Improvement Direction
This setting determines which direction is deemed to be the improvement direction for the measure. That is, the measure is getting better in this direction. The various options can be selected in the drop down menu:

- **Increase** - The measure increasing is a favourable outcome, and signals improvement in the measure (default).
- **Neutral** - There is no direction set, and the measure increasing or decreasing does not signal improvement or deterioration. This setting is used to detect any statistical variation.
- **Decrease** - The measure decreasing is a favourable outcome, and signals improvement in the measure.

To use these with the conditional formatting, the values must be set to only **increase**, **neutral** and **decrease** respectively.

This setting should be used in conjunction with the **Type of Change to Flag** setting above.

## Highlight all in Pattern
This toggle applies to the two-in-three pattern. When off (the default), only the points beyond the warning limit are highlighted. When on, every point in the three-point window is highlighted, except any point beyond the opposite warning limit. Shifts and trends always highlight every point in the pattern.

## Common Pattern Options
Each pattern (Astronomical Points, Shifts, Trends and Two-In-Three) has its own group of settings: a toggle to highlight it, colours for improvement, deterioration and neutral (low and high) points, and the settings specific to that pattern. These are listed under [All Settings](#all-settings). The default colours are consistent with the NHS theme.

## Shift Points
Sets the number of points required in order to detect a shift. The default is seven.

## Trend Points
Sets the number of points required in order to detect a trend. The default is five.

## All Settings

{{< include /_includes/settings/outliers.md >}}
