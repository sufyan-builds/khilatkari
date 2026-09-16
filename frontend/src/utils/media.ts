/**
 * Resolves static and uploaded media URLs properly across both
 * local development and production deployments.
 */
export function getMediaUrl(src?: string): string {
  if (!src) return "/images/placeholder.jpg";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  if (src.startsWith("/uploads/")) {
    const rawApiUrl = import.meta.env.VITE_API_URL || "";
    return rawApiUrl ? `${rawApiUrl.replace(/\/+$/, "")}${src}` : src;
  }
  return src;
}
