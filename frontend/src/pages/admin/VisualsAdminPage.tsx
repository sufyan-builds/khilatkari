import React, { useEffect, useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  MoveUp,
  MoveDown,
  Sliders,
  Sparkles,
  Video,
  Film,
} from "lucide-react";
import { homepageService, type HomepageContentConfig, type ImagePositionConfig } from "../../services/homepage";
import { productsService } from "../../services/products";
import { getMediaUrl } from "../../utils/media";
import { StatementCTAPanel, AboutPagePanel, CollectionsPagePanel } from "./CmsPanels";

// Pre-packaged model photoshoot images for quick selection
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

export default function VisualsAdminPage() {
  const [content, setContent] = useState<HomepageContentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"hero" | "experience" | "gallery" | "statement" | "about" | "collections">("hero");
  // Active slide index for hero or gallery
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Quick picker drawer toggle
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Drag-to-pan state on preview frame
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 50,
    posY: 20,
  });
  const previewFrameRef = useRef<HTMLDivElement>(null);

  // Load content
  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    setLoading(true);
    try {
      const res = await homepageService.getAdmin();
      if (res.success && res.data) {
        setContent(res.data);
      }
    } catch (err: any) {
      setToast({ type: "error", text: "Failed to load homepage visual content." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await homepageService.update(content);
      if (res.success && res.data) {
        setContent(res.data);
        setToast({ type: "success", text: "Homepage visual positioning and images saved successfully!" });
      }
    } catch (err: any) {
      setToast({ type: "error", text: err.response?.data?.message || "Failed to save visual content." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all homepage images and positioning to default boutique settings?")) return;
    setSaving(true);
    try {
      const res = await homepageService.reset();
      if (res.success && res.data) {
        setContent(res.data);
        setToast({ type: "success", text: "Homepage visuals restored to original defaults." });
      }
    } catch (err: any) {
      setToast({ type: "error", text: "Failed to reset homepage visuals." });
    } finally {
      setSaving(false);
    }
  };

  // Helper to get active item depending on section
  const getActiveItem = (): ImagePositionConfig | null => {
    if (!content) return null;
    if (activeTab === "hero") {
      return content.heroSlides[activeSlideIdx] || content.heroSlides[0] || null;
    }
    if (activeTab === "experience") {
      return content.experienceImage;
    }
    if (activeTab === "gallery") {
      return content.galleryStrip[activeSlideIdx] || content.galleryStrip[0] || null;
    }
    return null;
  };

  const updateActiveItem = (updater: (prev: ImagePositionConfig) => ImagePositionConfig) => {
    if (!content) return;
    setContent((prev) => {
      if (!prev) return prev;
      const copy = { ...prev };
      if (activeTab === "hero") {
        const slides = [...copy.heroSlides];
        const current = slides[activeSlideIdx] || slides[0];
        if (current) {
          slides[activeSlideIdx] = updater(current);
          copy.heroSlides = slides;
        }
      } else if (activeTab === "experience") {
        copy.experienceImage = updater(copy.experienceImage);
      } else if (activeTab === "gallery") {
        const strip = [...copy.galleryStrip];
        const current = strip[activeSlideIdx] || strip[0];
        if (current) {
          strip[activeSlideIdx] = updater(current);
          copy.galleryStrip = strip;
        }
      }
      return copy;
    });
  };

  // Positioning mutators
  const handleZoom = (delta: number) => {
    updateActiveItem((item) => ({
      ...item,
      zoom: Math.min(3.0, Math.max(0.5, parseFloat((item.zoom + delta).toFixed(2)))),
    }));
  };

  const handlePan = (dx: number, dy: number) => {
    updateActiveItem((item) => ({
      ...item,
      posX: Math.min(100, Math.max(0, Math.round(item.posX + dx))),
      posY: Math.min(100, Math.max(0, Math.round(item.posY + dy))),
    }));
  };

  const handleResetPosition = () => {
    updateActiveItem((item) => ({
      ...item,
      zoom: 1.0,
      posX: 50.0,
      posY: 20.0,
    }));
  };

  // Image replacement — uploads to Cloudinary then immediately persists to MongoDB
  const handleUploadImage = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setToast(null);
    try {
      const urls = await productsService.adminUpload(list);
      if (urls.length > 0) {
        // Update local state synchronously so handleSave picks up the new URL
        let updatedContent: typeof content = null;
        setContent((prev) => {
          if (!prev) return prev;
          const copy = { ...prev };
          if (activeTab === "hero") {
            const slides = [...copy.heroSlides];
            const current = slides[activeSlideIdx] || slides[0];
            if (current) {
              slides[activeSlideIdx] = { ...current, imageUrl: urls[0] };
              copy.heroSlides = slides;
            }
          } else if (activeTab === "experience") {
            copy.experienceImage = { ...copy.experienceImage, imageUrl: urls[0] };
          } else if (activeTab === "gallery") {
            const strip = [...copy.galleryStrip];
            const current = strip[activeSlideIdx] || strip[0];
            if (current) {
              strip[activeSlideIdx] = { ...current, imageUrl: urls[0] };
              copy.galleryStrip = strip;
            }
          }
          updatedContent = copy;
          return copy;
        });
        // Auto-save to MongoDB so the Cloudinary URL is persisted immediately
        if (updatedContent) {
          setSaving(true);
          try {
            const res = await homepageService.update(updatedContent);
            if (res.success && res.data) {
              setContent(res.data);
              setToast({ type: "success", text: "Image uploaded and saved successfully!" });
            } else {
              setToast({ type: "error", text: "Image uploaded but could not be saved. Please click Save Changes." });
            }
          } catch {
            setToast({ type: "error", text: "Image uploaded but save failed. Please click Save Changes to retry." });
          } finally {
            setSaving(false);
          }
        }
      }
    } catch (err: any) {
      setToast({ type: "error", text: err?.response?.data?.message || "Failed to upload image from device." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadVideo = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setToast(null);
    try {
      const urls = await productsService.adminUpload(list);
      if (urls.length > 0) {
        // Update local state synchronously so handleSave picks up the new URL
        let updatedContent: typeof content = null;
        setContent((prev) => {
          if (!prev) return prev;
          const copy = { ...prev };
          if (activeTab === "hero") {
            const slides = [...copy.heroSlides];
            const current = slides[activeSlideIdx] || slides[0];
            if (current) {
              slides[activeSlideIdx] = { ...current, mediaType: "video", videoUrl: urls[0] };
              copy.heroSlides = slides;
            }
          } else if (activeTab === "experience") {
            copy.experienceImage = { ...copy.experienceImage, mediaType: "video", videoUrl: urls[0] };
          } else if (activeTab === "gallery") {
            const strip = [...copy.galleryStrip];
            const current = strip[activeSlideIdx] || strip[0];
            if (current) {
              strip[activeSlideIdx] = { ...current, mediaType: "video", videoUrl: urls[0] };
              copy.galleryStrip = strip;
            }
          }
          updatedContent = copy;
          return copy;
        });
        // Auto-save to MongoDB so the Cloudinary URL is persisted immediately
        if (updatedContent) {
          setSaving(true);
          try {
            const res = await homepageService.update(updatedContent);
            if (res.success && res.data) {
              setContent(res.data);
              setToast({ type: "success", text: "Video uploaded and saved successfully!" });
            } else {
              setToast({ type: "error", text: "Video uploaded but could not be saved. Please click Save Changes." });
            }
          } catch {
            setToast({ type: "error", text: "Video uploaded but save failed. Please click Save Changes to retry." });
          } finally {
            setSaving(false);
          }
        }
      }
    } catch (err: any) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Failed to upload video from device." });
    } finally {
      setUploading(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  const handleSelectCatalogImage = (url: string) => {
    updateActiveItem((item) => ({
      ...item,
      imageUrl: url,
    }));
    setShowCatalogModal(false);
  };

  // Hero Slide management
  const handleAddHeroSlide = () => {
    if (!content) return;
    const newSlide: ImagePositionConfig = {
      id: `hero-${Date.now()}`,
      imageUrl: "",
      zoom: 1.0,
      posX: 50.0,
      posY: 15.0,
      title: "Handcrafted Luxury",
      subtitle: "Bespoke traditional wear tailored for private viewings.",
    };
    setContent({
      ...content,
      heroSlides: [...content.heroSlides, newSlide],
    });
    setActiveSlideIdx(content.heroSlides.length);
  };

  const handleRemoveHeroSlide = (index: number) => {
    if (!content || content.heroSlides.length <= 1) {
      alert("At least one hero slide is required.");
      return;
    }
    const filtered = content.heroSlides.filter((_, i) => i !== index);
    setContent({ ...content, heroSlides: filtered });
    setActiveSlideIdx(Math.max(0, index - 1));
  };

  // Gallery Strip frame management
  const handleAddGalleryFrame = () => {
    if (!content) return;
    const newFrame: ImagePositionConfig = {
      id: `gallery-${Date.now()}`,
      imageUrl: "",
      zoom: 1.0,
      posX: 50.0,
      posY: 20.0,
    };
    setContent({
      ...content,
      galleryStrip: [...content.galleryStrip, newFrame],
    });
    setActiveSlideIdx(content.galleryStrip.length);
  };

  const handleRemoveGalleryFrame = (index: number) => {
    if (!content || content.galleryStrip.length <= 1) {
      alert("At least one lookbook frame is required.");
      return;
    }
    const filtered = content.galleryStrip.filter((_, i) => i !== index);
    setContent({ ...content, galleryStrip: filtered });
    setActiveSlideIdx(Math.max(0, index - 1));
  };

  const handleMoveSlide = (direction: "up" | "down") => {
    if (!content || activeTab !== "hero") return;
    const list = [...content.heroSlides];
    const targetIdx = direction === "up" ? activeSlideIdx - 1 : activeSlideIdx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [moved] = list.splice(activeSlideIdx, 1);
    list.splice(targetIdx, 0, moved);
    setContent({ ...content, heroSlides: list });
    setActiveSlideIdx(targetIdx);
  };

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    const item = getActiveItem();
    if (!item) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: item.posX,
      posY: item.posY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewFrameRef.current) return;
    const rect = previewFrameRef.current.getBoundingClientRect();
    const dxPx = e.clientX - dragStartRef.current.x;
    const dyPx = e.clientY - dragStartRef.current.y;

    // Convert pixel delta to percentage of frame
    const dxPercent = (dxPx / rect.width) * -100;
    const dyPercent = (dyPx / rect.height) * -100;

    const newX = Math.min(100, Math.max(0, Math.round(dragStartRef.current.posX + dxPercent)));
    const newY = Math.min(100, Math.max(0, Math.round(dragStartRef.current.posY + dyPercent)));

    updateActiveItem((item) => ({
      ...item,
      posX: newX,
      posY: newY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin mx-auto text-[#C9A96E]" size={32} />
          <p className="text-xs uppercase tracking-widest text-[#9B8B7E]">Loading visual settings...</p>
        </div>
      </div>
    );
  }

  const currentItem = getActiveItem();

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E0D8CE] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C9A96E] font-medium mb-1">
            <Sliders size={14} /> Visual Content Management
          </div>
          <h1
            className="text-2xl md:text-3xl font-semibold text-[#1C1814]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Website CMS &amp; Visual Editor
          </h1>
          <p className="text-xs text-[#6B5B4E] mt-1 max-w-xl leading-relaxed">
            Manage website photography, statement marketing copy, About page story &amp; collage, and Lookbook collection headers with live positioning and zoom focal point controls.
          </p>
        </div>

        {/* Global Save & Reset Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="btn-outline text-xs px-3.5 py-2.5 flex items-center gap-1.5 cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-gold text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div
          className={`p-3.5 text-xs flex items-center justify-between border-l-4 rounded-xs shadow-xs ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{toast.text}</span>
          </div>
          <button onClick={() => setToast(null)} className="font-bold text-sm ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Section Selection Tabs */}
      <div className="flex border-b border-[#E0D8CE] gap-2 overflow-x-auto pb-px">
        {[
          { key: "hero", label: "Hero Carousel", count: content?.heroSlides.length },
          { key: "experience", label: "Experience Spotlight", count: undefined },
          { key: "gallery", label: "Lookbook Strip", count: content?.galleryStrip.length },
          { key: "statement", label: "Statement CTA", count: undefined },
          { key: "about", label: "About Page", count: undefined },
          { key: "collections", label: "Collections Page", count: undefined },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key as any);
              setActiveSlideIdx(0);
            }}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#C9A96E] text-[#1C1814] bg-white font-semibold shadow-xs"
                : "border-transparent text-[#6B5B4E] hover:text-[#1C1814] hover:bg-[#FAF8F5]"
            }`}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* Slide / Item Selector (when in Hero or Gallery Strip) */}
      {activeTab === "hero" && content && (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#F2EDE6] rounded-xs border border-[#E0D8CE]">
          <span className="text-[0.7rem] uppercase tracking-wider text-[#6B5B4E] font-semibold mr-1 pl-1">
            Slides:
          </span>
          {content.heroSlides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              onClick={() => setActiveSlideIdx(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-medium border transition-all cursor-pointer ${
                activeSlideIdx === idx
                  ? "bg-[#1C1814] text-white border-[#1C1814] shadow-xs"
                  : "bg-white text-[#6B5B4E] border-[#E0D8CE] hover:border-[#C9A96E]"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#C9A96E] text-[#1C1814] text-[0.65rem] flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span>{slide.title ? slide.title.slice(0, 18) + "..." : `Slide ${idx + 1}`}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleAddHeroSlide}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#C9A96E] hover:bg-white rounded-xs border border-dashed border-[#C9A96E] transition-colors cursor-pointer ml-auto"
          >
            <Plus size={14} /> Add Slide
          </button>
        </div>
      )}

      {activeTab === "gallery" && content && (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#F2EDE6] rounded-xs border border-[#E0D8CE]">
          <span className="text-[0.7rem] uppercase tracking-wider text-[#6B5B4E] font-semibold mr-1 pl-1">
            Strip Items:
          </span>
          {content.galleryStrip.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveSlideIdx(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-medium border transition-all cursor-pointer ${
                activeSlideIdx === idx
                  ? "bg-[#1C1814] text-white border-[#1C1814] shadow-xs"
                  : "bg-white text-[#6B5B4E] border-[#E0D8CE] hover:border-[#C9A96E]"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#C9A96E] text-[#1C1814] text-[0.65rem] flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span>{item.title ? item.title.slice(0, 14) + "..." : `Frame #${idx + 1}`}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleAddGalleryFrame}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#C9A96E] hover:bg-white rounded-xs border border-dashed border-[#C9A96E] transition-colors cursor-pointer ml-auto"
          >
            <Plus size={14} /> Add Frame
          </button>
        </div>
      )}

      {/* Main Two-Column Layout: Live Preview on Left, Controls on Right */}
      {currentItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Frame Preview (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xs border border-[#E0D8CE] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1C1814] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#C9A96E]" />
                Live Frame Preview
                <span className="text-[#9B8B7E] font-normal normal-case text-[0.7rem]">
                  (Drag to pan focal point)
                </span>
              </span>
              <span className="text-[0.7rem] bg-[#F2EDE6] text-[#6B5B4E] px-2 py-0.5 rounded-xs">
                {activeTab === "hero" && "Hero Aspect (16:9 / 90vh)"}
                {activeTab === "experience" && "Experience Frame (4:5)"}
                {activeTab === "gallery" && "Lookbook Frame (3:4)"}
              </span>
            </div>

            {/* Container Frame matching exact homepage aspect ratio */}
            <div
              ref={previewFrameRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative overflow-hidden bg-[#1C1814] border-2 border-[#1C1814] select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              } ${
                activeTab === "hero"
                  ? "aspect-[16/9] w-full min-h-[300px]"
                  : activeTab === "experience"
                  ? "aspect-[4/5] max-w-md mx-auto"
                  : "aspect-[3/4] max-w-sm mx-auto"
              }`}
            >
              {/* Media Element with live positioning styles */}
              {currentItem.mediaType === "video" && currentItem.videoUrl ? (
                <video
                  key={currentItem.videoUrl}
                  src={getMediaUrl(currentItem.videoUrl)}
                  poster={getMediaUrl(currentItem.posterUrl || currentItem.imageUrl || "")}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    objectFit: "cover",
                    objectPosition: `${currentItem.posX}% ${currentItem.posY}%`,
                    transform: `scale(${currentItem.zoom})`,
                    transformOrigin: `${currentItem.posX}% ${currentItem.posY}%`,
                    transition: isDragging ? "none" : "transform 0.15s ease, object-position 0.15s ease",
                  }}
                  className="w-full h-full pointer-events-none"
                />
              ) : currentItem.mediaType === "video" && !currentItem.videoUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/70 bg-[#2A2420]">
                  <Video size={36} className="text-[#C9A96E] mb-2" />
                  <p className="text-xs font-medium text-white">No Video File Attached Yet</p>
                  <p className="text-[0.7rem] text-[#9B8B7E] mt-1">
                    Upload an MP4 / WebM video from PC or enter a URL in the right column.
                  </p>
                </div>
              ) : !currentItem.imageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/70 bg-[#2A2420]">
                  <ImageIcon size={36} className="text-[#C9A96E] mb-2" />
                  <p className="text-xs font-medium text-white">No Image Selected Yet</p>
                  <p className="text-[0.7rem] text-[#9B8B7E] mt-1">
                    Upload an image from PC or enter a URL in the right column.
                  </p>
                </div>
              ) : (
                <img
                  src={getMediaUrl(currentItem.imageUrl)}
                  alt="Framed preview"
                  draggable={false}
                  style={{
                    objectFit: "cover",
                    objectPosition: `${currentItem.posX}% ${currentItem.posY}%`,
                    transform: `scale(${currentItem.zoom})`,
                    transformOrigin: `${currentItem.posX}% ${currentItem.posY}%`,
                    transition: isDragging ? "none" : "transform 0.15s ease, object-position 0.15s ease",
                  }}
                  className="w-full h-full pointer-events-none"
                />
              )}

              {/* Optional simulated gradient overlay for Hero */}
              {activeTab === "hero" && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1C1814]/80 via-[#1C1814]/40 to-transparent pointer-events-none flex flex-col justify-end p-6">
                  <span className="text-[0.65rem] tracking-widest uppercase text-[#C9A96E] font-medium">
                    KhilatKari
                  </span>
                  <h3
                    className="text-white text-lg md:text-xl font-medium mt-0.5 line-clamp-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {currentItem.title || "Heritage in Every Stitch"}
                  </h3>
                  <p className="text-[#D4C8BC] text-xs line-clamp-1 mt-0.5">
                    {currentItem.subtitle || "Handcrafted pieces presented through private appointments."}
                  </p>
                </div>
              )}

              {/* Crosshair indicator showing current focal point */}
              <div
                style={{
                  left: `${currentItem.posX}%`,
                  top: `${currentItem.posY}%`,
                }}
                className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#C9A96E] pointer-events-none flex items-center justify-center opacity-60 bg-white/20"
                title="Focal Center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              </div>

              {/* Badge info */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[0.65rem] px-2 py-0.5 rounded-xs pointer-events-none">
                Zoom: {currentItem.zoom.toFixed(2)}x | X: {currentItem.posX}% | Y: {currentItem.posY}%
              </div>
            </div>

            <p className="text-[0.7rem] text-[#9B8B7E] text-center italic">
              💡 Tip: Click and drag directly on the photo above to reposition the model's face or dress.
            </p>
          </div>

          {/* Right: Controls & Adjustments (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xs border border-[#E0D8CE] shadow-xs space-y-6">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-[#1C1814] border-b border-[#E0D8CE] pb-3">
              Positioning &amp; Framing Controls
            </h2>

            {/* Media Type Toggle for Hero & Experience */}
            {(activeTab === "hero" || activeTab === "experience") && (
              <div className="space-y-1.5 pb-2 border-b border-[#E0D8CE]">
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#6B5B4E] font-semibold">
                  Section Media Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateActiveItem((item) => ({ ...item, mediaType: "image" }))}
                    className={`px-3 py-2 text-xs rounded-xs flex items-center justify-center gap-2 border font-medium cursor-pointer transition-all ${
                      (currentItem.mediaType || "image") === "image"
                        ? "bg-[#1C1814] text-white border-[#1C1814] shadow-xs"
                        : "bg-white text-[#6B5B4E] border-[#E0D8CE] hover:border-[#C9A96E]"
                    }`}
                  >
                    <ImageIcon size={14} /> Image
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveItem((item) => ({ ...item, mediaType: "video" }))}
                    className={`px-3 py-2 text-xs rounded-xs flex items-center justify-center gap-2 border font-medium cursor-pointer transition-all ${
                      currentItem.mediaType === "video"
                        ? "bg-[#1C1814] text-white border-[#1C1814] shadow-xs"
                        : "bg-white text-[#6B5B4E] border-[#E0D8CE] hover:border-[#C9A96E]"
                    }`}
                  >
                    <Video size={14} /> Video
                  </button>
                </div>
              </div>
            )}

            {/* 1. Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1C1814] flex items-center gap-1.5">
                  <ZoomIn size={14} className="text-[#C9A96E]" /> Zoom (Scale)
                </span>
                <span className="font-mono text-[0.75rem] text-[#6B5B4E] bg-[#FAF8F5] px-2 py-0.5 border border-[#E0D8CE] rounded-xs">
                  {currentItem.zoom.toFixed(2)}x
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleZoom(-0.1)}
                  className="w-8 h-8 rounded-xs border border-[#E0D8CE] hover:bg-[#FAF8F5] flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Zoom Out (-0.1)"
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={currentItem.zoom}
                  onChange={(e) =>
                    updateActiveItem((item) => ({ ...item, zoom: parseFloat(e.target.value) }))
                  }
                  className="flex-1 accent-[#C9A96E] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleZoom(0.1)}
                  className="w-8 h-8 rounded-xs border border-[#E0D8CE] hover:bg-[#FAF8F5] flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Zoom In (+0.1)"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* 2. Vertical Pan (Y-Axis / Headroom) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1C1814] flex items-center gap-1.5">
                  <ArrowUp size={14} className="text-[#C9A96E]" /> Vertical Focal Point (Y)
                </span>
                <span className="font-mono text-[0.75rem] text-[#6B5B4E] bg-[#FAF8F5] px-2 py-0.5 border border-[#E0D8CE] rounded-xs">
                  {currentItem.posY}% (Top: 0% — Bottom: 100%)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePan(0, -5)}
                  className="w-8 h-8 rounded-xs border border-[#E0D8CE] hover:bg-[#FAF8F5] flex items-center justify-center text-xs cursor-pointer"
                  title="Shift Up (-5%)"
                >
                  <ArrowUp size={14} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={currentItem.posY}
                  onChange={(e) =>
                    updateActiveItem((item) => ({ ...item, posY: parseInt(e.target.value, 10) }))
                  }
                  className="flex-1 accent-[#C9A96E] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handlePan(0, 5)}
                  className="w-8 h-8 rounded-xs border border-[#E0D8CE] hover:bg-[#FAF8F5] flex items-center justify-center text-xs cursor-pointer"
                  title="Shift Down (+5%)"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            {/* 3. Horizontal Pan (X-Axis) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1C1814] flex items-center gap-1.5">
                  <ArrowLeft size={14} className="text-[#C9A96E]" /> Horizontal Focal Point (X)
                </span>
                <span className="font-mono text-[0.75rem] text-[#6B5B4E] bg-[#FAF8F5] px-2 py-0.5 border border-[#E0D8CE] rounded-xs">
                  {currentItem.posX}% (Left: 0% — Right: 100%)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePan(-5, 0)}
                  className="w-8 h-8 rounded-xs border border-[#E0D8CE] hover:bg-[#FAF8F5] flex items-center justify-center text-xs cursor-pointer"
                  title="Shift Left (-5%)"
                >
                  <ArrowLeft size={14} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={currentItem.posX}
                  onChange={(e) =>
                    updateActiveItem((item) => ({ ...item, posX: parseInt(e.target.value, 10) }))
                  }
                  className="flex-1 accent-[#C9A96E] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handlePan(5, 0)}
                  className="w-8 h-8 rounded-xs border border-[#E0D8CE] hover:bg-[#FAF8F5] flex items-center justify-center text-xs cursor-pointer"
                  title="Shift Right (+5%)"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Quick Reset for this item */}
            <button
              type="button"
              onClick={handleResetPosition}
              className="text-xs text-[#9B8B7E] hover:text-[#1C1814] underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} /> Reset this image's positioning to default
            </button>

            {/* 4. Media Asset / Upload Section */}
            {currentItem.mediaType === "video" ? (
              <div className="border-t border-[#E0D8CE] pt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E] flex items-center gap-1.5">
                  <Film size={14} className="text-[#C9A96E]" /> Section Video &amp; Poster
                </label>

                {/* Upload or change video from device */}
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full btn-outline text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Uploading Video...
                    </>
                  ) : (
                    <>
                      <Upload size={13} /> {currentItem.videoUrl ? "Replace Video from PC" : "Upload Video from PC (up to 50MB)"}
                    </>
                  )}
                </button>

                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/ogg"
                  onChange={(e) => e.target.files && handleUploadVideo(e.target.files)}
                  className="hidden"
                />

                {/* Video URL input */}
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">Video File URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentItem.videoUrl || ""}
                      onChange={(e) => updateActiveItem((item) => ({ ...item, videoUrl: e.target.value }))}
                      className="form-input text-xs flex-1"
                      placeholder="https://example.com/video.mp4 or /uploads/..."
                    />
                    {currentItem.videoUrl && (
                      <button
                        type="button"
                        onClick={() => updateActiveItem((item) => ({ ...item, videoUrl: undefined }))}
                        className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-xs text-xs cursor-pointer"
                        title="Remove video"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Fallback / Poster Image */}
                <div className="space-y-2 pt-2 border-t border-dashed border-[#E0D8CE]">
                  <div className="flex items-center justify-between">
                    <label className="block text-[0.7rem] uppercase tracking-wider text-[#6B5B4E] font-semibold">
                      Poster / Fallback Image
                    </label>
                    <span className="text-[0.65rem] text-[#9B8B7E]">Mobile / Buffer Fallback</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-outline text-xs py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Upload size={12} /> Poster from PC
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(true)}
                      className="btn-outline text-xs py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ImageIcon size={12} /> Choose Model
                    </button>
                  </div>

                  <input
                    type="url"
                    value={currentItem.posterUrl || currentItem.imageUrl || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, posterUrl: e.target.value, imageUrl: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="Poster image URL"
                  />
                </div>
              </div>
            ) : (
              <div className="border-t border-[#E0D8CE] pt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E]">
                  Replace Image
                </label>
                {activeTab === "hero" && (
                  <p className="text-[0.7rem] text-[#9B8B7E] leading-relaxed bg-[#FAF8F5] border border-[#E0D8CE] px-3 py-2">
                    📐 <strong>Image quality tip:</strong> For best hero results, upload images at least <strong>1920px wide</strong>. Avoid WhatsApp-shared photos — they are compressed to ~1280px and will appear soft at full-screen size.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn-outline text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={13} /> Upload from PC
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(true)}
                    className="btn-outline text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon size={13} /> Choose Model
                  </button>
                </div>
              </div>
            )}

            {/* Hidden image file input (used for image or poster) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => e.target.files && handleUploadImage(e.target.files)}
              className="hidden"
            />

            {/* 5. Hero Slide Text & Ordering (Hero tab only) */}
            {activeTab === "hero" && (
              <div className="border-t border-[#E0D8CE] pt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E]">
                  Hero Headline &amp; Ordering
                </label>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">Headline</label>
                  <input
                    type="text"
                    value={currentItem.title || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, title: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="Headline banner title"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={currentItem.subtitle || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, subtitle: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="Subtitle banner text"
                  />
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMoveSlide("up")}
                    disabled={activeSlideIdx === 0}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                    title="Move slide earlier"
                  >
                    <MoveUp size={12} /> Move Earlier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide("down")}
                    disabled={!content || activeSlideIdx === content.heroSlides.length - 1}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                    title="Move slide later"
                  >
                    <MoveDown size={12} /> Move Later
                  </button>
                  {content && content.heroSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHeroSlide(activeSlideIdx)}
                      className="text-red-600 hover:text-red-700 text-xs py-1.5 px-2 flex items-center gap-1 ml-auto cursor-pointer"
                      title="Remove this slide"
                    >
                      <Trash2 size={12} /> Remove Slide
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 6. Gallery Strip Frame Caption & Management (Gallery tab only) */}
            {activeTab === "gallery" && (
              <div className="border-t border-[#E0D8CE] pt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5B4E]">
                  Frame Caption &amp; CTA
                </label>
                <p className="text-[0.7rem] text-[#9B8B7E] leading-relaxed">
                  Optional overlay text and CTA link shown on the lookbook frame. Leave empty to show image only.
                </p>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">Title / Piece Name</label>
                  <input
                    type="text"
                    value={currentItem.title || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, title: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="e.g. Ivory Bridal Lehenga"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">Subtitle / Collection</label>
                  <input
                    type="text"
                    value={currentItem.subtitle || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, subtitle: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="e.g. Bridal '26"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">Tag / Badge Label</label>
                  <input
                    type="text"
                    value={currentItem.tag || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, tag: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="e.g. New Arrival"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={currentItem.ctaText || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, ctaText: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="e.g. View Piece"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] text-[#9B8B7E] mb-1">CTA Button Link</label>
                  <input
                    type="text"
                    value={currentItem.ctaLink || ""}
                    onChange={(e) => updateActiveItem((item) => ({ ...item, ctaLink: e.target.value }))}
                    className="form-input text-xs"
                    placeholder="e.g. /collections or /appointments"
                  />
                </div>

                {/* Remove frame */}
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={handleAddGalleryFrame}
                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add New Frame
                  </button>
                  {content && content.galleryStrip.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryFrame(activeSlideIdx)}
                      className="text-red-600 hover:text-red-700 text-xs py-1.5 px-2 flex items-center gap-1 cursor-pointer"
                      title="Remove this frame"
                    >
                      <Trash2 size={12} /> Remove Frame
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STATEMENT CTA TAB ─────────────────────────────────────────── */}
      {activeTab === "statement" && content && (
        <StatementCTAPanel content={content} setContent={setContent} uploading={uploading} setUploading={setUploading} setToast={setToast} CATALOG_IMAGES={CATALOG_IMAGES} />
      )}

      {/* ── ABOUT PAGE TAB ──────────────────────────────────────────────── */}
      {activeTab === "about" && content && (
        <AboutPagePanel content={content} setContent={setContent} uploading={uploading} setUploading={setUploading} setToast={setToast} CATALOG_IMAGES={CATALOG_IMAGES} />
      )}

      {/* ── COLLECTIONS PAGE TAB ──────────────────────────────────────── */}
      {activeTab === "collections" && content && (
        <CollectionsPagePanel content={content} setContent={setContent} />
      )}

      {/* Model Photoshoot Catalog Quick Picker Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-xs shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E0D8CE] pb-3">
              <h3
                className="text-lg font-semibold text-[#1C1814]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Choose from Photoshoot Catalog
              </h3>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-[#6B5B4E] hover:text-[#1C1814] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#6B5B4E]">
              Select any of the 18 high-resolution boutique photoshoot models to use for this section.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 overflow-y-auto p-1 flex-1">
              {CATALOG_IMAGES.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectCatalogImage(imgUrl)}
                  className={`relative aspect-[3/4] border rounded-xs overflow-hidden group hover:border-[#C9A96E] hover:shadow-md transition-all cursor-pointer ${
                    currentItem?.imageUrl === imgUrl ? "ring-2 ring-[#C9A96E] border-[#C9A96E]" : "border-[#E0D8CE]"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Model ${i + 1}`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[0.6rem] px-1 rounded-xs">
                    #{i + 1}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E0D8CE]">
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="btn-outline text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
