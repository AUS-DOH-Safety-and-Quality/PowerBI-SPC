---
title: G Chart
layout: page
parent: Chart Types
nav_order: 3.21
---

# g: Number of Non-events Between Events
When monitoring a process that happens infrequently or rarely, a normal SPC chart may not be very useful - as most values would be zero. Instead of monitoring a monthly proportion/rate of events, we can instead monitor the number of times that an event did not occur (when it had the opportunity to) before an event is recorded.

The g Chart to the left monitors the number of successful surgeries between each recorded fatality.

To construct this chart, you provide the outcome variable of interest (number of non-events) in the 'Outcome/Numerator' field, and the date variable (Month) in the 'ID Key' field (depicted below). Then, select the 'g' option from the 'Data Settings' dropdown.

<iframe title="SPCVisualExamplesTesting" width="100%" height="486" src="https://app.powerbi.com/view?r=eyJrIjoiYjg0ZmZlYzQtM2MyMC00NDg0LWIwMWQtOThjNTE2ZjJhOGQ5IiwidCI6IjIzMjA0YzgxLTVlNzYtNDE0ZS04Y2M1LTYzMWI0ODc0ZTIwOCJ9&pageName=ReportSectionf8d2f742db44307b5e0f" frameborder="0" allowFullScreen="true"></iframe>

![g Chart Fields](images\gChartFields.png) ![g Chart Type](images\gChartType.png)