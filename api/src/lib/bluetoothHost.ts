import { existsSync, readdirSync } from 'node:fs'

/** Avoid entering synchronous native BlueZ discovery on hosts without Bluetooth. */
export function canProbeBluetooth(
  platform = process.platform,
  adapters = () => readdirSync('/sys/class/bluetooth'),
  hasBus = () => existsSync('/run/dbus/system_bus_socket')
) {
  if (platform !== 'linux') return true
  try { return hasBus() && adapters().some(name => /^hci\d+$/.test(name)) }
  catch { return false }
}
