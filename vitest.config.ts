import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "next.config.ts",
        "postcss.config.mjs",
        "tailwind.config.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.d.ts",
      ],
    },
  },
})
