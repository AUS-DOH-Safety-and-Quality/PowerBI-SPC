import { test } from 'vitest'
import { g } from 'spc-limits-js'
import { rep } from '../../src/Functions'

// Test values calculated using the 'qicharts2' R package
test('gLimits function', ({ expect }) => {
  const labels = ['a', 'b', 'c'];
  const result = g({ labels: labels, numerators: [0, 10, 4] })

  expect(result.labels).toEqual(labels)
  expect(result.values).toEqual([0, 10, 4])
  expect(result.targets).toEqual(rep(4, 3))
  expect(result.ll99).toEqual(rep(0, 3))
  expect(result.ll95).toEqual(rep(0, 3))
  expect(result.ul95).toEqual(rep(14.95149908036101, 3))
  expect(result.ul99).toEqual(rep(20.09391528720818, 3))
})
