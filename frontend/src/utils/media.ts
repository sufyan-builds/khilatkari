/**
 * Resolves static and uploaded media URLs properly across both
 * local development and production deployments.
 * Blocks dangerous schemes (javascript:, vbscript:, arbitrary data:).
 */
export function getMediaUrl(src?: string): string {
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
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    const rawApiUrl = import.meta.env.VITE_API_URL || "";
    return rawApiUrl ? `${rawApiUrl.replace(/\/+$/, "")}${trimmed}` : trimmed;
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
