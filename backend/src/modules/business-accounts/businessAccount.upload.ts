import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.resolve(__dirname, "../../../uploads");
export const BUSINESS_UPLOAD_DIR = path.join(UPLOADS_ROOT, "business-accounts");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureDir(BUSINESS_UPLOAD_DIR);
    cb(null, BUSINESS_UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const userId = (req as { auth?: { userId?: string } }).auth?.userId ?? "anon";
    const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36) || "anon";
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10) || ".bin";
    const kind = file.fieldname === "license_doc" ? "license" : "business-id";
    cb(null, `${safeUser}-${kind}-${Date.now()}${ext}`);
  },
});

export const businessAccountUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Only PDF, JPEG, PNG, or WebP files are allowed"));
      return;
    }
    cb(null, true);
  },
});

/** Relative path stored in DB (under uploads/). */
export function toStoredRelativePath(absolutePath: string): string {
  const rel = path.relative(UPLOADS_ROOT, absolutePath).replace(/\\/g, "/");
  return rel;
}

/** Resolve a stored relative path; returns null if outside uploads root. */
export function resolveStoredPath(stored: string): string | null {
  const normalized = stored.replace(/\\/g, "/").replace(/^\/+/, "");
  const absolute = path.resolve(UPLOADS_ROOT, normalized);
  const rootWithSep = UPLOADS_ROOT.endsWith(path.sep) ? UPLOADS_ROOT : `${UPLOADS_ROOT}${path.sep}`;
  if (
    absolute !== UPLOADS_ROOT &&
    !absolute.toLowerCase().startsWith(rootWithSep.toLowerCase())
  ) {
    return null;
  }
  if (!fs.existsSync(absolute)) return null;
  return absolute;
}
