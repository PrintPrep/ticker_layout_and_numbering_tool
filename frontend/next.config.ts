// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for file processing
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  // Empty turbopack config to silence warnings
  turbopack: {},

  // Webpack config fallback
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },

  // Image domains (for Supabase/S3 images)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },

  // API rewrites (optional - direct backend calls)
  async rewrites() {
    return [
      // Uncomment to proxy Python backend through Next.js
      // {
      //   source: '/backend/:path*',
      //   destination: process.env.PYTHON_BACKEND_URL + '/:path*',
      // },
    ];
  },
};

export default nextConfig;