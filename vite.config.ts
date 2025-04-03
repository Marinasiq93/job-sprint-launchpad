
import { defineConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Customize HMR behavior
      overlay: true,
      // Conditionally disable HMR during tests
      ...(process.env.DISABLE_HMR === 'true' ? { enabled: false } : {}),
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add test-specific configuration
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    watch: false, // Disable watching during tests by default
  },
}));
