import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Star,
  Sparkles,
  Loader2,
} from "lucide-react";
import { productsService } from "../../services/products";
import type { Product } from "../../types";
import { getMediaUrl } from "../../utils/media";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    productsService
      .adminGetAll({ limit: 100 })
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await productsService.adminDelete(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setToast({ type: "success", text: `"${name}" deleted.` });
      } else {
        alert(res.message || "Failed to delete product");
      }
    } catch {
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (item: Product) => {
    setTogglingId(item.id);
    try {
      const res = await productsService.adminUpdate(item.id, { featured: !item.featured });
      if (res.success && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, featured: !item.featured } : p))
        );
        setToast({
          type: "success",
          text: item.featured
            ? `"${item.name}" removed from Featured Pieces.`
            : `"${item.name}" added to Featured Pieces on homepage.`,
        });
      } else {
        setToast({ type: "error", text: "Failed to update featured status." });
      }
    } catch {
      setToast({ type: "error", text: "Network error while updating featured status." });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.color?.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 text-xs border-l-4 shadow-md flex items-center gap-2 max-w-xs ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium block mb-1">
            Inventory
          </span>
          <h1 className="text-2xl font-semibold text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
            Products Catalog
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-[#9B8B7E]">
              {products.length} pieces in boutique
            </p>
            {/* Featured count badge */}
            <span
              className={`inline-flex items-center gap-1 text-[0.7rem] font-semibold px-2 py-0.5 ${
                featuredCount > 0
                  ? "bg-[#C9A96E]/15 text-[#A8844A]"
                  : "bg-[#FAF8F5] text-[#9B8B7E] border border-[#E0D8CE]"
              }`}
            >
              <Star size={11} className={featuredCount > 0 ? "fill-[#C9A96E] text-[#C9A96E]" : ""} />
              {featuredCount} featured on homepage
            </span>
          </div>
        </div>
        <Link to="/admin/products/new" className="btn-gold btn-sm flex items-center gap-1.5">
          <Plus size={16} /> Add New Design
        </Link>
      </div>

      {/* Featured info banner when no featured products */}
      {!loading && featuredCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 flex items-start gap-2">
          <Star size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            No products are currently featured on the homepage. Use the <Star size={11} className="inline" /> toggle in the Featured column below to add pieces to the homepage "Featured Pieces" section.
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#E0D8CE] p-4 rounded-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
          <input
            type="text"
            placeholder="Search by design title, fabric, or collection category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 text-xs"
          />
        </div>
        {search && (
          <span className="text-xs text-[#9B8B7E]">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E0D8CE] rounded-xs shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#9B8B7E]">Loading inventory pieces...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#9B8B7E]">
            <Sparkles size={32} className="mx-auto text-[#C9A96E] mb-2" />
            <p className="text-sm font-medium text-[#1C1814]">No products match your criteria</p>
            <p className="text-xs mt-1">Try another search term or create a new piece.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E0D8CE] uppercase tracking-wider text-[#9B8B7E]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Piece</th>
                  <th className="py-3.5 px-5 font-semibold">Category</th>
                  <th className="py-3.5 px-5 font-semibold">Fabric &amp; Craft</th>
                  <th className="py-3.5 px-5 font-semibold">Pricing</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Status</th>
                  {/* ─── Featured column ─── */}
                  <th className="py-3.5 px-5 font-semibold text-center">
                    <span className="flex items-center justify-center gap-1">
                      <Star size={12} className="text-[#C9A96E]" /> Featured
                    </span>
                  </th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D8CE]">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#FAF8F5]/80 transition-colors ${item.featured ? "bg-[#C9A96E]/5" : ""}`}
                  >
                    {/* Piece Thumbnail & Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getMediaUrl(item.images?.[0] || "/images/models/model-1.jpg")}
                          alt={item.name}
                          className="w-12 h-16 object-cover object-top border border-[#E0D8CE] rounded-xs flex-shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-sm text-[#1C1814]">
                            {item.name}
                          </div>
                          <div className="text-[0.7rem] text-[#9B8B7E] mt-0.5">
                            {item.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E0D8CE] text-[0.7rem] font-medium text-[#6B5B4E] uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>

                    {/* Fabric */}
                    <td className="py-4 px-5 text-[#6B5B4E]">
                      <div>{item.fabric || "—"}</div>
                      <div className="text-[0.7rem] text-[#9B8B7E]">{item.craftsmanship || "—"}</div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-5 text-[#1C1814] font-medium">
                      {item.priceDisplayMode === "fixed_price" && item.price ? (
                        `PKR ${item.price.toLocaleString()}`
                      ) : (
                        <span className="text-[#9B8B7E] text-[0.7rem] uppercase tracking-wider italic">
                          On Request
                        </span>
                      )}
                    </td>

                    {/* Availability Status */}
                    <td className="py-4 px-5 text-center">
                      {item.available ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[0.7rem] font-medium">
                          <CheckCircle size={13} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-[0.7rem] font-medium">
                          <XCircle size={13} /> Archived
                        </span>
                      )}
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item)}
                        disabled={togglingId === item.id}
                        title={item.featured ? "Remove from Featured Pieces" : "Add to Featured Pieces on homepage"}
                        className={`inline-flex flex-col items-center gap-1 cursor-pointer transition-all group ${
                          togglingId === item.id ? "opacity-40 pointer-events-none" : ""
                        }`}
                      >
                        {togglingId === item.id ? (
                          <Loader2 size={18} className="animate-spin text-[#C9A96E]" />
                        ) : item.featured ? (
                          <Star size={18} className="fill-[#C9A96E] text-[#C9A96E] group-hover:fill-transparent transition-all" />
                        ) : (
                          <Star size={18} className="text-[#CFC5B8] group-hover:text-[#C9A96E] transition-colors" />
                        )}
                        <span className={`text-[0.6rem] font-medium ${item.featured ? "text-[#A8844A]" : "text-[#9B8B7E]"}`}>
                          {item.featured ? "Featured" : "Not Featured"}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${item.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#9B8B7E] hover:text-[#1C1814] transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          to={`/admin/products/${item.id}/edit`}
                          className="p-1.5 text-[#C9A96E] hover:text-[#1C1814] transition-colors"
                          title="Edit Piece"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          title="Delete Piece"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
