# Meshsense Black Edition — modification notice

Release: 1.1.0-black.6. Code modifications through 12 September 2026; publication documentation updated 15 September 2026.

The public Black.6 pre-release includes the Linux server-listening timing fix and platform-selection checkboxes. Automated builds and startup checks have passed for Windows, both Mac targets, Linux x64 and Pi ARM64. Real-device testing remains separate from these checks.

Black.6 adds a separate ARM64 headless Pi package built in Debian Bookworm, with a Node 24 prerequisite, user service example, SSH-tunnel browser access and its own hosted startup test. Pi hardware validation remains outstanding. Desktop builds remain included. Localhost UI controls now also recognise 127.0.0.1 and IPv6 loopback.

Black.5: bounded HTTP retries and request timeouts, cancellation, explicit TLS persistence protected against generic WebSocket overwrites, discarded stale startup state, auto-connect off by default, loopback-only internal server by default and macOS Local Network usage description. See MAC-CONNECTION-TEST.md for remaining ad-hoc signing limitations and real-Mac checks.

Added Linux x64 AppImage to GitHub builds and draft release assets. Linux compiles the pinned native Bluetooth source and uses its adapter availability check, avoiding the separate node-ble native dependency path. Real Linux desktop and radio verification remains outstanding.

Linux startup follow-up: skip native Bluetooth discovery when sysfs reports no adapter or the system D-Bus socket is absent. CI starts a dedicated D-Bus session alongside Xvfb. This addresses the observed stall before the HTTP server starts on a runner without Bluetooth hardware; the subsequent hosted startup check passed.

Added manual GitHub Actions builds for Windows x64 and macOS Intel/Apple Silicon, matching per-platform source assets, checksums and optional draft releases. macOS uses locally compiled Bluetooth source and ad-hoc signing, without notarisation. Hosted builds have passed; Mac hardware and permission testing remains outstanding.

Maintenance update: Electron upgraded from 33.4.11 to 44.3.0, selected by the lockfile. Previous Black.2 packages remain separate for rollback. Live radio, Linux and macOS verification remains outstanding.

This is an independent modified version of MeshSense, originally developed by Affirmatech Inc. It is not an official Affirmatech release and does not claim endorsement or permission to use any trademark. Original copyright notices and the GNU GPL version 3 licence are retained. Copyright in modifications remains with their respective contributors (2026).

The modified program is distributed under GNU GPL version 3. Third-party components retain their own notices and licences. There is no warranty beyond any obligation imposed by applicable law; see LICENSE for the complete terms.

Changes in this edition:

- Discord-inspired charcoal panels with #FF871D highlights and an original Black Edition app icon.
- Mesh overview links return whenever no individual traceroute is selected; shared links are drawn once and estimated links are dotted.
- Independent edition name and an accessible About / Legal screen.
- MHUK website-link button using the logo retrieved from https://meshhub.uk/images/mhuk-logo.svg at the user's request. The logo identifies the linked site; no ownership or blanket relicensing of that logo is claimed.
- Separate outward/return traceroutes, per-hop signal readings, clear handling of missing return information, map fitting and dotted estimated sections.
- Compact route summary that leaves the map visible, including after Close route.
- Vertical node-information, device/battery, environment, power-sensor and position request controls.
- Cooldowns, request-state feedback, automatic dismissal after eight seconds and manual clearing of completed statuses.
- Updated role notices and a fallback for unknown roles.
- Build/type fixes, independent Windows packaging and disabled official update checks.
- Source download, retained licence texts and third-party notices included with the app.

## Source distribution

Each released application package has a matching platform-labelled source ZIP on the [public release page](https://github.com/jamesjsm/Meshsense-Black-Edition/releases/tag/v1.1.0-black.6). Supply the matching archive alongside that exact package when redistributing it. The archives contain application and dependency source, lockfiles, notices and build scripts. Dependency package sources are collected under `vendor/npm`; normal development installation still uses the lockfiles. About / Legal also offers the source archive included in the application build.

The public repository is https://github.com/jamesjsm/Meshsense-Black-Edition. Publication does not imply endorsement or trademark permission. Original copyright and licence notices remain intact.

Build instructions are in BUILD-CUSTOM.md and GITHUB-BUILDS.md. The original source repository is https://github.com/Affirmatech/MeshSense.
