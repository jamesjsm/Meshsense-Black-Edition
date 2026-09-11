# Meshsense Black Edition build instructions

For the new Black.4 Windows/macOS GitHub workflow, follow **GITHUB-BUILDS.md**. The Black.3 filenames below describe the previously tested Windows release. Black.4 hosted builds have not run yet. macOS is now accepted by the custom script and compiles its Bluetooth dependency locally; the Linux path remains unverified.

This is an independent GPLv3 modification of MeshSense, not an official Affirmatech release. Modified 8 September 2026. See MODIFICATIONS.md.

## Use the Windows build

The Windows x64 installer is:

`electron/dist/Meshsense-Black-Edition-1.1.0-black.3-x64.exe`

1. Close other MeshSense windows before connecting to the same radio.
2. Run the installer and launch **Meshsense Black Edition**.
3. This build uses separate settings, so enter your radio's Wi-Fi address or select its Bluetooth connection again.
4. Wait for the node list to populate.
5. Click a remote node's **↯** button to request a traceroute. The map panel shows **There**, **Back**, or **Both directions**. Orange is outward; white dashed is return. Arrows show travel direction. Close route restores the mesh overview; Fit mesh brings located nodes into view.
6. Expand **Request information** in a node's row to request **Node info**, **Device / battery**, **Environment**, **Power sensors**, or **Position**. **View saved route** opens a previous result without sending another request.

The installer is unsigned. Windows may show an unknown-publisher warning. Verify that the file is the custom build you intended to run; this build does not use Affirmatech's signing certificate.

For a run without installing, keep the entire `electron/dist/win-unpacked` folder together and launch `Meshsense Black Edition.exe` inside it. Do not copy only the executable.

## What changed

- Separate outward and return traceroute chains in the map panel and packet log.
- Per-hop signal readings when the response includes a complete signal list.
- A return route is labelled unavailable when it was not reported; an empty old-format return array is not assumed to mean a direct connection.
- Selected-route map lines and arrows. Dotted sections indicate estimated connections across missing or approximate positions; missing nodes are listed explicitly. Fit route brings located hops into view.
- Traceroute queued/waiting/received/timeout status, and reception time for new results.
- Node information and telemetry requests with disconnected/error handling, cooldowns and response status.
- Dedicated power-sensor readings are separate from ordinary device battery/voltage readings.
- All 13 known device roles are displayed, including Router Late and Client Base. Repeater is marked deprecated; future unknown roles show their numeric value.
- Custom release name, separate stored settings and disabled official update checks.
- Build fixes for existing type errors and Windows loading of a Linux-only Bluetooth dependency.

Requests use the destination node's recorded channel, falling back to the primary channel. An information request needs a connected radio and access to control it. Identical information requests have a 60-second cooldown, and different requests must be at least 5 seconds apart. Data requests time out after 90 seconds. Traceroutes retain the app's global queue spacing; their 90-second response timeout starts when sent, not while queued.

“Data received” means data of that type arrived from that node after the request. A periodic broadcast can satisfy this indication. A timeout is not proof a sensor is absent. Radio reachability, firmware, channel settings and installed/enabled sensors determine which responses are possible.

## Rebuild on this Windows PC

Use **Node.js 24.x** and **Python 3** (the `py` command on Windows). Python builds the matching source archive using its standard library. This build was prepared with Node 24.19.0 and pnpm 11.19.0. Node's Windows installer also installs npm. Reopen PowerShell after installing Node if it is not found.

Open PowerShell and run:

```powershell
cd "C:\Users\JAMES\meshsensecode\MeshSense-master"
node --version
node build-custom.mjs
```

The dependencies have already been downloaded in this working folder. The build checks the interface and API, runs the route and request-encoding tests, builds the app, and creates the installer under `electron/dist`. Allow a few minutes, especially for installer compression.

For a quicker folder build without an installer:

```powershell
node build-custom.mjs --unpacked
```

Close a running custom app before rebuilding its output folder. The build stops at the first failed command; read that error before trying again.

