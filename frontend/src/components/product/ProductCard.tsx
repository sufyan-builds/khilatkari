import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { formatPrice } from "../../utils/format";
import { getMediaUrl } from "../../utils/media";

interface ProductCardProps {
  product: Product;
}

const AVAILABILITY_STYLES: Record<string, string> = {
  Available: "bg-[#F7F2EA] text-[#8B6B38] border-[#E0D8CE]",
  Reserved: "bg-amber-50 text-amber-700 border-amber-200",
  Sold: "bg-red-50 text-red-700 border-red-200",
  Archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = getMediaUrl(product.images?.[0]);
  const availabilityLabel = product.availability && product.availability !== "Available"
    ? product.availability
    : null;

  return (
    <article className="product-card group active:scale-[0.99] transition-transform">
      <Link to={`/products/${product.slug}`} className="block h-full flex flex-col justify-between">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-[#F2EDE6]">
          <img
            src={mainImage}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith("/images/placeholder.jpg")) {
                target.src = "/images/placeholder.jpg";
              }
            }}
          />

          {/* Badges container — neatly spaced to never collide */}
          {(availabilityLabel || product.featured) && (
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none z-10">
              {availabilityLabel ? (
                <span className={`badge text-[0.6rem] sm:text-[0.65rem] border ${AVAILABILITY_STYLES[availabilityLabel] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {availabilityLabel}
                </span>
              ) : (
                <span />
              )}

              {product.featured && (
                <span className="badge badge-gold text-[0.6rem] sm:text-[0.65rem]">
                  Featured
                </span>
              )}
            </div>
          )}

          {/* Hover overlay CTA (desktop only) */}
          <div className="hidden md:flex absolute inset-0 bg-[#1C1814]/0 group-hover:bg-[#1C1814]/35 transition-all duration-300 items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
            <span className="btn-primary btn-sm">Inquire About This Piece</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
          <div>
            <p className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.12em] uppercase text-[#C9A96E] mb-1 font-medium">
              {product.category}
            </p>
            <h3
              className="text-sm sm:text-base font-medium text-[#1C1814] mb-1.5 leading-snug line-clamp-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#6B5B4E] mt-1">
            {formatPrice(product)}
          </p>
        </div>
      </Link>
    </article>
  );
}
