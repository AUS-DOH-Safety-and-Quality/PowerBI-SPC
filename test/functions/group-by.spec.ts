import groupBy from "../../src/Functions/groupBy";

describe("groupBy", () => {
    it("should group objects by a specific string key", () => {
        const data = [
            { category: "A", value: 1 },
            { category: "B", value: 2 },
            { category: "A", value: 3 },
            { category: "C", value: 4 }
        ];
        const result = groupBy(data, "category");
        
        // Expected output is an array of tuples [key, items[]]
        // Since Map preserves insertion order of keys: "A", "B", "C"
        expect(result.length).toBe(3);
        
        expect(result[0][0]).toBe("A");
        expect(result[0][1]).toEqual([
            { category: "A", value: 1 },
            { category: "A", value: 3 }
        ]);

        expect(result[1][0]).toBe("B");
        expect(result[1][1]).toEqual([
            { category: "B", value: 2 }
        ]);

        expect(result[2][0]).toBe("C");
        expect(result[2][1]).toEqual([
            { category: "C", value: 4 }
        ]);
    });

    it("should handle empty array", () => {
        const data: any[] = [];
        const result = groupBy(data, "category");
        expect(result).toEqual([]);
    });

    it("should group objects by numeric values corresponding to the key", () => {
        const data = [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
            { id: 1, name: "Charlie" }
        ];
        const result = groupBy(data, "id");
        expect(result.length).toBe(2);
        
        // id 1
        expect(result[0][0] as any).toBe(1);
        expect(result[0][1].length).toBe(2);
        expect(result[0][1][0].name).toBe("Alice");
        expect(result[0][1][1].name).toBe("Charlie");

        // id 2
        expect(result[1][0] as any).toBe(2);
        expect(result[1][1].length).toBe(1);
        expect(result[1][1][0].name).toBe("Bob");
    });

    it("should handle objects where the key is missing (undefined)", () => {
        const data = [
            { category: "A", value: 1 },
            { value: 2 }, // category missing
            { category: "A", value: 3 }
        ];
        // The implementation uses item[key], so it will be undefined.
        const result = groupBy(data, "category");
        
        // Groups: "A" and undefined
        expect(result.length).toBe(2);
        
        // "A" is encountered first
        expect(result[0][0]).toBe("A");
        
        // undefined is second
        expect(result[1][0]).toBeUndefined();
        expect(result[1][1]).toEqual([{ value: 2 }]);
    });
});
