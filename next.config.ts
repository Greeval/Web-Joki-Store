import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt", "192.168.1.5"],
};

export default nextConfig;
