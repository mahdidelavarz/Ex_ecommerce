const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function apiOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return null;
  }
}

function isLocalUploadHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "backend";
}

export function normalizeUploadUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("/uploads/")) return value;

  try {
    const url = new URL(value);
    if (url.pathname.startsWith("/uploads/")) {
      const origin = apiOrigin();
      if (!origin || url.origin === origin || isLocalUploadHost(url.hostname)) {
        return `${url.pathname}${url.search}`;
      }
    }
  } catch {
    return value;
  }

  return value;
}

export function getImageSrc(value: string | null | undefined) {
  return normalizeUploadUrl(value);
}
