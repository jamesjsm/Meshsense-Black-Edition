Independent modified version of MeshSense by Affirmatech Inc., distributed under GNU GPL v3. Not an official Affirmatech release.

Download the installer for your platform and its matching platform-labelled source ZIP from the assets below. Each source ZIP contains that build's source, dependency notices and build instructions. Retain it when redistributing the installer.

Windows: unsigned EXE installer. macOS: separate Apple Silicon (arm64) and Intel (x64) DMGs, ad-hoc signed for testing and not Apple-notarised. No Apple Developer identity is claimed.

Linux: x64 AppImage built on Ubuntu 24.04; mark executable before running. BlueZ/D-Bus and desktop permissions need real-device testing. Older distributions and ARM devices are not covered by this build.

Pi: separate ARM64 headless tar.gz for 64-bit Raspberry Pi OS Bookworm or newer, requiring Node.js 24. Read README-pi-arm64.md for installation and SSH-tunnel browser access. No Electron/desktop required. Hardware/radio testing remains outstanding.

Black.6 adds a separate Pi ARM64 headless package, platform-selection checkboxes for manual GitHub builds, recognition of loopback addresses for UI controls, and a Linux startup fix that waits for the server to bind before opening the window. Automated builds and startup checks have passed for all five targets.

Black.5 introduced bounded connection retries, HTTP timeouts, TLS persistence safeguards and a Local Network usage description. The latter does not resolve Apple's ad-hoc identity limitation by itself; see MAC-CONNECTION-TEST.md.

These are testing packages. Real-device testing should cover installation, connections, map and requests on each platform. A successful build does not prove live-radio or macOS permission behaviour. GitHub Actions artifacts expire; publish the matching source assets with binaries and keep them available.
