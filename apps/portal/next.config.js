/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@autocrm/api-client', '@autocrm/core', '@autocrm/ui'],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
}

module.exports = nextConfig 