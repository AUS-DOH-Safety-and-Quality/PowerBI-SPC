import { dropdownOption } from "./common";

const datesSettings = {
  description: "Date Settings",
  displayName: "Date Settings",
  settingsGroups: {
    "all": {
      date_format_day: dropdownOption("Day Format", "DD", ["DD", "Thurs DD", "Thursday DD", "(blank)"]),
      date_format_month: dropdownOption("Month Format", "MM", ["MM", "Mon", "Month", "(blank)"]),
      date_format_year: dropdownOption("Year Format", "YYYY", ["YYYY", "YY", "(blank)"]),
      date_format_delim: dropdownOption("Delimiter", "/", ["/", "-", " "]),
      date_format_locale: dropdownOption("Locale", "en-GB", ["en-GB", "en-US"])
    }
  }
};

export default datesSettings;
