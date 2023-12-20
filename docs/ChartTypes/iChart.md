---
title: I Chart (aka XmR)
layout: page
parent: Chart Types
nav_order: 3.12
---

# i: Individual Measurements (also known as XmR)
Similar to a run chart, an i Chart is used for monitoring a single observation over time. The key difference is that there are now upper and lower control limits. The width of these limits is determined by the magnitude of difference between each successive observation.

The i chart to the left shows the monthly recordings of the number of events across an 18-month period. 

To construct this chart, you provide the outcome variable of interest (number of events) in the 'Outcome/Numerator' field, and the date variable (Month) in the 'ID Key' field (depicted below). Then, select the 'i' option from the 'Data Settings' dropdown.

<iframe title="SPCVisualExamplesTesting" width="100%" height="486" src="https://app.powerbi.com/view?r=eyJrIjoiYjg0ZmZlYzQtM2MyMC00NDg0LWIwMWQtOThjNTE2ZjJhOGQ5IiwidCI6IjIzMjA0YzgxLTVlNzYtNDE0ZS04Y2M1LTYzMWI0ODc0ZTIwOCJ9&pageName=ReportSectiondbf937554903f9c2661a" frameborder="0" allowFullScreen="true"></iframe>

![i Chart Fields](images\iChartFields.png) ![ig Chart Type](images\iChartType.png)