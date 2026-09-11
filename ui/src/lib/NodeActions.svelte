<script lang="ts">
  import axios from 'axios'
  import { connectionStatus, currentTime, type NodeInfo } from 'api/src/vars'
  import { nodeRequests, traceRequests, isCompletedStatus, type RequestKind } from 'api/src/nodeRequests'
  import { onDestroy } from 'svelte'
  import { hasAccess } from './util'
  import { routeTarget } from './routes'
  export let node: NodeInfo
  let error = ''
  let errorTimer: ReturnType<typeof setTimeout>
  function showError(message: string) {
    clearTimeout(errorTimer)
    error = message
    errorTimer = setTimeout(() => error = '', 8000)
  }
  onDestroy(() => clearTimeout(errorTimer))
  $: hasCompleted = actions.some(a => isCompletedStatus($nodeRequests[`${node.num}:${a.kind}`]?.status)) || isCompletedStatus($traceRequests[node.num]?.status)
  async function clearStatus() {
    showError('')
    try { await axios.post('/clearNodeRequestStatus', { destination: node.num }) }
    catch (e) { showError(e.response?.data?.error || 'Could not clear status') }
  }
  const actions: { kind: RequestKind; label: string }[] = [
    { kind: 'nodeInfo', label: 'Node info' }, { kind: 'deviceMetrics', label: 'Device / battery' },
    { kind: 'environmentMetrics', label: 'Environment' }, { kind: 'powerMetrics', label: 'Power sensors' },
    { kind: 'position', label: 'Position' }
  ]
  async function request(kind: RequestKind) {
    error = ''
    try { await axios.post('/requestNodeData', { destination: node.num, kind }) }
    catch (e) { showError(e.response?.data?.error || e.message || 'Request failed') }
  }
</script>

<details class="text-xs mt-1 min-w-0 max-w-64 break-words">
  <summary class="cursor-pointer">Request information</summary>
  <div class="flex flex-col items-stretch gap-1.5 py-2">
    {#if node.trace}<button class="btn" on:click={() => routeTarget.set(node.num)}>View saved route</button>{/if}
    {#if hasCompleted || error}<button class="btn" disabled={!$hasAccess} on:click={clearStatus}>Clear status</button>{/if}
    {#each actions as action}
      {@const state = $nodeRequests[`${node.num}:${action.kind}`]}
      <div class="min-w-0">
        <button class="btn w-full text-left" disabled={!$hasAccess || $connectionStatus !== 'connected' || state?.status === 'Waiting for data' || ($currentTime - (state?.at ?? 0) < 60000)} on:click={() => request(action.kind)}>{action.label}</button>
        {#if state?.status}<div role="status">{state.status}</div>{/if}
      </div>
    {/each}
  </div>
  {#if error}<div role="alert" class="text-red-300">{error}</div>{/if}
  <div class="text-white/60">Readings depend on the node's sensors and settings. Data received means new data arrived after the request.</div>
  {#if node.powerMetrics}
    <div class="flex gap-2 flex-wrap">{#each Object.entries(node.powerMetrics).filter(([key]) => !key.startsWith('$')) as [key, value]}<span>{key}: {value}{key.toLowerCase().includes('voltage') ? ' V' : key.toLowerCase().includes('current') ? ' mA' : ''}</span>{/each}</div>
  {/if}
</details>
