// frontend/next.config.ts
import type { NextConfig } from 'next';

const apiProxyTarget = (
  process.env.API_PROXY_TARGET ||
  process.env.INTERNAL_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://localhost:5000'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow cross-origin dev requests from the LAN (e.g. testing on a phone).
  allowedDevOrigins: ['192.168.1.100', '192.168.1.*'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${apiProxyTarget}/uploads/:path*`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
  images: {
    // The production server has restricted outbound network/DNS behavior, so
    // avoid proxying remote images through Next's server-side optimizer.
    unoptimized: true,
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
