import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { BRAND, CITIES, APPOINTMENT_PROCESS, WHATSAPP_URL } from "../data/constants";
import { productsService } from "../services/products";
import { homepageService, type HomepageContentConfig } from "../services/homepage";
import { categoriesService } from "../services/categories";
import { getMediaUrl, sanitizeLinkUrl } from "../utils/media";
import type { Product, Category } from "../types";
import ProductCard from "../components/product/ProductCard";

const INITIAL_HOMEPAGE_CONTENT: HomepageContentConfig = {
  heroSlides: [
    {
      id: "hero-1789649398460",
      mediaType: "image",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391518/ms_fashions/screenshot_20251105_170619_instagram-cf5020c01f.jpg",
      zoom: 1.0,
      posX: 51.0,
      posY: 32.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    },
    {
      id: "hero-1789712848753",
      mediaType: "image",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391824/ms_fashions/whatsapp-image-2026-09-15-at-4-36-30-pm-0ef4664601.jpg",
      zoom: 1.0,
      posX: 49.0,
      posY: 26.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    },
    {
      id: "hero-1789712878469",
      mediaType: "image",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391875/ms_fashions/whatsapp-image-2026-09-16-at-10-21-11-pm-166e1d17c7.jpg",
      zoom: 1.0,
      posX: 13.0,
      posY: 8.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    },
    {
      id: "hero-1789712921393",
      mediaType: "image",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391506/ms_fashions/img-20251116-wa0018-7b960ab263.jpg",
      zoom: 1.0,
      posX: 50.0,
      posY: 41.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    },
    {
      id: "hero-1789712934249",
      mediaType: "image",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391598/ms_fashions/screenshot_20260719_141656_instagram-94ed529f31.jpg",
      zoom: 1.0,
      posX: 46.0,
      posY: 33.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    },
    {
      id: "hero-1789712953593",
      mediaType: "video",
      imageUrl: "",
      videoUrl: "https://res.cloudinary.com/iv29blwq/video/upload/v1791391696/ms_fashions/ssstik-io_1785751034820--1-fac8907bf7.mp4",
      zoom: 1.0,
      posX: 25.0,
      posY: 21.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    },
  ],
  experienceImage: {
    id: "exp-1",
    mediaType: "image",
    imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391829/ms_fashions/whatsapp-image-2026-09-15-at-4-36-31-pm--322253409e.jpg",
    zoom: 1.0,
    posX: 50.0,
    posY: 33.0,
    title: "The Private Viewing Experience",
  },
  galleryStrip: [
    {
      id: "gallery-1789732793005",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391579/ms_fashions/screenshot_20260719_141645_instagram-f7a18b75f2.jpg",
      zoom: 1.0,
      posX: 53.0,
      posY: 42.0,
    },
    {
      id: "gallery-1789732826548",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391554/ms_fashions/screenshot_20251105_171122_instagram-f828f56279.jpg",
      zoom: 1.0,
      posX: 50.0,
      posY: 20.0,
    },
    {
      id: "gallery-1789732846203",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391879/ms_fashions/whatsapp-image-2026-09-16-at-10-21-12-pm-21017d0257.jpg",
      zoom: 1.0,
      posX: 49.0,
      posY: 40.0,
    },
    {
      id: "gallery-1789732946421",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391548/ms_fashions/screenshot_20251105_170746_instagram-e0b502e398.jpg",
      zoom: 1.0,
      posX: 50.0,
      posY: 20.0,
    },
    {
      id: "gallery-1789732984183",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391877/ms_fashions/whatsapp-image-2026-09-16-at-10-21-11-pm-f93ff7366b.jpg",
      zoom: 1.0,
      posX: 50.0,
      posY: 20.0,
    },
  ],
  statementSection: {
    backgroundImage: {
      id: "stmt-bg",
      mediaType: "image",
      imageUrl: "https://res.cloudinary.com/iv29blwq/image/upload/v1791391888/ms_fashions/whatsapp-image-2026-09-16-at-10-21-12-pm-76fdca365d.jpg",
      zoom: 1.0,
      posX: 50.0,
      posY: 9.0,
    },
    headlineMain: "Discover Your Next",
    headlineItalic: "Statement Piece.",
    bodyText: "Request a private appointment to experience our hand-crafted bridal, Chikankari, and luxury formal collections in the comfort of your own home.",
    button1Text: "Book a Private Appointment",
    button1Link: "/appointments",
    button2Text: "Chat on WhatsApp",
    button2Link: "",
  },
  aboutPage: {
    heroHeadlineMain: "A Celebration of Authentic",
    heroHeadlineItalic: "South Asian Heritage",
    heroIntroText: "KhilatKari was born out of a profound admiration for the timeless artistry of South Asian handcrafts, reimagined for the contemporary woman through an exclusive in-home experience.",
  },
};

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-kamdani",
    name: "Kamdani",
    slug: "kamdani",
    coverImage: "/images/models/model-4.jpg",
    description: "Shimmering metal thread work",
    homepageDescription: "Shimmering metal thread work",
    imagePosition: { zoom: 1.0, posX: 50.0, posY: 25.0 },
    featuredOnHomepage: true,
    homepageOrder: 2,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "cat-gota-mukesh",
    name: "Gota & Mukesh",
    slug: "gota-mukesh",
    coverImage: "/images/models/model-6.jpg",
    description: "Ornate gold ribbon embellishment",
    homepageDescription: "Ornate gold ribbon embellishment",
    imagePosition: { zoom: 1.0, posX: 50.0, posY: 0.0 },
    featuredOnHomepage: true,
    homepageOrder: 3,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "cat-bridal-wear",
    name: "Bridal Wear",
    slug: "bridal-wear",
    coverImage: "/images/models/model-9.jpg",
    description: "Bespoke bridal ensembles",
    homepageDescription: "Bespoke bridal ensembles",
    imagePosition: { zoom: 1.0, posX: 50.0, posY: 0.0 },
    featuredOnHomepage: true,
    homepageOrder: 5,
    displayOrder: 5,
    isActive: true,
  },
];

