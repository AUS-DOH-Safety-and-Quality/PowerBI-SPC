import { test } from 'vitest';
import { between } from '../../src/Functions';

test('between', ({ expect }) => {
  expect(between(5, 1, 10)).toBe(true);
  expect(between(3.14, 3, 3.5)).toBe(true);
  expect(between('b', 'a', 'c')).toBe(true);
  expect(between(1, 1, 10)).toBe(true);
  expect(between(3, 3, 3.5)).toBe(true);
  expect(between('a', 'a', 'c')).toBe(true);
  expect(between(15, 1, 10)).toBe(false);
  expect(between(2.5, 3, 3.5)).toBe(false);
  expect(between('d', 'a', 'c')).toBe(false);
});
