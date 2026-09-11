import { State } from './lib/state'

export type RequestKind = 'nodeInfo' | 'deviceMetrics' | 'environmentMetrics' | 'powerMetrics' | 'position'
export const requestKinds: RequestKind[] = ['nodeInfo', 'deviceMetrics', 'environmentMetrics', 'powerMetrics', 'position']
export const nodeRequests = new State<Record<string, { status: string; at: number }>>('nodeRequests', {}, { hideLog: true })
export const traceRequests = new State<Record<number, { status: string; at: number }>>('traceRequests', {}, { hideLog: true })

export function isCompletedStatus(status: string) {
  return !!status && !['Queued', 'Waiting for data', 'Waiting for route'].includes(status)
}

function dismissLater(state: State<any>, key: string | number) {
  const entry = state.value[key]
  if (!isCompletedStatus(entry.status)) return
  setTimeout(() => {
    if (state.value[key] === entry) state.assign({ [key]: { ...entry, status: '' } })
  }, 8000).unref()
}

export function clearCompletedStatuses(destination: number) {
  for (const kind of requestKinds) {
    const key = `${destination}:${kind}`
    const entry = nodeRequests.value[key]
    if (entry && isCompletedStatus(entry.status)) nodeRequests.assign({ [key]: { ...entry, status: '' } })
  }
  const trace = traceRequests.value[destination]
  if (trace && isCompletedStatus(trace.status)) traceRequests.assign({ [destination]: { ...trace, status: '' } })
}

export function setTraceStatus(destination: number, status: string) {
  traceRequests.assign({ [destination]: { status, at: Date.now() } })
  dismissLater(traceRequests, destination)
}

export function setRequestStatus(destination: number, kind: RequestKind, status: string) {
  nodeRequests.assign({ [`${destination}:${kind}`]: { status, at: Date.now() } })
  dismissLater(nodeRequests, `${destination}:${kind}`)
}

export function receiveNodeData(destination: number, kind: RequestKind) {
  if (nodeRequests.value[`${destination}:${kind}`]?.status === 'Waiting for data') {
    setRequestStatus(destination, kind, 'Data received')
  }
}
