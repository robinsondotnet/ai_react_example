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
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4502",
        pathname: "/content/dam/**",
      },
    ],
  },

  async rewrites() {
    // Rewrites are not supported in static export mode
    if (isCdnBuild) return [];
    return [
      {
        source: "/aem-api/:path*",
        destination: `${process.env.NEXT_PUBLIC_AEM_HOST}/:path*`,
      },
    ];
  },
};

export default nextConfig;
