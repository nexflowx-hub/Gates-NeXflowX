import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-78dde357-f846-4ab9-afd1-3c89294c60e8.space-z.ai",
  ],
};

export default nextConfig;
