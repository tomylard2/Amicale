// Compresse la photo d'accueil (hero) pour le web.
// Usage : node scripts/compress-hero.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync, statSync } from "node:fs";

const file = "public/images/hero-caserne.jpg";
const before = statSync(file).size;

// sharp lit d'abord tout le fichier en mémoire (toBuffer), on peut donc
// réécrire le même chemin ensuite sans conflit.
const input = readFileSync(file);
const output = await sharp(input)
  .resize(1920, 1080, { fit: "cover", withoutEnlargement: true })
  .jpeg({ quality: 68, mozjpeg: true })
  .toBuffer();

writeFileSync(file, output);
const after = statSync(file).size;

console.log(
  `hero-caserne.jpg : ${(before / 1024 / 1024).toFixed(1)} Mo -> ${(
    after / 1024
  ).toFixed(0)} Ko`,
);
