# Meshsense Black Edition — modification notice

Modified on 11 September 2026. Release: 1.1.0-black.4 (build preparation).

Added manual GitHub Actions builds for Windows x64 and macOS Intel/Apple Silicon, matching per-platform source assets, checksums and optional draft releases. macOS uses locally compiled Bluetooth source and ad-hoc signing, without notarisation. The first hosted builds and Mac hardware tests remain outstanding.

Maintenance update: Electron upgraded from 33.4.11 to 44.3.0, pinned in the dependency manifest and lockfile. Previous Black.2 packages remain separate for rollback. Live radio, Linux and macOS verification remains outstanding.

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

The matching `Meshsense-Black-Edition-1.1.0-black.3-source.zip` accompanies the installer. The identical archive is available through About / Legal → Download this version's source. Supply that archive alongside this exact installer whenever sharing it. It contains the application source, restored Meshtastic/WebBluetooth/SimpleBLE sources, dependency package sources, lockfiles, notices and build scripts. Dependency sources are collected under `vendor/npm`; normal development installation still uses the lockfiles.

No public repository or external source download has been published for this edition. Publishing this fork or securing naming/logo permissions is not represented as completed by these notices. Review branding permissions before a public release. Source and licence compliance does not itself grant trademark rights.

Build instructions are in BUILD-CUSTOM.md. The original source repository is https://github.com/Affirmatech/MeshSense.


