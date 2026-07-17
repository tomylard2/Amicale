// Génère les icônes PWA à partir d'un emblème SVG.
// Usage : node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/icons", { recursive: true });

// Emblème : fond rouge pompier, étoile blanche (rappel de l'identité).
function emblem({ padding = 0.16 } = {}) {
  const size = 512;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * (1 - padding);
  // étoile à 5 branches centrée
  const star = (() => {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? r * 0.62 : r * 0.26;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      points.push(
        `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`,
      );
    }
    return points.join(" ");
  })();

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#dc2626"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffffff" stroke-width="18"/>
      <polygon points="${star}" fill="#ffffff"/>
    </svg>`,
  );
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0.16 },
  { name: "icon-512.png", size: 512, padding: 0.16 },
  // maskable : plus de marge pour la "zone de sécurité"
  { name: "icon-maskable-512.png", size: 512, padding: 0.28 },
  { name: "apple-touch-icon.png", size: 180, padding: 0.16 },
];

for (const t of targets) {
  await sharp(emblem({ padding: t.padding }))
    .resize(t.size, t.size)
    .png()
    .toFile(`public/icons/${t.name}`);
  console.log(`+ public/icons/${t.name}`);
}
