import type { NextConfig } from "next";
import path from "node:path";

const isPublicStaticBuild = process.env.CINEATLAS_BUILD_MODE === "static";

const nextConfig: NextConfig = {
  output: isPublicStaticBuild ? "export" : undefined,
  // Directory-style output lets static hosts serve `/country/cn/` directly
  // without platform-specific rewrites from extensionless URLs to `.html`.
  trailingSlash: isPublicStaticBuild,
  images: isPublicStaticBuild ? { unoptimized: true } : undefined,
  transpilePackages: ["cesium"],
  serverExternalPackages: isPublicStaticBuild
    ? []
    : ["@prisma/adapter-better-sqlite3"],
  allowedDevOrigins: ["127.0.0.1", "192.168.31.153"],
  env: {
    NEXT_PUBLIC_CINEATLAS_PUBLIC_MODE: isPublicStaticBuild ? "1" : "0",
  },
  ...(isPublicStaticBuild
    ? {
        webpack(config) {
      const publicActions = path.resolve(
        process.cwd(),
        "lib/public-history-actions.ts",
      );
      const maintenanceActions = path.resolve(
        process.cwd(),
        "app/country/[countryCode]/history-actions.ts",
      );
      config.resolve.alias["@/app/country/[countryCode]/history-actions"] =
        publicActions;
      config.resolve.alias[maintenanceActions] = publicActions;
          return config;
        },
      }
    : {}),
};

export default nextConfig;
