import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Play,
} from "lucide-react";
import { productsService } from "../services/products";
import type { Product } from "../types";
import { WHATSAPP_URL } from "../data/constants";
import ProductCard from "../components/product/ProductCard";
import { getMediaUrl } from "../utils/media";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{ type: "image" | "video"; url: string }>({
    type: "image",
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");
    window.scrollTo(0, 0);

    productsService
      .getBySlug(slug)
      .then((res) => {
        if (res.success && res.data) {
          const item = res.data;
          setProduct(item);
          if (item.images && item.images.length > 0) {
            setSelectedMedia({ type: "image", url: item.images[0] });
          } else if (item.videos && item.videos.length > 0) {
            setSelectedMedia({ type: "video", url: item.videos[0] });
          }
          // Fetch related in same category
          return productsService.getAll({ category: item.category, limit: 4 });
        } else {
          setError("Product not found");
          return null;
        }
      })
      .then((relatedRes) => {
        if (relatedRes && relatedRes.success && relatedRes.data) {
          setRelatedProducts(
            relatedRes.data.products.filter((p) => p.slug !== slug).slice(0, 3)
          );
        }
      })
      .catch(() => setError("Unable to load piece details."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name || "KhilatKari Handcrafted Piece",
          text: `Explore ${product?.name} from KhilatKari`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-12 md:py-20">
        <div className="container-main max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="skeleton aspect-[3/4] w-full rounded-sm" />
            <div className="space-y-6">
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton h-24 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-20">
        <div className="text-center max-w-md p-8 bg-white border border-[#E0D8CE] shadow-sm">
          <p
            className="text-display-sm text-[#1C1814] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Piece Not Found
          </p>
          <p className="text-[#6B5B4E] text-sm mb-6">
            The requested design may have been archived or is currently being prepared for an exclusive showing.
          </p>
          <button
            onClick={() => navigate("/collections")}
            className="btn-primary"
          >
            <ArrowLeft size={16} /> Return to Collections
          </button>
        </div>
      </div>
    );
  }

  const whatsappMessage = `Hello KhilatKari! I am interested in viewing "${product.name}" (Design: ${product.slug}). Could we arrange a private appointment?`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 md:py-16">
      {/* Breadcrumbs */}
      <div className="container-main max-w-6xl mb-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#9B8B7E]">
          <Link to="/" className="hover:text-[#1C1814] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-[#1C1814] transition-colors">
            Collections
          </Link>
          <span>/</span>
          <Link
            to={`/collections?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#1C1814] transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#1C1814] truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main product showcase */}
      <div className="container-main max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Gallery - 7 cols */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails rail (photos + videos) */}
            {((product.images?.length || 0) + (product.videos?.length || 0) > 1) && (
              <div className="flex md:flex-col gap-2.5 sm:gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] pb-2 md:pb-0 scrollbar-none -mx-1 px-1">
                {/* Images */}
                {product.images?.map((img, idx) => (
                  <button
                    key={`img-${idx}`}
                    onClick={() => setSelectedMedia({ type: "image", url: img })}
                    className={`relative w-16 h-22 sm:w-20 sm:h-28 flex-shrink-0 border-2 transition-all overflow-hidden cursor-pointer ${
                      selectedMedia.type === "image" && selectedMedia.url === img
                        ? "border-[#C9A96E] shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    title={`View photo ${idx + 1}`}
                  >
                    <img
                      src={getMediaUrl(img)}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}

                {/* Videos */}
                {product.videos?.map((vid, vIdx) => (
                  <button
                    key={`vid-${vIdx}`}
                    onClick={() => setSelectedMedia({ type: "video", url: vid })}
                    className={`relative w-16 h-22 sm:w-20 sm:h-28 flex-shrink-0 border-2 transition-all overflow-hidden bg-black/90 cursor-pointer group/vid ${
                      selectedMedia.type === "video" && selectedMedia.url === vid
                        ? "border-[#C9A96E] shadow-sm"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                    title={`Play showcase video ${vIdx + 1}`}
                  >
                    <video
                      src={getMediaUrl(vid)}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover opacity-60 group-hover/vid:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-[#C9A96E] text-white flex items-center justify-center shadow-md">
                        <Play size={13} className="ml-0.5 fill-white" />
                      </div>
                      <span className="text-[0.6rem] uppercase tracking-wider text-white font-semibold bg-black/60 px-1.5 py-0.5 rounded-xs">
                        Video
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Main Media Viewport */}
            <div className="flex-1 relative aspect-[3/4] bg-[#F2EDE6] overflow-hidden border border-[#E0D8CE] shadow-sm group flex items-center justify-center">
              {selectedMedia.type === "video" ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video
                    key={selectedMedia.url}
                    src={getMediaUrl(selectedMedia.url)}
                    controls
                    playsInline
                    muted
                    autoPlay
                    poster={getMediaUrl(product.images?.[0] || "")}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={getMediaUrl(selectedMedia.url || product.images?.[0] || "/images/models/model-1.jpg")}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-[#1C1814] flex items-center justify-center hover:bg-white shadow transition-transform active:scale-95"
                  title="Share this piece"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>
              {copied && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1C1814] text-[#FAF8F5] text-xs px-3 py-1.5 shadow-md z-10">
                  Link copied to clipboard!
                </div>
              )}
            </div>
          </div>

          {/* Details - 5 cols */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category & Badges */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#C9A96E]">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="px-2 py-0.5 text-[0.65rem] tracking-wider uppercase bg-[#C9A96E]/15 text-[#8C6B2D] border border-[#C9A96E]/30 font-medium">
                    Curated Signature
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                className="text-display-md text-[#1C1814] mb-4 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </h1>

              {/* Price / Price on Request */}
              <div className="mb-6 pb-6 border-b border-[#E0D8CE]">
                {product.priceDisplayMode === "fixed_price" && product.price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#1C1814]">
                      PKR {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9B8B7E] uppercase tracking-wider">
                      (Inclusive of tailoring consultation)
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F2EDE6] text-[#6B5B4E] border border-[#E0D8CE]">
                    <Sparkles size={14} className="text-[#C9A96E]" />
                    <span className="text-xs font-medium tracking-wider uppercase">
                      Price Available Upon Private Appointment
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-[#6B5B4E] text-sm md:text-base leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Specifications Matrix */}
              <div className="bg-[#F2EDE6]/60 border border-[#E0D8CE] p-4 sm:p-5 mb-8 space-y-3 text-xs sm:text-sm">
                {product.fabric && (
                  <div className="flex justify-between items-baseline gap-3 border-b border-[#E0D8CE]/50 pb-2">
                    <span className="text-[#9B8B7E] shrink-0">Fabric:</span>
                    <span className="font-medium text-[#1C1814] text-right">{product.fabric}</span>
                  </div>
                )}
                {product.craftsmanship && (
                  <div className="flex justify-between items-baseline gap-3 border-b border-[#E0D8CE]/50 pb-2">
                    <span className="text-[#9B8B7E] shrink-0">Work & Craftsmanship:</span>
                    <span className="font-medium text-[#1C1814] text-right">{product.craftsmanship}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between items-baseline gap-3 border-b border-[#E0D8CE]/50 pb-2">
                    <span className="text-[#9B8B7E] shrink-0">Colorway:</span>
                    <span className="font-medium text-[#1C1814] text-right">{product.color}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline gap-3">
                  <span className="text-[#9B8B7E] shrink-0">Sizing & Fitting:</span>
                  <span className="font-medium text-[#1C1814] text-right">
                    {product.sizes && product.sizes.length > 0
                      ? product.sizes.join(", ")
                      : "Free Size (Custom Fitting)"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <Link
                  to={`/appointments?product=${product.id}&collection=${encodeURIComponent(
                    product.category
                  )}&productName=${encodeURIComponent(product.name)}`}
                  className="btn-gold w-full text-center flex items-center justify-center gap-2 py-4"
                >
                  <Calendar size={18} />
                  Book Private Home Appointment to View
                </Link>

                <a
                  href={WHATSAPP_URL(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full text-center flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
                >
                  <MessageCircle size={18} />
                  Enquire on WhatsApp Directly
                </a>
              </div>

              {/* Luxury Guarantee */}
              <div className="border-t border-[#E0D8CE] pt-6 space-y-3 text-xs text-[#6B5B4E]">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-[#C9A96E] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Exclusive In-Home Viewing:</strong> Our representative brings selected pieces to your residence in Lahore, Islamabad, Rawalpindi, or Peshawar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#C9A96E] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Bespoke Tailoring:</strong> Every piece can be custom fitted to your exact measurements by our master tailors.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-[#E0D8CE]">
            <div className="text-center mb-10">
              <p className="section-label mb-2">Complements</p>
              <h2
                className="text-display-sm text-[#1C1814]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                More from {product.category}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
