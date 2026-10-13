import formatDateParts from "../../src/Functions/formatDateParts";
import { describe, it, expect } from "vitest";

describe("formatDateParts", () => {
  it("leaves unrequested parts empty", () => {
    expect(formatDateParts(new Date(2024, 0, 15), {})).toEqual({ weekday: "", day: "", month: "", year: "" });
    expect(formatDateParts(new Date(2024, 5, 7), { day: "2-digit", month: "long" })).toEqual({
      weekday: "", day: "07", month: "June", year: ""
    });
  });

  it("names every weekday and month in short and long form", () => {
    // 14 January 2024 is a Sunday
    const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdaysLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = 0; i < weekdaysShort.length; i++) {
      const date = new Date(2024, 0, 14 + i);
      expect(formatDateParts(date, { weekday: "short" }).weekday).toBe(weekdaysShort[i]);
      expect(formatDateParts(date, { weekday: "long" }).weekday).toBe(weekdaysLong[i]);
    }
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsLong = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthsNumeric = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    for (let i = 0; i < monthsShort.length; i++) {
      const date = new Date(2024, i, 15);
      expect(formatDateParts(date, { month: "short" }).month).toBe(monthsShort[i]);
      expect(formatDateParts(date, { month: "long" }).month).toBe(monthsLong[i]);
      expect(formatDateParts(date, { month: "2-digit" }).month).toBe(monthsNumeric[i]);
    }
  });

  it("pads days and writes full or two-digit years", () => {
    expect(formatDateParts(new Date(2024, 1, 29), {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    })).toEqual({ weekday: "Thursday", day: "29", month: "February", year: "2024" });
    expect(formatDateParts(new Date(2024, 0, 1), { day: "2-digit", year: "2-digit" })).toEqual({
      weekday: "", day: "01", month: "", year: "24"
    });
    expect(formatDateParts(new Date(2000, 0, 15), { year: "2-digit" }).year).toBe("00");
    expect(formatDateParts(new Date(1999, 11, 31), { day: "2-digit", year: "2-digit" })).toEqual({
      weekday: "", day: "31", month: "", year: "99"
    });
  });
});
