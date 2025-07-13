/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  distDir: 'frontend/.next',
  experimental: {
    appDir: false
  }
};

module.exports = nextConfig;
