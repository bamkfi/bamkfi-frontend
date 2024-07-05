/** @type {import('next').NextConfig} */
const nextConfig = {
    // https://docs.family.co/connectkit/getting-started#getting-started-nextjs
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
    async redirects() {
        return [
          {
            source: '/mint',
            destination: '/swap/mint',
            permanent: false,
          },
          {
            source: '/swap',
            destination: '/swap/mint',
            permanent: false,
          },
        ];
      },
};

export default nextConfig;
