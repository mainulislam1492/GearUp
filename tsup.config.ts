import { defineConfig } from "tsup";

export default defineConfig({
    // bundle the express app into a single file that Vercel runs as a function
    entry: { index: "src/app.ts" },
    outDir: "api",
    format: ["esm"], // your package.json has "type": "module", so output ESM (api/index.js)
    platform: "node",
    target: "node20",
    clean: true,
    shims: true,
    splitting: false,
    sourcemap: false,
    dts: false,
    banner: {
        js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
    }
});