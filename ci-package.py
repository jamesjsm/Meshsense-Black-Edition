"""Validate the repository and collect distinct per-platform release assets."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

root = Path(__file__).resolve().parent
version = json.loads((root / 'electron/package.json').read_text(encoding='utf-8-sig'))['version']
if sys.argv[1] == 'check':
    for relative in ['api/meshtastic-js/package.json', 'api/webbluetooth/package.json',
                     'api/webbluetooth/SimpleBLE/simpleble/CMakeLists.txt',
                     'api/meshtastic-js/pnpm-lock.yaml', 'api/webbluetooth/pnpm-lock.yaml']:
        if not (root / relative).is_file():
            raise SystemExit(f'Missing {relative}. Use the prepared repository ZIP; dependency sources must be committed as ordinary files.')
    print('Dependency source and lockfile checks passed.')
elif sys.argv[1] == 'package':
    platform = sys.argv[2]
    if platform not in ('windows-x64', 'macos-arm64', 'macos-x64', 'linux-x64'):
        raise SystemExit('Unknown platform')
    suffix = '-x64.exe' if platform == 'windows-x64' else '-linux-x64.AppImage' if platform == 'linux-x64' else f'-{platform}.dmg'
    prefix = f'Meshsense-Black-Edition-{version}'
    installer = root / 'electron/dist' / f'{prefix}{suffix}'
    source = root / 'release' / f'{prefix}-source.zip'
    if platform == 'linux-x64' and not installer.is_file():
        # AppImage builders may spell the architecture x86_64 instead of x64.
        # Also accept the earlier configured name without the platform segment.
        candidates = [root / 'electron/dist' / name for name in (
            f'{prefix}-linux-x86_64.AppImage',
            f'{prefix}-x64.AppImage',
            f'{prefix}-x86_64.AppImage',
        )]
        matches = [p for p in candidates if p.is_file()]
        if len(matches) == 1:
            installer = matches[0]
        elif len(matches) > 1:
            raise SystemExit(f'Ambiguous AppImage outputs: {[p.name for p in matches]}')
    if not installer.is_file() or not source.is_file():
        for directory in (root / 'electron/dist', root / 'release'):
            print(f'Files in {directory}: {[p.name for p in directory.iterdir() if p.is_file()] if directory.exists() else "directory absent"}', flush=True)
        raise SystemExit(f'Build output missing. Expected installer: {installer}; expected source: {source}')
    out = root / 'release/ci'
    out.mkdir(parents=True, exist_ok=True)
    files = [out / f'{prefix}{suffix}', out / f'{prefix}-{platform}-source.zip']
    shutil.copyfile(installer, files[0])
    shutil.copyfile(source, files[1])
    instructions = ('Run the EXE installer.' if platform == 'windows-x64' else
                    'Mark the AppImage executable in file Properties, then run it. This x64 test build targets Ubuntu 24.04 or newer compatible systems; older distributions may lack its native libraries. Bluetooth needs BlueZ and a running system D-Bus. AppImage mounting may need libfuse2t64 on Ubuntu 24.04. This is not an ARM/Raspberry Pi build.' if platform == 'linux-x64' else
                    'Open the DMG and drag the app to Applications. This is an ad-hoc signed testing build, not Apple-notarised. macOS may block it. A trusted, signed/notarised public release is still needed.')
    readme = out / f'README-{platform}.txt'
    readme.write_text(f'Meshsense Black Edition {version} — {platform}\n\n{instructions}\nClose any other MeshSense app before connecting to the same radio.\nKeep the matching source ZIP when sharing this installer. No developer tools are required to run it.\nIndependent GPLv3 modification of MeshSense by Affirmatech; not an official Affirmatech release. See the source and About / Legal for notices and terms.\nThese builds need real-radio and platform testing before public stable release.\n', encoding='utf-8')
    files.append(readme)
    (out / f'SHA256SUMS-{platform}.txt').write_text(''.join(
        f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in files), encoding='utf-8')
    print(f'Prepared {platform} assets in {out}')
else:
    raise SystemExit('Use check or package PLATFORM')
