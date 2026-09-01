import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["cesium"],
  serverExternalPackages: ["@prisma/adapter-better-sqlite3"],
  allowedDevOrigins: ["127.0.0.1", "192.168.31.153"],
};

export default nextConfig;
