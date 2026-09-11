#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [ "$(uname -m)" != aarch64 ]; then
  echo 'This package needs a 64-bit ARM Linux system (aarch64).' >&2
  exit 1
fi
NODE="${MESHSENSE_NODE:-node}"
if ! command -v "$NODE" >/dev/null 2>&1; then
  echo 'Install Node.js 24 ARM64 first; see README-PI.md.' >&2
  exit 1
fi
"$NODE" -e 'if(process.versions.node.split(".")[0]!=="24") { console.error("Node.js 24 is required"); process.exit(1) }'
export MESHSENSE_HEADLESS=1
export MESHSENSE_VERSION="$(cat VERSION)"
# Keep the control service private; use the documented SSH tunnel for browser access.
export MESHSENSE_BIND_HOST=127.0.0.1
export PORT="${PORT:-5920}"
export MESHSENSE_DATA_DIR="${MESHSENSE_DATA_DIR:-$HOME/.local/share/meshsense-black-edition}"
exec "$NODE" app/index.cjs
