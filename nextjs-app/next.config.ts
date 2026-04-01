import type { NextConfig } from "next";

const isCdnBuild = process.env.BUILD_TARGET === "cdn";

const nextConfig: NextConfig = {
  // Static export when building for CDN hosting
  ...(isCdnBuild && {
    output: "export",
    trailingSlash: true,
  }),

  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL ?? "",

  images: {
    // Static export requires unoptimized images; CDN serves them as-is
    unoptimized: isCdnBuild,
  },
};

export default nextConfig;
