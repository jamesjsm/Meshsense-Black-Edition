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
    if platform not in ('windows-x64', 'macos-arm64', 'macos-x64'):
        raise SystemExit('Unknown platform')
    suffix = '-x64.exe' if platform == 'windows-x64' else f'-{platform}.dmg'
    prefix = f'Meshsense-Black-Edition-{version}'
    installer = root / 'electron/dist' / f'{prefix}{suffix}'
    source = root / 'release' / f'{prefix}-source.zip'
    if not installer.is_file() or not source.is_file():
        raise SystemExit('Build output missing; refusing to create incomplete release assets.')
    out = root / 'release/ci'
    out.mkdir(parents=True, exist_ok=True)
    files = [out / installer.name, out / f'{prefix}-{platform}-source.zip']
    shutil.copyfile(installer, files[0])
    shutil.copyfile(source, files[1])
    instructions = ('Run the EXE installer.' if platform == 'windows-x64' else
                    'Open the DMG and drag the app to Applications. This is an ad-hoc signed testing build, not Apple-notarised. macOS may block it. A trusted, signed/notarised public release is still needed.')
    readme = out / f'README-{platform}.txt'
    readme.write_text(f'Meshsense Black Edition {version} — {platform}\n\n{instructions}\nClose any other MeshSense app before connecting to the same radio.\nKeep the matching source ZIP when sharing this installer. No developer tools are required to run it.\nIndependent GPLv3 modification of MeshSense by Affirmatech; not an official Affirmatech release. See the source and About / Legal for notices and terms.\nThese builds need real-radio and platform testing before public stable release.\n', encoding='utf-8')
    files.append(readme)
    (out / f'SHA256SUMS-{platform}.txt').write_text(''.join(
        f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in files), encoding='utf-8')
    print(f'Prepared {platform} assets in {out}')
else:
    raise SystemExit('Use check or package PLATFORM')
