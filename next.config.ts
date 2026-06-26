// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'api.thearyatara.info',
//         port: '',
//         pathname: '/media/**', 
//       },
//     ],
//   },
// };

// export default nextConfig;



/** @type {import('next').NextConfig} */
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
};

module.exports = nextConfig;