import type { NextConfig } from "next";

const appSlug = process.env.NEXT_PUBLIC_ONHYPER_APP_SLUG || 'course-creator-4473b404';
const useSubdomainBase =
  process.env.ONHYPER_USE_SUBDOMAIN === 'true' ||
  process.env.NEXT_PUBLIC_ONHYPER_USE_SUBDOMAIN === 'true';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Path-based deploys use /a/{slug}, subdomain deploys use root
  basePath: useSubdomainBase ? '' : `/a/${appSlug}`,
};

export default nextConfig;