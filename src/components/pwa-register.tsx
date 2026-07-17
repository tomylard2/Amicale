"use client";

import { useEffect } from "react";

// Enregistre le service worker (uniquement en production, pour ne pas
// perturber le rechargement à chaud en développement).
export function PWARegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Enregistrement échoué : l'application reste utilisable sans PWA.
      });
    }
  }, []);

  return null;
}
