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
  - SR: Indirectly Standardised Ratios


# Installing the Visual

The most recent version of the visual can be downloaded from the ['Releases' section'](https://github.com/andrjohns/PowerBI-SPC/releases/tag/Continuous) and added to PowerBI using the 'Import visual from a file' option:

![image](https://user-images.githubusercontent.com/27717896/128833977-51ae139d-43f2-4d32-8c8c-4cdcabc2bdaf.png)

# Using the Visual

Once you have installed the visual and added it to your report, you can add the desired data (numerators, denominators, and dates) to the visual:

![image](https://user-images.githubusercontent.com/27717896/128966635-21d44a5a-42ef-46c0-8230-b39fa659052b.png)

The visual will default to displaying an i-Chart:

![image](https://user-images.githubusercontent.com/27717896/128966833-b60ce732-0a4a-44aa-b747-8faa7ec418c0.png)

You can change this through the 'Data Settings' menu:

![image](https://user-images.githubusercontent.com/27717896/128966866-bb04e37b-7df9-47c0-ab6d-0a442e637c8a.png)

Aesthetic options for the lines, scatter dots, and chart axes are also available.

# Building Locally

To build the PowerBI visual (.pbiviz file), you will need a working Node.js installation and internet access. Navigate to the project source directory and run:
```
npm install
npm install -g powerbi-visuals-tools
pbiviz package
```

The .pbiviz file can then be found in the `dist` directory

