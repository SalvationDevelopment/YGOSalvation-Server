import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname
  },
  webpack(config) {
    const ignored = config.watchOptions?.ignored;

    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: [
        ...(Array.isArray(ignored)
          ? ignored.filter((entry) => typeof entry === "string" && entry.length)
          : typeof ignored === "string" && ignored.length
            ? [ignored]
            : []),
        path.resolve(__dirname, "../server/ui/public/manifest")
      ]
    };

    return config;
  }
};

export default nextConfig;
