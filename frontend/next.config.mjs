import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Polyfill __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // 👇 Now safe to use in .mjs
  outputFileTracingRoot: __dirname,

  outputFileTracingIncludes: {
    '*': [
      './node_modules/@solana/web3.js/**/*',
      './node_modules/@noble/ed25519/**/*',
      './node_modules/@noble/secp256k1/**/*',
      './node_modules/canvas/**/*',
      './node_modules/usb/**/*',
      './node_modules/@ledgerhq/**/*',
    ],
  },

  experimental: {
    esmExternals: "loose",
    serverActions: true,
  },

  async headers() {
    return [
      {
        source: "/embed/:id*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *;" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/ipfs/:path*",
        destination: "https://ipfs.io/ipfs/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "p16-sign.tiktokcdn-us.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "nftstorage.link" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  swcMinify: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    return config;
  },
};

export default nextConfig;
