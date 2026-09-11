# Publishing Meshsense Black Edition on GitHub

Prepared 9 September 2026 for 1.1.0-black.3. This is a practical release guide, not a legal opinion or a completed audit of every bundled component. Nothing has been published or permission requested on your behalf.

## 1. What is permitted, and what still needs attention

The application remains a modified GPLv3 MeshSense distribution, including its application code in the `electron` folder. The Electron framework is a separate dependency: its MIT licence permits use, modification and redistribution, including commercial distribution, provided its copyright and permission notice are preserved. The framework's MIT licence does not replace the application's GPL licence. Chromium and other bundled components have their own notices and requirements. [Electron 33.4.11 licence](https://github.com/electron/electron/blob/v33.4.11/LICENSE).

Checked locally: the unpacked Windows build contains `LICENSE.electron.txt` and `LICENSES.chromium.html`. The updated About / Legal screen also provides both documents. Keep them in every package; retaining notices alone is not a substitute for satisfying any component-specific source or other conditions.

**Runtime updated in Black.3.** This build uses Electron 44.3.0, upgraded from the unsupported Electron 33.4.11. Complete live-radio testing before a public stable release. Electron supports its latest three stable major releases. Select a supported version at release time, update the lockfile, and repeat the Windows, Bluetooth, serial, network and UI checks. Publishing source for review can happen before a production binary release. This is a maintenance recommendation, separate from copyright permission. [Release schedule](https://releases.electronjs.org/schedule), [support policy](https://www.electronjs.org/docs/latest/tutorial/electron-timelines).

Confirm that you may distribute the MHUK logo and that your chosen MeshSense-derived name is acceptable. This project does not establish trademark permission. Keep the independent-release wording and original attribution. Do not use Affirmatech's signing identity or suggest its endorsement.

## 2. Licence requirements for this release

Retain `LICENSE`, original copyright notices, warranty notices and third-party licence files. Keep a prominent dated modification notice and state that the modified application is GPLv3. Preserve the About / Legal notices. Do not add restrictions on recipients' GPL rights.

For GitHub downloads, use GPLv3 section 6(d): provide the exact corresponding source at no extra charge, with a clear link beside the installer. Source must include the preferred editable files and material needed to build and install the covered work, including build scripts and relevant dependency source. A link to unchanged upstream MeshSense is insufficient. Keep the matching source available while offering its binary; never silently replace source for an existing release. [GPLv3, sections 1, 4–6](https://www.gnu.org/licenses/gpl-3.0.html), [GNU distribution FAQ](https://www.gnu.org/licenses/gpl-faq.en.html#SourceAndBinaryOnDifferentSites).

The supplied source ZIP is the release companion. Before publishing, verify it by extracting and rebuilding in a clean folder. It includes restored dependency source and npm package sources under `vendor/npm`, but its presence is not a blanket certification of every dependency's obligations. Review the retained notices, especially native/runtime components, against the actual shipped versions. If distributing the program as part of a locked-down device, obtain advice about GPLv3 Installation Information requirements; this guide covers downloadable desktop releases.

## 3. Prepare a clean repository copy

Use a fresh folder extracted from this version's source ZIP, rather than uploading the current working directory. The current project was supplied as a ZIP, and restored dependency folders in the working directory have nested Git metadata. Adding those directly can record incomplete submodules instead of their source.

1. Extract `release/Meshsense-Black-Edition-1.1.0-black.3-source.zip` to a new folder, for example `C:\Users\JAMES\meshsense-publish`.
2. Keep all application source, `LICENSE`, `MODIFICATIONS.md`, `THIRD-PARTY-NOTICES.txt`, this guide, `BUILD-CUSTOM.md`, build scripts, lockfiles, icons and populated `api/meshtastic-js` and `api/webbluetooth` folders (including SimpleBLE).
3. For this ordinary-file repository approach, remove only the obsolete `.gitmodules` files from the extracted copy. Keep the actual dependency files. There should be no nested `.git` files or directories. Do not remove anything from the development folder.
4. Keep `vendor/npm` in the release source ZIP. You may leave it out of the Git repository to reduce repository size; the matching full source ZIP must then remain an attached release asset.
5. Inspect the copy for radio settings, channel keys, passwords, private keys, signing certificates, `.env` files, location logs and personal screenshots. Exclusions reduce accidental uploads but do not replace inspection. Do not upload installers, `node_modules`, generated `dist`/`out` folders or test data as Git source files.
6. Keep the supplied native source pin from `BUILD-CUSTOM.md`. The Windows Bluetooth prebuild matches webbluetooth v3.2.1 and MIT SimpleBLE revision `818eeb43574119bde87e9b8cdfea34e9bb17dc98`. An upstream submodule update can replace that source with a different licence revision.

Use a new repository named, for example, `meshsense-black-edition`. A repository made this way is an independent source import, not a GitHub fork with preserved upstream history. Credit and link upstream prominently in its README.

## 4. Create the repository with GitHub Desktop

Install GitHub Desktop and sign in to the account or organisation that will maintain the project. Add the extracted folder as a local repository and use its option to create a repository there if prompted. Do not select a replacement licence: retain the existing GPL `LICENSE`.

Review the complete file list before committing. In particular, check that the dependency directories contain source files rather than just submodule entries. Commit with a message such as “Import Meshsense Black Edition 1.1.0-black.3”. Publish the repository when you are ready to make those files public. You can start private for review, but a public installer must not point users at inaccessible source.

In the README, retain the existing independent-edition notice and add your real repository URL, release link, maintainer contact and supported platforms. Replace inherited project/contact links that could direct support requests to Affirmatech, while retaining original attribution. Once those edits are made, rebuild so the published source and binary reflect the same final files.

## 5. Build and verify the exact release

Follow `BUILD-CUSTOM.md` in a fresh extracted source folder. Install Node.js 24, Python 3 and the documented pnpm version, then run:

```powershell
node build-custom.mjs --install
node smoke-test.mjs
```

The build generates the installer and matching source archive. Check actual Wi-Fi/Bluetooth or serial connections and node requests with your radio; the automated smoke test sends no radio requests. Do not label Linux supported/tested until a Linux build has been verified.

Open About / Legal in the resulting app. Download its source ZIP and confirm it matches the release ZIP. Check the licence links, MHUK button, route selection/closing and request status clearing. The installer is unsigned; code signing with your own identity is optional for GPL purposes but helps users establish who published it.

Generate checksums of the final assets in PowerShell (from the project root):

```powershell
Get-FileHash electron/dist/Meshsense-Black-Edition-1.1.0-black.3-x64.exe -Algorithm SHA256
Get-FileHash release/Meshsense-Black-Edition-1.1.0-black.3-source.zip -Algorithm SHA256
```

Copy both complete results into `SHA256SUMS.txt`. Checksums detect changed downloads; they do not authenticate a publisher by themselves.

## 6. Create the GitHub Release

On your repository's Releases page, draft a new release. Create tag `v1.1.0-black.3` on the exact committed source used for the build; use title `Meshsense Black Edition 1.1.0-black.3`. Start as a pre-release while live-radio checks or maintenance work remain. A pre-release still has the same licence obligations.

Attach these files together:

- `Meshsense-Black-Edition-1.1.0-black.3-x64.exe`
- `Meshsense-Black-Edition-1.1.0-black.3-source.zip`
- `SHA256SUMS.txt`

Upload these as release assets, not ordinary repository files. GitHub limits individual regular Git files to 100 MiB; these packaged assets are larger. Do not rely solely on GitHub's automatic “Source code” download: it may omit submodule contents and the dependency sources carried in our companion ZIP. [GitHub file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github), [creating releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).

Suggested release description (replace the asset link with its actual URL):

> Independent modified version of MeshSense by Affirmatech Inc., modified 8 September 2026. Not an official Affirmatech release. Licensed under GNU GPL v3; original and dependency notices are retained. Windows x64 installer, unsigned. Matching corresponding source and build instructions: [Meshsense-Black-Edition-1.1.0-black.3-source.zip](REPLACE_WITH_SOURCE_ASSET_URL). Includes the charcoal/orange theme, MHUK website button, mesh overview, separate there/back routes and node data requests. State the actual test results and any remaining limitations here.

Before publishing, verify the release links and version numbers. After publishing, test the installer and source downloads while signed out of GitHub. Keep each release's source and notices accessible; issue a new version for later changes instead of overwriting the old assets. Update the in-app public-source wording and README once a real repository exists, then rebuild that change for the next release.


