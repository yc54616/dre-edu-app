import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.30.1.94', '192.168.22.161'],
  output: 'standalone',
  serverExternalPackages: ['mongoose'],
  async redirects() {
    return [
      {
        source: '/menu',
        destination: '/m/materials',
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
