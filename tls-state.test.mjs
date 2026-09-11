import {spawn} from 'node:child_process'
import {mkdtempSync,mkdirSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {once} from 'node:events'
import assert from 'node:assert/strict'
import WebSocket from './api/node_modules/ws/index.js'

mkdirSync('.test-data',{recursive:true})
const data=mkdtempSync(resolve('.test-data/tls-state-'))
let child
let output=''
async function start() {
  output=''
  child=spawn(process.execPath,['api/dist/index.cjs'],{env:{...process.env,PORT:'15937',ADDRESS:'',MESHSENSE_DATA_DIR:data},stdio:['ignore','pipe','pipe']})
  child.stdout.on('data',d=>output+=d)
  child.stderr.on('data',d=>output+=d)
  for(let i=0;i<100;i++) {
    if(child.exitCode!==null) throw Error(output)
    if(output.includes('Server listening')) return
    await new Promise(r=>setTimeout(r,100))
  }
  throw Error('Service did not start: '+output)
}
async function stop() { if(child && child.exitCode===null) {child.kill();await once(child,'exit')} }
async function snapshot() {
  const ws=new WebSocket('ws://127.0.0.1:15937/ws')
  const state=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('No initial state')),5000)
    ws.on('error',reject)
    ws.on('message',raw=>{const m=JSON.parse(raw);if(m.event==='initState'){clearTimeout(timer);resolve(m.data)}})
  })
  return {ws,state}
}
try {
  await start()
  const first=await snapshot()
  assert.equal(first.state.autoConnectOnStartup,false)
  const response=await fetch('http://127.0.0.1:15937/connectionTLS',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enableTLS:true})})
  assert.equal(response.status,200)
  first.ws.send(JSON.stringify({event:'state',data:{name:'enableTLS',action:'set',args:[false]}}))
  await new Promise(r=>setTimeout(r,100))
  const second=await snapshot()
  assert.equal(second.state.enableTLS,true,'Generic WebSocket update must not overwrite TLS')
  first.ws.close();second.ws.close()
  // Local, deliberately blocked port: exercises the full service failure path without a radio.
  const failed=await fetch('http://127.0.0.1:15937/connect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:'127.0.0.1:1',enableTLS:true})})
  assert.equal(failed.status,200)
  await new Promise(r=>setTimeout(r,16000))
  const afterFailure=await snapshot()
  assert.equal(afterFailure.state.connectionStatus,'disconnected','Exhausted HTTP attempts must return UI to disconnected')
  assert.equal((output.match(/Starting connection attempt/g)||[]).length,1,'Application must not restart the exhausted transport')
  afterFailure.ws.close()
  await stop();await start()
  const restarted=await snapshot()
  assert.equal(restarted.state.enableTLS,true,'TLS survives service restart')
  assert.equal(restarted.state.connectionStatus,'disconnected')
  restarted.ws.close()
  console.log('PASS: TLS save/restart, stale WebSocket rejection, bounded service connection and startup disconnected')
} finally { await stop() }
