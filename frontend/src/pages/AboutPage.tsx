import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, HeartHandshake, ShieldCheck, Gem } from "lucide-react";
import { BRAND, WHATSAPP_URL, CITIES } from "../data/constants";

export default function AboutPage() {
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
      desc: "Founded as a passion project for exquisite South Asian traditional textiles, MS Fashions serves discerning families with warmth and integrity.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C9A96E]" />,
      title: "Customized Fitting",
      desc: "From length adjustments to bespoke dupattas and neckline fittings, our master tailors customize each silhouette to your exact specifications.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Editorial Hero */}
      <section className="relative py-20 md:py-28 bg-[#F2EDE6] border-b border-[#E0D8CE]">
        <div className="container-main max-w-4xl text-center">
          <p className="section-label mb-3">The MS Fashions Story</p>
          <h1
            className="text-display-lg text-[#1C1814] mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A Celebration of Authentic
            <span className="block italic font-normal text-[#9B773E]"> South Asian Heritage</span>
          </h1>
          <div className="divider-gold" />
          <p className="text-[#6B5B4E] max-w-2xl mx-auto mt-6 text-base md:text-lg leading-relaxed">
            MS Fashions was born out of a profound admiration for the timeless artistry of subcontinental needlework, reimagined for the contemporary woman through an exclusive in-home experience.
          </p>
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section className="py-20 md:py-28 container-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Images Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/images/models/model-16.jpg"
                alt="MS Fashions Heritage Model"
                className="w-full aspect-[3/4] object-cover object-top border border-[#E0D8CE] shadow-sm"
              />
              <img
                src="/images/models/model-4.jpg"
                alt="Kamdani Work Detailing"
                className="w-full aspect-square object-cover object-top border border-[#E0D8CE] shadow-sm"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="/images/models/model-1.jpg"
                alt="Chikankari Handcraft"
                className="w-full aspect-square object-cover object-top border border-[#E0D8CE] shadow-sm"
              />
              <img
                src="/images/models/model-12.jpg"
                alt="Traditional Dress Ensemble"
                className="w-full aspect-[3/4] object-cover object-top border border-[#E0D8CE] shadow-sm"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6">
            <p className="section-label mb-3">Our Philosophy</p>
            <h2
              className="text-display-md text-[#1C1814] mb-6 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Why We Operate Exclusively by Appointment
            </h2>
            <p className="text-[#6B5B4E] leading-relaxed mb-6">
              In an age of mass-produced, fast-fashion retail, true luxury has become rare. Browsing crowded store racks with hurried sales staff cannot do justice to a bridal ensemble adorned with months of delicate hand-embroidery.
            </p>
            <p className="text-[#6B5B4E] leading-relaxed mb-6">
              At <strong>MS Fashions</strong>, we replaced the conventional store with an intimate, private home viewing model. You and your family review our curated collections within the quiet comfort of your own living room across <strong>Lahore, Islamabad, Rawalpindi, and Peshawar</strong>.
            </p>
            <p className="text-[#6B5B4E] leading-relaxed mb-8">
              You feel the weight of pure chiffon, inspect the gleam of genuine metal Kamdani threads, and drape shawls under warm home lighting before making any decision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
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

      {/* The Crafts */}
      <section className="py-20 bg-[#F2EDE6] border-y border-[#E0D8CE]">
        <div className="container-main">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="section-label mb-3">Artistry & Technique</p>
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
                Kamdani & Mukesh
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

      {/* Values Grid */}
      <section className="py-20 md:py-28 container-main">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="section-label mb-3">Our Standards</p>
          <h2
            className="text-display-md text-[#1C1814]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The MS Fashions Promise
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
          Experience the Collection Firsthand
        </h2>
        <p className="text-[#6B5B4E] max-w-lg mx-auto mb-8 text-sm leading-relaxed">
          Request your private appointment today and discover handcrafted luxury in the comfort of your own home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/appointments" className="btn-gold">
            Book an Appointment
          </Link>
          <a
            href={WHATSAPP_URL("Hello MS Fashions! I'd like to learn more about your private viewing services.")}
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
