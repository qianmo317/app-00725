import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "./",
  base: "/",
  server: {
    port: 8081,
    host: "0.0.0.0",
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        cardFactory: resolve(__dirname, "pages/card-factory.html"),
        appMarket: resolve(__dirname, "pages/app-market.html"),
        designer: resolve(__dirname, "pages/designer.html"),
        map: resolve(__dirname, "pages/map.html"),
      },
      output: {
        manualChunks: {
          layui: ["layui"],
          echarts: ["echarts"],
          sortablejs: ["sortablejs"],
          grapesjs: ["grapesjs"],
          ol: ["ol"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["layui", "echarts", "sortablejs", "grapesjs", "ol"],
  },
});
