import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  external: ["crc", "ste-simple-events", "tslog"],
  noExternal: [
    "@buf/meshtastic_protobufs.bufbuild_es",
    "@jsr/meshtastic__protobufs",
    "@meshtastic/protobufs",
    "@bufbuild/protobuf",
  ],
  format: "esm",
  sourcemap: true,
  clean: true,
  dts: true,
});
