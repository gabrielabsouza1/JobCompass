import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
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
