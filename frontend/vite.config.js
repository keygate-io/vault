import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

const env = dotenv.config({ path: "../.env" });

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": env.parsed,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
