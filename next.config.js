/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '145.223.103.156',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '145.223.103.156',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    // Development ortamında daha esnek ayarlar
    domains: ['localhost', '145.223.103.156'],
    unoptimized: true, // Image optimization'ı tamamen devre dışı bırak
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Development ortamında daha hızlı hot reload
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Production için ek ayarlar
  output: 'standalone',
  poweredByHeader: false,
  // Static export için
  trailingSlash: true,
  // Asset prefix
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

module.exports = nextConfig;
