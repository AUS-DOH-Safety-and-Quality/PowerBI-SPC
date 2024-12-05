import { test } from 'vitest'
import { g } from '../../src/Limit Calculations'
import { rep } from '../../src/Functions'

// Test values calculated using the 'qicharts2' R package
test('gLimits function', ({ expect }) => {
  const keys = [{ x: 5, id: 1, label: 'a' }, { x: 7, id: 2, label: 'b' }, { x: 9, id: 3, label: 'c' }];
  const result = g({ keys: keys, numerators: [0, 10, 4], subset_points: [0, 1, 2] })

  expect(result.keys).toEqual(keys)
  expect(result.values).toEqual([0, 10, 4])
  expect(result.targets).toEqual(rep(4, 3))
  expect(result.ll99).toEqual(rep(0, 3))
  expect(result.ll95).toEqual(rep(0, 3))
  expect(result.ul95).toEqual(rep(14.95149908036101, 3))
  expect(result.ul99).toEqual(rep(20.09391528720818, 3))
})
