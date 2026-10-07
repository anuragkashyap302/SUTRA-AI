import type { NextConfig } from "next";

/**
 * Next.js 15 Configuration
 * - remotePatterns: Cloudinary aur Clerk ke images allow karne ke liye zaroori hai
 * - typedRoutes: Type-safe routing support
 * - typescript ka types folder bana lena usme sab rakhna types ko
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    // lucide-react ko optimize karne ke liye isko add kiya gya hai 
    // AST (Abstract Syntax Tree) ki help se lucide-react ko optimize kiya jata hai 
    // ye teeno function ko ek saath import krta hai jbki humko sirf 1 hi chaiye 
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
