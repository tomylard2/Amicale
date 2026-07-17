import type { MetadataRoute } from "next";

// Manifeste de l'application (permet l'installation sur mobile / bureau)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amicale des Pompiers de Châteaubourg",
    short_name: "Amicale Pompiers",
    description:
      "Réservation en ligne du matériel de l'Amicale des Pompiers de Châteaubourg.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#dc2626",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
