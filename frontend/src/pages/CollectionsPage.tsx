import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { CATEGORIES } from "../data/constants";
import { productsService } from "../services/products";
import { homepageService, type CollectionsPageConfig } from "../services/homepage";
import { categoriesService } from "../services/categories";
import type { Product, Category } from "../types";
import ProductCard from "../components/product/ProductCard";

const STORAGE_KEY_CONTENT = "khilatkari_cached_homepage_content";

function getCachedCollectionsConfig(): CollectionsPageConfig | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.collectionsPage) {
          return parsed.collectionsPage;
        }
      }
    } catch {}
  }
  return null;
}

export default function CollectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cms, setCms] = useState<CollectionsPageConfig | null>(getCachedCollectionsConfig);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    homepageService
      .getPublic()
      .then((res) => {
        const data = res.data;
        if (res.success && data) {
          if (data.collectionsPage) {
            setCms(data.collectionsPage);
          }
          try {
            localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    // Fetch active categories dynamically
    categoriesService
      .getAll()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setDbCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const category = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setLoading(true);
    setError("");
    productsService
      .getAll({
        category: category === "All" ? undefined : category,
        search: search || undefined,
        page,
        limit: 12,
      })
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data.products);
          setTotal(res.data.total);
          setPages(res.data.pages);
        }
      })
      .catch(() => setError("Unable to load products. Please try again."))
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const setCategory = (cat: string) => {
    setSearchParams((p) => {
      p.set("category", cat);
      p.delete("page");
      return p;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((p) => {
      if (searchInput) p.set("search", searchInput);
      else p.delete("search");
      p.delete("page");
      return p;
    });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams((p) => { p.delete("search"); return p; });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Page header */}
      <div className="bg-[#F2EDE6] border-b border-[#E0D8CE] py-14 md:py-20">
        <div className="container-main text-center">
          <p className="section-label mb-3">{cms?.label || "Private Lookbook"}</p>
          <h1
            className="text-display-md text-[#1C1814]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {cms?.heading || "The Collection"}
          </h1>
          <div className="divider-gold" />
          <p className="text-[#6B5B4E] mt-4 max-w-md mx-auto text-sm leading-relaxed">
            {cms?.description || "Each piece is handcrafted and available for private viewing at your home. Browse, explore, then book an appointment to see them in person."}
          </p>
        </div>
      </div>

      <div className="container-main py-8 md:py-12">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="form-group flex-1">
            <span className="form-input-icon">
              <Search size={18} className="text-[#9B8B7E]" />
            </span>
            <input
              type="text"
              id="collection-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, colour, fabric…"
              className="form-input form-input-search"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#9B8B7E] hover:text-[#1C1814] cursor-pointer"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {/* Result count */}
          {!loading && (
            <div className="flex items-center text-xs sm:text-sm text-[#6B5B4E] whitespace-nowrap px-1">
              <SlidersHorizontal size={15} className="mr-2 text-[#C9A96E]" />
              {total} {total === 1 ? "piece" : "pieces"} found
            </div>
          )}
        </div>

        {/* Category filters — horizontally swipeable on mobile, wrapping on tablet/desktop */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
          {(() => {
            const filterList = [
              "All",
              ...(dbCategories.length > 0
                ? dbCategories.map((c) => c.name)
                : CATEGORIES.filter((c) => c !== "All")),
            ];

            const isSelected = (catName: string) => {
              if (catName === "All") return category === "All" || !category;
              if (category.toLowerCase() === catName.toLowerCase()) return true;
              const match = dbCategories.find(
                (c) => c.slug.toLowerCase() === category.toLowerCase()
              );
              return match?.name.toLowerCase() === catName.toLowerCase();
            };

            return filterList.map((cat) => (
              <button
                key={cat}
                id={`filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium tracking-[0.08em] uppercase border transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isSelected(cat)
                    ? "bg-[#1C1814] text-[#FAF8F5] border-[#1C1814]"
                    : "bg-white text-[#6B5B4E] border-[#E0D8CE] hover:border-[#1C1814] hover:text-[#1C1814]"
                }`}
              >
                {cat}
              </button>
            ));
          })()}
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-[#B85C5C]">
            <p>{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
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
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 px-4">
            <p
              className="text-display-sm text-[#9B8B7E] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No pieces found
            </p>
            <p className="text-sm text-[#9B8B7E] mb-6 max-w-sm mx-auto">
              Try a different category or clear your search to explore other handcrafted garments.
            </p>
            <button onClick={() => { clearSearch(); setCategory("All"); }} className="btn-outline btn-sm">
              Clear Filters
            </button>
          </div>
        )}

        {/* Appointment CTA Banner */}
        {!loading && !error && products.length > 0 && (
          <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1C1814] text-[#FAF8F5] p-5 sm:p-6">
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-[0.15em] text-[#C9A96E] font-semibold mb-1">Private Viewing Available</p>
              <p className="text-xs sm:text-sm text-[#D4C8BC]">Interested in a piece? We bring it to your home.</p>
            </div>
            <a
              href="/appointments"
              className="btn-gold btn-sm whitespace-nowrap flex-shrink-0 w-full sm:w-auto text-center"
            >
              Book a Private Appointment
            </a>
          </div>
        )}

        {/* Products grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    id={`page-btn-${i + 1}`}
                    onClick={() => setSearchParams((p) => { p.set("page", String(i + 1)); return p; })}
                    className={`w-9 h-9 text-sm border transition-all ${
                      page === i + 1
                        ? "bg-[#1C1814] text-white border-[#1C1814]"
                        : "border-[#E0D8CE] text-[#6B5B4E] hover:border-[#1C1814]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
