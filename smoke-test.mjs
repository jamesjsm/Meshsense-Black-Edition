import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const root = dirname(fileURLToPath(import.meta.url))
const data = join(root, '.test-data', 'packaged-startup')
mkdirSync(data, { recursive: true })
const executable = process.platform === 'darwin'
  ? join(root, `electron/dist/${process.arch === 'arm64' ? 'mac-arm64' : 'mac'}/Meshsense Black Edition.app/Contents/MacOS/Meshsense Black Edition`)
  : join(root, 'electron/dist/win-unpacked/Meshsense Black Edition.exe')
const child = spawn(executable, ['--headless'], {
  windowsHide: true,
  env: { ...process.env, PORT: '15927', ADDRESS: '', MESHSENSE_DATA_DIR: data },
  stdio: ['ignore', 'pipe', 'pipe']
})
let output = ''
child.stdout.on('data', chunk => { output += chunk })
child.stderr.on('data', chunk => { output += chunk })
let launchError
child.on('error', error => { launchError = error })
try {
  let ready = false
  for (let i = 0; i < 40; i++) {
    if (launchError) throw launchError
    if (child.exitCode !== null) throw new Error(`App exited: ${child.exitCode}\n${output}`)
    if (output.includes('Server listening')) { ready = true; break }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  assert.ok(ready, `Service did not start:\n${output}`)
  const home = await fetch('http://localhost:15927/')
  assert.equal(home.status, 200)
  assert.match(await home.text(), /<html/i)
  for (const [path, body, expected] of [
    ['/requestNodeData', { destination: 123, kind: 'deviceMetrics' }, 409],
    ['/requestNodeData', { destination: 4294967295, kind: 'powerMetrics' }, 400],
    ['/requestNodeData', { destination: 123, kind: 'invalid' }, 400],
    ['/traceRoute', { destination: 123 }, 409],
    ['/traceRoute', { destination: 4294967295 }, 400]
  ]) {
    const result = await fetch(`http://localhost:15927${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    assert.equal(result.status, expected, `${path}: ${await result.text()}`)
  }
  console.log('PASS: packaged service starts, serves the UI, and rejects disconnected/invalid requests. No radio transmissions requested.')
} finally {
  writeFileSync(join(root, 'packaged-startup.log'), output)
  if (child.pid) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    else child.kill('SIGTERM')
  }
}

