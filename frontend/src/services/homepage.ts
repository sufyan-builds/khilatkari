import api from "./api";
import type { ApiResponse } from "../types";

export interface ImagePositionConfig {
  id?: string;
  mediaType?: "image" | "video";
  imageUrl: string;
  videoUrl?: string;
  posterUrl?: string;
  zoom: number;   // 0.5 – 3.0, default 1.0
  posX: number;   // 0 – 100, default 50
  posY: number;   // 0 – 100, default 20
  title?: string;
  subtitle?: string;
  tag?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface AboutPageConfig {
  // Hero
  heroHeadlineMain?: string;
  heroHeadlineItalic?: string;
  heroIntroText?: string;
  // Philosophy
  philosophyHeadline?: string;
  philosophyPara1?: string;
  philosophyPara2?: string;
  philosophyPara3?: string;
  // Bottom CTA
  ctaHeadline?: string;
  ctaBodyText?: string;
  // Four independently configurable collage image slots
  collageImage1?: ImagePositionConfig;
  collageImage2?: ImagePositionConfig;
  collageImage3?: ImagePositionConfig;
  collageImage4?: ImagePositionConfig;
}

export interface CollectionsPageConfig {
  label?: string;       // e.g. "Private Lookbook"
  heading?: string;     // e.g. "The Collection"
  description?: string; // e.g. "Each piece is handcrafted…"
}

export interface StatementSectionConfig {
  backgroundImage?: ImagePositionConfig;
  headlineMain?: string;    // e.g. "Discover Your Next"
  headlineItalic?: string;  // e.g. "Statement Piece."
  bodyText?: string;
  button1Text?: string;
  button1Link?: string;
  button2Text?: string;
  button2Link?: string;     // Falls back to WhatsApp URL when empty
}

export interface HomepageContentConfig {
  heroSlides: ImagePositionConfig[];
  experienceImage: ImagePositionConfig;
  galleryStrip: ImagePositionConfig[];
  statementSection?: StatementSectionConfig;
  aboutPage?: AboutPageConfig;
  collectionsPage?: CollectionsPageConfig;
  updatedAt?: string;
  expectedUpdatedAt?: string;
}

export const homepageService = {
  /** Public storefront — no auth required */
  getPublic: async (): Promise<ApiResponse<HomepageContentConfig>> => {
    const response = await api.get<ApiResponse<HomepageContentConfig>>("/homepage");
    return response.data;
  },

  /** Admin — requires auth token */
  getAdmin: async (): Promise<ApiResponse<HomepageContentConfig>> => {
    const response = await api.get<ApiResponse<HomepageContentConfig>>("/admin/homepage");
    return response.data;
  },

  update: async (data: Partial<HomepageContentConfig>): Promise<ApiResponse<HomepageContentConfig>> => {
    const response = await api.put<ApiResponse<HomepageContentConfig>>("/admin/homepage", data);
    return response.data;
  },

  reset: async (): Promise<ApiResponse<HomepageContentConfig>> => {
    const response = await api.post<ApiResponse<HomepageContentConfig>>("/admin/homepage/reset");
    return response.data;
  },
};
