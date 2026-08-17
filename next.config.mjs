/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false; // Permanently disables stale disk cache corruption on Windows dev
    }
    return config;
  },
};

export default nextConfig;
