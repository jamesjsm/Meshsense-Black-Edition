# Raspberry Pi headless testing package

For 64-bit Raspberry Pi OS Bookworm (Debian 12) or newer, initially Pi 4/5. `uname -m` must say `aarch64`. This is not the Linux desktop AppImage and does not support 32-bit Pi OS. No desktop or Electron is required. The first ARM64 GitHub build and real-Pi tests are still required.

## Prepare the Pi

Enable SSH in Raspberry Pi OS and connect using your own Pi username. Install **Node.js 24 for Linux ARM64**, using the official instructions/download at https://nodejs.org/en/download. Verify `node --version` starts with `v24`. Use a system-wide installation in `/usr/local/bin` or `/usr/bin` for the supplied service; a shell-only nvm installation needs an explicit MESHSENSE_NODE environment setting in the service.

Install the system Bluetooth/D-Bus runtime if needed:

```sh
sudo apt update
sudo apt install bluez dbus libdbus-1-3
```

No npm installation or compilation is needed on the Pi. Node is a prerequisite and is not bundled. Bluetooth needs the operating system's normal BlueZ permissions and an available adapter. Start with a Wi-Fi radio connection when testing; USB/serial support is not added by this package.

## Extract and start

Copy the downloaded `*-pi-arm64-headless.tar.gz` to the Pi. From your home folder, substitute its actual filename:

```sh
cd ~
tar -xzf Meshsense-Black-Edition-VERSION-pi-arm64-headless.tar.gz
cd ~/meshsense-headless
./start.sh
```

It prints a listening message for port 5920. Leave it running while testing. A missing Bluetooth adapter should not prevent network-radio operation. Press Ctrl+C to stop it.

## Open the interface from your Windows/Mac/Linux computer

Run this on **your computer**, replacing USER and PI_ADDRESS:

```sh
ssh -N -L 15920:127.0.0.1:5920 USER@PI_ADDRESS
```

Keep that SSH session open and browse to **http://127.0.0.1:15920** on the same computer. Enter your radio's network address and select TLS if it requires HTTPS, then Connect. New installations do not auto-connect until you enable that option. The Pi needs network access to the radio; the browser computer needs SSH access to the Pi.

This package deliberately binds to the Pi's loopback address. Direct `http://PI_ADDRESS:5920` access will not work. The SSH tunnel authenticates and encrypts browser access without exposing the app's existing control interface to the LAN. Do not forward this service through your internet router. A direct-LAN login/proxy option is not included in this release.

## Run as a background service

After the manual test works:

```sh
mkdir -p ~/.config/systemd/user
cp ~/meshsense-headless/meshsense-headless.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now meshsense-headless
```

To keep it running after logout and start it at boot, run `sudo loginctl enable-linger "$USER"`. Stop the foreground copy first so only one process uses the port/radio.

Status and logs:

```sh
systemctl --user status meshsense-headless
journalctl --user -u meshsense-headless -n 100
systemctl --user stop meshsense-headless
```

Settings live in `~/.local/share/meshsense-black-edition`. Before upgrading, stop the service, back up that directory, and replace the application folder with the new package. Do not delete the settings directory unless you intend to reset the app.

## Licence and verification

Independent GPLv3 modification of MeshSense by Affirmatech Inc.; not an official Affirmatech release. Keep the matching `*-pi-arm64-source.zip` alongside the package when sharing it. It includes notices, source and build instructions. Node.js retains its separate licence. Verify startup, TLS persistence, messages and traceroutes on actual Pi hardware before treating this as a stable release.
