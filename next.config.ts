import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Halaman "Pasangan saya" berganti nama jadi "Pantauan".
  async redirects() {
    return [{ source: '/dashboard/pasangan-saya', destination: '/dashboard/pantauan', permanent: true }];
  },
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
