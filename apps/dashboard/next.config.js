/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@autocrm/core', '@autocrm/ui', '@autocrm/docs', '@autocrm/auth'],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
    esmExternals: 'loose'
  },
  webpack: (config, { isServer }) => {
    // Force ESM modules to be processed correctly
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })
    return config
  }
}

module.exports = nextConfig 