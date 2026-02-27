/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent webpack from serializing large strings to the file cache
      config.cache = {
        type: "memory",
      };
    }
    return config;
  },
};
export default nextConfig;
