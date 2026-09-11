"""Package the built API for an ARM64 Pi; Node 24 is installed separately."""
from pathlib import Path
import hashlib, json, shutil, tarfile, tempfile, platform, sys

if sys.platform != 'linux' or platform.machine() not in ('aarch64', 'arm64'):
    raise SystemExit('Package Pi binaries only on Linux ARM64; use the GitHub Pi job.')

root=Path(__file__).resolve().parent
version=json.loads((root/'electron/package.json').read_text(encoding='utf-8-sig'))['version']
prefix=f'Meshsense-Black-Edition-{version}'
out=root/'release/pi'
out.mkdir(parents=True,exist_ok=True)
(root/'.test-data').mkdir(exist_ok=True)
stage=Path(tempfile.mkdtemp(prefix='pi-stage-',dir=root/'.test-data'))/'meshsense-headless'
stage.mkdir(parents=True,exist_ok=True)
shutil.copytree(root/'api/dist',stage/'app',dirs_exist_ok=True)
for name in ('start.sh','meshsense-headless.service','README-PI.md'):
    shutil.copyfile(root/'pi'/name,stage/name)
(stage/'start.sh').chmod(0o755)
(stage/'VERSION').write_text(version+'\n')
archive=out/f'{prefix}-pi-arm64-headless.tar.gz'
with tarfile.open(archive,'w:gz') as tar:
    tar.add(stage,arcname='meshsense-headless')
source=out/f'{prefix}-pi-arm64-source.zip'
shutil.copyfile(root/'release'/f'{prefix}-source.zip',source)
shutil.copyfile(root/'pi/README-PI.md',out/'README-pi-arm64.md')
(out/'SHA256SUMS-pi-arm64.txt').write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in (archive,source)))
print(f'Pi package ready: {archive}')
