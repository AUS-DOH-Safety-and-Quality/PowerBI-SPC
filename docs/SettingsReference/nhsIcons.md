---
title: "NHS Iconography Options"
---

The NHS has developed variation and assurance icons that can be displayed in the SPC chart. For further information on what these icons mean, see the Plot The Dots documentation.

These settings adjust the display and formatting of these icons.

The variation icons summarise the points flagged by the patterns turned on in **Outlier Settings**; with no patterns turned on, they always show common cause. By default only the patterns at the last point are considered (**Flag Only Last Point**); turning it off considers every point. More than one icon shows when patterns in both directions are found.

The assurance icon compares the **Additional Target Value** with the last point's three-sigma limits. It needs **Show Alt. Target Line** turned on in **Line Settings**, and an **Improvement Direction** of Increase or Decrease in **Outlier Settings**. Run charts show no assurance icon.

## All Settings

{{< include /_includes/settings/nhs_icons.md >}}
