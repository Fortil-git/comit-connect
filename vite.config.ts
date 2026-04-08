import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let lovablePlugins: PluginOption[] = [];

  if (mode === "development") {
    try {
      const { componentTagger } = await import("lovable-tagger");
      lovablePlugins = [componentTagger()];
    } catch {
      lovablePlugins = [];
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), ...lovablePlugins],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
