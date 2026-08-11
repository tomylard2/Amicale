import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Filet de sécurité : sur l'hébergement mutualisé (1 CPU), la génération
  // d'une page peut être lente. On relève la limite (défaut 60 s) pour éviter
  // les échecs de build par dépassement de délai.
  staticPageGenerationTimeout: 300,
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
