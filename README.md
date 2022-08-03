# Introduction 
This repository contains a PowerBI custom visual for SPC Charts. The visual is implemented purely within PowerBI and has no dependencies on external programs like R or Python. The visual natively supports tooltips as well as cross-plot filtering and highlighting.

The following chart types are (currently) implemented:

  - Run: Run Chart
  - i: Individual Measurements (AKA XmR)
  - mr: Moving Range of Individual Measurements
  - p: Proportions
  - p': Proportions with Large-Sample Correction
  - u: Rates
  - u': Rates with Large-Sample Correction
  - c: Counts
  - xbar: Sample Means
  - s: Sample SDs
  - g: Number of Non-events Between Events
  - t: Time Between Events

# Installing the Visual

The most recent version of the visual can be downloaded from the ['Releases' section](https://github.com/AUS-DOH-Safety-and-Quality/PowerBI-SPC/releases/tag/latest).  Save the file to your desktop.   Within Power BI, use the Visuals pane and add using the 'Import visual from a file' option:

![image](https://user-images.githubusercontent.com/27717896/128833977-51ae139d-43f2-4d32-8c8c-4cdcabc2bdaf.png)

Find the file on your desktop and click OK.  The custom visual will show as a new icon.

# Using the Visual

Once you have installed the visual and added it to your report, you can add the desired data (numerators, denominators, and dates) to the visual:

![image](https://user-images.githubusercontent.com/27717896/177291124-2215ff5b-d81c-4195-a948-e6fa2d20a544.png)

The visual will default to displaying an i-Chart:

![image](https://user-images.githubusercontent.com/27717896/177291187-a8d8b875-e083-4d49-93f8-b4fbcdf4eebb.png)

You can change this through the 'Data Settings' menu:

![image](https://user-images.githubusercontent.com/27717896/177291297-35346801-d049-4c05-86c1-41ee5cc51f9d.png)

Aesthetic options for the lines, scatter dots, and chart axes are also available.

# Building Locally

To build the PowerBI visual (.pbiviz file), you will need a working Node.js installation and internet access. Navigate to the project source directory and run:
```
npm install
npm install -g powerbi-visuals-tools
pbiviz package
```

The .pbiviz file can then be found in the `dist` directory

