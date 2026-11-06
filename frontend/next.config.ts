import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://qxcqywgrw1.c40.airoapp.ai";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: backendUrl,
  },
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    // The host allows one listening port. One worker, and no Turbopack
    // child process, keeps the production build inside that limit.
    cpus: 1,
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/dashboard", permanent: true },
      { source: "/admin/:path*", destination: "/dashboard/:path*", permanent: true },
    ];
  },
  // Browser calls same-origin /api/* so session cookies are first-party on the site host.
  // (Cross-host cookies to airoapp.ai are blocked → login works but /me is Unauthenticated.)
  async rewrites() {
    const target = backendUrl.replace(/\/+$/, "");
    return [
      { source: "/api/:path*", destination: `${target}/api/:path*` },
      { source: "/health", destination: `${target}/health` },
    ];
  },
};

export default nextConfig;
