import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { BRAND, CITIES, APPOINTMENT_PROCESS, WHATSAPP_URL } from "../data/constants";
import { productsService } from "../services/products";
import type { Product } from "../types";
import ProductCard from "../components/product/ProductCard";

// Hero images from our real model photos
const HERO_IMAGES = [
  "/images/models/model-3.jpg",
  "/images/models/model-9.jpg",
  "/images/models/model-5.jpg",
];

const COLLECTION_DATA = [
  { name: "Chikankari", image: "/images/models/model-1.jpg", desc: "Delicate thread embroidery on chiffon" },
  { name: "Kamdani", image: "/images/models/model-4.jpg", desc: "Shimmering metal thread work" },
  { name: "Gota & Mukesh", image: "/images/models/model-6.jpg", desc: "Ornate gold ribbon embellishment" },
  { name: "Kashmiri Shawls", image: "/images/models/model-7.jpg", desc: "Authentic Pashmina craftsmanship" },
  { name: "Bridal Wear", image: "/images/models/model-9.jpg", desc: "Bespoke bridal ensembles" },
];

export default function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Auto-advance hero image
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden" id="hero">
        {/* Background images */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={img}
              alt="MS Fashions luxury collection"
              className="w-full h-full object-cover object-top"
            />
          </div>
        ))}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1814]/80 via-[#1C1814]/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full container-main flex flex-col justify-center">
          <div className="max-w-2xl">
            <p className="section-label text-[#C9A96E] mb-4">MS Fashions</p>
            <h1
              className="text-display-xl text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Private Luxury
              <span className="block italic font-normal text-[#E8D5A8]"> Traditional Wear.</span>
            </h1>
            <p className="text-[#D4C8BC] text-base md:text-lg leading-relaxed mb-10 max-w-lg">
              Handcrafted South Asian traditional wear — Chikankari, Kamdani, Bridal &amp; more — presented through an exclusive private appointment experience in Lahore, Islamabad, Rawalpindi, and Peshawar.
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`h-0.5 transition-all duration-300 ${i === heroIdx ? "w-8 bg-[#C9A96E]" : "w-4 bg-white/40"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── APPOINTMENT NOTE BANNER ────────────────── */}
      <section className="bg-[#1C1814] py-4" id="appointment-banner">
        <div className="container-main">
          <p className="text-center text-xs tracking-[0.15em] uppercase text-[#C9A96E]">
            By Private Appointment Only — Not a Walk-In Store
            <span className="mx-4 text-[#3A3028]">|</span>
            <a
              href={WHATSAPP_URL("Hello! I'd like to book an appointment.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#C9A96E] transition-colors"
            >
              WhatsApp: {BRAND.whatsappDisplay}
            </a>
          </p>
        </div>
      </section>

      {/* ── FEATURED COLLECTIONS ──────────────────── */}
      <section className="py-20 md:py-28 bg-[#FAF8F5]" id="collections">
        <div className="container-main">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Our Specialities</p>
            <h2 className="text-display-md text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
              Explore the Collection
            </h2>
            <div className="divider-gold" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLLECTION_DATA.map((col) => (
              <Link
                to={`/collections?category=${encodeURIComponent(col.name)}`}
                key={col.name}
                className="group block"
              >
                <div className="relative overflow-hidden aspect-[3/4] bg-[#F2EDE6]">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1814]/80 via-[#1C1814]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3
                      className="text-white font-medium text-sm mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {col.name}
                    </h3>
                    <p className="text-[#D4C8BC] text-[0.7rem] leading-snug">{col.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card">
                  <div className="skeleton aspect-[3/4] w-full" />
                  <div className="p-4 space-y-2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
            {/* Image side */}
            <div className="relative">
              <img
                src="/images/models/model-11.jpg"
                alt="Private appointment experience"
                className="w-full aspect-[4/5] object-cover object-top"
              />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 border-2 border-[#C9A96E] hidden lg:block" />
            </div>

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
      <section className="bg-[#1C1814] overflow-hidden" id="gallery-strip">
        <div className="flex h-64 md:h-80">
          {[
            "/images/models/model-13.jpg",
            "/images/models/model-15.jpg",
            "/images/models/model-17.jpg",
            "/images/models/model-2.jpg",
            "/images/models/model-8.jpg",
          ].map((img, i) => (
            <div key={i} className="flex-1 overflow-hidden relative group">
              <img
                src={img}
                alt="MS Fashions collection"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#1C1814]/20 group-hover:bg-[#1C1814]/0 transition-all duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT SNIPPET ─────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#F2EDE6]" id="about-snippet">
        <div className="container-main max-w-3xl text-center">
          <p className="section-label mb-3">Our Story</p>
          <h2
            className="text-display-md text-[#1C1814] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Craftsmanship That Speaks
          </h2>
          <div className="divider-gold" />
          <p className="text-[#6B5B4E] leading-relaxed mt-6 mb-6 text-base md:text-lg">
            MS Fashions is a family boutique dedicated to the art of Indian and Pakistani traditional wear. Every piece in our collection is selected for its exceptional craftsmanship — from the delicate threadwork of Chikankari to the rich embellishments of bridal wear.
          </p>
          <p className="text-[#6B5B4E] leading-relaxed mb-10">
            We bring a curated selection of the finest traditional wear to your doorstep through our exclusive private appointment service, available across Lahore, Islamabad, Rawalpindi, and Peshawar.
          </p>
          <Link to="/about" className="btn-outline">
            Learn More About Us <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── SERVICE CITIES ────────────────────────── */}
      <section className="py-16 bg-[#FAF8F5] border-y border-[#E0D8CE]" id="cities">
        <div className="container-main">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
            <p className="text-xs tracking-[0.15em] uppercase text-[#9B8B7E] md:mr-4">
              Available In
            </p>
            {CITIES.map((city, i) => (
              <div key={city} className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2 text-[#1C1814]">
                  <MapPin size={14} className="text-[#C9A96E]" />
                  <span className="text-sm font-medium">{city}</span>
                </div>
                {i < CITIES.length - 1 && (
                  <span className="hidden md:block text-[#E0D8CE]">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────── */}
      <section
        className="relative py-28 md:py-40 overflow-hidden"
        id="final-cta"
        style={{
          backgroundImage: "url('/images/models/model-10.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-[#1C1814]/75" />
        <div className="relative z-10 container-main text-center">
          <p className="section-label text-[#C9A96E] mb-4">Begin Your Journey</p>
          <h2
            className="text-display-lg text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Discover Your Next
            <span className="block italic font-normal text-[#E8D5A8]"> Statement Piece.</span>
          </h2>
          <p className="text-[#C8BBA8] max-w-xl mx-auto mb-10 leading-relaxed">
            Request a private appointment and let us bring our full collection to you. A personal, unhurried, and unforgettable shopping experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/appointments" className="btn-gold">
              Book a Private Appointment <ArrowRight size={16} />
            </Link>
            <a
              href={WHATSAPP_URL("Hello! I'd like to enquire about booking an appointment with MS Fashions.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline border-white text-white hover:bg-white hover:text-[#1C1814]"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
