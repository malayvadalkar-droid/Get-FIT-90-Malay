import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Needed so recharts (a CJS package) works in App Router
  transpilePackages: ["recharts", "victory-vendor"],

  // Don't fail the Vercel build on ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Don't fail the build on TS errors in CI (tsc check is separate)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
