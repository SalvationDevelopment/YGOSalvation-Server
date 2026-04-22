import path from "path";
import { fileURLToPath } from "url";
import createMDX from "@next/mdx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../..");
const withMDX = createMDX({
  extension: /\.mdx?$/
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: REPO_ROOT,
  pageExtensions: ["js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  },
  turbopack: {
    rules: {
      "*.mdx": {
        loaders: ["@mdx-js/loader"],
        as: "*.js"
      }
    },
    root: REPO_ROOT
  }
};

export default withMDX(nextConfig);
