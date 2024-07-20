import { buffer } from "stream/consumers";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    return config;
  },
  images: {
    remotePatterns: [{ hostname: "uploadthing.com" }, { hostname: "utfs.io" }],
  },
};

export default nextConfig;
