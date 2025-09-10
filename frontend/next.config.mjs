/** @type {import('next').NextConfig} */
const nextConfig = {
  // 👇 REQUIRED for Docker standalone deployment
  output: 'standalone',

  // 👇 Ensure tracing includes files from project root (critical for monorepos or nested builds)
  outputFileTracingRoot: __dirname,

  // 👇 Explicitly include native modules that static tracing might miss (e.g., Solana, USB, canvas)
  outputFileTracingIncludes: {
    '*': [
      './node_modules/@solana/web3.js/**/*',
      './node_modules/@noble/ed25519/**/*',
      './node_modules/@noble/secp256k1/**/*',
      './node_modules/canvas/**/*',           // if using canvas
      './node_modules/usb/**/*',              // if using USB modules
      './node_modules/@ledgerhq/**/*',        // if using Ledger
    ],
  },

  experimental: {
    esmExternals: "loose",
    serverActions: true,
  },

  // Headers configuration for embed functionality
  async headers() {
    return [
      {
        source: "/embed/:id*", // Handle /embed and /embed/[id]
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
        ],
      },
      {
        // API routes security headers
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Configure this to your domain in production
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Rewrites for IPFS and external services
  async rewrites() {
    return [
      {
        source: "/ipfs/:path*",
        destination: "https://ipfs.io/ipfs/:path*", // Fixed: removed space after "ipfs/"
      },
    ];
  },

  // Image configuration for external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "p16-sign.tiktokcdn-us.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "nftstorage.link",
        port: "",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
      },
    ],
  },

  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Optimize build performance
  swcMinify: true,

  // Webpack config (if needed)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    return config;
  },
};

module.exports = nextConfig; // 👈 CommonJS export for maximum compatibility
