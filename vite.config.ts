import {defineConfig} from "vite";
import {resolve} from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "R2Bucket",
			formats: ["es", "cjs", "umd"],
			fileName: (format) => {
				if (format === "es") return "index.mjs";
				if (format === "cjs") return "index.cjs";
				return "index.umd.js";
			},
		},
		rollupOptions: {
			external: [
				"@aws-sdk/client-s3",
				"@aws-sdk/lib-storage",
				"@aws-sdk/s3-request-presigner",
				"stream",
				"fs",
				"path",
			],
			output: {
				globals: {
					"@aws-sdk/client-s3": "S3Client",
					"@aws-sdk/lib-storage": "LibStorage",
					"@aws-sdk/s3-request-presigner": "S3RequestPresigner",
				},
			},
		},
		sourcemap: true,
		minify: "esbuild",
	},
	plugins: [
		dts({
			include: ["src"],
			insertTypesEntry: true,
		}),
	],
});
