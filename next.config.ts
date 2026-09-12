import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large GLB/GLTF assets to be served
  serverExternalPackages: ["three", "three-mesh-bvh"],

  // Optimize for Vercel deployment
  experimental: {
    // Optimize package imports for Three.js ecosystem
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
