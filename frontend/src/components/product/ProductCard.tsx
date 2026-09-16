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
    <article className="product-card group">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#F2EDE6]">
          <img
            src={mainImage}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
          />

          {/* Availability badge (only if not "Available") */}
          {availabilityLabel && (
            <div className="absolute top-3 left-3">
              <span className={`badge text-[0.65rem] border ${AVAILABILITY_STYLES[availabilityLabel] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {availabilityLabel}
              </span>
            </div>
          )}

          {product.featured && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-gold text-[0.65rem]">Featured</span>
            </div>
          )}

          {/* Hover overlay CTA */}
          <div className="absolute inset-0 bg-[#1C1814]/0 group-hover:bg-[#1C1814]/35 transition-all duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
            <span className="btn-primary btn-sm">Inquire About This Piece</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[0.65rem] tracking-[0.12em] uppercase text-[#C9A96E] mb-1">
            {product.category}
          </p>
          <h3
            className="text-[1rem] font-medium text-[#1C1814] mb-2 leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </h3>
          <p className="text-sm font-medium text-[#6B5B4E]">
            {formatPrice(product)}
          </p>
        </div>
      </Link>
    </article>
  );
}
