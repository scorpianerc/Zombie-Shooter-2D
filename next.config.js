/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile Phaser for Next.js
  transpilePackages: ['phaser'],
  webpack: (config) => {
    // Handle canvas and other Node.js modules that Phaser might need
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

module.exports = nextConfig;
