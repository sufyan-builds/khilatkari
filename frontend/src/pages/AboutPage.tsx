import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, HeartHandshake, ShieldCheck, Gem } from "lucide-react";
import { BRAND, WHATSAPP_URL, CITIES } from "../data/constants";
import { homepageService, type AboutPageConfig, type ImagePositionConfig } from "../services/homepage";
import { getMediaUrl } from "../utils/media";

const STORAGE_KEY_CONTENT = "khilatkari_cached_homepage_content";

const INITIAL_ABOUT_CONFIG: AboutPageConfig = {
  heroHeadlineMain: "A Celebration of Authentic",
  heroHeadlineItalic: "South Asian Heritage",
  heroIntroText:
    "KhilatKari was born out of a profound admiration for the timeless artistry of South Asian handcrafts, reimagined for the contemporary woman through an exclusive in-home experience.",
  philosophyHeadline: "Why We Operate Exclusively by Appointment",
  philosophyPara1:
    "In an age of mass-produced, fast-fashion retail, true luxury has become rare. Browsing crowded store racks with hurried sales staff cannot do justice to a bridal ensemble adorned with months of delicate hand-embroidery.",
  philosophyPara2:
    "At KhilatKari, we replaced the conventional store with an intimate, private home viewing model. You and your family review our curated collections within the quiet comfort of your own living room across Lahore, Islamabad, Rawalpindi, and Peshawar.",
  philosophyPara3:
    "You feel the weight of pure chiffon, inspect the gleam of genuine metal Kamdani threads, and drape shawls under warm home lighting before making any decision.",
  ctaHeadline: "Experience the Collection Firsthand",
  ctaBodyText:
    "Request your private appointment today and discover handcrafted luxury in the comfort of your own home.",
  collageImage1: {
    id: "about-col-1",
    mediaType: "image",
    imageUrl:
      "https://res.cloudinary.com/iv29blwq/image/upload/v1791391867/ms_fashions/whatsapp-image-2026-09-15-at-4-36-34-pm-0e343c6b5e.jpg",
    zoom: 1.0,
    posX: 50.0,
    posY: 0.0,
  },
  collageImage2: {
    id: "about-col-2",
    mediaType: "image",
    imageUrl:
      "https://res.cloudinary.com/iv29blwq/image/upload/v1792939208/ms_fashions/screenshot_20260719_141607_instagram-2b63948073.jpg",
    zoom: 1.05,
    posX: 67.0,
    posY: 2.0,
  },
  collageImage3: {
    id: "about-col-3",
    mediaType: "image",
    imageUrl:
      "https://res.cloudinary.com/iv29blwq/image/upload/v1792939236/ms_fashions/screenshot_20260719_141645_instagram-b5554be515.jpg",
    zoom: 1.0,
    posX: 50.0,
    posY: 18.0,
  },
  collageImage4: {
    id: "about-col-4",
    mediaType: "image",
    imageUrl:
      "https://res.cloudinary.com/iv29blwq/image/upload/v1791391857/ms_fashions/whatsapp-image-2026-09-15-at-4-36-32-pm-3aad42d659.jpg",
    zoom: 1.0,
    posX: 50.0,
    posY: 39.0,
  },
};

function getCachedAboutPageConfig(): AboutPageConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.aboutPage) {
          return {
            ...INITIAL_ABOUT_CONFIG,
            ...parsed.aboutPage,
          };
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return INITIAL_ABOUT_CONFIG;
}

// Static defaults — initialized with verified brand admin images to eliminate flash
const DEFAULT_COLLAGE: [string, string, string, string] = [
  INITIAL_ABOUT_CONFIG.collageImage1?.imageUrl || "",
  INITIAL_ABOUT_CONFIG.collageImage2?.imageUrl || "",
  INITIAL_ABOUT_CONFIG.collageImage3?.imageUrl || "",
  INITIAL_ABOUT_CONFIG.collageImage4?.imageUrl || "",
];

const DEFAULT_COLLAGE_ALTS = [
  "KhilatKari Heritage Model",
  "Kamdani Work Detailing",
  "Chikankari Handcraft",
  "Traditional Dress Ensemble",
];

