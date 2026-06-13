import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

import tailwindcss from "@tailwindcss/vite";

import path from "path";

import sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),

    sitemap({
      hostname: "https://edustream.click",

      readable: true,

      dynamicRoutes: ["/", "/search"],

      exclude: [
        "/admin",

        "/admin/dashboard",

        "/admin/manage-users",

        "/admin/manage-videos",

        "/admin/manage-reports",

        "/edit-profile",

        "/profile",

        "/oauth2/redirect",

        "/login",

        "/register",
      ],
    }),

    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
