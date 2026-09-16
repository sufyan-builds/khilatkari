import type { Product } from "../types";

export function formatPrice(product: Product): string {
  if (product.priceDisplayMode === "price_on_request" || !product.price) {
    return "Price on Request";
  }
  return `PKR ${product.price.toLocaleString("en-PK")}`;
}
