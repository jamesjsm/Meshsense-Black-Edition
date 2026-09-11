# Build installers on GitHub

Black.6 additionally builds **desktop-pi-arm64-headless** on an ARM64 runner inside Debian Bookworm. This is a separate service tarball, not an AppImage. See `pi/README-PI.md`: Node 24 is required on the Pi, browser access uses an SSH tunnel, and no desktop is needed. Draft releases now wait for the four desktop jobs and the Pi job. Its first hosted build and real-Pi test remain outstanding.

Updated for Black.5. The previous Black.4 Windows and Mac jobs passed on GitHub. Black.5 includes connection fixes and adds a Linux x64 job; its hosted builds and real-device retests remain outstanding. Existing installers are unchanged.

## Upload the project

1. Run `py prepare-github.py` in the development folder. Extract the resulting `release/Meshsense-Black-Edition-GitHub-source.zip` into a fresh folder.
2. Use GitHub Desktop to create a repository from that folder. Review the changes, commit and publish it to your account. The prepared ZIP includes the workflow (inside `.github`), all lockfiles and populated dependency source as ordinary files. Do not replace it with the old Black.3 source ZIP.
3. Keep `LICENSE`, notices, modification history and source files. Review for private data before publishing. The preparation script excludes known build/data folders and private-key file types but cannot recognise every possible secret.

## Run a build

On GitHub open **Actions → Build desktop packages → Run workflow**. Leave **Create a draft release** off for the first test run. Four jobs build Windows x64, macOS Apple Silicon, macOS Intel and Linux x64 on matching hosted machines. No Apple certificate or other secret is required for these testing builds.

When a run succeeds, download its four **Artifacts**. Each contains a package, matching source, readme and checksums: Windows `.exe`, Macs `.dmg`, Linux `.AppImage`. Actions downloads require GitHub access and expire after 30 days; use Releases for lasting downloads.

If a job fails, open the red step and share its log. Linux requires its first hosted build. For Macs, follow MAC-CONNECTION-TEST.md: successful packaging does not establish Finder/Dock Local Network access with ad-hoc signing.

## Create downloadable EXE/DMG releases

Once testing is satisfactory, run the workflow with **Create a draft release** selected. All four builds must pass before it creates a draft pre-release tagged from the exact build commit. Review the notes and assets in **Releases**, then publish manually. The workflow never publishes a release automatically.

Use a new version in `electron/package.json` for each new release. Update modification dates/notices too. An existing release tag causes creation to fail rather than overwrite its files. A failed draft step does not remove successful build artifacts.

Each platform's source ZIP has a distinct name because dependencies and runtime notices can differ between machines. Keep every installer next to its matching source; do not substitute a source ZIP from another version. See `GITHUB-PUBLISHING.md` for the distribution/licence guide.

## Mac limitations and Linux

Mac builds are ad-hoc signed and not notarised. Gatekeeper may block downloads. They are for testing, not a claim of Apple-approved distribution. Public-friendly Mac installation requires your own Developer ID signing and notarisation configuration in a later step. Electron 44 requires macOS 13 or later.

Linux uses Ubuntu 24.04 x64, builds the native Bluetooth component from its pinned source, and runs the packaged service under Xvfb. The CI-only startup check disables Chromium's sandbox on the disposable hosted runner; it does not change installed-app defaults and is not proof of desktop sandbox compatibility. Test the AppImage on a real Linux desktop, including sandbox startup, BlueZ/D-Bus permissions, serial access and radio connections. This build is not for ARM/Raspberry Pi, and older distributions may not provide the native libraries it requires.

## Local checks

`python ci-package.py check` validates that required dependency sources and lockfiles are present. `node build-custom.mjs --install` builds on the current Windows/Mac host. macOS requires Xcode command-line tools and CMake; hosted Mac runners supply these. `node smoke-test.mjs` checks the packaged service with isolated data without sending radio requests. Do not cross-build native Mac dependencies on Windows.

The workflow uses GitHub-hosted runner labels documented at https://docs.github.com/en/actions/reference/runners/github-hosted-runners. Building a private repository may consume your Actions allowance; review your account's usage settings.
