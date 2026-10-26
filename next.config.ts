import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server output, used by the Docker image.
  output: "standalone",
  images: {
    // Product photos uploaded by the admin live on Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {
    // Server actions carry photo and receipt uploads; Vercel itself caps request bodies at 4.5 MB.
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
