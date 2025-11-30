import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/config.ts");

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["niand-nuc", "localhost"],
  output: "standalone",
  experimental: {
    optimizeCss: false,
  },
};

export default withNextIntl(nextConfig);
