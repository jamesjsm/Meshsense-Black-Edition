Independent modified version of MeshSense by Affirmatech Inc., distributed under GNU GPL v3. Not an official Affirmatech release.

Download the installer for your platform and its matching platform-labelled source ZIP from the assets below. Each source ZIP contains that build's source, dependency notices and build instructions. Retain it when redistributing the installer.

Windows: unsigned EXE installer. macOS: separate Apple Silicon (arm64) and Intel (x64) DMGs, ad-hoc signed for testing and not Apple-notarised. No Apple Developer identity is claimed.

Linux: x64 AppImage built on Ubuntu 24.04; mark executable before running. BlueZ/D-Bus and desktop permissions need real-device testing. Older distributions and ARM devices are not covered by this build.

Black.5 adds bounded connection retries, HTTP timeouts, TLS persistence safeguards and a Local Network usage description. The latter does not resolve Apple's ad-hoc identity limitation by itself; see MAC-CONNECTION-TEST.md.

These are testing packages. Inspect the build logs and test installation, connections, map and requests on each platform before publishing. A successful build does not prove live-radio or macOS permission behaviour. GitHub Actions artifacts expire; publish the matching source assets with binaries and keep them available.
