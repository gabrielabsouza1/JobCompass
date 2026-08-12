import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zunastatic-abf.kxcdn.com",
      },
    ],
  },
};

export default nextConfig;
