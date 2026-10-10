---
title: Installation
layout: page
nav_order: 2
---

# Installing the Visual

## AppSource

We recommend installing the visual from [AppSource](https://appsource.microsoft.com/en-us/product/power-bi-visuals/healthdepartmentwa1667894240640.powerbi-spc-charts?tab=Overview), as this is the current stable version and includes the extra functionality available to certified visuals.

## Development Release

You can download the most recent development release from the ['Releases' section](https://github.com/AUS-DOH-Safety-and-Quality/PowerBI-SPC/releases/tag/latest).  Save the file to your desktop. Within Power BI, use the Visuals pane and add using the 'Import visual from a file' option:

![image](https://user-images.githubusercontent.com/27717896/128833977-51ae139d-43f2-4d32-8c8c-4cdcabc2bdaf.png)

Find the file on your desktop and click OK.  The custom visual will show as a new icon.

## (Advanced) Building the Visual Locally

You won't need to do this step if you have installed the visual using the steps above.  However, if you have strong IT skills and you'd like to build the PowerBI visual locally, (`.pbiviz` file), you will need a working [Node.js](https://nodejs.org/en) installation and internet access.

First, download the visual source code from the [repository](https://github.com/AUS-DOH-Safety-and-Quality/PowerBI-SPC)

After that, navigate to the project source directory and run:
```
npm install
npm install -g powerbi-visuals-tools
pbiviz package
```

This will create the visual for you. The .pbiviz file can then be found in the `dist` directory, and installed in PowerBI following the steps above.
