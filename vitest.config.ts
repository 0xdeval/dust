import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    alias: {
      "@": "./src",
      "@/components": "./src/components",
      "@/types": "./src/types",
      "@/lib": "./src/lib",
      "@/utils": "./src/utils",
    },
  },
});
