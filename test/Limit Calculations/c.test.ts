import { test } from 'vitest'
import { c } from 'spc-limits-js'
import { rep } from '../../src/Functions'

// Test values calculated using the 'qicharts2' R package
test('cLimits function', ({ expect }) => {
  const labels = ['a', 'b', 'c'];
  const result = c({ labels: labels, numerators: [5, 7, 9] })

  expect(result.labels).toEqual(labels)
  expect(result.values).toEqual([5, 7, 9])
  expect(result.targets).toEqual([7, 7, 7]) // assuming mean of [5, 7, 9] is 7
  expect(result.ll99).toEqual([0, 0, 0])
  expect(result.ll95).toEqual(rep(1.7084973778708186, 3))
  expect(result.ul95).toEqual(rep(12.291502622129181, 3))
  expect(result.ul99).toEqual(rep(14.937253933193773, 3))
})
