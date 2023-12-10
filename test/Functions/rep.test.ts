import { test } from 'vitest';
import { rep } from "../../src/Functions";

test('rep', ({ expect }) => {
  // Test case 1
  expect(rep(0, 3)).toStrictEqual([0, 0, 0]);

  // Test case 2
  expect(rep('a', 5)).toStrictEqual(['a', 'a', 'a', 'a', 'a']);

  // Test case 3
  expect(rep(true, 2)).toStrictEqual([true, true]);

  // Test case 4
  expect(rep({ name: 'John' }, 4)).toStrictEqual([
    { name: 'John' },
    { name: 'John' },
    { name: 'John' },
    { name: 'John' },
  ]);

  expect(rep('a', 0)).toStrictEqual([]);
  expect(rep(100, 0)).toStrictEqual([]);
  expect(rep(true, 0)).toStrictEqual([]);
});
