import { test } from 'node:test'
import assert from 'node:assert/strict'
import { routeLegs, hopSignal, mapRoute, meshOverview } from './routes.ts'

test('outward and return hops remain in their reported order', () => {
  const legs = routeLegs({ route: [2, 3], routeBack: [5, 6], snrTowards: [4, -128, -8], snrBack: [8, 12, 16] }, 1, 4)
  assert.deepEqual(legs[0].ids, [1, 2, 3, 4])
  assert.deepEqual(legs[1].ids, [4, 5, 6, 1])
  assert.equal(hopSignal(legs[0], 1), ' (1 dB)')
  assert.equal(hopSignal(legs[0], 2), ' (? dB)')
  assert.equal(hopSignal(legs[0], 3), ' (-2 dB)')
})
test('old empty return fields do not imply a direct return', () => {
  assert.equal(routeLegs({ route: [], routeBack: [], snrBack: [] }, 1, 2)[1].available, false)
  assert.equal(routeLegs({ route: [], routeBack: [], snrBack: [0] }, 1, 2)[1].available, true)
})
test('missing and mismatched signal data are not assigned to the wrong hop', () => {
  assert.deepEqual(routeLegs(undefined, 1, 2), [])
  const leg = routeLegs({ route: [3], snrTowards: [12] }, 1, 2)[0]
  assert.equal(hopSignal(leg, 1), '')
  assert.equal(hopSignal(leg, 2), '')
})

test('missing intermediate positions keep an explicitly uncertain connection', () => {
  const nodes = { 1: { position: { longitudeI: -20000000, latitudeI: 520000000 } }, 3: { position: { longitudeI: -10000000, latitudeI: 530000000 } } }
  const result = mapRoute([1, 2, 3], id => nodes[id])
  assert.deepEqual(result.missing, [2])
  assert.equal(result.segments.length, 1)
  assert.equal(result.segments[0].uncertain, true)
})
test('real adjacent hops are solid; approximate positions are marked uncertain', () => {
  const nodes = { 1: { position: { longitudeI: 0, latitudeI: 520000000 } }, 2: { position: { longitudeI: 10000000, latitudeI: 530000000 } }, 3: { approximatePosition: { longitude: 2, latitude: 54 } } }
  const result = mapRoute([1, 2, 3, 4], id => nodes[id])
  assert.deepEqual(result.segments.map(s => s.uncertain), [false, true])
  assert.deepEqual(result.missing, [4])
})

test('mesh overview merges shared outbound/return links and includes direct neighbours', () => {
  const nodes = [1,2,3,4].map(num => ({ num, position: { longitudeI: num * 10000000, latitudeI: 520000000 } }))
  nodes[1].hopsAway = 0
  nodes[2].trace = { route: [2], routeBack: [2] }
  nodes[3].trace = { route: [2,3] }
  const links = meshOverview(nodes, 1, id => nodes.find(n => n.num === id))
  assert.equal(links.length, 3)
  assert.ok(links.every(l => !l.uncertain))
})
test('mesh overview excludes traces from a different connected radio', () => {
  const nodes = [{num: 1, position: {longitudeI: 10000000, latitudeI: 520000000}}, {num: 2, traceOrigin: 99, trace: {route: []}, position: {longitudeI: 20000000, latitudeI: 520000000}}]
  assert.deepEqual(meshOverview(nodes, 1, id => nodes.find(n => n.num === id)), [])
})
