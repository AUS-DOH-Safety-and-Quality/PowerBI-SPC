import formatDateParts from "../../src/Functions/formatDateParts";
import { describe, it, expect } from "vitest";

describe("formatDateParts", () => {
  describe("empty options", () => {
    it("should return empty strings for all components when no options specified", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", {});
      expect(result.weekday).toBe("");
      expect(result.day).toBe("");
      expect(result.month).toBe("");
      expect(result.year).toBe("");
    });
  });

  describe("weekday formatting", () => {
    it("should format weekday in short format", () => {
      const dates = [
        new Date(2024, 0, 14),
        new Date(2024, 0, 15),
        new Date(2024, 0, 16),
        new Date(2024, 0, 17),
        new Date(2024, 0, 18),
        new Date(2024, 0, 19),
        new Date(2024, 0, 20)
      ];
      const expected = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 0; i < dates.length; i++) {
        const result = formatDateParts(dates[i], "en-GB", { weekday: "short" });
        expect(result.weekday).toBe(expected[i]);
      }
    });

    it("should format weekday in long format", () => {
      const dates = [
        new Date(2024, 0, 14),
        new Date(2024, 0, 15),
        new Date(2024, 0, 16),
        new Date(2024, 0, 17),
        new Date(2024, 0, 18),
        new Date(2024, 0, 19),
        new Date(2024, 0, 20)
      ];
      const expected = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      for (let i = 0; i < dates.length; i++) {
        const result = formatDateParts(dates[i], "en-GB", { weekday: "long" });
        expect(result.weekday).toBe(expected[i]);
      }
    });

    it("should return same weekday names for en-US locale", () => {
      const date = new Date(2024, 0, 15);
      const resultGB = formatDateParts(date, "en-GB", { weekday: "long" });
      const resultUS = formatDateParts(date, "en-US", { weekday: "long" });
      expect(resultGB.weekday).toBe("Monday");
      expect(resultUS.weekday).toBe("Monday");
    });
  });

  describe("day formatting", () => {
    it("should format single-digit day with leading zero", () => {
      const date = new Date(2024, 0, 1);
      const result = formatDateParts(date, "en-GB", { day: "2-digit" });
      expect(result.day).toBe("01");
    });

    it("should format double-digit day without modification", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", { day: "2-digit" });
      expect(result.day).toBe("15");
    });

    it("should format last day of month correctly", () => {
      const date = new Date(2024, 0, 31);
      const result = formatDateParts(date, "en-GB", { day: "2-digit" });
      expect(result.day).toBe("31");
    });

    it("should format leap year day correctly", () => {
      const date = new Date(2024, 1, 29);
      const result = formatDateParts(date, "en-GB", { day: "2-digit" });
      expect(result.day).toBe("29");
    });
  });

  describe("month formatting", () => {
    it("should format month as 2-digit with leading zero", () => {
      const dates = [
        new Date(2024, 0, 15),
        new Date(2024, 8, 15),
        new Date(2024, 11, 15)
      ];
      const expected = ["01", "09", "12"];

      for (let i = 0; i < dates.length; i++) {
        const result = formatDateParts(dates[i], "en-GB", { month: "2-digit" });
        expect(result.month).toBe(expected[i]);
      }
    });

    it("should format all months in short format", () => {
      const expected = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      for (let i = 0; i < expected.length; i++) {
        const result = formatDateParts(new Date(2024, i, 15), "en-GB", { month: "short" });
        expect(result.month).toBe(expected[i]);
      }
    });

    it("should format all months in long format", () => {
      const expected = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      for (let i = 0; i < expected.length; i++) {
        const result = formatDateParts(new Date(2024, i, 15), "en-GB", { month: "long" });
        expect(result.month).toBe(expected[i]);
      }
    });

    it("should return same month names for en-US locale", () => {
      const date = new Date(2024, 0, 15);
      const resultGB = formatDateParts(date, "en-GB", { month: "long" });
      const resultUS = formatDateParts(date, "en-US", { month: "long" });
      expect(resultGB.month).toBe("January");
      expect(resultUS.month).toBe("January");
    });
  });

  describe("year formatting", () => {
    it("should format year as numeric (4 digits)", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", { year: "numeric" });
      expect(result.year).toBe("2024");
    });

    it("should format year as 2-digit", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", { year: "2-digit" });
      expect(result.year).toBe("24");
    });

    it("should format year 2000 as 2-digit correctly", () => {
      const date = new Date(2000, 0, 15);
      const result = formatDateParts(date, "en-GB", { year: "2-digit" });
      expect(result.year).toBe("00");
    });

    it("should format year 1999 as 2-digit correctly", () => {
      const date = new Date(1999, 11, 31);
      const result = formatDateParts(date, "en-GB", { year: "2-digit" });
      expect(result.year).toBe("99");
    });
  });

  describe("combined formatting", () => {
    it("should format complete date with all components", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
      expect(result.weekday).toBe("Monday");
      expect(result.day).toBe("15");
      expect(result.month).toBe("January");
      expect(result.year).toBe("2024");
    });

    it("should format date with short formats", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "2-digit"
      });
      expect(result.weekday).toBe("Mon");
      expect(result.day).toBe("15");
      expect(result.month).toBe("Jan");
      expect(result.year).toBe("24");
    });

    it("should format date with 2-digit month and numeric year", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateParts(date, "en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      expect(result.weekday).toBe("");
      expect(result.day).toBe("15");
      expect(result.month).toBe("01");
      expect(result.year).toBe("2024");
    });

    it("should handle partial options (only day and month)", () => {
      const date = new Date(2024, 5, 7);
      const result = formatDateParts(date, "en-GB", {
        day: "2-digit",
        month: "long"
      });
      expect(result.weekday).toBe("");
      expect(result.day).toBe("07");
      expect(result.month).toBe("June");
      expect(result.year).toBe("");
    });

    it("should handle partial options (only month and year)", () => {
      const date = new Date(2024, 11, 25);
      const result = formatDateParts(date, "en-US", {
        month: "short",
        year: "numeric"
      });
      expect(result.weekday).toBe("");
      expect(result.day).toBe("");
      expect(result.month).toBe("Dec");
      expect(result.year).toBe("2024");
    });
  });

  describe("edge cases", () => {
    it("should handle January 1st correctly", () => {
      const date = new Date(2024, 0, 1);
      const result = formatDateParts(date, "en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      expect(result.day).toBe("01");
      expect(result.month).toBe("01");
      expect(result.year).toBe("2024");
    });

    it("should handle December 31st correctly", () => {
      const date = new Date(2024, 11, 31);
      const result = formatDateParts(date, "en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      expect(result.day).toBe("31");
      expect(result.month).toBe("12");
      expect(result.year).toBe("2024");
    });

    it("should handle leap year date (Feb 29)", () => {
      const date = new Date(2024, 1, 29);
      const result = formatDateParts(date, "en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
      expect(result.weekday).toBe("Thursday");
      expect(result.day).toBe("29");
      expect(result.month).toBe("February");
      expect(result.year).toBe("2024");
    });
  });

  describe("locale consistency", () => {
    it("should produce identical results for both locales (since both are English)", () => {
      const date = new Date(2024, 5, 15);
      const options = {
        weekday: "long" as const,
        day: "2-digit" as const,
        month: "long" as const,
        year: "numeric" as const
      };

      const resultGB = formatDateParts(date, "en-GB", options);
      const resultUS = formatDateParts(date, "en-US", options);

      expect(resultGB.weekday).toBe(resultUS.weekday);
      expect(resultGB.day).toBe(resultUS.day);
      expect(resultGB.month).toBe(resultUS.month);
      expect(resultGB.year).toBe(resultUS.year);
    });
  });
});
