import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
  },
  server: {
    proxy: {
      "/api": {
        // Point to your local Firebase Functions emulator
        target: "http://127.0.0.1:5001/mo-s-wears/us-central1/api", 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
