// frontend/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow cross-origin dev requests from the LAN (e.g. testing on a phone).
  allowedDevOrigins: ['192.168.1.100', '192.168.1.*'],
  images: {
    // In Docker dev, next/image optimizes server-side inside the frontend
    // container where localhost:5000 is unreachable. Disable optimization in
    // development so the browser fetches the port-mapped backend directly.
    unoptimized: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;