import { writable } from 'svelte/store'

export const routeTarget = writable<number | undefined>(undefined)
export const routeDirection = writable<'both' | 'there' | 'back'>('both')

export function routeLegs(trace: any, origin: number, destination: number) {
  if (!trace) return []
  const route = trace.route ?? []
  const back = trace.routeBack ?? []
  const backAvailable = back.length > 0 || trace.snrBack?.length === back.length + 1
  return [
    { key: 'there', label: 'There', ids: [origin, ...route, destination], snr: trace.snrTowards ?? [], available: true },
    { key: 'back', label: 'Back', ids: [destination, ...back, origin], snr: trace.snrBack ?? [], available: backAvailable }
  ]
}

export function hopSignal(leg: ReturnType<typeof routeLegs>[number], index: number) {
  if (index === 0 || leg.snr.length !== leg.ids.length - 1) return ''
  const value = leg.snr[index - 1]
  return value === -128 ? ' (? dB)' : ` (${value / 4} dB)`
}

export function mapRoute(ids: number[], lookup: (id: number) => any) {
  const located = ids.map((id, index) => {
    const node = lookup(id)
    const p = node?.position
    const valid = (c: number[]) => c.every(Number.isFinite) && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90 && (c[0] !== 0 || c[1] !== 0)
    const real = [p?.longitudeI / 1e7, p?.latitudeI / 1e7]
    const approximate = [node?.approximatePosition?.longitude, node?.approximatePosition?.latitude]
    return valid(real) ? { index, coords: real, approximate: false } : valid(approximate) ? { index, coords: approximate, approximate: true } : undefined
  })
  const segments: { points: number[][]; uncertain: boolean }[] = []
  let previous: NonNullable<typeof located[number]>
  for (const point of located) {
    if (!point) continue
    if (previous) segments.push({ points: [previous.coords, point.coords], uncertain: point.index !== previous.index + 1 || previous.approximate || point.approximate })
    previous = point
  }
  return { segments, missing: ids.filter((_, index) => !located[index]), coordinates: located.filter(Boolean).map(p => p.coords) }
}

/** Overview links are undirected and deduplicated; selecting a trace restores direction. */
export function meshOverview(nodes: any[], origin: number, lookup: (id: number) => any) {
  const links = new Map<string, ReturnType<typeof mapRoute>['segments'][number]>()
  for (const node of nodes) {
    if (node.num === origin || (node.traceOrigin !== undefined && node.traceOrigin !== origin)) continue
    const legs = node.trace ? routeLegs(node.trace, origin, node.num).filter(l => l.available).map(l => l.ids)
      : node.hopsAway === 0 ? [[origin, node.num]] : []
    for (const ids of legs) for (const segment of mapRoute(ids, lookup).segments) {
      const points = segment.points.map(p => p.join(',')).sort()
      if (points[0] === points[1]) continue
      const key = points.join('|')
      if (!links.has(key) || !segment.uncertain) links.set(key, segment)
    }
  }
  return [...links.values()]
}
