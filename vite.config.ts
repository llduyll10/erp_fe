import path from "path";
import fs from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), tsconfigPaths()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		https: {
			key: fs.readFileSync('./certs/localhost-key.pem'),
			cert: fs.readFileSync('./certs/localhost.pem'),
		},
		port: 5173,
	},
});
