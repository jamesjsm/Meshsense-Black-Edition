# Build installers on GitHub

Prepared 11 September 2026. The workflow is ready for its first hosted run; it has not yet produced or tested a macOS installer. Black.3 Windows installers remain unchanged. The next build version is Black.4.

## Upload the project

1. Run `py prepare-github.py` in the development folder. Extract the resulting `release/Meshsense-Black-Edition-GitHub-source.zip` into a fresh folder.
2. Use GitHub Desktop to create a repository from that folder. Review the changes, commit and publish it to your account. The prepared ZIP includes the workflow (inside `.github`), all lockfiles and populated dependency source as ordinary files. Do not replace it with the old Black.3 source ZIP.
3. Keep `LICENSE`, notices, modification history and source files. Review for private data before publishing. The preparation script excludes known build/data folders and private-key file types but cannot recognise every possible secret.

## Run a build

On GitHub open **Actions → Build desktop packages → Run workflow**. Leave **Create a draft release** off for the first test run. The three jobs build Windows x64, macOS Apple Silicon and macOS Intel on matching hosted machines. No Apple certificate or other secret is required for these testing builds.

When a run succeeds, open its summary and download the three **Artifacts**. Each artifact contains its installer, matching source ZIP, readme and checksums. Windows gets `.exe`; Macs get `.dmg`. These downloads require GitHub access and expire after 30 days; use Releases for lasting downloads.

If a job fails, open the red step and share its log. The Mac native Bluetooth build, packaging and startup check particularly need their first hosted run. No working Mac package is claimed until those pass, and actual Bluetooth permissions/connections still require testing on a Mac.

## Create downloadable EXE/DMG releases

Once testing is satisfactory, run the workflow with **Create a draft release** selected. All three builds must pass before it creates a draft pre-release tagged from the exact build commit. Review the notes and assets in **Releases**, then publish manually. The workflow never publishes a release automatically.

Use a new version in `electron/package.json` for each new release. Update modification dates/notices too. An existing release tag causes creation to fail rather than overwrite its files. A failed draft step does not remove successful build artifacts.

Each platform's source ZIP has a distinct name because dependencies and runtime notices can differ between machines. Keep every installer next to its matching source; do not substitute a source ZIP from another version. See `GITHUB-PUBLISHING.md` for the distribution/licence guide.

## Mac limitations and Linux

Mac builds are ad-hoc signed and not notarised. Gatekeeper may block downloads. They are for testing, not a claim of Apple-approved distribution. Public-friendly Mac installation requires your own Developer ID signing and notarisation configuration in a later step. Electron 44 requires macOS 13 or later.

Linux is not included in this first workflow: the existing AppImage path and Linux-specific native dependencies need separate verification. No Mac or Linux testing has taken place on this Windows PC.

## Local checks

`python ci-package.py check` validates that required dependency sources and lockfiles are present. `node build-custom.mjs --install` builds on the current Windows/Mac host. macOS requires Xcode command-line tools and CMake; hosted Mac runners supply these. `node smoke-test.mjs` checks the packaged service with isolated data without sending radio requests. Do not cross-build native Mac dependencies on Windows.

The workflow uses GitHub-hosted runner labels documented at https://docs.github.com/en/actions/reference/runners/github-hosted-runners. Building a private repository may consume your Actions allowance; review your account's usage settings.
