<script context="module" lang="ts">
  import { writable } from 'svelte/store'
  export let expandedMap = writable(false)
  export let setPositionMode = writable(false)
  import { generateHexer } from '@bdancer/icon-gaga'

  export function getSvgUri(name: string) {
    const hexId = parseInt(name).toString(16).padStart(8, '0')
    const colorId = hexId.slice(-6)
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(generateHexer({ 
      name,
      borderColor: `#${colorId}`
    }))
  }

  export function getIconURL(node: NodeInfo) {
    if (node.position?.latitudeI) {
      if (node?.position?.altitude > 2743) return `${import.meta.env.VITE_PATH || ''}/airplane.svg`
      else return getSvgUri(String(node.num))
      // else return `https://icongaga-api.bytedancer.workers.dev/api/genHexer?name=${node.num}`
    } else {
      return `${import.meta.env.VITE_PATH || ''}/circle-help.svg`
    }
  }
</script>

<script lang="ts">
  import { connectionStatus, myNodeNum, version, type NodeInfo } from 'api/src/vars'
  import { filteredNodes, isInactive, nodeVisibilityMode } from './Nodes.svelte'
  import Card from './lib/Card.svelte'
  import OpenLayersMap from './lib/OpenLayersMap.svelte'
  import { getCoordinates, getNodeById, getNodeName, getNodeNameById, setPosition } from './lib/util'
  import { showConfigModal, showPage } from './SettingsModal.svelte'
  import { newsVisible } from './News.svelte'
  import RouteDetails from './lib/RouteDetails.svelte'
  import { routeTarget, routeDirection, routeLegs, mapRoute, meshOverview } from './lib/routes'
  import { nodes } from 'api/src/vars'

  export let ol: OpenLayersMap = undefined

  $: nodesWithCoords = $filteredNodes.filter((n) => !(n.position?.latitudeI == undefined || n.position?.latitudeI == 0) || n.approximatePosition)

  function plotData() {
    let myNodeCoords = getCoordinates($myNodeNum)

    const target = $nodes.find(n => n.num === $routeTarget)
    const overview = $routeTarget === undefined ? meshOverview($filteredNodes, $myNodeNum, getNodeById) : []
    ol.plotLines('mesh-overview', overview.filter(s => !s.uncertain).map(s => s.points), 'rgba(255,135,29,0.65)', false, false, true)
    ol.plotLines('mesh-overview-uncertain', overview.filter(s => s.uncertain).map(s => s.points), 'rgba(255,135,29,0.45)', true, true, true)
    const legs = routeLegs(target?.trace, target?.traceOrigin ?? $myNodeNum, target?.num)
    for (const direction of ['there', 'back']) {
      let segments: ReturnType<typeof mapRoute>['segments'] = []
      const leg = legs.find(l => l.key === direction)
      if (leg?.available && ($routeDirection === 'both' || $routeDirection === direction)) {
        segments = mapRoute(leg.ids, getNodeById).segments
      }
      ol.plotLines(`route-${direction}`, segments.filter(s => !s.uncertain).map(s => s.points), direction === 'there' ? '#FF871D' : '#f1f1f1', direction === 'back')
      ol.plotLines(`route-${direction}-uncertain`, segments.filter(s => s.uncertain).map(s => s.points), direction === 'there' ? '#FF871D' : '#f1f1f1', true, true)
    }

    ol.plotPoints(
      'nodes',
      nodesWithCoords.map((n) => {
        let [lon, lat] = getCoordinates(n)
        return {
          lat,
          lon,
          icon: getIconURL(n),
          description: getNodeName(n)
        }
      })
    )
  }

  $: {
    $myNodeNum, nodesWithCoords, $nodes, $routeTarget, $routeDirection
    if (ol) {
      plotData()
    }
  }

  let modalPage = 'Settings'
  function fitRoute() {
    const target = $nodes.find(n => n.num === $routeTarget)
    const legs = routeLegs(target?.trace, target?.traceOrigin ?? $myNodeNum, target?.num)
    ol?.fitCoordinates(legs.filter(l => l.available && ($routeDirection === 'both' || l.key === $routeDirection)).flatMap(l => mapRoute(l.ids, getNodeById).coordinates))
  }
  function fitMesh() {
    ol?.fitCoordinates($filteredNodes.flatMap(n => mapRoute([n.num], getNodeById).coordinates))
  }
