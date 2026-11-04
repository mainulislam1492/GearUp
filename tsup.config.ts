import { defineConfig } from "tsup";

export default defineConfig({
    // bundle the express app into a single file that Vercel runs as a function
    entry: { index: "src/app.ts" },
    outDir: "api",
    format: ["cjs"],
    platform: "node",
    target: "node20",
    clean: true,
    shims: true, // needed because the generated Prisma client uses import.meta
    splitting: false,
    sourcemap: false,
    dts: false
});