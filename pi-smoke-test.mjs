import {spawn,spawnSync} from 'node:child_process'
import {mkdtempSync,mkdirSync,readdirSync} from 'node:fs'
import {resolve,join} from 'node:path'
import assert from 'node:assert/strict'

assert.equal(process.platform,'linux')
assert.equal(process.arch,'arm64')
mkdirSync('.test-data',{recursive:true})
const dir=mkdtempSync(resolve('.test-data/pi-test-'))
const archive=readdirSync('release/pi').find(n=>n.endsWith('-headless.tar.gz'))
assert.ok(archive,'Pi archive is missing')
assert.equal(spawnSync('tar',['-xzf',resolve('release/pi',archive),'-C',dir]).status,0)
const child=spawn('sh',[join(dir,'meshsense-headless/start.sh')],{
  env:{...process.env,PORT:'15942',ADDRESS:'',MESHSENSE_DATA_DIR:join(dir,'data')},
  stdio:['ignore','pipe','pipe']
})
let output=''
child.stdout.on('data',d=>output+=d)
child.stderr.on('data',d=>output+=d)
try {
  for(let i=0;i<100 && !output.includes('Server listening');i++) {
    if(child.exitCode!==null)throw Error(output)
    await new Promise(r=>setTimeout(r,100))
  }
  assert.ok(output.includes('Server listening'),output)
  const home=await fetch('http://127.0.0.1:15942/')
  assert.equal(home.status,200)
  assert.match(await home.text(),/Meshsense Black Edition/)
  const request=await fetch('http://127.0.0.1:15942/requestNodeData',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({destination:123,kind:'deviceMetrics'})})
  assert.equal(request.status,409)
  console.log('PASS: extracted ARM64 package starts without Electron/X11, serves UI and rejects disconnected requests')
} finally { child.kill('SIGTERM') }
