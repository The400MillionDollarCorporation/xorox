/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
    // Enable server actions if you're using them in your fullstack app
    serverActions: true,
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
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
        destination: "https://ipfs.io/ipfs/:path*",
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
    // Custom environment variables if needed
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Enable source maps in production for better debugging (optional)
  productionBrowserSourceMaps: false,
  
  // Optimize build performance
  swcMinify: true,
  
  // Configure webpack if needed for your fullstack app
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack configuration if needed
    return config;
  },
};

export default nextConfig;
