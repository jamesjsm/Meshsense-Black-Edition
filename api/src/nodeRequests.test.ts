import assert from 'node:assert/strict'
import { nodeRequests, traceRequests, setRequestStatus, setTraceStatus, clearCompletedStatuses } from './nodeRequests'

const originalTimeout = globalThis.setTimeout
const scheduled: (() => void)[] = []
globalThis.setTimeout = ((callback: () => void, delay: number) => {
  assert.equal(delay, 8000)
  scheduled.push(callback)
  return { unref() {} }
}) as any
try {
  setRequestStatus(1, 'deviceMetrics', 'Data received')
  const at = nodeRequests.value['1:deviceMetrics'].at
  scheduled.shift()()
  assert.equal(nodeRequests.value['1:deviceMetrics'].status, '')
  assert.equal(nodeRequests.value['1:deviceMetrics'].at, at, 'dismissal must preserve cooldown metadata')
  setRequestStatus(1, 'deviceMetrics', 'Send failed')
  setRequestStatus(1, 'deviceMetrics', 'Waiting for data')
  scheduled.shift()()
  assert.equal(nodeRequests.value['1:deviceMetrics'].status, 'Waiting for data', 'old timer must not erase a new request')
  setRequestStatus(1, 'powerMetrics', 'Send failed')
  setTraceStatus(1, 'Route received')
  clearCompletedStatuses(1)
  assert.equal(nodeRequests.value['1:powerMetrics'].status, '')
  assert.equal(traceRequests.value[1].status, '')
  assert.equal(nodeRequests.value['1:deviceMetrics'].status, 'Waiting for data')
  console.log('PASS: automatic dismissal, manual clearing, retained cooldowns, and protection of pending requests')
} finally {
  globalThis.setTimeout = originalTimeout
}
