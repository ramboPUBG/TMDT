import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ["api.dicebear.com", "images.unsplash.com", "res.cloudinary.com"],
  },
};

export default nextConfig;
