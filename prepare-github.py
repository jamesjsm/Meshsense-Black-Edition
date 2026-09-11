"""Create a source-only GitHub import ZIP without nested repositories or builds."""
from pathlib import Path
import os
import zipfile

root = Path(__file__).resolve().parent
excluded = {'node_modules', '.git', '.test-data', '.store', '.codex', '.agents',
            'release', '.vscode', '__pycache__', 'vendor'}
generated = {'api/dist', 'api/static', 'api/prebuilds', 'api/meshtastic-js/dist',
             'api/webbluetooth/dist', 'api/webbluetooth/build', 'electron/out',
             'electron/dist', 'electron/resources/api', 'electron/resources/prebuilds'}
output = root / 'release/Meshsense-Black-Edition-GitHub-source.zip'
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as z:
    for base, dirs, files in os.walk(root, followlinks=False):
        rel = Path(base).relative_to(root)
        dirs[:] = [d for d in dirs if d not in excluded and (rel/d).as_posix() not in generated and not Path(base,d).is_symlink()]
        for name in files:
            p = Path(base,name)
            # Upstream ignores generated protocol source which this snapshot needs.
            # The root ignore file covers build outputs for this ordinary-file import.
            if name == '.gitignore' and rel != Path('.'):
                continue
            if p.is_symlink() or name in {'.git', '.gitmodules'} or name.startswith('.env'):
                continue
            if p.suffix.lower() in {'.zip','.log','.exe','.dll','.node','.pdb','.so','.dylib','.tsbuildinfo','.pem','.key','.pfx','.p12'}:
                continue
            z.write(p, p.relative_to(root).as_posix())
with zipfile.ZipFile(output) as z:
    assert '.github/workflows/desktop-build.yml' in z.namelist()
    assert 'api/webbluetooth/SimpleBLE/simpleble/CMakeLists.txt' in z.namelist()
    assert not any('.git' in Path(n).parts or 'node_modules' in Path(n).parts for n in z.namelist())
    assert z.testzip() is None
print(f'Ready to import with GitHub Desktop: {output}')