const STORAGE_KEY_CONTENT = "khilatkari_cached_homepage_content";
const STORAGE_KEY_CATEGORIES = "khilatkari_cached_homepage_categories";
const STORAGE_KEY_PRODUCTS = "khilatkari_cached_featured_products";

function getCachedInitialContent(): HomepageContentConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return INITIAL_HOMEPAGE_CONTENT;
}

function getCachedInitialCategories(): Category[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return INITIAL_CATEGORIES;
}

function getCachedInitialProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return [];
}

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(getCachedInitialProducts);
  const [loadingProducts, setLoadingProducts] = useState(() => getCachedInitialProducts().length === 0);

  // Homepage CMS Content state — starts with synchronized production data & cache for zero layout shift
  const [homepageContent, setHomepageContent] = useState<HomepageContentConfig | null>(getCachedInitialContent);
  const [loadingContent, setLoadingContent] = useState(false);

  // Homepage Featured Categories state — initialized with active categories for consistent display
  const [homepageCategories, setHomepageCategories] = useState<Category[]>(getCachedInitialCategories);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);

  // Fetch dynamic visual positioning settings from backend in background
  useEffect(() => {
    homepageService
      .getPublic()
      .then((res) => {
        const newData = res.data;
        if (res.success && newData) {
          setHomepageContent((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
            try {
              localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(newData));
            } catch {}
            return newData;
          });
        }
      })
      .catch(() => {
        // Keeps graceful fallback without breaking layout
      })
      .finally(() => {
        setLoadingContent(false);
      });

    // Fetch dynamic categories featured on homepage
    categoriesService
      .getHomepage()
      .then((res) => {
        const newCats = res.data;
        if (res.success && newCats && newCats.length > 0) {
          setHomepageCategories((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(newCats)) return prev;
            try {
              localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(newCats));
            } catch {}
            return newCats;
          });
        }
      })
      .catch(() => {
        setCategoriesError(false);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, []);

  // Filter hero slides to only those with configured visual media
  const rawHeroSlides = homepageContent?.heroSlides || [];
  const validHeroSlides = rawHeroSlides.filter(
    (slide) => Boolean(slide.imageUrl?.trim() || slide.videoUrl?.trim())
  );

  // Auto-advance hero image if more than 1 valid slide
  useEffect(() => {
    if (validHeroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIdx((i) => (i + 1) % validHeroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [validHeroSlides.length]);

  const safeHeroIdx = validHeroSlides.length > 0 ? heroIdx % validHeroSlides.length : 0;

  // Touch swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 45 && validHeroSlides.length > 1) {
      // Swiped left -> next slide
      setHeroIdx((i) => (i + 1) % validHeroSlides.length);
    } else if (distance < -45 && validHeroSlides.length > 1) {
      // Swiped right -> prev slide
      setHeroIdx((i) => (i - 1 + validHeroSlides.length) % validHeroSlides.length);
    }
  };

  // Fetch featured products
  useEffect(() => {
    productsService
      .getAll({ featured: true, limit: 6 })
      .then((res) => {
        const newProducts = res.data?.products;
        if (res.success && newProducts) {
          setFeaturedProducts((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(newProducts)) return prev;
            try {
              localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
            } catch {}
            return newProducts;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────── */}
      {(() => {
        const activeSlide = validHeroSlides[safeHeroIdx] || validHeroSlides[0];

        return (
          <section
            className="relative min-h-[500px] sm:min-h-[520px] md:min-h-[560px] h-auto sm:h-[75vh] md:h-[82vh] max-h-none sm:max-h-[740px] overflow-hidden pt-16 sm:pt-0"
            id="hero"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background images or videos */}
            {validHeroSlides.map((slide, i) => (
              <div
                key={slide.id || slide.imageUrl || i}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  i === safeHeroIdx ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {slide.mediaType === "video" && slide.videoUrl ? (
                  i === safeHeroIdx ? (
                    <video
                      src={getMediaUrl(slide.videoUrl)}
                      poster={slide.posterUrl ? getMediaUrl(slide.posterUrl) : undefined}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      style={{
                        objectFit: "cover",
                        objectPosition: `${slide.posX ?? 50}% ${slide.posY ?? 15}%`,
                        transform: `scale(${slide.zoom ?? 1.0})`,
                        transformOrigin: `${slide.posX ?? 50}% ${slide.posY ?? 15}%`,
                      }}
                      className="w-full h-full"
                    />
                  ) : null
                ) : (
                  <img
                    src={getMediaUrl(slide.imageUrl, 1400)}
                    alt={slide.title || "KhilatKari luxury handcrafted collection"}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                    style={{
                      objectFit: "cover",
                      objectPosition: `${slide.posX ?? 50}% ${slide.posY ?? 15}%`,
                      transform: `scale(${slide.zoom ?? 1.0})`,
                      transformOrigin: `${slide.posX ?? 50}% ${slide.posY ?? 15}%`,
                    }}
                    className="w-full h-full text-transparent"
                  />
                )}
              </div>
            ))}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C1814]/85 via-[#1C1814]/45 to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full container-main flex flex-col justify-center py-10 sm:py-0">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <p className="section-label text-[#C9A96E] tracking-[0.25em] text-[0.68rem] sm:text-xs">
                    KHILATKARI
                  </p>
                  <span className="text-[#C9A96E]/50 text-xs">&bull;</span>
                  <span
                    className="font-urdu text-sm sm:text-base text-[#E8D5A8] tracking-normal select-none leading-normal inline-block"
                    title="خلعت کاری"
                  >
                    خلعت کاری
                  </span>
                </div>

                <h1
                  className="text-display-lg sm:text-display-xl text-white mb-2.5 sm:mb-4 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {activeSlide?.title ? (
                    activeSlide.title
                  ) : (
                    <>
                      Heritage in
                      <span className="block italic font-normal text-[#E8D5A8]"> Every Stitch.</span>
                    </>
                  )}
                </h1>

                <p className="text-[#D4C8BC] text-xs sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg line-clamp-4 sm:line-clamp-none">
                  {activeSlide?.subtitle ||
                    "Handcrafted South Asian traditional wear — Chikankari, Kamdani, Bridal & more — presented through an exclusive private appointment experience in Lahore, Islamabad, Rawalpindi, and Peshawar."}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                  <Link
                    to="/appointments"
                    className="btn-gold py-2.5 sm:py-3.5 px-5 sm:px-6 text-xs sm:text-sm"
                  >
                    <span>Book a Private Appointment</span> <ArrowRight size={15} className="shrink-0" />
                  </Link>
                  <Link
                    to="/collections"
                    className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814] py-2.5 sm:py-3.5 px-5 sm:px-6 text-xs sm:text-sm"
                  >
                    Explore the Collection
                  </Link>
                </div>
              </div>
            </div>

            {/* Slide indicators */}
            {validHeroSlides.length > 1 && (
              <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {validHeroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`h-1 sm:h-0.5 transition-all duration-300 rounded-full ${
                      i === safeHeroIdx ? "w-7 sm:w-8 bg-[#C9A96E]" : "w-3 sm:w-4 bg-white/40"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })()}

      {/* ── APPOINTMENT NOTE BANNER ────────────────── */}
      <section className="bg-[#1C1814] py-3.5 sm:py-4" id="appointment-banner">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 text-center text-[0.68rem] sm:text-xs tracking-[0.14em] uppercase text-[#C9A96E]">
            <span>By Private Appointment Only — Not a Walk-In Store</span>
            <span className="hidden sm:inline text-[#4A3D33]">&bull;</span>
            <a
              href={WHATSAPP_URL("Hello! I'd like to book an appointment.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#C9A96E] transition-colors"
            >
              WhatsApp: {BRAND.whatsappDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ──────────────────── */}
      <section className="py-16 md:py-24 bg-[#FAF8F5]" id="collections">
        <div className="container-main">
          <div className="text-center mb-10 sm:mb-14">
            <p className="section-label mb-2 sm:mb-3">Our Specialities</p>
            <h2 className="text-display-md text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
              Explore the Collection
            </h2>
            <div className="divider-gold" />
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-[#E8E0D5] animate-pulse rounded-xs" />
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-center py-12">
              <p className="text-[#9B8B7E] text-sm mb-4">Unable to load collection categories at this time.</p>
              <Link to="/collections" className="btn-outline">
                Browse Full Lookbook <ArrowRight size={15} />
              </Link>
            </div>
          ) : homepageCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9B8B7E] text-sm mb-4">No featured collections currently highlighted.</p>
              <Link to="/collections" className="btn-outline">
                View All Collections <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {homepageCategories.map((col) => {
                const targetQuery = col.slug || col.name;
                const framing = col.imagePosition;
                const hasCover = Boolean(col.coverImage?.trim());

                return (
                  <Link
                    to={`/collections?category=${encodeURIComponent(targetQuery)}`}
                    key={col.id || col.name}
                    className="group block"
                  >
                    <div className="relative overflow-hidden aspect-[3/4] bg-[#F2EDE6]">
                      {hasCover ? (
                        <img
                          src={getMediaUrl(col.coverImage)}
                          alt={col.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{
                            objectPosition: `${framing?.posX ?? 50}% ${framing?.posY ?? 0}%`,
                            transform: `scale(${framing?.zoom ?? 1.0})`,
                            transformOrigin: `${framing?.posX ?? 50}% ${framing?.posY ?? 0}%`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D2319] to-[#1C1814] p-4 text-center">
                          <div className="w-10 h-10 rounded-full border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E] mb-2 font-serif text-xs font-semibold">
                            KK
                          </div>
                          <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-medium">
                            {col.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1814]/80 via-[#1C1814]/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3
                          className="text-white font-medium text-xs sm:text-sm mb-0.5 sm:mb-1"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {col.name}
                        </h3>
                        <p className="text-[#D4C8BC] text-[0.65rem] sm:text-[0.7rem] leading-snug line-clamp-2">
                          {col.homepageDescription || col.description || ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/collections" className="btn-outline">
              View All Collections <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F2EDE6]" id="featured-products">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Curated Selection</p>
            <h2 className="text-display-md text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
              Featured Pieces
            </h2>
            <p className="text-sm text-[#9B8B7E] mt-2">Available for private viewing by appointment</p>
            <div className="divider-gold" />
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card">
                  <div className="skeleton aspect-[3/4] w-full" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#9B8B7E]">No featured products yet. Add products from the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/collections" className="btn-primary">
              Explore Full Collection <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#FAF8F5]" id="how-it-works">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image / Video side */}
            {(() => {
              if (loadingContent) {
                return (
                  <div className="relative overflow-hidden aspect-[4/5] bg-[#E8E0D5] animate-pulse rounded-xs" />
                );
              }

              const exp = homepageContent?.experienceImage;
              const hasVideo = exp?.mediaType === "video" && Boolean(exp?.videoUrl?.trim());
              const hasImage = Boolean(exp?.imageUrl?.trim());

              if (hasVideo && exp?.videoUrl) {
                return (
                  <div className="relative overflow-hidden aspect-[4/5] bg-[#F2EDE6]">
                    <video
                      src={getMediaUrl(exp.videoUrl)}
                      poster={exp.posterUrl ? getMediaUrl(exp.posterUrl) : undefined}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      style={{
                        objectFit: "cover",
                        objectPosition: `${exp.posX ?? 50}% ${exp.posY ?? 15}%`,
                        transform: `scale(${exp.zoom ?? 1.0})`,
                        transformOrigin: `${exp.posX ?? 50}% ${exp.posY ?? 15}%`,
                      }}
                      className="w-full h-full"
                    />
                    <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-[#C9A96E] hidden lg:block pointer-events-none" />
                  </div>
                );
              }

              if (hasImage && exp?.imageUrl) {
                return (
                  <div className="relative overflow-hidden aspect-[4/5] bg-[#F2EDE6]">
                    <img
                      src={getMediaUrl(exp.imageUrl)}
                      alt={exp.title || "Private appointment experience"}
                      style={{
                        objectFit: "cover",
                        objectPosition: `${exp.posX ?? 50}% ${exp.posY ?? 15}%`,
                        transform: `scale(${exp.zoom ?? 1.0})`,
                        transformOrigin: `${exp.posX ?? 50}% ${exp.posY ?? 15}%`,
                      }}
                      className="w-full h-full"
                    />
                    <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-[#C9A96E] hidden lg:block pointer-events-none" />
                  </div>
                );
              }

              // Placeholder / Empty state when no visual configured
              return (
                <div className="relative overflow-hidden aspect-[4/5] bg-[#F2EDE6] border border-[#E0D8CE] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full border border-[#C9A96E]/50 flex items-center justify-center text-[#C9A96E] mb-4 font-serif text-lg font-semibold">
                    KK
                  </div>
                  <h3 className="font-serif text-lg text-[#1C1814] mb-2">{exp?.title || "The Private Viewing Experience"}</h3>
                  <p className="text-xs text-[#6B5B4E] max-w-xs leading-relaxed">
                    Exclusive in-home luxury consultations across Lahore, Islamabad, Rawalpindi, and Peshawar.
                  </p>
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-[#C9A96E] hidden lg:block pointer-events-none" />
                </div>
              );
            })()}

            {/* Text side */}
            <div>
              <p className="section-label mb-3">The Experience</p>
              <h2
                className="text-display-md text-[#1C1814] mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                A Private Shopping Experience,
                <span className="block italic font-normal"> Tailored for You.</span>
              </h2>
              <p className="text-[#6B5B4E] leading-relaxed mb-10">
                We believe luxury shopping should feel personal. Every appointment is a private, unhurried experience where you can explore our full collection at your own pace.
              </p>

              <div className="space-y-6">
                {APPOINTMENT_PROCESS.map((step) => (
                  <div key={step.step} className="flex gap-5 items-start">
                    <span
                      className="text-[#C9A96E] font-medium text-lg flex-shrink-0 mt-0.5"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-medium text-[#1C1814] mb-1">{step.title}</h3>
                      <p className="text-sm text-[#6B5B4E] leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/appointments" className="btn-primary">
                  Request an Appointment <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL GALLERY STRIP ───────────────── */}
      {(() => {
        if (loadingContent) {
          return (
            <section className="bg-[#1C1814] overflow-hidden py-8" id="gallery-strip">
              <div className="container-main">
                <div className="flex gap-4 h-48 md:h-64 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-1 bg-[#2A231C] rounded-xs" />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        const validStrip = (homepageContent?.galleryStrip || []).filter(
          (item) => Boolean(item.imageUrl?.trim() || item.videoUrl?.trim())
        );

        if (validStrip.length === 0) {
          return (
            <section className="bg-[#1C1814] border-y border-[#2E2721] py-8 overflow-hidden" id="gallery-strip">
              <div className="container-main text-center">
                <p className="text-xs tracking-[0.25em] uppercase text-[#C9A96E]">
                  Handcrafted Traditional Wear &middot; Chikankari &middot; Kamdani &middot; Mukesh &middot; Bridal Heirlooms
                </p>
              </div>
            </section>
          );
        }

        return (
          <section className="bg-[#1C1814] overflow-hidden" id="gallery-strip">
            <div className="flex h-56 sm:h-64 md:h-80 overflow-x-auto scrollbar-none snap-x snap-mandatory">
              {validStrip.map((item, i) => (
                <div
                  key={item.id || i}
                  className="w-56 sm:w-64 md:w-auto md:flex-1 flex-shrink-0 snap-center overflow-hidden relative group"
                >
                  <img
                    src={getMediaUrl(item.imageUrl)}
                    alt={item.title || "KhilatKari handcrafted collection"}
                    style={{
                      objectFit: "cover",
                      objectPosition: `${item.posX ?? 50}% ${item.posY ?? 15}%`,
                      transform: `scale(${item.zoom ?? 1.0})`,
                      transformOrigin: `${item.posX ?? 50}% ${item.posY ?? 15}%`,
                    }}
                    className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#1C1814]/20 group-hover:bg-[#1C1814]/0 transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ── ABOUT SNIPPET ─────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#F2EDE6]" id="about-snippet">
        <div className="container-main max-w-3xl text-center">
          <p className="section-label mb-2 sm:mb-3">Our Story</p>
          <h2
            className="text-display-md text-[#1C1814] mb-4 sm:mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Craftsmanship That Speaks
          </h2>
          <div className="divider-gold" />
          <p className="text-[#6B5B4E] leading-relaxed mt-4 sm:mt-6 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
            {homepageContent?.aboutPage?.heroIntroText || "KhilatKari celebrates the beauty of traditional South Asian craftsmanship through carefully handcrafted clothing and textiles. Every piece in our collection is created with timeless artistry — from delicate Kamdani and Mukesh work to intricate Gota embellishments and bridal craftsmanship."}
          </p>
          <p className="text-[#6B5B4E] leading-relaxed mb-8 sm:mb-10 text-xs sm:text-sm md:text-base">
            We bring a curated selection of the finest traditional wear to your doorstep through our exclusive private appointment service, available across Lahore, Islamabad, Rawalpindi, and Peshawar.
          </p>
          <Link to="/about" className="btn-outline">
            Learn More About Us <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── SERVICE CITIES ────────────────────────── */}
      <section className="py-12 md:py-16 bg-[#FAF8F5] border-y border-[#E0D8CE]" id="cities">
        <div className="container-main">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-10">
            <p className="w-full sm:w-auto text-center sm:text-left text-[0.65rem] sm:text-xs tracking-[0.18em] uppercase text-[#9B8B7E] font-medium sm:mr-2">
              Available In
            </p>
            {CITIES.map((city, i) => (
              <div key={city} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[#1C1814]">
                  <MapPin size={14} className="text-[#C9A96E] flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">{city}</span>
                </div>
                {i < CITIES.length - 1 && (
                  <span className="text-[#E0D8CE] font-serif text-sm">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────── */}
      {(() => {
        if (loadingContent) {
          return (
            <section className="py-28 md:py-40 bg-[#1C1814] animate-pulse" id="final-cta">
              <div className="container-main max-w-xl mx-auto text-center space-y-4">
                <div className="h-4 w-32 bg-[#C9A96E]/20 mx-auto rounded-xs" />
                <div className="h-10 w-3/4 bg-white/10 mx-auto rounded-xs" />
                <div className="h-16 w-full bg-white/5 mx-auto rounded-xs" />
              </div>
            </section>
          );
        }

        const stmt = homepageContent?.statementSection;
        const bgImg = stmt?.backgroundImage;
        const hasBg = Boolean(bgImg?.imageUrl?.trim());
        const bgUrl = hasBg ? bgImg!.imageUrl! : "";
        const bgPosX = bgImg?.posX ?? 50;
        const bgPosY = bgImg?.posY ?? 0;
        const bgZoom = bgImg?.zoom ?? 1.0;

        const headlineMain = stmt?.headlineMain || "Discover Your Next";
        const headlineItalic = stmt?.headlineItalic || "Statement Piece.";
        const bodyText = stmt?.bodyText || "Request a private appointment and let us bring our full collection to you. A personal, unhurried, and unforgettable shopping experience.";
        const btn1Text = stmt?.button1Text || "Book a Private Appointment";
        const btn1Link = stmt?.button1Link || "/appointments";
        const btn2Text = stmt?.button2Text || "Chat on WhatsApp";
        const btn2Link = stmt?.button2Link || WHATSAPP_URL("Hello! I'd like to enquire about booking an appointment with KhilatKari.");

        const bgStyle = hasBg
          ? {
              backgroundImage: `url('${getMediaUrl(bgUrl)}')`,
              backgroundSize: "cover",
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              transform: bgZoom !== 1.0 ? `scale(${bgZoom})` : undefined,
            }
          : undefined;

        return (
          <section
            className={`relative py-16 sm:py-24 md:py-36 overflow-hidden ${
              hasBg ? "" : "bg-gradient-to-r from-[#1C1814] via-[#2A231C] to-[#1C1814] border-t border-[#C9A96E]/20"
            }`}
            id="final-cta"
            style={bgStyle}
          >
            <div className="absolute inset-0 bg-[#1C1814]/75" />
            <div className="relative z-10 container-main text-center">
              <p className="section-label text-[#C9A96E] mb-4">Begin Your Journey</p>
              <h2
                className="text-display-lg text-white mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {headlineMain}
                <span className="block italic font-normal text-[#E8D5A8]"> {headlineItalic}</span>
              </h2>
              <p className="text-[#C8BBA8] max-w-xl mx-auto mb-10 leading-relaxed">
                {bodyText}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={sanitizeLinkUrl(btn1Link, "/appointments")} className="btn-gold">
                  {btn1Text} <ArrowRight size={16} />
                </Link>
                {(() => {
                  const safeBtn2 = sanitizeLinkUrl(btn2Link, "/collections");
                  return safeBtn2.startsWith("http") ? (
                    <a
                      href={safeBtn2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814]"
                    >
                      {btn2Text}
                    </a>
                  ) : (
                    <Link
                      to={safeBtn2}
                      className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814]"
                    >
                      {btn2Text}
                    </Link>
                  );
                })()}
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
}
