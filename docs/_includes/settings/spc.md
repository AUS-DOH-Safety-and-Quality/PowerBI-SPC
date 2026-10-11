<!-- Generated from the settings model; edit the setting definitions, not this file. -->

### Data Settings

| Setting | Description | Default | Values |
| --- | --- | --- | --- |
| Chart Type | Type of control chart; see Chart Types for the inputs each needs. | i - Individual Measurements | • run - Run Chart (`run`)<br>• i - Individual Measurements (`i`)<br>• i_m - Individual Measurements: Median centerline (`i_m`)<br>• i_mm - Individual Measurements: Median centerline, Median MR Limits (`i_mm`)<br>• mr - Moving Range of Individual Measurements (`mr`)<br>• p - Proportions (`p`)<br>• p prime - Proportions: Large-Sample Corrected (`pp`)<br>• u - Rates (`u`)<br>• u prime - Rates: Large-Sample Correction (`up`)<br>• c - Counts (`c`)<br>• xbar - Sample Means (`xbar`)<br>• s - Sample SDs (`s`)<br>• g - Number of Non-Events Between Events (`g`)<br>• t - Time Between Events (`t`) |
| Keep Outliers in Limit Calcs. | Keeps unusually large moving ranges when calculating limits; off drops them first. Applies to i, i_m, i_mm, t, p prime and u prime charts. | Off | On or Off |
| Multiplier | Multiplies plotted values and limits, e.g. 1000 for a rate per 1,000. | 1 | Number, at least 0 |
| Decimals to Report: | Decimal places for values in tooltips, line labels and the y-axis, unless the y-axis sets its own. | 2 | Whole number from 0 to 20 |
| Report as percentage | Yes multiplies by 100 and adds a % sign, replacing the multiplier. Automatic does this for proportion charts with a multiplier of 1 or 100. No never adds a % sign. | Automatic | • `Automatic`<br>• `Yes`<br>• `No` |
| Split Limits on Click | Clicking a point ends a limit period there; clicking it again removes the split. Splits stay when this is turned off, and are ignored when Grouping (Summary Table) is used. | Off | On or Off |
| Subset Number of Points for Limit Calculations | Calculates the first period's limits from only this many points; blank or out of range uses them all. | (blank) | Whole number |
| Subset Points From | Whether the subset is taken from the start or end of the period. | Start | • `Start`<br>• `End` |
| Subset Points After Each Re-Baseline | Applies the subset to every rebaseline period, not only the first. | Off | On or Off |
| Show Date in Tooltip | Shows the date, or the point number for g and t charts, in the tooltip. | On | On or Off |
| Date Tooltip Label | Name for the date in the tooltip; Automatic uses Date, or Event for g and t charts. | `Automatic` | Text |
| Show Numerator in Tooltip | Shows the numerator in the tooltip, when one is supplied. | On | On or Off |
| Numerator Tooltip Label | Name for the numerator in the tooltip. | `Numerator` | Text |
| Show Denominator in Tooltip | Shows the denominator in the tooltip, when one is supplied. | On | On or Off |
| Denominator Tooltip Label | Name for the denominator in the tooltip. | `Denominator` | Text |
| Show Value in Tooltip | Shows the plotted value in the tooltip. | On | On or Off |
| Value Tooltip Label | Name for the plotted value in the tooltip; Automatic names it after the chart type. | `Automatic` | Text |
| Truncate Lower Limits at: | Limits below this plotted value are drawn at it, and points are flagged against them. | (blank) | Number |
| Truncate Upper Limits at: | Limits above this plotted value are drawn at it, and points are flagged against them. | (blank) | Number |
