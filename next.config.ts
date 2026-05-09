import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint during builds (temporary solution)
    ignoreDuringBuilds: true,
  },
   typescript: {
    // ⚠️ Ignore TypeScript errors during build (NOT recommended long-term)
    ignoreBuildErrors: true,
  },
  images: {
    // Configure image optimization if needed
    domains: [], // Add your image domains here if using external images
  },
  // Other Next.js config options can go here

  experimental: {
    serverActions: {
      bodySizeLimit: "25mb", // Set your desired limit here (e.g., 10MB)
    },
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
