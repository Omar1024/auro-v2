/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'auro.obl.ee'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'auro.obl.ee',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig












