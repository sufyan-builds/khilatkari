import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle,
  Loader2,
  Layers,
  Home,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Shirt,
  X,
} from "lucide-react";
import { categoriesService } from "../../services/categories";
import { productsService } from "../../services/products";
import type { Category, ImageFramingConfig } from "../../types";
import { getMediaUrl } from "../../utils/media";

// Pre-packaged model photoshoot images for quick luxury selection
const CATALOG_IMAGES = [
  "/images/models/model-1.jpg",
  "/images/models/model-2.jpg",
  "/images/models/model-3.jpg",
  "/images/models/model-4.jpg",
  "/images/models/model-5.jpg",
  "/images/models/model-6.jpg",
  "/images/models/model-7.jpg",
  "/images/models/model-8.jpg",
  "/images/models/model-9.jpg",
  "/images/models/model-10.jpg",
  "/images/models/model-11.jpg",
  "/images/models/model-12.jpg",
  "/images/models/model-13.jpg",
  "/images/models/model-14.jpg",
  "/images/models/model-15.jpg",
  "/images/models/model-16.jpg",
  "/images/models/model-17.jpg",
  "/images/models/model-18.jpg",
];

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Delete Safety Modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTargetName, setReassignTargetName] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Image upload in modal
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formHomepageDesc, setFormHomepageDesc] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("/images/models/model-1.jpg");
  const [formFraming, setFormFraming] = useState<ImageFramingConfig>({ zoom: 1.0, posX: 50.0, posY: 0.0 });
  const [formIsActive, setFormIsActive] = useState(true);
  const [formFeaturedOnHomepage, setFormFeaturedOnHomepage] = useState(false);
  const [formHomepageOrder, setFormHomepageOrder] = useState(1);
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);

  const fetchCategories = () => {
    setLoading(true);
    categoriesService
      .adminGetAll()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => setToast({ type: "error", text: "Failed to load categories." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Open Create modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormHomepageDesc("");
    setFormCoverImage("/images/models/model-1.jpg");
    setFormFraming({ zoom: 1.0, posX: 50.0, posY: 0.0 });
    setFormIsActive(true);
    setFormFeaturedOnHomepage(false); // Default: newly created category does NOT automatically appear on homepage
    setFormHomepageOrder(categories.length + 1);
    setFormDisplayOrder(categories.length + 1);
    setIsEditModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug || "");
    setFormDesc(cat.description || "");
    setFormHomepageDesc(cat.homepageDescription || cat.description || "");
    setFormCoverImage(cat.coverImage || "/images/models/model-1.jpg");
    setFormFraming(cat.imagePosition || { zoom: 1.0, posX: 50.0, posY: 0.0 });
    setFormIsActive(cat.isActive ?? true);
    setFormFeaturedOnHomepage(cat.featuredOnHomepage ?? false);
    setFormHomepageOrder(cat.homepageOrder ?? 1);
    setFormDisplayOrder(cat.displayOrder ?? 1);
    setIsEditModalOpen(true);
  };

  // Auto slugify on name change if slug is empty or matches slugified previous name
  const handleNameChange = (newName: string) => {
    setFormName(newName);
    if (!editingCategory) {
      const generated = newName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      setFormSlug(generated);
    }
  };

  // Pan and Zoom handlers for cover image framing
  const handleZoom = (delta: number) => {
    setFormFraming((prev) => ({
      ...prev,
      zoom: Math.min(3.0, Math.max(0.5, parseFloat((prev.zoom + delta).toFixed(2)))),
    }));
  };

  const handlePan = (dx: number, dy: number) => {
    setFormFraming((prev) => ({
      ...prev,
      posX: Math.min(100, Math.max(0, Math.round(prev.posX + dx))),
      posY: Math.min(100, Math.max(0, Math.round(prev.posY + dy))),
    }));
  };

  const handleResetFraming = () => {
    setFormFraming({ zoom: 1.0, posX: 50.0, posY: 0.0 });
  };

  const handleUploadImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const urls = await productsService.adminUpload(Array.from(files));
      if (urls.length > 0) {
        setFormCoverImage(urls[0]);
        setToast({ type: "success", text: "Cover image uploaded successfully!" });
      }
    } catch {
      setToast({ type: "error", text: "Failed to upload image." });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setToast({ type: "error", text: "Category name is required." });
      return;
    }

    setSavingCategory(true);
    const payload: Partial<Category> = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      description: formDesc.trim() || undefined,
      homepageDescription: formHomepageDesc.trim() || undefined,
      coverImage: formCoverImage,
      imagePosition: formFraming,
      isActive: formIsActive,
      featuredOnHomepage: formFeaturedOnHomepage,
      homepageOrder: Number(formHomepageOrder) || 1,
      displayOrder: Number(formDisplayOrder) || 1,
    };

    try {
      if (editingCategory) {
        const res = await categoriesService.adminUpdate(editingCategory.id, payload);
        if (res.success) {
          setToast({ type: "success", text: `Category '${formName}' updated successfully.` });
          setIsEditModalOpen(false);
          fetchCategories();
        } else {
          setToast({ type: "error", text: res.message || "Failed to update category." });
        }
      } else {
        const res = await categoriesService.adminCreate(payload);
        if (res.success) {
          setToast({ type: "success", text: `Category '${formName}' created successfully.` });
          setIsEditModalOpen(false);
          fetchCategories();
        } else {
          setToast({ type: "error", text: res.message || "Failed to create category." });
        }
      }
    } catch (err: any) {
      setToast({ type: "error", text: err.response?.data?.message || err.message || "Failed to save category." });
    } finally {
      setSavingCategory(false);
    }
  };

  // Toggle active / hidden directly from table
  const handleToggleActive = async (cat: Category) => {
    try {
      const res = await categoriesService.adminUpdate(cat.id, { isActive: !cat.isActive });
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !cat.isActive } : c))
        );
        setToast({
          type: "success",
          text: `Category '${cat.name}' is now ${!cat.isActive ? "Active on Storefront" : "Hidden"}.`,
        });
      }
    } catch {
      setToast({ type: "error", text: "Failed to toggle category status." });
    }
  };

  // Toggle homepage card directly
  const handleToggleHomepage = async (cat: Category) => {
    try {
      const res = await categoriesService.adminUpdate(cat.id, {
        featuredOnHomepage: !cat.featuredOnHomepage,
      });
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id ? { ...c, featuredOnHomepage: !cat.featuredOnHomepage } : c
          )
        );
        setToast({
          type: "success",
          text: `Category '${cat.name}' ${!cat.featuredOnHomepage ? "added to" : "removed from"} Homepage cards.`,
        });
      }
    } catch {
      setToast({ type: "error", text: "Failed to update homepage exhibition status." });
    }
  };

  // Quick reorder
  const handleMoveOrder = async (cat: Category, direction: "up" | "down") => {
    const currentOrder = cat.displayOrder || 1;
    const newOrder = direction === "up" ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await categoriesService.adminUpdate(cat.id, { displayOrder: newOrder });
      fetchCategories();
    } catch {
      setToast({ type: "error", text: "Failed to adjust order." });
    }
  };

  // Safe Deletion handling
  const handleOpenDelete = (cat: Category) => {
    setDeleteTarget(cat);
    // Suggest first other category for reassignment
    const other = categories.find((c) => c.id !== cat.id);
    setReassignTargetName(other ? other.name : "");
  };

  const handleReassignAndProceed = async () => {
    if (!deleteTarget || !reassignTargetName) return;
    setIsReassigning(true);
    try {
      const res = await categoriesService.adminReassign(deleteTarget.name, reassignTargetName);
      if (res.success) {
        setToast({
          type: "success",
          text: `Reassigned ${res.data?.reassignedCount || 0} product(s) to '${reassignTargetName}'.`,
        });
        // Now productCount is 0, we can safely delete or refresh
        fetchCategories();
        // Update local deleteTarget count
        setDeleteTarget((prev) => (prev ? { ...prev, productCount: 0 } : null));
      } else {
        setToast({ type: "error", text: res.message || "Failed to reassign products." });
      }
    } catch {
      setToast({ type: "error", text: "Error reassigning products." });
    } finally {
      setIsReassigning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await categoriesService.adminDelete(deleteTarget.id);
      if (res.success) {
        setToast({ type: "success", text: `Category '${deleteTarget.name}' deleted successfully.` });
        setDeleteTarget(null);
        fetchCategories();
      } else {
        setToast({ type: "error", text: res.message || "Failed to delete category." });
      }
    } catch (err: any) {
      setToast({
        type: "error",
        text: err.response?.data?.message || err.message || "Cannot delete category.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveInstead = async () => {
    if (!deleteTarget) return;
    try {
      await categoriesService.adminUpdate(deleteTarget.id, { isActive: false });
      setToast({ type: "success", text: `Category '${deleteTarget.name}' has been archived/hidden.` });
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      setToast({ type: "error", text: "Failed to archive category." });
    }
  };

  // Filtered categories
  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const homepageCount = categories.filter((c) => c.featuredOnHomepage && c.isActive).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 shadow-md flex items-center gap-3 text-sm transition-all border ${
            toast.type === "success"
              ? "bg-[#1C1814] text-white border-[#C9A96E]"
              : "bg-[#7F2323] text-white border-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} className="text-[#C9A96E]" />
          ) : (
            <AlertTriangle size={16} className="text-white" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E0D8CE] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers size={22} className="text-[#C9A96E]" />
            <h1
              className="text-2xl font-medium text-[#1C1814]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Categories & Collections
            </h1>
          </div>
          <p className="text-sm text-[#6B5B4E]">
            Single source of truth for product taxonomy, lookbook filters, and Homepage specialty cards.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E0D8CE] p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-[#9B8B7E] font-medium">Total Categories</p>
          <p className="text-2xl font-semibold text-[#1C1814] mt-1">{totalCategories}</p>
          <p className="text-[0.7rem] text-[#6B5B4E] mt-0.5">Managed in boutique system</p>
        </div>
        <div className="bg-white border border-[#E0D8CE] p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-[#9B8B7E] font-medium">Active on Storefront</p>
          <p className="text-2xl font-semibold text-[#1C1814] mt-1">{activeCount}</p>
          <p className="text-[0.7rem] text-[#6B5B4E] mt-0.5">Visible in collections lookbook filters</p>
        </div>
        <div className="bg-white border border-[#E0D8CE] p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-[#9B8B7E] font-medium">Featured on Homepage</p>
          <p className="text-2xl font-semibold text-[#C9A96E] mt-1">{homepageCount}</p>
          <p className="text-[0.7rem] text-[#6B5B4E] mt-0.5">Under "Our Specialities / Explore the Collection"</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E0D8CE] p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B8B7E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug, or description…"
            className="form-input pl-10 text-sm w-full"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-[#E0D8CE] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#9B8B7E]">
            <Loader2 size={28} className="animate-spin text-[#C9A96E]" />
            <p className="text-sm font-medium">Loading luxury categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[#9B8B7E]">
            <p className="text-sm">No categories found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F2EDE6] text-[#6B5B4E] uppercase text-[0.7rem] tracking-wider border-b border-[#E0D8CE]">
                  <th className="py-3.5 px-4 font-semibold">Visual</th>
                  <th className="py-3.5 px-4 font-semibold">Category Name & Slug</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Products</th>
                  <th className="py-3.5 px-4 font-semibold">Homepage Card</th>
                  <th className="py-3.5 px-4 font-semibold">Lookbook Order</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D8CE]">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#FAF8F5] transition-colors">
                    {/* Visual Cover Thumbnail */}
                    <td className="py-3.5 px-4 w-20">
                      <div className="relative w-14 h-18 bg-[#F2EDE6] border border-[#E0D8CE] overflow-hidden">
                        <img
                          src={getMediaUrl(cat.coverImage || "/images/models/model-1.jpg")}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: `${cat.imagePosition?.posX ?? 50}% ${cat.imagePosition?.posY ?? 0}%`,
                            transform: `scale(${cat.imagePosition?.zoom ?? 1.0})`,
                            transformOrigin: `${cat.imagePosition?.posX ?? 50}% ${cat.imagePosition?.posY ?? 0}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Name & Slug */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1C1814] text-sm flex items-center gap-1.5">
                        {cat.name}
                      </div>
                      <div className="text-[0.72rem] text-[#9B8B7E] font-mono mt-0.5">
                        slug: /{cat.slug}
                      </div>
                      {cat.description && (
                        <p className="text-[0.7rem] text-[#6B5B4E] line-clamp-1 max-w-xs mt-1">
                          {cat.description}
                        </p>
                      )}
                    </td>

                    {/* Assigned Products */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        to={`/admin/products`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#E0D8CE] text-xs text-[#1C1814] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors rounded-xs"
                      >
                        <Shirt size={13} className="text-[#C9A96E]" />
                        <span className="font-semibold">{cat.productCount ?? 0}</span>
                        <span className="text-[0.7rem] text-[#6B5B4E]">pieces</span>
                      </Link>
                    </td>

                    {/* Homepage Card Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleHomepage(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-xs transition-colors cursor-pointer ${
                          cat.featuredOnHomepage
                            ? "bg-[#1C1814] text-[#FAF8F5] border-[#1C1814] hover:bg-[#3A3028]"
                            : "bg-white text-[#9B8B7E] border-[#E0D8CE] hover:border-[#1C1814] hover:text-[#1C1814]"
                        }`}
                        title="Toggle appearance under 'Our Specialities / Explore the Collection'"
                      >
                        <Home size={12} className={cat.featuredOnHomepage ? "text-[#C9A96E]" : ""} />
                        {cat.featuredOnHomepage ? `Shown (Pos #${cat.homepageOrder || 1})` : "Catalog Only"}
                      </button>
                    </td>

                    {/* Lookbook Order & Up/Down */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-[#6B5B4E] w-6 text-center">
                          #{cat.displayOrder || 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveOrder(cat, "up")}
                            className="p-0.5 text-[#9B8B7E] hover:text-[#1C1814] transition-colors"
                            title="Move Up"
                          >
                            <MoveUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(cat, "down")}
                            className="p-0.5 text-[#9B8B7E] hover:text-[#1C1814] transition-colors"
                            title="Move Down"
                          >
                            <MoveDown size={12} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Active / Hidden Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs border rounded-xs cursor-pointer transition-colors ${
                          cat.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                        title="Click to toggle Active / Hidden"
                      >
                        {cat.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {cat.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/collections?category=${encodeURIComponent(cat.slug || cat.name)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#9B8B7E] hover:text-[#1C1814] transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-[#9B8B7E] hover:text-[#1C1814] transition-colors"
                          title="Edit Category Details & Visuals"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(cat)}
                          className="p-1.5 text-[#9B8B7E] hover:text-[#B85C5C] transition-colors"
                          title="Delete / Archive Category"
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

      {/* ─────────────────────────────────────────────────────────────
          CREATE / EDIT CATEGORY MODAL
      ───────────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white border border-[#E0D8CE] shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D8CE] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#C9A96E]" />
                <h2
                  className="text-lg font-medium text-[#1C1814]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#9B8B7E] hover:text-[#1C1814] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Velvet & Zardozi"
                    className="form-input text-sm w-full"
                  />
                  <p className="text-[0.65rem] text-[#9B8B7E] mt-1">
                    Primary business name displayed in catalog and appointment forms.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. velvet-zardozi"
                    className="form-input text-sm w-full font-mono text-xs"
                  />
                  <p className="text-[0.65rem] text-[#9B8B7E] mt-1">
                    Direct lookbook link: <span className="font-mono">/collections?category={formSlug || "..."}</span>
                  </p>
                </div>
              </div>

              {/* Status & Display Orders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF8F5] border border-[#E0D8CE] p-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                    Storefront Status
                  </label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="inline-flex items-center text-xs text-[#1C1814] cursor-pointer">
                      <input
                        type="radio"
                        name="catStatus"
                        checked={formIsActive}
                        onChange={() => setFormIsActive(true)}
                        className="mr-1.5 accent-[#1C1814]"
                      />
                      Active (Visible)
                    </label>
                    <label className="inline-flex items-center text-xs text-[#6B5B4E] cursor-pointer">
                      <input
                        type="radio"
                        name="catStatus"
                        checked={!formIsActive}
                        onChange={() => setFormIsActive(false)}
                        className="mr-1.5 accent-[#1C1814]"
                      />
                      Hidden
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                    Lookbook Filter Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                    className="form-input text-sm w-full"
                  />
                  <p className="text-[0.65rem] text-[#9B8B7E] mt-1">Position in filter bar</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                    Homepage Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formHomepageOrder}
                    onChange={(e) => setFormHomepageOrder(parseInt(e.target.value) || 1)}
                    className="form-input text-sm w-full"
                  />
                  <p className="text-[0.65rem] text-[#9B8B7E] mt-1">Order on Explore cards</p>
                </div>
              </div>

              {/* Homepage Feature Toggle */}
              <div className="border border-[#E0D8CE] p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] flex items-center gap-1.5">
                      <Home size={14} className="text-[#C9A96E]" />
                      Show on Homepage → "Our Specialities / Explore the Collection"
                    </p>
                    <p className="text-[0.7rem] text-[#6B5B4E] mt-0.5">
                      When enabled, this category is featured with a visual cover card on the boutique homepage.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeaturedOnHomepage}
                      onChange={(e) => setFormFeaturedOnHomepage(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E0D8CE] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1C1814]" />
                  </label>
                </div>

                {formFeaturedOnHomepage && (
                  <div className="pt-2 border-t border-[#E0D8CE] space-y-2 animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E]">
                      Homepage Card Short Description
                    </label>
                    <input
                      type="text"
                      value={formHomepageDesc}
                      onChange={(e) => setFormHomepageDesc(e.target.value)}
                      placeholder="e.g. Delicate thread embroidery on pure chiffon"
                      className="form-input text-sm w-full"
                    />
                    <p className="text-[0.65rem] text-[#9B8B7E]">
                      Short luxury blurb shown beneath the category title on the homepage card.
                    </p>
                  </div>
                )}
              </div>

              {/* Catalog Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] mb-1.5">
                  Full Catalog Description
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Masterpieces crafted by multi-generational artisans featuring intricate needlework and authentic South Asian silhouettes."
                  className="form-input text-sm w-full"
                />
              </div>

              {/* Cover Image & Interactive Framing */}
              <div className="border border-[#E0D8CE] p-4 bg-[#FAF8F5] space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#C9A96E]" />
                    Category Cover Image & Visual Framing
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(true)}
                      className="text-xs border border-[#E0D8CE] px-2.5 py-1 bg-white hover:bg-[#F2EDE6] text-[#1C1814] transition-colors"
                    >
                      Browse Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="text-xs border border-[#1C1814] px-2.5 py-1 bg-[#1C1814] text-white hover:bg-[#3A3028] transition-colors flex items-center gap-1"
                    >
                      {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadImage(e.target.files)}
                    />
                  </div>
                </div>

                {/* Preview + Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Visual Preview */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-[#F2EDE6] border border-[#E0D8CE]">
                    <img
                      src={getMediaUrl(formCoverImage)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover transition-transform"
                      style={{
                        objectPosition: `${formFraming.posX}% ${formFraming.posY}%`,
                        transform: `scale(${formFraming.zoom})`,
                        transformOrigin: `${formFraming.posX}% ${formFraming.posY}%`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1814]/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 p-2 pointer-events-none text-white">
                      <p className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                        {formName || "Category Title"}
                      </p>
                      <p className="text-[0.65rem] text-[#D4C8BC] line-clamp-1">
                        {formHomepageDesc || formDesc || "Card subtitle preview"}
                      </p>
                    </div>
                  </div>

                  {/* Framing Controls */}
                  <div className="space-y-3 bg-white border border-[#E0D8CE] p-3 text-xs">
                    <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#6B5B4E]">
                      Visual Framing & Zoom
                    </p>
                    <p className="text-[0.65rem] text-[#9B8B7E]">
                      Fine-tune the crop so model face or embroidery is framed perfectly.
                    </p>

                    {/* Zoom */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#6B5B4E]">Zoom ({formFraming.zoom.toFixed(2)}x)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleZoom(-0.1)}
                          className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5]"
                          title="Zoom Out"
                        >
                          <ZoomOut size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleZoom(0.1)}
                          className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5]"
                          title="Zoom In"
                        >
                          <ZoomIn size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Pan Buttons */}
                    <div className="pt-2">
                      <span className="text-[0.68rem] text-[#6B5B4E] block mb-1.5">
                        Position Focus (X: {formFraming.posX}%, Y: {formFraming.posY}%)
                      </span>
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handlePan(0, -5)}
                          className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5]"
                          title="Pan Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePan(-5, 0)}
                            className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5]"
                            title="Pan Left"
                          >
                            <ArrowLeft size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={handleResetFraming}
                            className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5] text-[#9B8B7E]"
                            title="Reset Position"
                          >
                            <RotateCcw size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePan(5, 0)}
                            className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5]"
                            title="Pan Right"
                          >
                            <ArrowRight size={13} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePan(0, 5)}
                          className="p-1 border border-[#E0D8CE] hover:bg-[#FAF8F5]"
                          title="Pan Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0D8CE]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-outline text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  {savingCategory && <Loader2 size={13} className="animate-spin" />}
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CATALOG IMAGE SELECTION MODAL
      ───────────────────────────────────────────────────────────── */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white border border-[#E0D8CE] shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D8CE] pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1814]">
                Select Cover Image from Boutique Catalog
              </h3>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-[#9B8B7E] hover:text-[#1C1814]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto p-1">
              {CATALOG_IMAGES.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => {
                    setFormCoverImage(img);
                    setShowCatalogModal(false);
                  }}
                  className={`aspect-[3/4] overflow-hidden border-2 transition-all ${
                    formCoverImage === img
                      ? "border-[#C9A96E] ring-2 ring-[#C9A96E]/30"
                      : "border-transparent hover:border-[#1C1814]"
                  }`}
                >
                  <img src={img} alt="Catalog choice" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="text-right pt-2 border-t border-[#E0D8CE]">
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="btn-outline text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DELETE SAFETY & REASSIGNMENT MODAL
      ───────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border border-[#E0D8CE] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 text-red-700 border border-red-200 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3
                  className="text-base font-semibold text-[#1C1814]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Delete Category: {deleteTarget.name}
                </h3>
                <p className="text-xs text-[#6B5B4E] mt-1">
                  Enforcing strict data safety to protect catalog products from becoming orphaned.
                </p>
              </div>
            </div>

            {/* If products are assigned */}
            {(deleteTarget.productCount ?? 0) > 0 ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-700" />
                    Cannot permanently delete this category yet!
                  </p>
                  <p>
                    There are currently <strong>{deleteTarget.productCount}</strong> products assigned to{" "}
                    <strong>{deleteTarget.name}</strong>. A category cannot be deleted while products belong to it.
                  </p>
                </div>

                {/* Option 1: Reassign */}
                <div className="border border-[#E0D8CE] p-4 bg-[#FAF8F5] space-y-3">
                  <p className="text-xs font-semibold text-[#1C1814] uppercase tracking-wider">
                    Option 1: Reassign Products & Delete
                  </p>
                  <p className="text-[0.72rem] text-[#6B5B4E]">
                    Move all {deleteTarget.productCount} products from '{deleteTarget.name}' into another category:
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={reassignTargetName}
                      onChange={(e) => setReassignTargetName(e.target.value)}
                      className="form-input text-xs flex-1"
                    >
                      <option value="">Select target category…</option>
                      {categories
                        .filter((c) => c.id !== deleteTarget.id)
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!reassignTargetName || isReassigning}
                      onClick={handleReassignAndProceed}
                      className="btn-outline text-xs whitespace-nowrap flex items-center justify-center gap-1.5"
                    >
                      {isReassigning && <Loader2 size={12} className="animate-spin" />}
                      Reassign All Products
                    </button>
                  </div>
                </div>

                {/* Option 2: Archive */}
                <div className="border border-[#E0D8CE] p-4 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#1C1814] uppercase tracking-wider">
                      Option 2: Archive / Hide
                    </p>
                    <p className="text-[0.72rem] text-[#6B5B4E] mt-0.5">
                      Hides category from storefront while safely preserving product associations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleArchiveInstead}
                    className="btn-outline text-xs whitespace-nowrap ml-4"
                  >
                    Archive Category
                  </button>
                </div>

                <div className="text-right pt-3 border-t border-[#E0D8CE]">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="btn-outline text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* If zero products are assigned, allow deletion */
              <div className="space-y-4">
                <p className="text-xs text-[#6B5B4E]">
                  This category has <strong>0 products</strong> assigned. Are you sure you want to permanently delete{" "}
                  <strong>'{deleteTarget.name}'</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0D8CE]">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="btn-outline text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] bg-[#7F2323] text-white hover:bg-red-800 transition-colors flex items-center gap-1.5"
                  >
                    {isDeleting && <Loader2 size={12} className="animate-spin" />}
                    Confirm Permanent Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
