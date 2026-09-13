// Cloudinary direct browser uploads for the pharmacist degree certificate.
//
// The client only ever sees the PUBLIC cloud name and an UNSIGNED upload preset.
// Never put Cloudinary API secrets here - this app intentionally has no server
// upload endpoint, so the preset must be restricted to the intended uploads.
//
// One-time Cloudinary setup (Settings > Upload > Add upload preset):
//   - Mode: Unsigned
//   - Folder: pharmalink/certificates (optional; the request also sends it)
//   - Allowed formats: jpg, png, webp only
//   - Max file size: 5 MB
// Then expose it to the client in .env.local:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud name>
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<unsigned preset name>

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? "";

/** Folder requested on every upload; the preset decides whether it applies. */
export const CLOUDINARY_UPLOAD_FOLDER = "pharmalink/certificates";

export const CERTIFICATE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const CERTIFICATE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CERTIFICATE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** True when both public env vars are present (client-side check only). */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

export type CertificateFileIssue = "type" | "size";

/** Client-side guard run before anything is uploaded. */
export function validateCertificateFile(file: File): CertificateFileIssue | null {
  const name = file.name.toLowerCase();
  const extensionOk = CERTIFICATE_EXTENSIONS.some((ext) => name.endsWith(ext));
  const mimeOk = file.type === "" || CERTIFICATE_MIME_TYPES.includes(file.type);
  if (!extensionOk || !mimeOk) return "type";
  if (file.size > CERTIFICATE_MAX_BYTES) return "size";
  return null;
}

export type CertificateUploadErrorCode = "not-configured" | "upload-failed";

export class CertificateUploadError extends Error {
  readonly code: CertificateUploadErrorCode;

  constructor(code: CertificateUploadErrorCode) {
    super(
      code === "not-configured"
        ? "Cloudinary is not configured"
        : "Cloudinary upload failed",
    );
    this.name = "CertificateUploadError";
    this.code = code;
  }
}

/**
 * Uploads a validated image straight to Cloudinary with an unsigned preset and
 * resolves with the returned secure_url. onProgress reports 0-100 when the
 * browser can measure upload progress.
 */
export function uploadCertificateToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return Promise.reject(new CertificateUploadError("not-configured"));
  }

  const endpoint =
    "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload";
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  body.append("folder", CLOUDINARY_UPLOAD_FOLDER);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new CertificateUploadError("upload-failed"));
        return;
      }
      try {
        const payload = JSON.parse(xhr.responseText) as { secure_url?: string };
        if (payload.secure_url) {
          resolve(payload.secure_url);
        } else {
          reject(new CertificateUploadError("upload-failed"));
        }
      } catch {
        reject(new CertificateUploadError("upload-failed"));
      }
    };

    xhr.onerror = () => reject(new CertificateUploadError("upload-failed"));
    xhr.onabort = () => reject(new CertificateUploadError("upload-failed"));

    xhr.send(body);
  });
}