function CollageImg({
  slot,
  defaultSrc,
  alt,
  className,
}: {
  slot?: ImagePositionConfig;
  defaultSrc: string;
  alt: string;
  className: string;
}) {
  const src = slot?.imageUrl || defaultSrc;
  const posX = slot?.posX ?? 50;
  const posY = slot?.posY ?? 0; // "object-top" equivalent is posY=0
  const zoom = slot?.zoom ?? 1.0;
  return (
    <img
      src={getMediaUrl(src)}
      alt={alt}
      className={className}
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.endsWith("/images/placeholder.jpg")) {
          target.src = "/images/placeholder.jpg";
        }
      }}
      style={{
        objectFit: "cover",
        objectPosition: `${posX}% ${posY}%`,
        transform: zoom !== 1.0 ? `scale(${zoom})` : undefined,
        transformOrigin: `${posX}% ${posY}%`,
      }}
    />
  );
}

export default function AboutPage() {
  const [cms, setCms] = useState<AboutPageConfig>(getCachedAboutPageConfig);

  useEffect(() => {
    homepageService
      .getPublic()
      .then((res) => {
        const data = res.data;
        if (res.success && data) {
          const freshAbout = data.aboutPage;
          if (freshAbout) {
            setCms((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(freshAbout)) return prev;
              return freshAbout;
            });
          }
          try {
            localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const values = [
    {
      icon: <Gem className="w-6 h-6 text-[#C9A96E]" />,
      title: "Pristine Craftsmanship",
      desc: "Every ensemble represents dozens of artisan hours — hand-pulled threads, genuine metal wire Kamdani, and authentic Kashmiri needlecraft.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C9A96E]" />,
      title: "Private In-Home Sanctuary",
      desc: "We abandon the chaos of public shopping malls. Our private home consultations offer total discretion, personal attention, and calm contemplation.",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#C9A96E]" />,
      title: "Family Heritage",
      desc: "Founded on a reverence for exquisite South Asian traditional textiles, KhilatKari serves discerning families with dedication, warmth, and integrity.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C9A96E]" />,
      title: "Customized Fitting",
      desc: "From length adjustments to bespoke dupattas and neckline fittings, our master tailors customize each silhouette to your exact specifications.",
    },
  ];

  // CMS values with static fallbacks
  const heroHeadlineMain = cms?.heroHeadlineMain || "A Celebration of Authentic";
  const heroHeadlineItalic = cms?.heroHeadlineItalic || "South Asian Heritage";
  const heroIntroText = cms?.heroIntroText || "KhilatKari was born out of a profound admiration for the timeless artistry of South Asian handcrafts, reimagined for the contemporary woman through an exclusive in-home experience.";
  const philosophyHeadline = cms?.philosophyHeadline || "Why We Operate Exclusively by Appointment";
  const philosophyPara1 = cms?.philosophyPara1 || "In an age of mass-produced, fast-fashion retail, true luxury has become rare. Browsing crowded store racks with hurried sales staff cannot do justice to a bridal ensemble adorned with months of delicate hand-embroidery.";
  const philosophyPara2 = cms?.philosophyPara2 || `At KhilatKari, we replaced the conventional store with an intimate, private home viewing model. You and your family review our curated collections within the quiet comfort of your own living room across Lahore, Islamabad, Rawalpindi, and Peshawar.`;
  const philosophyPara3 = cms?.philosophyPara3 || "You feel the weight of pure chiffon, inspect the gleam of genuine metal Kamdani threads, and drape shawls under warm home lighting before making any decision.";
  const ctaHeadline = cms?.ctaHeadline || "Experience the Collection Firsthand";
  const ctaBodyText = cms?.ctaBodyText || "Request your private appointment today and discover handcrafted luxury in the comfort of your own home.";

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Editorial Hero */}
      <section className="relative py-20 md:py-28 bg-[#F2EDE6] border-b border-[#E0D8CE]">
        <div className="container-main max-w-4xl text-center">
          <p className="section-label mb-3">The KhilatKari Story</p>
          <h1
            className="text-display-lg text-[#1C1814] mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {heroHeadlineMain}
            <span className="block italic font-normal text-[#9B773E]"> {heroHeadlineItalic}</span>
          </h1>
          <div className="divider-gold" />
          <p className="text-[#6B5B4E] max-w-2xl mx-auto mt-6 text-base md:text-lg leading-relaxed">
            {heroIntroText}
          </p>
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section className="py-20 md:py-28 container-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Images Grid — 4 independent slots */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <CollageImg
                slot={cms?.collageImage1}
                defaultSrc={DEFAULT_COLLAGE[0]}
                alt={DEFAULT_COLLAGE_ALTS[0]}
                className="w-full aspect-[3/4] object-cover border border-[#E0D8CE] shadow-xs"
              />
              <CollageImg
                slot={cms?.collageImage2}
                defaultSrc={DEFAULT_COLLAGE[1]}
                alt={DEFAULT_COLLAGE_ALTS[1]}
                className="w-full aspect-square object-cover border border-[#E0D8CE] shadow-xs"
              />
            </div>
            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-8">
              <CollageImg
                slot={cms?.collageImage3}
                defaultSrc={DEFAULT_COLLAGE[2]}
                alt={DEFAULT_COLLAGE_ALTS[2]}
                className="w-full aspect-square object-cover border border-[#E0D8CE] shadow-xs"
              />
              <CollageImg
                slot={cms?.collageImage4}
                defaultSrc={DEFAULT_COLLAGE[3]}
                alt={DEFAULT_COLLAGE_ALTS[3]}
                className="w-full aspect-[3/4] object-cover border border-[#E0D8CE] shadow-xs"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6">
            <p className="section-label mb-2 sm:mb-3">Our Philosophy</p>
            <h2
              className="text-display-md text-[#1C1814] mb-4 sm:mb-6 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {philosophyHeadline}
            </h2>
            <p className="text-[#6B5B4E] leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              {philosophyPara1}
            </p>
            <p className="text-[#6B5B4E] leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              {philosophyPara2}
            </p>
            <p className="text-[#6B5B4E] leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              {philosophyPara3}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/appointments" className="btn-gold">
                Schedule a Consultation <ArrowRight size={16} />
              </Link>
              <Link to="/collections" className="btn-outline">
                View Collections
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Crafts — hardcoded (craft terminology, unlikely to change) */}
      <section className="py-20 bg-[#F2EDE6] border-y border-[#E0D8CE]">
        <div className="container-main">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="section-label mb-3">Artistry &amp; Technique</p>
            <h2
              className="text-display-md text-[#1C1814]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The Traditions We Treasure
            </h2>
            <div className="divider-gold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-[#E0D8CE] shadow-xs">
              <span className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold block mb-2">
                Technique 01
              </span>
              <h3 className="text-xl font-semibold text-[#1C1814] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Chikankari
              </h3>
              <p className="text-sm text-[#6B5B4E] leading-relaxed">
                Originating from historic Lucknow, Chikankari is the sublime art of white-on-white shadow and embossed hand embroidery on pure chiffon, organza, and cotton.
              </p>
            </div>

            <div className="bg-white p-8 border border-[#E0D8CE] shadow-xs">
              <span className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold block mb-2">
                Technique 02
              </span>
              <h3 className="text-xl font-semibold text-[#1C1814] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Kamdani &amp; Mukesh
              </h3>
              <p className="text-sm text-[#6B5B4E] leading-relaxed">
                Meticulous metal thread work where flattened gold and silver wires (badla) are pierced through delicate fabric to form glittering dots and intricate royal motifs.
              </p>
            </div>

            <div className="bg-white p-8 border border-[#E0D8CE] shadow-xs">
              <span className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold block mb-2">
                Technique 03
              </span>
              <h3 className="text-xl font-semibold text-[#1C1814] mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Kashmiri Needlework
              </h3>
              <p className="text-sm text-[#6B5B4E] leading-relaxed">
                Centuries-old Sozni and Aari hand needlework on genuine Pashmina and cashmere, capturing the flora and majesty of the Kashmir valley.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid — hardcoded (brand promise cards) */}
      <section className="py-20 md:py-28 container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="section-label mb-3">Our Standards</p>
          <h2
            className="text-display-md text-[#1C1814]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The KhilatKari Promise
          </h2>
          <div className="divider-gold" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="p-6 border border-[#E0D8CE] bg-white">
              <div className="mb-4">{v.icon}</div>
              <h3 className="text-base font-semibold text-[#1C1814] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {v.title}
              </h3>
              <p className="text-xs text-[#6B5B4E] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service Area Ribbon */}
      <section className="py-12 bg-[#1C1814] text-[#FAF8F5]">
        <div className="container-main text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#C9A96E] mb-3">
            In-Home Services Available Throughout
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            {CITIES.map((c) => (
              <span key={c} className="text-white flex items-center gap-2">
                <span>✦</span> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 container-main text-center">
        <h2
          className="text-display-md text-[#1C1814] mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {ctaHeadline}
        </h2>
        <p className="text-[#6B5B4E] max-w-lg mx-auto mb-8 text-sm leading-relaxed">
          {ctaBodyText}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/appointments" className="btn-gold">
            Book an Appointment
          </Link>
          <a
            href={WHATSAPP_URL("Hello KhilatKari! I'd like to learn more about your private viewing services.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Chat on WhatsApp ({BRAND.whatsappDisplay})
          </a>
        </div>
      </section>
    </div>
  );
}
