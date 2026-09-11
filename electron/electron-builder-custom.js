const base = require('./electron-builder-config.js')
module.exports = {
  ...base,
  appId: 'local.meshsense.custom',
  productName: 'Meshsense Black Edition',
  publish: null,
  generateUpdatesFilesForAllChannels: false,
  mac: {
    target: ['dmg'],
    artifactName: 'Meshsense-Black-Edition-${version}-macos-${arch}.${ext}',
    category: 'public.app-category.utilities',
    icon: 'build/black-edition.png',
    identity: '-',
    hardenedRuntime: false,
    notarize: false,
    extendInfo: {
      NSLocalNetworkUsageDescription: 'Connect to your Meshtastic radio on your local network.',
      NSBluetoothAlwaysUsageDescription: 'Connect to your Meshtastic radio using Bluetooth.',
      NSBluetoothPeripheralUsageDescription: 'Connect to your Meshtastic radio using Bluetooth.'
    }
  },
  dmg: { artifactName: 'Meshsense-Black-Edition-${version}-macos-${arch}.${ext}' },
  win: {
    target: ['nsis'],
    artifactName: 'Meshsense-Black-Edition-${version}-${arch}.${ext}',
    executableName: 'Meshsense Black Edition',
    icon: 'build/black-edition.ico',
    signAndEditExecutable: false
  },
  nsis: { ...base.nsis, artifactName: 'Meshsense-Black-Edition-${version}-${arch}.${ext}', installerIcon: 'build/black-edition.ico', uninstallerIcon: 'build/black-edition.ico' },
  linux: { ...base.linux, target: ['AppImage'], executableName: 'meshsense-black-edition', maintainer: 'Black Edition contributors', icon: 'build/black-edition.png' },
  appImage: { artifactName: 'Meshsense-Black-Edition-${version}-linux-${arch}.${ext}' }
}
