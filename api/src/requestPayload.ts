import { create, toBinary } from '@bufbuild/protobuf'
import { Protobuf } from '../meshtastic-js/dist/index.js'
import type { RequestKind } from './nodeRequests'

export function requestPayload(kind: RequestKind) {
  if (kind === 'nodeInfo' || kind === 'position') {
    return { payload: new Uint8Array(), port: kind === 'nodeInfo' ? Protobuf.Portnums.PortNum.NODEINFO_APP : Protobuf.Portnums.PortNum.POSITION_APP }
  }
  const telemetry = create(Protobuf.Telemetry.TelemetrySchema, { variant: { case: kind, value: {} } })
  return { payload: toBinary(Protobuf.Telemetry.TelemetrySchema, telemetry), port: Protobuf.Portnums.PortNum.TELEMETRY_APP }
}
