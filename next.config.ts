const nextConfig = {
  images: {
    domains: [], // domains is deprecated, use remotePatterns instead
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dnvqwu9v8/image/upload/**',
      },
      // Add other patterns as needed
      {
        protocol: 'https',
        hostname: '**.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amybakesbread.com',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;