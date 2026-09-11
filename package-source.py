"""Build the Black Edition source companion and retained third-party notices.
Modified 2026-09-08. GPL-3.0-only; see LICENSE.
"""
from pathlib import Path
import json, os, zipfile, shutil

root = Path(__file__).resolve().parent
version = json.loads((root / 'electron/package.json').read_text(encoding='utf-8-sig'))['version']
release = root / 'release'
release.mkdir(exist_ok=True)
archive = release / f'Meshsense-Black-Edition-{version}-source.zip'
excluded = {'node_modules', '.git', '.test-data', '.store', '.codex', '.agents', 'release', '.vscode', '__pycache__'}
generated = {'api/dist', 'api/static', 'api/prebuilds', 'api/meshtastic-js/dist', 'api/webbluetooth/dist', 'api/webbluetooth/build', 'electron/out', 'electron/dist', 'electron/resources/api', 'electron/resources/prebuilds'}
binary = {'.exe', '.dll', '.node', '.pdb', '.so', '.dylib', '.pak', '.bin', '.dat'}

def project_files():
    for base, dirs, files in os.walk(root, followlinks=False):
        rel = Path(base).relative_to(root)
        dirs[:] = [d for d in dirs if d not in excluded and (rel / d).as_posix() not in generated and not Path(base, d).is_symlink()]
        for f in files:
            p = Path(base, f)
            if f == '.git' or f.startswith('.env') or f.endswith(('.log', '.zip', '.tsbuildinfo')) or p.suffix.lower() in binary:
                continue
            yield p, p.relative_to(root).as_posix()

packages = {}
for folder in ['api', 'ui', 'electron', 'api/meshtastic-js', 'api/webbluetooth']:
    store = root / folder / 'node_modules/.pnpm'
    if not store.exists(): continue
    for manifest in store.glob('*/node_modules/*/package.json'):
        try:
            pkg = json.loads(manifest.read_text(encoding='utf-8'))
            packages.setdefault((pkg['name'], pkg['version']), (manifest.parent.resolve(), pkg))
        except (ValueError, KeyError): pass
    for manifest in store.glob('*/node_modules/@*/*/package.json'):
        try:
            pkg = json.loads(manifest.read_text(encoding='utf-8'))
            packages.setdefault((pkg['name'], pkg['version']), (manifest.parent.resolve(), pkg))
        except (ValueError, KeyError): pass

notices = ['Meshsense Black Edition — third-party notices', 'Original application: MeshSense by Affirmatech Inc.; GPL v3. See LICENSE and MODIFICATIONS.md.', 'MHUK logo: https://meshhub.uk/images/mhuk-logo.svg — used to identify the requested link; rights remain with its owner.', 'Dependency notices follow. Source packages are retained in the source archive under vendor/npm.']
native_license = (root / 'api/webbluetooth/SimpleBLE/LICENSE.md').read_text(encoding='utf-8')
if not native_license.startswith('MIT License'):
    raise SystemExit('Restore the MIT SimpleBLE revision listed in BUILD-CUSTOM.md before packaging.')
notices.extend(['Native Bluetooth: webbluetooth v3.2.1; SimpleBLE 818eeb43574119bde87e9b8cdfea34e9bb17dc98.', native_license])
runtime = root / 'electron/node_modules/electron/dist'
for original, target in [('LICENSE', 'LICENSE.electron.txt'), ('LICENSES.chromium.html', 'LICENSES.chromium.html')]:
    if not (runtime / original).exists():
        raise SystemExit(f'Missing Electron runtime notice: {original}. Install the runtime before packaging.')
    shutil.copyfile(runtime / original, root / 'ui/public' / target)
for (name, ver), (directory, pkg) in sorted(packages.items()):
    notices.append(f'\n{name} {ver}\nDeclared licence: {pkg.get("license", pkg.get("licenses", "See package source"))}\nRepository: {pkg.get("repository", "See package source")}')
    for file in directory.iterdir():
        if file.is_file() and file.name.lower().startswith(('license', 'licence', 'copying', 'notice', 'copyright')):
            try: notices.append(file.read_text(encoding='utf-8', errors='replace'))
            except OSError: pass
notices_text = '\n\n'.join(notices)
(root / 'THIRD-PARTY-NOTICES.txt').write_text(notices_text, encoding='utf-8')
shutil.copyfile(root / 'LICENSE', root / 'ui/public/LICENSE.txt')
shutil.copyfile(root / 'THIRD-PARTY-NOTICES.txt', root / 'ui/public/THIRD-PARTY-NOTICES.txt')
shutil.copyfile(root / 'MODIFICATIONS.md', root / 'ui/public/MODIFICATIONS.md')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for file, relative in project_files(): z.write(file, relative)
    for (name, ver), (directory, pkg) in sorted(packages.items()):
        prefix = f'vendor/npm/{name.replace("/", "__")}/{ver}'
        for base, dirs, files in os.walk(directory, followlinks=False):
            dirs[:] = [d for d in dirs if d not in {'node_modules', '.git'} and not Path(base, d).is_symlink()]
            for file in files:
                p = Path(base, file)
                if p.suffix.lower() in binary or p.name.startswith('.env'): continue
                z.write(p, f'{prefix}/{p.relative_to(directory).as_posix()}')
shutil.copyfile(archive, root / 'ui/public/black-edition-source.zip')
print(f'Created {archive.name}: {archive.stat().st_size // 1024 // 1024} MiB; {len(packages)} dependency source packages')
