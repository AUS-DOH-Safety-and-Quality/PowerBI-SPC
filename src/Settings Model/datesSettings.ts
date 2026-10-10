import { dropdownOption } from "powerbi-visuals-core/settings";

const datesSettings = {
  description: "Date Settings",
  displayName: "Date Settings",
  settingsGroups: {
    "all": {
      date_format_day: dropdownOption("Day Format", "How the day appears in date labels; (blank) leaves it out.",
                                      "DD", ["DD", "Thurs DD", "Thursday DD", "(blank)"]),
      date_format_month: dropdownOption("Month Format", "How the month appears in date labels; (blank) leaves it out.",
                                        "MM", ["MM", "Mon", "Month", "(blank)"]),
      date_format_year: dropdownOption("Year Format", "How the year appears in date labels; (blank) leaves it out.",
                                       "YYYY", ["YYYY", "YY", "(blank)"]),
      date_format_delim: dropdownOption("Delimiter", "Character between the parts of a date label.", "/", ["/", "-", " "]),
      date_format_locale: dropdownOption("Locale", "Order of the parts: en-GB puts the day first, en-US the month.",
                                         "en-GB", ["en-GB", "en-US"])
    }
  }
};

export default datesSettings;
