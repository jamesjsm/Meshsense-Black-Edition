"""Bundle the existing Black Edition installer and matching source for sharing.
Run: py package-for-friend.py
Uses Python 3 standard library only; does not rebuild the application.
"""
from pathlib import Path
import hashlib
import json
import zipfile

root = Path(__file__).resolve().parent
version = json.loads((root / 'electron/package.json').read_text(encoding='utf-8-sig'))['version']
name = f'Meshsense-Black-Edition-{version}'
installer = root / 'electron/dist' / f'{name}-x64.exe'
source = root / 'release' / f'{name}-source.zip'
for file in (installer, source):
    if not file.is_file():
        raise SystemExit(f'Missing {file.name}. Build this version first with node build-custom.mjs.')
with zipfile.ZipFile(source) as archive:
    source_version = json.loads(archive.read('electron/package.json').decode('utf-8-sig'))['version']
    if source_version != version:
        raise SystemExit('Source archive version does not match the installer version.')

readme = f'''MESHSENSE BLACK EDITION {version}
Windows 64-bit testing build

GET STARTED
1. Right-click this sharing ZIP and choose Extract All.
2. Close any other MeshSense app before connecting to the same radio.
3. Run {installer.name} and follow the installer.
4. Open Meshsense Black Edition and enter your Meshtastic radio's
   Wi-Fi address, or select an available connection in the app.
5. Wait for the node list to populate.

No Node.js, Python or development tools are needed to run the app.
The installer is unsigned, so Windows may show an unknown-publisher
warning. Only run it if you trust the person who sent it to you.

USING THE APP
- The map shows saved routes and reported direct links by default.
- Select a traceroute to see the outward (orange) and return (white)
  paths. Dotted lines indicate estimated sections.
- Close route restores the mesh overview. Fit mesh/route adjusts the view.
- Expand Request information on a node for node, battery/device,
  environment, power or position requests. Replies depend on the radio,
  connection and available sensors.
- Completed status messages disappear after eight seconds, or use Clear status.
- The orange Mesh Hub UK button opens https://meshhub.uk/.

FILES INCLUDED
{installer.name}
  The Windows installer. This is the only file you need to run.
{source.name}
  Matching editable source, licences and build instructions. Included
  for GPL source distribution; you do not need to extract or build it.
SHA256SUMS.txt
  Checksums for checking that the two files have not changed.

LICENCE AND SHARING
Independent modified version of MeshSense by Affirmatech Inc.
Not an official Affirmatech release. Modified 8 September 2026.
The modified application is licensed under GNU GPL version 3.
Original and third-party notices are retained in the source and app.
See About / Legal and the source archive for licence and warranty terms.
If you pass this build on, include its matching source ZIP too.

TESTING LIMITS
This build uses Electron 44.3.0. It is intended for testing;
live radio behaviour still needs verification before a production release.
This installer is for Windows, not Linux or macOS.
'''
checksums = ''.join(f'{hashlib.sha256(file.read_bytes()).hexdigest()}  {file.name}\n'
                    for file in (installer, source))
output = root / 'release' / f'{name}-friend-package.zip'
# Both large inputs are already compressed; storing them keeps packaging quick.
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_STORED) as archive:
    archive.writestr('READ-ME-FIRST.txt', readme)
    archive.writestr('SHA256SUMS.txt', checksums)
    archive.write(installer, installer.name)
    archive.write(source, source.name)
with zipfile.ZipFile(output) as archive:
    bad = archive.testzip()
    if bad:
        raise SystemExit(f'ZIP verification failed: {bad}')
print(f'Ready to send: {output}\nSize: {output.stat().st_size / 1024 / 1024:.1f} MiB')