## Install dependencies again, or move to another PC

Copy the source folder including `api/meshtastic-js`, `api/webbluetooth` and all `pnpm-lock.yaml` files. You can omit `node_modules`, generated `dist`/`out` folders, `.test-data`, and logs.

Install Node 24.x, then run:

```powershell
npm.cmd install --global pnpm@11.19.0
cd "C:\Users\JAMES\meshsensecode\MeshSense-master"
node build-custom.mjs --install
```

Change the path to match the folder on the other PC. The install step uses the supplied pnpm lockfiles, downloads Electron and the prebuilt Bluetooth component, then builds. It needs internet access. Use this custom build script rather than `update.mjs`, which pulls upstream source changes, or the original signed-release build commands.

If the two dependency source folders are missing, restore these exact revisions using Git before running the install step:

```powershell
git clone https://github.com/Affirmatech/meshtastic-js.git api/meshtastic-js
git -C api/meshtastic-js checkout 204db7486849ccbdc8a8e671cb9f64155a82469f
git clone https://github.com/Affirmatech/webbluetooth.git api/webbluetooth
git -C api/webbluetooth checkout 86d459c5c5e0fad7018c71450a40884a60f295de
git -C api/webbluetooth fetch https://github.com/thegecko/webbluetooth.git tag v3.2.1
git -C api/webbluetooth restore --source=v3.2.1 -- lib/peripheral.cpp lib/peripheral.h
git -C api/webbluetooth submodule update --init --recursive
git -C api/webbluetooth/SimpleBLE checkout 818eeb43574119bde87e9b8cdfea34e9bb17dc98
```

Also restore this custom version's dependency `pnpm-lock.yaml` files from your source copy. A GitHub source ZIP normally does not contain populated submodules.

The native wrapper and MIT-licensed SimpleBLE revision above match the webbluetooth v3.2.1 Windows prebuild. Keep this pin: a later submodule update can replace it with a different source/licence revision. The supplied source ZIP already contains the pinned files.

## Linux

The shared app changes are intended for Linux too, and the custom script has an AppImage target when run on Linux. **The Linux package has not been built or tested here.** Build on Linux, not by running the Windows installer.

Linux also requires the platform's Bluetooth/BlueZ and D-Bus setup; native components may need a compiler and CMake. If no matching Bluetooth prebuild is available, compile that dependency before using the build script without `--install`. The inherited optional Unix-socket native dependency also needs checking in a Linux build. Do not treat the Windows verification as Linux verification.

## Verification and limits

- The custom build script includes Svelte, API and Electron type checks and focused route/protobuf and status-dismissal tests.
- `node smoke-test.mjs` checks the unpacked Windows app in headless mode, serves the UI, and exercises invalid/disconnected request errors using isolated settings. It does not connect to a radio or send mesh requests.
- Actual there/back routes, Bluetooth/Wi-Fi connection behaviour and telemetry replies still need testing with your Meshtastic radio.
- The restored Meshtastic JS fork uses the 2.5.9 protocol definitions. Those definitions contain the route and telemetry fields used here. This is not a wholesale upgrade to every newer firmware feature.
- Custom radio settings live under the custom app's user-data folder in `radio-data`. The optional `MESHSENSE_DATA_DIR` environment variable overrides that directory for development/testing.

The installer and source remain subject to the licenses included with MeshSense and its dependencies.

## Custom.2 interface fixes

The route summary is compact, with More detail for signal readings and timestamps. Request buttons are stacked vertically. Completed statuses disappear after eight seconds, or immediately using Clear status. Pending requests remain visible, and clearing a status keeps the received readings and cooldowns intact.


## Custom.3 map fix

Close route now removes only the route panel and route lines. The map remains visible in both expanded and normal layouts.


## Sharing Black Edition

Distribute the matching source ZIP in the release folder with the installer. The same ZIP is included in About / Legal. Keep the GPL licence, modification notice and third-party notices with the source. The source packer excludes settings, test data and secrets. No public repository or naming permission has been secured; review naming/logo permission before public distribution.