</script>

<Card title="Map" {...$$restProps}>
  <h2 slot="title" class="rounded-t flex items-center gap-1">
    <div class="mr-2">Map</div>

    <div class="grow">
      <button on:click={() => ($expandedMap = !$expandedMap)} class="btn font-normal text-xs">{$expandedMap ? 'Collapse' : 'Expand'}</button>
    </div>
    <button class="text-xs text-blue-500 pr-2" on:click={() => showPage('About / Legal')}>Meshsense Black Edition · {$version}</button>
    <button class="text-xs text-white/50 pr-2 font-normal" on:click={() => showPage('About / Legal')}>About / Legal</button>
    <a title="Support MeshSense" target="_blank" rel="noopener" class="!text-rose-400 font-bold btn text-sm hover:brightness-110" href="https://purchase.affirmatech.com/?productId=MeshSenseDonation"
      >♥</a
    >
    <button title="What's New?" class="btn btn-sm h-6 grid place-content-center" on:click={() => newsVisible.set(true)}>📰</button>
    <a title="MeshSense Global Map" target="_blank" rel="noopener" class="font-bold btn text-sm hover:brightness-110" href="https://meshsense.affirmatech.com/">🌎</a>
    <button title="Settings" class="btn btn-sm h-6 font-normal grid place-content-center" on:click={() => showPage('Settings')}>⚙</button>
    <a href="https://meshhub.uk/" target="_blank" rel="noopener noreferrer" title="Mesh Hub UK website" aria-label="Open Mesh Hub UK website" class="shrink-0 inline-flex items-center gap-2 rounded-sm bg-[#FF871D] px-3 py-1 !text-black hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
      <img src="/mhuk-symbol.svg" alt="" class="h-7 w-7 object-contain" />
      <span class="text-sm font-semibold whitespace-nowrap">Mesh Hub UK</span>
    </a>
  </h2>
  <div class="grid grid-rows-[auto_minmax(0,1fr)] h-full min-h-0 overflow-hidden">
  <!-- Keep this grid row present when the route panel is closed. -->
  <div class="min-h-0">
    {#if $routeTarget === undefined}
      <div class="flex gap-2 items-center px-2 py-1 text-xs text-white/60">
        <span>Mesh overview · saved routes and reported direct links · dotted = estimated</span>
        <button class="btn shrink-0" on:click={fitMesh}>Fit mesh</button>
      </div>
    {/if}
    <RouteDetails onFit={fitRoute} />
  </div>
  <OpenLayersMap
    bind:this={ol}
    center={JSON.parse(localStorage.getItem('mapCenter')) ?? getCoordinates($myNodeNum)}
    zoom={JSON.parse(localStorage.getItem('mapZoom'))}
    onMove={(center, zoom) => {
      localStorage.setItem('mapCenter', JSON.stringify(center))
      localStorage.setItem('mapZoom', JSON.stringify(zoom))
    }}
    onClick={(latitude, longitude) => {
      if ($setPositionMode) {
        $setPositionMode = false
        setPosition(latitude, longitude)
      }
    }}
    onDarkModeToggle={plotData}
  ></OpenLayersMap>
  </div>
  {#if $setPositionMode}
    <div class="absolute select-none top-10 left-10 bg-indigo-600/80 text-white p-3 py-1 rounded-lg">
      Click on a new position for {getNodeNameById($myNodeNum)}
      <button title="Cancel selecting a position" class="btn btn-sm ml-2 font-bold !text-red-200 !from-rose-500 !to-rose-800 rounded-full" on:click={() => ($setPositionMode = false)}>X</button>
    </div>
  {/if}
</Card>

