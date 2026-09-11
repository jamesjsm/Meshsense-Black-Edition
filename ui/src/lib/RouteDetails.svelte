<script lang="ts">
  import { myNodeNum, nodes } from 'api/src/vars'
  import { routeTarget, routeDirection, routeLegs, hopSignal, mapRoute } from './routes'
  import { getNodeNameById, getNodeById } from './util'
  import { traceRequests } from 'api/src/nodeRequests'
  export let onFit: () => void = () => {}
  let expanded = false
  $: node = $nodes.find(n => n.num === $routeTarget)
  $: legs = routeLegs(node?.trace, node?.traceOrigin ?? $myNodeNum, node?.num)
</script>

{#if $routeTarget !== undefined}
  <div class="p-1.5 rounded bg-black/30 text-xs max-h-40 overflow-auto">
    <div class="flex gap-2 items-center flex-wrap">
      <strong>Route to {getNodeNameById($routeTarget)}</strong>
      <select aria-label="Route direction" class="input" bind:value={$routeDirection}>
        <option value="both">Both directions</option><option value="there">There</option><option value="back">Back</option>
      </select>
      <button class="btn" on:click={onFit}>Fit route</button>
      <button class="btn" on:click={() => expanded = !expanded}>{expanded ? 'Less detail' : 'More detail'}</button>
      <button class="btn" on:click={() => routeTarget.set(undefined)}>Close route</button>
    </div>
    {#if expanded}
    {#if $traceRequests[$routeTarget]?.status}<div role="status">{$traceRequests[$routeTarget].status}</div>{/if}
    {#if node?.traceReceivedAt}<div>Last received: {new Date(node.traceReceivedAt).toLocaleString()}</div>{:else if node?.trace}<div>Saved route — reception time unavailable</div>{/if}
    {#if !node?.trace}<div>No traceroute received yet.</div>{/if}
    {/if}
    {#each legs as leg}
      {#if $routeDirection === 'both' || $routeDirection === leg.key}
        <div class={leg.key === 'there' ? 'text-blue-500' : 'text-white'}>
          <strong>{leg.label}:</strong>
          {#if leg.available}
            {leg.ids.map((id, index) => (id === 0 || id === 4294967295 ? 'Unknown hop' : getNodeNameById(id)) + (expanded ? hopSignal(leg, index) : '')).join(' → ')}
          {:else}Return route unavailable{/if}
        </div>
      {/if}
    {/each}
    <div class="text-white/60">Orange: there · White: back · Dotted: estimated connection across missing/approximate positions.</div>
    {#each legs.filter(l => l.available && ($routeDirection === 'both' || l.key === $routeDirection)) as leg}
      {@const missing = mapRoute(leg.ids, getNodeById).missing}
      {#if missing.length}<div class="text-amber-200">{leg.label}: no position for {missing.map(getNodeNameById).join(', ')}. Exact placement unavailable.</div>{/if}
    {/each}
  </div>
{/if}

