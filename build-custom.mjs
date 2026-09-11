import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { cpSync, existsSync, mkdirSync } from 'node:fs'

const root = dirname(fileURLToPath(import.meta.url))
const windows = process.platform === 'win32'
const mac = process.platform === 'darwin'
if (!windows && !mac && process.platform !== 'linux') throw new Error('Unsupported build platform.')
function run(dir, command, args) {
  const result = spawnSync(command, args, { cwd: join(root, dir), stdio: 'inherit', shell: windows && command.endsWith('.cmd') })
  if (result.error || result.status !== 0) throw new Error(`${command} failed in ${dir}: ${result.error?.message || result.status}`)
}
const node = (dir, script, ...args) => run(dir, process.execPath, [script, ...args])
for (const dir of ['api/meshtastic-js', 'api/webbluetooth']) {
  if (!existsSync(join(root, dir, 'package.json'))) throw new Error(`Missing ${dir}. Restore the dependency sources before building (see BUILD-CUSTOM.md).`)
}
if (process.argv.includes('--install')) {
  for (const dir of ['api/meshtastic-js', 'api/webbluetooth', 'api', 'ui', 'electron']) {
    run(dir, windows ? 'pnpm.cmd' : 'pnpm', ['install', '--ignore-scripts', '--frozen-lockfile'])
  }
  node('electron', 'node_modules/electron/install.js')
  if (mac) node('api/webbluetooth', 'node_modules/cmake-js/bin/cmake-js', 'compile')
  else node('api/webbluetooth', 'node_modules/prebuild-install/bin.js', '--runtime', 'napi')
}
node('api/meshtastic-js', 'node_modules/tsup/dist/cli-default.js')
node('api/webbluetooth', 'node_modules/typescript/bin/tsc')
node('ui', 'node_modules/svelte-check/bin/svelte-check', '--tsconfig', './tsconfig.json')
node('ui', 'src/lib/routes.test.mjs')
node('api', 'src/requestPayload.test.mjs')
node('api', 'node_modules/vite-node/vite-node.mjs', 'src/nodeRequests.test.ts')
node('api', 'node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.build.json')
run('', process.env.PYTHON || (windows ? 'py' : 'python3'), ['package-source.py'])
node('ui', 'node_modules/vite/bin/vite.js', 'build', '--outDir', '../api/dist/static')
node('api', 'node_modules/rollup/dist/bin/rollup', '-c')
// Preserve the native serial binaries alongside the bundled radio service.
const serialRoot = join(root, 'api/node_modules/@serialport/bindings-cpp/prebuilds')
if (existsSync(serialRoot)) {
  cpSync(serialRoot, join(root, 'api/dist/prebuilds'), { recursive: true })
  cpSync(serialRoot, join(root, 'electron/resources/prebuilds'), { recursive: true })
}
mkdirSync(join(root, 'electron/resources/api'), { recursive: true })
cpSync(join(root, 'api/dist'), join(root, 'electron/resources/api'), { recursive: true })
node('electron', 'node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.node.json', '--composite', 'false')
node('electron', 'node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.web.json', '--composite', 'false')
node('electron', 'node_modules/electron-vite/bin/electron-vite.js', 'build')
node('electron', 'node_modules/electron-builder/cli.js', windows ? '--win' : mac ? '--mac' : '--linux', '--config', 'electron-builder-custom.js', '--publish', 'never', ...(process.argv.includes('--unpacked') ? ['--dir'] : []))
console.log('Custom build complete. Output: electron/dist')
