/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },

      // Render production
      {
        protocol: "https",
        hostname: "resturant-backend-3khk.onrender.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "resturant-backend-3khk.onrender.com",
        pathname: "/api/uploads/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

