/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://mcpub-registry.shelflix.workers.dev/api/:path*',
      },
    ];
  },
};
module.exports = nextConfig;
