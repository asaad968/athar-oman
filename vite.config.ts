import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      nitro: {
        preset: process.env.NETLIFY
          ? "netlify"
          : process.env.VERCEL
          ? "vercel"
          : process.env.CF_PAGES
          ? "cloudflare-pages"
          : "node-server",
      },
    }),
    viteReact(),
  ],
});
