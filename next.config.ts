import { spawnSync } from "node:child_process";
import withSerwist from "@serwist/next";

// Revisión para versionar las páginas precacheadas. Evita respuestas obsoletas.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).stdout ??
  crypto.randomUUID();

const withSerwistConfig = withSerwist({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwistConfig({
  /* config options here */
});
