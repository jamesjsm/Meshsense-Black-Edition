# Black.5 connection fixes and Mac retest

Modified 11 September 2026. The friend report showed successful TLS/NodeDB access from a direct executable launch, but Finder/Dock access failed. That distinguishes transport capability from macOS permission identity; it does not prove every failure has the same cause.

Changes: HTTP connection attempts stop after five tries with exponential delays (1, 2, 4, 8 seconds). Each request has a ten-second timeout. Cancel interrupts retry waiting. The HTTP transport no longer recursively restarts itself, and the application no longer starts a second HTTP retry cycle. Three consecutive polling failures disconnect. Previously received data is retained on an HTTP failure. TLS is explicitly saved through the authorised HTTP interface and cannot be overwritten by generic WebSocket state messages. Startup state synchronisation does not replay stale state. New installations default to auto-connect off; an existing saved user preference remains respected.

The internal service now listens on 127.0.0.1 by default. Deliberately hosting it for other computers requires MESHSENSE_BIND_HOST; review access controls before exposing it. TLS mode stays visible. Logs show the attempted HTTP/HTTPS host, without adding credentials to that diagnostic.

The existing handling of radio self-signed certificates has not been redesigned here. These fixes are not a complete security audit.

## Retest on the friend's Mac

1. Install the new ARM DMG; quit earlier copies first. Launch from Finder/Dock.
2. Leave auto-connect off. Enter 10.0.1.12 and enable TLS. Confirm “HTTPS / TLS” is displayed.
3. Click Connect. Check for a Local Network prompt and the app entry in System Settings. Record whether it reaches Connected and receives the NodeDB.
4. Quit and reopen via Finder/Dock. TLS should remain enabled and the app should wait for Connect unless auto-connect was explicitly enabled.
5. With an unreachable address, verify that retries are spaced, stop, and leave the app responsive and Disconnected. Cancel during a retry wait and confirm it stops promptly.
6. If Finder/Dock still fails but direct executable launch succeeds, record both results. Do not mark Local Network identity resolved based on the terminal launch alone.

NSLocalNetworkUsageDescription is now included and the bundle identifier remains local.meshsense.custom. No Developer ID certificate or notarisation has been added. Apple recommends an Apple-issued signing identity for reliable Local Network privacy tracking; an ad-hoc signature plus a stable bundle ID cannot guarantee this behaviour. See https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy.

Local Windows compilation and mocked transport tests can verify retry logic; this PC cannot verify the friend's network, certificate or Finder/Dock permission behaviour. Intel Macs remain a separate supported hardware target; keep both Mac builds unless intentionally dropping Intel support.
