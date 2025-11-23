import extractValues from "../src/Functions/extractValues";
import groupBy from "../src/Functions/groupBy";
import repIfScalar from "../src/Functions/repIfScalar";

describe("Utility Functions - Data Extraction", () => {
  describe("extractValues()", () => {
    it("should extract values at specified indices", () => {
      const values = [10, 20, 30, 40, 50];
      const indices = [0, 2, 4];

      const result = extractValues(values, indices);

      expect(result).toEqual([10, 30, 50]);
    });

    it("should handle single index", () => {
      const values = [10, 20, 30];
      const indices = [1];

      const result = extractValues(values, indices);

      expect(result).toEqual([20]);
    });

    it("should handle empty index array", () => {
      const values = [10, 20, 30];
      const indices = [];

      const result = extractValues(values, indices);

      expect(result).toEqual([]);
    });

    it("should handle null values array", () => {
      const values = null;
      const indices = [0, 1, 2];

      const result = extractValues(values, indices);

      expect(result).toEqual([]);
    });

    it("should handle undefined values array", () => {
      const values = undefined;
      const indices = [0, 1, 2];

      const result = extractValues(values, indices);

      expect(result).toEqual([]);
    });

    it("should preserve null/undefined elements in values", () => {
      const values = [10, null, undefined, 40];
      const indices = [0, 1, 2, 3];

      const result = extractValues(values, indices);

      expect(result).toEqual([10, null, undefined, 40]);
    });

    it("should work with string arrays", () => {
      const values = ["a", "b", "c", "d"];
      const indices = [0, 2];

      const result = extractValues(values, indices);

      expect(result).toEqual(["a", "c"]);
    });

    it("should work with object arrays", () => {
      const values = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const indices = [0, 2];

      const result = extractValues(values, indices);

      expect(result).toEqual([{ id: 1 }, { id: 3 }]);
    });

    it("should handle non-sequential indices", () => {
      const values = [10, 20, 30, 40, 50];
      const indices = [4, 1, 3];

      const result = extractValues(values, indices);

      expect(result).toEqual([20, 40, 50]);
    });

    it("should handle large arrays efficiently", () => {
      const values = Array.from({ length: 1000 }, (_, i) => i);
      const indices = [0, 100, 500, 999];

      const result = extractValues(values, indices);

      expect(result).toEqual([0, 100, 500, 999]);
      expect(result.length).toBe(4);
    });
  });

  describe("groupBy()", () => {
    it("should group objects by specified key", () => {
      const data = [
        { category: "A", value: 1 },
        { category: "B", value: 2 },
        { category: "A", value: 3 }
      ];

      const result = groupBy(data, "category");

      expect(result.length).toBe(2);
      expect(result[0][0]).toBe("A");
      expect(result[0][1]).toEqual([
        { category: "A", value: 1 },
        { category: "A", value: 3 }
      ]);
      expect(result[1][0]).toBe("B");
      expect(result[1][1]).toEqual([{ category: "B", value: 2 }]);
    });

    it("should handle single group", () => {
      const data = [
        { category: "A", value: 1 },
        { category: "A", value: 2 }
      ];

      const result = groupBy(data, "category");

      expect(result.length).toBe(1);
      expect(result[0][0]).toBe("A");
      expect(result[0][1].length).toBe(2);
    });

    it("should handle each item in separate group", () => {
      const data = [
        { category: "A", value: 1 },
        { category: "B", value: 2 },
        { category: "C", value: 3 }
      ];

      const result = groupBy(data, "category");

      expect(result.length).toBe(3);
      result.forEach(group => {
        expect(group[1].length).toBe(1);
      });
    });

    it("should handle empty array", () => {
      const data = [];

      const result = groupBy(data, "category");

      expect(result).toEqual([]);
    });

    it("should group by numeric key", () => {
      const data = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 1, name: "Charlie" }
      ];

      const result = groupBy(data, "id");

      expect(result.length).toBe(2);
      expect(result[0][0] as any).toBe(1);
      expect(result[0][1].length).toBe(2);
      expect(result[1][0] as any).toBe(2);
      expect(result[1][1].length).toBe(1);
    });

    it("should handle null/undefined values in key", () => {
      const data = [
        { category: "A", value: 1 },
        { category: null, value: 2 },
        { category: undefined, value: 3 },
        { category: null, value: 4 }
      ];

      const result = groupBy(data, "category");

      expect(result.length).toBe(3);
      // Find the null group
      const nullGroup = result.find(g => g[0] === null);
      expect(nullGroup[1].length).toBe(2);
    });

    it("should maintain insertion order within groups", () => {
      const data = [
        { category: "A", value: 1 },
        { category: "A", value: 2 },
        { category: "A", value: 3 }
      ];

      const result = groupBy(data, "category");

      expect(result[0][1][0].value).toBe(1);
      expect(result[0][1][1].value).toBe(2);
      expect(result[0][1][2].value).toBe(3);
    });

    it("should work with complex objects", () => {
      const data = [
        { category: "A", nested: { id: 1 } },
        { category: "B", nested: { id: 2 } },
        { category: "A", nested: { id: 3 } }
      ];

      const result = groupBy(data, "category");

      expect(result.length).toBe(2);
      expect(result[0][1][0].nested.id).toBe(1);
      expect(result[0][1][1].nested.id).toBe(3);
    });
  });

  describe("repIfScalar()", () => {
    it("should repeat scalar value n times", () => {
      const result = repIfScalar(5, 3);

      expect(result).toEqual([5, 5, 5]);
    });

    it("should repeat string value", () => {
      const result = repIfScalar("hello", 2);

      expect(result).toEqual(["hello", "hello"]);
    });

    it("should repeat object value", () => {
      const obj = { id: 1 };
      const result = repIfScalar(obj, 3);

      expect(result.length).toBe(3);
      expect(result[0]).toBe(obj);
      expect(result[1]).toBe(obj);
      expect(result[2]).toBe(obj);
      // All should be the same reference
      expect(result[0] === result[1]).toBe(true);
    });

    it("should return array unchanged if input is array", () => {
      const arr = [1, 2, 3];
      const result = repIfScalar(arr, 5);

      expect(result).toBe(arr);
      expect(result).toEqual([1, 2, 3]);
    });

    it("should handle n = 0 for scalar", () => {
      const result = repIfScalar(5, 0);

      expect(result).toEqual([]);
    });

    it("should handle n = 1 for scalar", () => {
      const result = repIfScalar(5, 1);

      expect(result).toEqual([5]);
    });

    it("should handle null scalar", () => {
      const result = repIfScalar(null, 3);

      expect(result).toEqual([null, null, null]);
    });

    it("should handle undefined scalar", () => {
      const result = repIfScalar(undefined, 2);

      expect(result).toEqual([undefined, undefined]);
    });

    it("should handle boolean scalar", () => {
      const result = repIfScalar(true, 3);

      expect(result).toEqual([true, true, true]);
    });

    it("should not modify empty array", () => {
      const arr = [];
      const result = repIfScalar(arr, 5);

      expect(result).toBe(arr);
      expect(result).toEqual([]);
    });

    it("should handle large n value", () => {
      const result = repIfScalar(1, 100);

      expect(result.length).toBe(100);
      expect(result.every(v => v === 1)).toBe(true);
    });
  });

  // Note: extractInputData() and extractDataColumn() tests are omitted here
  // because they require extensive mocking of PowerBI DataView objects and
  // settingsClass which have complex dependencies. These would be better suited
  // for integration tests rather than unit tests.
  // 
  // Key functions that would need testing:
  // - extractInputData(): Main orchestration function
  // - extractDataColumn(): Column extraction with type handling
  // - formatKeys(): Date formatting and key concatenation
  // - extractTooltips(): Tooltip data extraction
  //
  // These tests would require:
  // - Mock powerbi.DataViewCategorical objects
  // - Mock defaultSettingsType with complete settings
  // - Mock derivedSettingsClass with chart type properties
  // - Test data with various column types (numeric, string, date)
  // - Test conditional formatting extraction
});
