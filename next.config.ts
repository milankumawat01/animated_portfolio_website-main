import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: ['three'],
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vert|frag|vs|fs)$/,
      type: 'asset/source',
    })
    return config
  },
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'], as: '*.js' },
      '*.vert': { loaders: ['raw-loader'], as: '*.js' },
      '*.frag': { loaders: ['raw-loader'], as: '*.js' },
    },
  },
}

export default nextConfig
