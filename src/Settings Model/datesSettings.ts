import { FormattingComponent } from "./common";

const datesSettings = {
  description: "Date Settings",
  displayName: "Date Settings",
  settingsGroups: {
    "all": {
      date_format_day: {
        displayName: "Day Format",
        type: FormattingComponent.Dropdown,
        default: "DD",
        valid: ["DD", "Thurs DD", "Thursday DD", "(blank)"],
        items: [
          { displayName : "DD",          value : "DD" },
          { displayName : "Thurs DD",    value : "Thurs DD" },
          { displayName : "Thursday DD", value : "Thursday DD"  },
          { displayName : "(blank)",    value : "(blank)" }
        ]
      },
      date_format_month: {
        displayName: "Month Format",
        type: FormattingComponent.Dropdown,
        default: "MM",
        valid: ["MM", "Mon", "Month", "(blank)"],
        items: [
          { displayName : "MM",    value : "MM" },
          { displayName : "Mon",   value : "Mon" },
          { displayName : "Month", value : "Month" },
          { displayName : "(blank)",    value : "(blank)" }
        ]
      },
      date_format_year: {
        displayName: "Year Format",
        type: FormattingComponent.Dropdown,
        default: "YYYY",
        valid: ["YYYY", "YY", "(blank)"],
        items: [
            { displayName : "YYYY", value : "YYYY" },
            { displayName : "YY",   value : "YY" },
            { displayName : "(blank)",    value : "(blank)" }
          ]
      },
      date_format_delim: {
        displayName: "Delimiter",
        type: FormattingComponent.Dropdown,
        default: "/",
        valid: ["/", "-", " "],
        items: [
          { displayName : "/", value : "/" },
          { displayName : "-", value : "-" },
          { displayName : " ", value : " " }
        ]
      },
      date_format_locale: {
        displayName: "Locale",
        type: FormattingComponent.Dropdown,
        default: "en-GB",
        valid: ["en-GB", "en-US"],
        items: [
          { displayName : "en-GB", value : "en-GB" },
          { displayName : "en-US", value : "en-US" }
        ]
      }
    }
  }
};

export default datesSettings;
