import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.thearyatara.info',
        port: '',
        pathname: '/media/**', 
      },
    ],
  },
};

export default nextConfig;