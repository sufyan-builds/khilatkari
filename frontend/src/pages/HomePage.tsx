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

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Homepage CMS Content state
  const [homepageContent, setHomepageContent] = useState<HomepageContentConfig | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState(false);

  // Homepage Featured Categories state
  const [homepageCategories, setHomepageCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Fetch dynamic visual positioning settings from backend
  useEffect(() => {
    homepageService
      .getPublic()
      .then((res) => {
        if (res.success && res.data) {
          setHomepageContent(res.data);
        } else {
          setContentError(true);
        }
      })
      .catch(() => {
        setContentError(true);
      })
      .finally(() => {
        setLoadingContent(false);
      });

    // Fetch dynamic categories featured on homepage
    categoriesService
      .getHomepage()
      .then((res) => {
        if (res.success && res.data) {
          setHomepageCategories(res.data);
        } else {
          setCategoriesError(true);
        }
      })
      .catch(() => {
        setCategoriesError(true);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, []);

  // Filter hero slides to only those with configured visual media (no obsolete model defaults)
  const rawHeroSlides = homepageContent?.heroSlides || [];
  const validHeroSlides = rawHeroSlides.filter(
    (slide) => Boolean(slide.imageUrl?.trim() || slide.videoUrl?.trim())
  );

  // Auto-advance hero image if more than 1 valid slide
  useEffect(() => {
    if (validHeroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIdx((i) => (i + 1) % validHeroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [validHeroSlides.length]);

  const safeHeroIdx = validHeroSlides.length > 0 ? heroIdx % validHeroSlides.length : 0;

  // Fetch featured products
  useEffect(() => {
    productsService
      .getAll({ featured: true, limit: 6 })
      .then((res) => {
        if (res.success && res.data) setFeaturedProducts(res.data.products);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────── */}
      {(() => {
        // 1. Loading / Skeleton state
        if (loadingContent) {
          return (
            <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-[#1C1814] flex items-center" id="hero">
              <div className="container-main max-w-2xl animate-pulse space-y-6">
                <div className="h-4 w-28 bg-[#C9A96E]/30 rounded-xs" />
                <div className="h-12 w-3/4 bg-white/10 rounded-xs" />
                <div className="h-12 w-1/2 bg-white/10 rounded-xs" />
                <div className="h-4 w-full max-w-lg bg-white/5 rounded-xs" />
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="h-12 w-48 bg-[#C9A96E]/20 rounded-xs" />
                  <div className="h-12 w-44 bg-white/10 rounded-xs" />
                </div>
              </div>
            </section>
          );
        }

        // 2. Error Fallback state (Never promotional model images)
        if (contentError) {
          return (
            <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-[#1C1814] flex items-center" id="hero">
              <div className="absolute inset-0 bg-gradient-to-b from-[#1C1814] via-[#2A231C]/60 to-[#1C1814]" />
              <div className="relative z-10 container-main flex flex-col justify-center">
                <div className="max-w-2xl">
                  <p className="section-label text-[#C9A96E] mb-4 tracking-[0.25em]">KHILATKARI</p>
                  <h1
                    className="text-display-xl text-white mb-4 leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    The Art of
                    <span className="block italic font-normal text-[#E8D5A8]"> Timeless Craft.</span>
                  </h1>
                  <p className="text-[#D4C8BC] text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                    KhilatKari celebrates the beauty of traditional South Asian craftsmanship through carefully handcrafted clothing and textiles — Kamdani, Mukesh, Gota, and bridal wear — experienced through private in-home appointments.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/appointments" className="btn-gold">
                      Book a Private Appointment <ArrowRight size={16} />
                    </Link>
                    <Link to="/collections" className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814]">
                      Explore the Collection
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 3. Empty / Placeholder state (No visual configured by Admin)
        if (validHeroSlides.length === 0) {
          return (
            <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-gradient-to-b from-[#1C1814] via-[#251E18] to-[#1C1814] flex items-center" id="hero">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C9A96E_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="relative z-10 container-main flex flex-col justify-center">
                <div className="max-w-2xl">
                  <p className="section-label text-[#C9A96E] mb-4 tracking-[0.25em]">KHILATKARI</p>
                  <h1
                    className="text-display-xl text-white mb-4 leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    The Art of
                    <span className="block italic font-normal text-[#E8D5A8]"> Timeless Craft.</span>
                  </h1>
                  <p className="text-[#D4C8BC] text-base md:text-lg leading-relaxed mb-10 max-w-lg">
                    KhilatKari celebrates the beauty of traditional South Asian craftsmanship through carefully handcrafted clothing and textiles — Kamdani, Mukesh, Gota, and bridal wear — experienced through private in-home appointments.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/appointments" className="btn-gold">
                      Book a Private Appointment <ArrowRight size={16} />
                    </Link>
                    <Link to="/collections" className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814]">
                      Explore the Collection
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 4. Configured Admin Visuals
        const activeSlide = validHeroSlides[safeHeroIdx] || validHeroSlides[0];

        return (
          <section className="relative h-[90vh] min-h-[600px] overflow-hidden" id="hero">
            {/* Background images or videos */}
            {validHeroSlides.map((slide, i) => (
              <div
                key={slide.id || slide.imageUrl || i}
                className={`absolute inset-0 transition-opacity duration-1000 ${i === safeHeroIdx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              >
                {slide.mediaType === "video" && slide.videoUrl ? (
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
                ) : (
                  <img
                    src={getMediaUrl(slide.imageUrl)}
                    alt={slide.title || "KhilatKari luxury handcrafted collection"}
                    style={{
                      objectFit: "cover",
                      objectPosition: `${slide.posX ?? 50}% ${slide.posY ?? 15}%`,
                      transform: `scale(${slide.zoom ?? 1.0})`,
                      transformOrigin: `${slide.posX ?? 50}% ${slide.posY ?? 15}%`,
                    }}
                    className="w-full h-full"
                  />
                )}
              </div>
            ))}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C1814]/80 via-[#1C1814]/40 to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full container-main flex flex-col justify-center">
              <div className="max-w-2xl">
                <p className="section-label text-[#C9A96E] mb-4 tracking-[0.25em]">KHILATKARI</p>
                <h1
                  className="text-display-xl text-white mb-4 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {activeSlide?.title ? (
                    activeSlide.title
                  ) : (
                    <>
                      The Art of
                      <span className="block italic font-normal text-[#E8D5A8]"> Timeless Craft.</span>
                    </>
                  )}
                </h1>
                <p className="text-[#D4C8BC] text-base md:text-lg leading-relaxed mb-10 max-w-lg">
                  {activeSlide?.subtitle || "Handcrafted South Asian traditional wear — Chikankari, Kamdani, Bridal & more — presented through an exclusive private appointment experience in Lahore, Islamabad, Rawalpindi, and Peshawar."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/appointments" className="btn-gold">
                    Book a Private Appointment <ArrowRight size={16} />
                  </Link>
                  <Link to="/collections" className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814]">
                    Explore the Collection
                  </Link>
                </div>
              </div>
            </div>

            {/* Slide indicators */}
            {validHeroSlides.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {validHeroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`h-0.5 transition-all duration-300 ${i === safeHeroIdx ? "w-8 bg-[#C9A96E]" : "w-4 bg-white/40"}`}
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
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3
                          className="text-white font-medium text-sm mb-1"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {col.name}
                        </h3>
                        <p className="text-[#D4C8BC] text-[0.7rem] leading-snug line-clamp-2">
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
            <p className="text-[0.65rem] sm:text-xs tracking-[0.18em] uppercase text-[#9B8B7E] font-medium mr-2">
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
            className={`relative py-28 md:py-40 overflow-hidden ${
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
