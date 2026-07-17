import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Dossier de stockage local des photos de matériel.
// NOTE déploiement : sur un hébergement "serverless" (ex. Vercel), le système
// de fichiers est en lecture seule. Au moment du déploiement, on remplacera
// ce stockage local par un service dédié (ex. Vercel Blob). En développement
// et sur un serveur/VPS classique, l'écriture dans /public fonctionne.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "materiel");
const PUBLIC_PREFIX = "/uploads/materiel";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Enregistre une image de matériel et renvoie son chemin public. */
export async function saveEquipmentImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Aucun fichier fourni." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "L'image ne doit pas dépasser 5 Mo." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: "Format non supporté (JPEG, PNG, WebP ou GIF uniquement).",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext =
    { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" }[
      file.type
    ] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { ok: true, url: `${PUBLIC_PREFIX}/${filename}` };
}

/** Supprime une image de matériel (best-effort, ignore si absente). */
export async function deleteEquipmentImage(url: string | null): Promise<void> {
  if (!url || !url.startsWith(PUBLIC_PREFIX)) return;
  try {
    const filename = path.basename(url);
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // Fichier déjà absent : on ignore.
  }
}
