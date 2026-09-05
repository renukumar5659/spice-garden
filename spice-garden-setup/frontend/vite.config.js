export default defineConfig({
  plugins: [react()],

  server: {
    // keep your existing settings here
  },

  preview: {
    allowedHosts: ["spice-garden-frontend.onrender.com"],
  },
});