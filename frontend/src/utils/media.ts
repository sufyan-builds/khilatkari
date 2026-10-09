export function optimizeCloudinaryUrl(url: string, maxWidth: number = 1200): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  // Avoid duplicating existing transformation parameters
  if (
    url.includes("/image/upload/f_") ||
    url.includes("/image/upload/q_") ||
    url.includes("/image/upload/w_")
  ) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${maxWidth}/`);
}

/**
 * Resolves static and uploaded media URLs properly across both
 * local development and production deployments.
 * Blocks dangerous schemes (javascript:, vbscript:, arbitrary data:).
 */
export function getMediaUrl(src?: string, maxWidth: number = 1200): string {
  if (!src) return "/images/placeholder.jpg";
  const trimmed = src.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous pseudo-protocols
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "/images/placeholder.jpg";
  }

  // Safe data URIs (images and videos only)
  if (lower.startsWith("data:")) {
    if (lower.startsWith("data:image/") || lower.startsWith("data:video/")) {
      return trimmed;
    }
    return "/images/placeholder.jpg";
  }

  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    if (lower.includes("res.cloudinary.com") && lower.includes("/image/upload/")) {
      return optimizeCloudinaryUrl(trimmed, maxWidth);
    }
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
    if (rawApiUrl) {
      return `${rawApiUrl}${trimmed}`;
    }
    if (
      import.meta.env.PROD ||
      (typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1")
    ) {
      return `https://ms-fashion-closet.onrender.com${trimmed}`;
    }
    return trimmed;
  }

  // Relative internal path (e.g. /images/models/...)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Validates and sanitizes external and internal CTA links.
 * Permits relative paths, https://, http://, mailto:, and tel: schemes.
 * Disallows javascript:, data:, or other untrusted protocols.
 */
export function sanitizeLinkUrl(url?: string, defaultFallback: string = "/"): string {
  if (!url) return defaultFallback;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("data:")
  ) {
    return defaultFallback;
  }

  if (
    trimmed.startsWith("/") ||
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("whatsapp:")
  ) {
    return trimmed;
  }

  return defaultFallback;
}
