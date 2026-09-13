import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image's `quality` prop must be explicitly allow-listed (Next 16).
    // 100 is used for the auth registration pages' brand photos, where every
    // bit of sharpness matters since the source images are already small.
    qualities: [75, 100],
  },
};

export default nextConfig;
