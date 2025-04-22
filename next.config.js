const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 React 严格模式以捕获潜在问题
  reactStrictMode: true,

  // 启用增量静态再生成
  // 这对于频繁更改的页面很有用
  // 但对于开发模式下的性能没有直接影响
  // 仅在生产环境中有效
  // incremental: true,

  // 配置图像优化
  images: {
    domains: [],
    // 减少图像优化的默认缓存时间以提高开发体验
    minimumCacheTTL: 60,
  },

  // 配置 webpack 以优化构建
  webpack: (config, { dev }) => {
    // 仅在开发模式下应用这些优化
    if (dev) {
      // 减少开发模式下的源映射生成以提高性能
      config.devtool = 'eval-source-map';

      // 禁用某些插件以加快开发构建
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    return config;
  },

  // 实验性功能
  experimental: {
    // 启用 serverActions - 使用正确的配置格式
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    // 启用 Turbopack 以解决 Webpack 和 Turbopack 冲突警告
    turbo: {},
  },

  // 禁用 ESLint 在开发过程中运行以提高性能
  eslint: {
    // 仅在生产构建时运行 ESLint
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // 禁用类型检查以提高开发性能
  typescript: {
    // 仅在生产构建时进行类型检查
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
};

module.exports = withBundleAnalyzer(nextConfig);