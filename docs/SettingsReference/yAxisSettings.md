---
title: Y-Axis Settings
layout: page
parent: Settings Reference
nav_order: 7.9
---

# Y-Axis Aesthetics
All settings related to formatting the Y-Axis are available in this section. These are grouped by the three categories, Axis, Ticks and Label.

![Y Axis Settings Group](images\yAxisSettings\YAxisSettingsGroup.png)

## Axis
The Axis settings adjust the colour of the Y-Axis and any truncation in the lower and upper dates.

![Y Axis Axis](images\yAxisSettings\Axis.png)

- **Axis Colour** - The colour of the horizontal line and ticks (default is black)
- **Axis Scaling Factor** - The factor that is used to scale the x-axis, to format the space above and below the control limits. The default is set to 1.5, with a higher number increasing the space and a lower number decreasing the space.
- **Tick Decimal Places** - The number of decimal places to display on the y-axis ticks. This will override the setting provided in **Data Settings**.
- **Lower Limit** - Set the lower limit of the Y-Axis using an integer. A positive integer will truncate the points displayed on the chart, a negative integer will create whitespace on the left of the SPC lines. 
- **Upper Limit** - Set the upper limit of the Y-Axis using an integer. This sets the right hand side upper limit to be displayed on the chart

## Ticks
The Tick settings adjust the placement and formatting of the ticks, and the formatting of the tick text.

![Y Axis Ticks](images\yAxisSettings\Ticks.png)

- **Draw Ticks** - A toggle for whether Y-Axis ticks and labels should be drawn (default is on)
- **Maximum Ticks** - A numeric value of the maximum number of ticks that should be displayed on the Y-Axis. The value input here does not necessarily correlate with the number of ticks displayed, as the visual attempts to evenly space the ticks.
- **Tick Font** - Font of the tick text (default is Arial)
- **Tick Font Size** - Size of the tick text (default is 10%)
- **Tick Font Colour** - Colour of the tick text (default is black)
- **Tick Rotation (Degrees)** - The degrees of rotation for the Y-Axis ticks labels (default is 0)

## Label
The label settings create and format the Y-Axis label.

![Y Axis Label](images\yAxisSettings\Label.png)

- **Label** - The text of the Y-Axis label.
- **Label Font** - Font of the label text (default is Arial)
- **Label Font Size** - Size of the label text (default is 10%)
- **Label Font Colour** - Colour of the label text (default is black)
