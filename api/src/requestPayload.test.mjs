import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fromBinary } from '@bufbuild/protobuf'
import { Protobuf } from '../meshtastic-js/dist/index.js'
import { requestPayload } from './requestPayload.ts'

test('each telemetry request selects its actual protobuf variant', () => {
  for (const kind of ['deviceMetrics', 'environmentMetrics', 'powerMetrics']) {
    const result = requestPayload(kind)
    assert.equal(result.port, Protobuf.Portnums.PortNum.TELEMETRY_APP)
    assert.ok(result.payload.length > 0, 'an empty packet would lose the requested telemetry type')
    assert.equal(fromBinary(Protobuf.Telemetry.TelemetrySchema, result.payload).variant.case, kind)
  }
})
test('node info and position use their own request ports', () => {
  assert.equal(requestPayload('nodeInfo').port, Protobuf.Portnums.PortNum.NODEINFO_APP)
  assert.equal(requestPayload('position').port, Protobuf.Portnums.PortNum.POSITION_APP)
  assert.equal(requestPayload('nodeInfo').payload.length, 0)
  assert.equal(requestPayload('position').payload.length, 0)
})
