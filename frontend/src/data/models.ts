import rawModels from "./models_catalog.json";

export interface ModelItem {
  id: string;
  number: number;
  originalFilename: string;
  cleanStem: string;
  localFilename: string;
  localUrl: string;
  cloudinaryUrl: string;
  width: number;
  height: number;
  format: string;
}

export const MODEL_CATALOG: ModelItem[] = rawModels as ModelItem[];

/**
 * All 36 permanent Cloudinary HTTPS model photoshoot URLs.
 * Preferred for database persistence so records are 100% device-independent.
 */
export const MODEL_PRESETS: string[] = MODEL_CATALOG.map((m) => m.cloudinaryUrl);

/**
 * Local static fallback paths (/images/models/model-*.jpg).
 */
export const LOCAL_MODEL_PRESETS: string[] = MODEL_CATALOG.map((m) => m.localUrl);

/**
 * Resolves a model item from either its number, Cloudinary URL, or local path.
 */
export function getModelItem(identifier: string | number): ModelItem | undefined {
  if (typeof identifier === "number") {
    return MODEL_CATALOG.find((m) => m.number === identifier);
  }
  const str = String(identifier).trim();
  return MODEL_CATALOG.find(
    (m) =>
      m.id === str ||
      m.cloudinaryUrl === str ||
      m.localUrl === str ||
      str.endsWith(m.localFilename) ||
      str.includes(m.cleanStem)
  );
}
