import { test } from 'vitest'
import { c } from '../../src/Limit Calculations'
import { rep } from '../../src/Functions'

// Test values calculated using the 'qicharts2' R package
test('cLimits function', ({ expect }) => {
  const keys = [{ x: 5, id: 1, label: 'a' }, { x: 7, id: 2, label: 'b' }, { x: 9, id: 3, label: 'c' }];
  const result = c({ keys: keys, numerators: [5, 7, 9] })

  expect(result.keys).toEqual(keys)
  expect(result.values).toEqual([5, 7, 9])
  expect(result.targets).toEqual([7, 7, 7]) // assuming mean of [5, 7, 9] is 7
  expect(result.ll99).toEqual([0, 0, 0])
  expect(result.ll95).toEqual(rep(1.7084973778708186, 3))
  expect(result.ul95).toEqual(rep(12.291502622129181, 3))
  expect(result.ul99).toEqual(rep(14.937253933193773, 3))
})
