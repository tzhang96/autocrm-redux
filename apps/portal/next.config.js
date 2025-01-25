/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@autocrm/core', '@autocrm/ui'],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
}

module.exports = nextConfig 