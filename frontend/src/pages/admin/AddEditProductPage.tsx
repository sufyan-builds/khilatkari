import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Upload, Loader2, ImagePlus, Link as LinkIcon, Star } from "lucide-react";
import { CATEGORIES } from "../../data/constants";
import { productsService } from "../../services/products";
import type { Product, PriceDisplayMode, ProductAvailability } from "../../types";
import { getMediaUrl } from "../../utils/media";

const AVAILABLE_MODEL_IMAGES = Array.from({ length: 18 }, (_, i) => `/images/models/model-${i + 1}.jpg`);

export default function AddEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: CATEGORIES.find((c) => c !== "All") || "Chikankari",
    description: "",
    priceDisplayMode: "price_on_request" as PriceDisplayMode,
    price: "" as string | number,
    fabric: "",
    craftsmanship: "",
    color: "",
    sizes: "Free Size, Custom Stitching Available",
    images: ["/images/models/model-1.jpg"],
    featured: false,
    available: true,
    availability: "Available" as ProductAvailability,
  });

  // Load existing if edit mode
  useEffect(() => {
    if (!id) return;
    setFetching(true);
    productsService
      .adminGetAll({ limit: 200 })
      .then((res) => {
        if (res.success && res.data) {
          const item = res.data.products.find((p) => p.id === id);
          if (item) {
            setForm({
              name: item.name,
              slug: item.slug,
              category: item.category,
              description: item.description || "",
              priceDisplayMode: item.priceDisplayMode,
              price: item.price ?? "",
              fabric: item.fabric || "",
              craftsmanship: item.craftsmanship || "",
              color: item.color || "",
              sizes: item.sizes ? item.sizes.join(", ") : "Free Size",
              images: item.images && item.images.length > 0 ? item.images : ["/images/models/model-1.jpg"],
              featured: item.featured,
              available: item.available,
              availability: (item.availability as ProductAvailability) || "Available",
            });
          } else {
            setError("Product not found");
          }
        }
      })
      .catch(() => setError("Failed to fetch product details"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      // Auto generate slug only when creating new
      slug: !isEdit
        ? name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : prev.slug,
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, url.trim()] }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setForm((prev) => {
      const copy = [...prev.images];
      const [item] = copy.splice(index, 1);
      return { ...prev, images: [item, ...copy] };
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      const urls = await productsService.adminUpload(fileList);
      if (urls.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...urls],
        }));
      }
    } catch (err: any) {
      setUploadError(
        err.response?.data?.message || err.message || "Failed to upload image(s) from device."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) return;
    handleAddImage(customUrl.trim());
    setCustomUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Please provide a name and URL slug for the piece.");
      return;
    }

    if (form.images.length === 0) {
      setError("Please specify at least one product image.");
      return;
    }

    setLoading(true);

    const payload: Partial<Product> = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category,
      description: form.description.trim(),
      priceDisplayMode: form.priceDisplayMode,
      price: form.priceDisplayMode === "fixed_price" && form.price ? Number(form.price) : undefined,
      fabric: form.fabric.trim() || undefined,
      craftsmanship: form.craftsmanship.trim() || undefined,
      color: form.color.trim() || undefined,
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: form.images,
      featured: form.featured,
      available: form.available,
      availability: form.availability,
    };

    try {
      if (isEdit && id) {
        const res = await productsService.adminUpdate(id, payload);
        if (res.success) {
          navigate("/admin/products");
        } else {
          setError(res.message || "Update failed");
        }
      } else {
        const res = await productsService.adminCreate(payload);
        if (res.success) {
          navigate("/admin/products");
        } else {
          setError(res.message || "Creation failed");
        }
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let msg = "";
      if (Array.isArray(detail)) {
        msg = detail.map((d: any) => `${d.loc?.slice(-1)?.[0] || "field"}: ${d.msg}`).join(", ");
      } else if (typeof detail === "string") {
        msg = detail;
      } else {
        msg = err.response?.data?.message || err.message || "Failed to save product.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-12 text-center text-xs text-[#9B8B7E]">Loading piece information...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs text-[#9B8B7E] hover:text-[#1C1814] uppercase tracking-wider transition-colors"
      >
        <ArrowLeft size={14} /> Back to Catalog
      </Link>

      <div className="bg-white border border-[#E0D8CE] p-6 md:p-10 rounded-xs shadow-xs">
        <div className="border-b border-[#E0D8CE] pb-5 mb-8">
          <span className="text-[0.65rem] tracking-[0.2em] uppercase text-[#C9A96E] font-medium block mb-1">
            Boutique Piece
          </span>
          <h1 className="text-2xl font-semibold text-[#1C1814]" style={{ fontFamily: "var(--font-display)" }}>
            {isEdit ? "Edit Collection Piece" : "Add New Collection Piece"}
          </h1>
          <p className="text-xs text-[#9B8B7E] mt-0.5">
            Configure metadata, luxury craft descriptions, and model imagery.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Piece Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Emerald Chikankari Suit"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="form-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Slug (URL Identifier) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. royal-emerald-chikankari-suit"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="form-input text-sm"
              />
            </div>
          </div>

          {/* Category & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="form-input text-sm cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Pricing Mode
              </label>
              <select
                value={form.priceDisplayMode}
                onChange={(e) => setForm({ ...form, priceDisplayMode: e.target.value as PriceDisplayMode })}
                className="form-input text-sm cursor-pointer"
              >
                <option value="price_on_request">Price On Request (Luxury standard)</option>
                <option value="fixed_price">Fixed Price (PKR)</option>
              </select>
            </div>

            {form.priceDisplayMode === "fixed_price" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                  Price (PKR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 85000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="form-input text-sm"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
              Curated Editorial Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the fabric feel, silhouette, embroidery heritage, and styling recommendations..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input text-sm"
            />
          </div>

          {/* Fabric, Craftsmanship, Color */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Fabric
              </label>
              <input
                type="text"
                placeholder="e.g. Pure Chiffon / Raw Silk"
                value={form.fabric}
                onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                className="form-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Handcraft Technique
              </label>
              <input
                type="text"
                placeholder="e.g. Kamdani & Mukesh work"
                value={form.craftsmanship}
                onChange={(e) => setForm({ ...form, craftsmanship: e.target.value })}
                className="form-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                Colorway
              </label>
              <input
                type="text"
                placeholder="e.g. Ivory White / Blush Pink"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="form-input text-sm"
              />
            </div>
          </div>

          {/* Sizing */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
              Available Sizes (Comma separated)
            </label>
            <input
              type="text"
              placeholder="Free Size, Custom Stitching Available"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="form-input text-sm"
            />
          </div>

          {/* Images Section */}
          <div className="border-t border-[#E0D8CE] pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E]">
                  Piece Imagery ({form.images.length} attached)
                </label>
                <p className="text-[0.75rem] text-[#9B8B7E]">
                  The first photo (#1) will be the primary cover displayed in collections and preview cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-[#1C1814] text-white px-3.5 py-1.5 text-xs tracking-wider uppercase font-medium hover:bg-[#C9A96E] transition-colors rounded-xs self-start sm:self-auto cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload from PC / Device
                  </>
                )}
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xs p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-[#C9A96E] bg-[#F7F2EA]"
                  : "border-[#E0D8CE] hover:border-[#C9A96E] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-11 h-11 rounded-full bg-white border border-[#E0D8CE] flex items-center justify-center text-[#C9A96E] shadow-xs">
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ImagePlus size={20} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#1C1814]">
                    {uploading
                      ? "Uploading photos from your device to server..."
                      : "Click to select photos from PC / Device or drag & drop here"}
                  </p>
                  <p className="text-[0.7rem] text-[#9B8B7E] mt-0.5">
                    Supports JPG, PNG, WEBP, AVIF (up to 15MB each). Select multiple files at once.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-3 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs flex items-center justify-between">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError("")}
                  className="text-red-700 font-bold ml-2 text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Current Images Gallery */}
            {form.images.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[0.65rem] uppercase tracking-wider text-[#9B8B7E] font-semibold block">
                  Attached Photos (Click star to set as Primary Cover):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-[3/4] border group rounded-xs overflow-hidden transition-shadow ${
                        idx === 0
                          ? "border-[#C9A96E] ring-2 ring-[#C9A96E]/30"
                          : "border-[#E0D8CE]"
                      }`}
                    >
                      <img
                        src={getMediaUrl(img)}
                        alt="Product view"
                        className="w-full h-full object-cover object-top"
                      />

                      {/* Top Action Buttons */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="bg-black/70 hover:bg-[#C9A96E] text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-colors"
                            title="Set as Primary Cover"
                          >
                            <Star size={11} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-colors"
                          title="Remove image"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      {/* Badge (Primary / Order) */}
                      <span
                        className={`absolute bottom-1.5 left-1.5 text-[0.6rem] px-1.5 py-0.5 rounded-xs font-medium ${
                          idx === 0
                            ? "bg-[#C9A96E] text-white"
                            : "bg-black/70 text-white"
                        }`}
                      >
                        {idx === 0 ? "★ Primary Cover" : `#${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xs">
                No images attached yet. Please upload from your PC, enter an image URL, or pick from the photoshoot catalog below.
              </div>
            )}

            {/* Custom URL Input & Model Quick-Add Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Add via URL */}
              <div className="bg-[#FAF8F5] border border-[#E0D8CE] p-3 rounded-xs">
                <label className="block text-[0.65rem] uppercase tracking-wider text-[#6B5B4E] font-semibold mb-1.5">
                  Add via Image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]"
                    />
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomUrl();
                        }
                      }}
                      className="form-input text-xs pl-7 py-1.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    disabled={!customUrl.trim()}
                    className="px-3 py-1.5 bg-white border border-[#E0D8CE] text-[#1C1814] text-xs hover:border-[#C9A96E] transition-colors rounded-xs disabled:opacity-50 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Quick-Pick Model Photos from Products Folder */}
              <div className="bg-[#FAF8F5] border border-[#E0D8CE] p-3 rounded-xs">
                <span className="text-[0.65rem] uppercase tracking-wider text-[#6B5B4E] font-semibold block mb-1.5">
                  Quick-Pick Model Photos (Existing Catalog):
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                  {AVAILABLE_MODEL_IMAGES.map((img) => {
                    const isAttached = form.images.includes(img);
                    return (
                      <button
                        type="button"
                        key={img}
                        onClick={() => (isAttached ? null : handleAddImage(img))}
                        disabled={isAttached}
                        className={`text-[0.65rem] px-2 py-0.5 border rounded-xs transition-colors ${
                          isAttached
                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-white text-[#1C1814] border-[#E0D8CE] hover:border-[#C9A96E] cursor-pointer"
                        }`}
                      >
                        + {img.replace("/images/models/", "")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="border-t border-[#E0D8CE] pt-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-2">
              Availability Status
            </label>
            <select
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value as ProductAvailability })}
              className="form-input text-sm cursor-pointer max-w-xs"
            >
              <option value="Available">Available — ready for private viewing</option>
              <option value="Reserved">Reserved — held for a client</option>
              <option value="Sold">Sold — no longer available</option>
              <option value="Archived">Archived — hidden from collection</option>
            </select>
          </div>

          {/* Checkboxes: Featured & Available */}
          <div className="border-t border-[#E0D8CE] pt-6 flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 text-xs text-[#1C1814] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded-xs border-[#E0D8CE] text-[#C9A96E] focus:ring-[#C9A96E]"
              />
              <span>Feature on Homepage Signature Section</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#1C1814] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="rounded-xs border-[#E0D8CE] text-[#C9A96E] focus:ring-[#C9A96E]"
              />
              <span>Visible in Public Collection (uncheck to hide)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-[#E0D8CE] pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold btn-sm flex items-center gap-1.5"
            >
              <Save size={15} />
              {loading ? "Saving Piece..." : isEdit ? "Update Piece" : "Create Piece"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
