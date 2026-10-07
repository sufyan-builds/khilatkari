// ============================================================
// MS FASHIONS — TypeScript type definitions
// ============================================================

export type PriceDisplayMode = "fixed_price" | "price_on_request";

export type ProductAvailability = "Available" | "Reserved" | "Sold" | "Archived";

export type AppointmentStatus =
  | "pending"
  | "contacted"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price?: number;
  priceDisplayMode: PriceDisplayMode;
  fabric?: string;
  craftsmanship?: string;
  color?: string;
  occasion?: string;
  sizes: string[];
  images: string[];
  videos?: string[];
  featured: boolean;
  available: boolean;
  availability?: ProductAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  preferredDate: string;
  preferredTime: string;
  collection: string;
  interestedPiece?: string;
  productId?: string;
  message?: string;
  status: AppointmentStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreate {
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  preferredDate: string;
  preferredTime: string;
  collection: string;
  interestedPiece?: string;
  productId?: string;
  message?: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  pages: number;
}

export interface CollectionSummary {
  category: string;
  count: number;
}

export interface ImageFramingConfig {
  zoom: number;
  posX: number;
  posY: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  imagePosition?: ImageFramingConfig;
  featuredOnHomepage: boolean;
  homepageDescription?: string;
  homepageOrder: number;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalProducts: number;
  featuredProducts: number;
  totalAppointments: number;
  pendingAppointments: number;
  contactedAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  cityBreakdown?: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, string>;
}
