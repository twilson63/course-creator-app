import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configure for OnHyper app path
  basePath: '/a/course-creator-30c2a685',
};

export default nextConfig;