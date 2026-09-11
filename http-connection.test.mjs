import assert from 'node:assert/strict'
import { HttpConnection } from './api/meshtastic-js/dist/index.js'

const originalFetch = globalThis.fetch
try {
  const connection = new HttpConnection()
  connection.defaultRetryConfig.initialDelayMs = 20
  connection.defaultRetryConfig.backoffFactor = 2
  const attempts = []
  globalThis.fetch = async (url) => { attempts.push({url, at:Date.now()}); throw new TypeError('fetch failed') }
  await connection.connect({address:'10.0.1.12',tls:true})
  assert.equal(attempts.length,5)
  assert.ok(attempts.every(a=>a.url==='https://10.0.1.12/index.html'))
  assert.ok(attempts[4].at-attempts[0].at >= 260, 'Backoff must actually delay retries')
  await new Promise(r=>setTimeout(r,80))
  assert.equal(attempts.length,5, 'Failure must not recursively restart connect')
  assert.ok(connection.abortController.signal.aborted)

  const cancelled = new HttpConnection()
  let count=0
  globalThis.fetch = async () => { count++; throw new TypeError('fetch failed') }
  const pending = cancelled.connect({address:'10.0.1.12'})
  setTimeout(()=>cancelled.disconnect(),20)
  await pending
  assert.equal(count,1,'Cancel interrupts the retry delay')

  const timeout = new HttpConnection()
  globalThis.fetch = async (_url,{signal}) => new Promise((_,reject)=>{
    signal.addEventListener('abort',()=>reject(signal.reason),{once:true})
  })
  const keepAlive = setInterval(()=>{},1000)
  try { await assert.rejects(timeout.request('http://127.0.0.1/'), /timeout|timed out/i) }
  finally { clearInterval(keepAlive); timeout.disconnect() }
  console.log('PASS: bounded retries, exponential delays, TLS URL, cancellation and request timeout')
} finally { globalThis.fetch = originalFetch }
