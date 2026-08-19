import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://aspiraway-crm.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;