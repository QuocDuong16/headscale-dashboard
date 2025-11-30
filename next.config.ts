import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/config.ts");

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["localhost"],
  output: "standalone",
  productionBrowserSourceMaps: false,
  compress: true,
  experimental: {
    optimizeCss: false,
  },
};

export default withNextIntl(nextConfig);
