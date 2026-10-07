/**
 * CMS Panel Components for VisualsAdminPage
 * Provides UI for Statement CTA, About Page, and Collections Page CMS editing.
 */
import React, { useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { productsService } from "../../services/products";
import { getMediaUrl } from "../../utils/media";
import type { HomepageContentConfig, ImagePositionConfig } from "../../services/homepage";

/* ─────────────────────────────────────────────────────────────────
   Shared: Single Image Slot Editor (upload + zoom/pan controls)
───────────────────────────────────────────────────────────────── */
interface ImageSlotEditorProps {
  label: string;
  slot: ImagePositionConfig | undefined;
  defaultSrc: string;
  CATALOG_IMAGES: string[];
  uploading: boolean;
  setUploading: (v: boolean) => void;
  setToast: (t: { type: "success" | "error"; text: string } | null) => void;
  onChange: (updated: ImagePositionConfig) => void;
  aspectClass?: string; // e.g. "aspect-[3/4]" or "aspect-square"
}

function ImageSlotEditor({
  label,
  slot,
  defaultSrc,
  CATALOG_IMAGES,
  uploading,
  setUploading,
  setToast,
  onChange,
  aspectClass = "aspect-[3/4]",
}: ImageSlotEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showPicker, setShowPicker] = useState(false);

  const current: ImagePositionConfig = slot || {
    imageUrl: defaultSrc,
    zoom: 1.0,
    posX: 50,
    posY: 0,
  };

  const update = (patch: Partial<ImagePositionConfig>) =>
    onChange({ ...current, ...patch });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await productsService.adminUpload(Array.from(files));
      if (urls.length > 0) {
        update({ imageUrl: urls[0] });
        setToast({ type: "success", text: `${label} image updated.` });
      }
    } catch {
      setToast({ type: "error", text: `Failed to upload ${label} image.` });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="border border-[#E0D8CE] bg-white p-4 space-y-3">
      <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#6B5B4E]">{label}</p>

      {/* Preview */}
      <div className={`relative overflow-hidden bg-[#F2EDE6] border border-[#E0D8CE] ${aspectClass} w-full`}>
        {current.imageUrl || defaultSrc ? (
          <img
            src={getMediaUrl(current.imageUrl || defaultSrc)}
            alt={label}
            className="w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: `${current.posX ?? 50}% ${current.posY ?? 0}%`,
              transform: `scale(${current.zoom ?? 1.0})`,
              transformOrigin: `${current.posX ?? 50}% ${current.posY ?? 0}%`,
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#9B8B7E] p-4 text-center">
            <ImageIcon size={24} className="mb-1 text-[#C9A96E]" />
            <span className="text-[0.7rem]">No image configured</span>
          </div>
        )}
        <div className="absolute top-1 left-1 bg-black/60 text-white text-[0.6rem] px-1.5 py-0.5 rounded-xs pointer-events-none">
          {(current.zoom ?? 1.0).toFixed(2)}× | X:{current.posX ?? 50}% Y:{current.posY ?? 0}%
        </div>
      </div>

      {/* Upload buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-outline text-xs py-1.5 flex items-center justify-center gap-1 cursor-pointer"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload from PC
        </button>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="btn-outline text-xs py-1.5 flex items-center justify-center gap-1 cursor-pointer"
        >
          <ImageIcon size={12} /> Choose Model
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Zoom */}
      <div className="flex items-center gap-2 text-xs">
        <ZoomOut size={13} className="text-[#9B8B7E]" />
        <input
          type="range"
          min="0.8"
          max="2.5"
          step="0.05"
          value={current.zoom ?? 1.0}
          onChange={(e) => update({ zoom: parseFloat(e.target.value) })}
          className="flex-1 accent-[#C9A96E]"
        />
        <ZoomIn size={13} className="text-[#9B8B7E]" />
        <span className="font-mono text-[0.7rem] text-[#6B5B4E] w-10 text-right">{(current.zoom ?? 1.0).toFixed(2)}×</span>
      </div>

      {/* Y-axis */}
      <div className="flex items-center gap-2 text-xs">
        <ArrowUp size={13} className="text-[#9B8B7E]" />
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={current.posY ?? 0}
          onChange={(e) => update({ posY: parseInt(e.target.value, 10) })}
          className="flex-1 accent-[#C9A96E]"
        />
        <ArrowDown size={13} className="text-[#9B8B7E]" />
        <span className="font-mono text-[0.7rem] text-[#6B5B4E] w-10 text-right">Y:{current.posY ?? 0}%</span>
      </div>

      {/* X-axis */}
      <div className="flex items-center gap-2 text-xs">
        <ArrowLeft size={13} className="text-[#9B8B7E]" />
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={current.posX ?? 50}
          onChange={(e) => update({ posX: parseInt(e.target.value, 10) })}
          className="flex-1 accent-[#C9A96E]"
        />
        <ArrowRight size={13} className="text-[#9B8B7E]" />
        <span className="font-mono text-[0.7rem] text-[#6B5B4E] w-10 text-right">X:{current.posX ?? 50}%</span>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={() => update({ zoom: 1.0, posX: 50, posY: 0 })}
        className="text-xs text-[#9B8B7E] hover:text-[#1C1814] underline flex items-center gap-1 cursor-pointer"
      >
        <RotateCcw size={11} /> Reset position
      </button>

      {/* Catalog picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-xs shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E0D8CE] pb-3">
              <h3 className="text-base font-semibold text-[#1C1814]">Choose from Photoshoot Catalog — {label}</h3>
              <button onClick={() => setShowPicker(false)} className="text-[#6B5B4E] hover:text-[#1C1814] text-lg font-bold cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 overflow-y-auto flex-1 p-1">
              {CATALOG_IMAGES.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { update({ imageUrl: imgUrl }); setShowPicker(false); }}
                  className={`relative aspect-[3/4] border rounded-xs overflow-hidden hover:border-[#C9A96E] hover:shadow-md transition-all cursor-pointer ${current.imageUrl === imgUrl ? "ring-2 ring-[#C9A96E] border-[#C9A96E]" : "border-[#E0D8CE]"}`}
                >
                  <img src={imgUrl} alt={`Model ${i + 1}`} className="w-full h-full object-cover object-top" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[0.6rem] px-1 rounded-xs">#{i + 1}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-[#E0D8CE]">
              <button type="button" onClick={() => setShowPicker(false)} className="btn-outline text-xs px-4 py-2 cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Shared: Text Field
───────────────────────────────────────────────────────────────── */
function CmsTextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-[0.7rem] uppercase tracking-wider font-semibold text-[#6B5B4E] mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="form-input text-xs"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input text-xs"
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Panel: Statement CTA Section
───────────────────────────────────────────────────────────────── */
interface PanelProps {
  content: HomepageContentConfig;
  setContent: React.Dispatch<React.SetStateAction<HomepageContentConfig | null>>;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  setToast: (t: { type: "success" | "error"; text: string } | null) => void;
  CATALOG_IMAGES: string[];
}

export function StatementCTAPanel({ content, setContent, uploading, setUploading, setToast, CATALOG_IMAGES }: PanelProps) {
  const stmt = content.statementSection || {};

  const update = (patch: Partial<typeof stmt>) =>
    setContent((prev) => prev ? { ...prev, statementSection: { ...prev.statementSection, ...patch } } : prev);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-[#FAF8F5] border border-[#E0D8CE] p-4 text-xs text-[#6B5B4E] leading-relaxed">
        <Sparkles size={13} className="inline text-[#C9A96E] mr-1" />
        Controls the <strong>"Discover Your Next Statement Piece"</strong> full-width CTA section at the bottom of the homepage.
        Leave any field empty to use the default content.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Background Image */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] mb-3">Background Image &amp; Focal Point</p>
          <ImageSlotEditor
            label="Background Image"
            slot={stmt.backgroundImage}
            defaultSrc=""
            CATALOG_IMAGES={CATALOG_IMAGES}
            uploading={uploading}
            setUploading={setUploading}
            setToast={setToast}
            aspectClass="aspect-[16/9]"
            onChange={(updated) => update({ backgroundImage: updated })}
          />
        </div>

        {/* Text + Buttons */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] mb-1">Copy &amp; Buttons</p>

          <CmsTextField
            label="Main Headline"
            value={stmt.headlineMain || ""}
            placeholder="Discover Your Next"
            onChange={(v) => update({ headlineMain: v })}
          />
          <CmsTextField
            label="Italic Headline"
            value={stmt.headlineItalic || ""}
            placeholder="Statement Piece."
            onChange={(v) => update({ headlineItalic: v })}
          />
          <CmsTextField
            label="Body Paragraph"
            value={stmt.bodyText || ""}
            placeholder="Request a private appointment…"
            multiline
            rows={3}
            onChange={(v) => update({ bodyText: v })}
          />

          <hr className="border-[#E0D8CE]" />

          <CmsTextField
            label="Button 1 Text"
            value={stmt.button1Text || ""}
            placeholder="Book a Private Appointment"
            onChange={(v) => update({ button1Text: v })}
          />
          <CmsTextField
            label="Button 1 Link"
            value={stmt.button1Link || ""}
            placeholder="/appointments"
            onChange={(v) => update({ button1Link: v })}
          />
          <CmsTextField
            label="Button 2 Text"
            value={stmt.button2Text || ""}
            placeholder="Chat on WhatsApp"
            onChange={(v) => update({ button2Text: v })}
          />
          <div>
            <CmsTextField
              label="Button 2 Link (leave empty for WhatsApp default)"
              value={stmt.button2Link || ""}
              placeholder="https://wa.me/... or /page"
              onChange={(v) => update({ button2Link: v })}
            />
            <p className="text-[0.65rem] text-[#9B8B7E] mt-1">
              If left empty, Button 2 will automatically open WhatsApp with a pre-filled booking message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Panel: About Page
───────────────────────────────────────────────────────────────── */
export function AboutPagePanel({ content, setContent, uploading, setUploading, setToast, CATALOG_IMAGES }: PanelProps) {
  const about = content.aboutPage || {};

  const update = (patch: Partial<typeof about>) =>
    setContent((prev) => prev ? { ...prev, aboutPage: { ...prev.aboutPage, ...patch } } : prev);

  const updateCollage = (key: "collageImage1" | "collageImage2" | "collageImage3" | "collageImage4", val: ImagePositionConfig) =>
    update({ [key]: val });

  const COLLAGE_DEFAULTS = [
    "/images/models/model-16.jpg",
    "/images/models/model-4.jpg",
    "/images/models/model-1.jpg",
    "/images/models/model-12.jpg",
  ] as const;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-[#FAF8F5] border border-[#E0D8CE] p-4 text-xs text-[#6B5B4E] leading-relaxed">
        <Sparkles size={13} className="inline text-[#C9A96E] mr-1" />
        Controls business-facing content on the <strong>About page</strong>. Leave any field empty to use the default copy. Crafts section and Values grid remain hardcoded.
      </div>

      {/* Hero Section */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] border-b border-[#E0D8CE] pb-2 mb-4">Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CmsTextField
            label="Main Headline"
            value={about.heroHeadlineMain || ""}
            placeholder="A Celebration of Authentic"
            onChange={(v) => update({ heroHeadlineMain: v })}
          />
          <CmsTextField
            label="Italic Headline"
            value={about.heroHeadlineItalic || ""}
            placeholder="South Asian Heritage"
            onChange={(v) => update({ heroHeadlineItalic: v })}
          />
          <div className="md:col-span-3">
            <CmsTextField
              label="Intro Paragraph"
              value={about.heroIntroText || ""}
              placeholder="MS Fashions was born out of a profound admiration…"
              multiline
              rows={3}
              onChange={(v) => update({ heroIntroText: v })}
            />
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] border-b border-[#E0D8CE] pb-2 mb-4">Philosophy Section</h3>
        <div className="space-y-4">
          <CmsTextField
            label="Philosophy Headline"
            value={about.philosophyHeadline || ""}
            placeholder="Why We Operate Exclusively by Appointment"
            onChange={(v) => update({ philosophyHeadline: v })}
          />
          <CmsTextField
            label="Philosophy Paragraph 1"
            value={about.philosophyPara1 || ""}
            placeholder="In an age of mass-produced, fast-fashion retail…"
            multiline
            rows={3}
            onChange={(v) => update({ philosophyPara1: v })}
          />
          <CmsTextField
            label="Philosophy Paragraph 2"
            value={about.philosophyPara2 || ""}
            placeholder="At MS Fashions, we replaced the conventional store…"
            multiline
            rows={3}
            onChange={(v) => update({ philosophyPara2: v })}
          />
          <CmsTextField
            label="Philosophy Paragraph 3"
            value={about.philosophyPara3 || ""}
            placeholder="You feel the weight of pure chiffon…"
            multiline
            rows={3}
            onChange={(v) => update({ philosophyPara3: v })}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] border-b border-[#E0D8CE] pb-2 mb-4">Bottom CTA Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CmsTextField
            label="CTA Headline"
            value={about.ctaHeadline || ""}
            placeholder="Experience the Collection Firsthand"
            onChange={(v) => update({ ctaHeadline: v })}
          />
          <CmsTextField
            label="CTA Body Text"
            value={about.ctaBodyText || ""}
            placeholder="Request your private appointment today…"
            multiline
            rows={2}
            onChange={(v) => update({ ctaBodyText: v })}
          />
        </div>
      </div>

      {/* Collage Images */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1814] border-b border-[#E0D8CE] pb-2 mb-4">
          Four-Image Collage (independently configurable)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {(["collageImage1", "collageImage2", "collageImage3", "collageImage4"] as const).map((key, i) => (
            <ImageSlotEditor
              key={key}
              label={`Image Slot ${i + 1}`}
              slot={about[key]}
              defaultSrc={COLLAGE_DEFAULTS[i]}
              CATALOG_IMAGES={CATALOG_IMAGES}
              uploading={uploading}
              setUploading={setUploading}
              setToast={setToast}
              aspectClass={i === 0 || i === 3 ? "aspect-[3/4]" : "aspect-square"}
              onChange={(updated) => updateCollage(key, updated)}
            />
          ))}
        </div>
        <p className="text-[0.65rem] text-[#9B8B7E] mt-3">
          Slot 1 &amp; 4 display as portrait (3:4). Slot 2 &amp; 3 display as square. All support independent zoom and focal point adjustment.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Panel: Collections Page Header
───────────────────────────────────────────────────────────────── */
export function CollectionsPagePanel({
  content,
  setContent,
}: {
  content: HomepageContentConfig;
  setContent: React.Dispatch<React.SetStateAction<HomepageContentConfig | null>>;
}) {
  const col = content.collectionsPage || {};

  const update = (patch: Partial<typeof col>) =>
    setContent((prev) => prev ? { ...prev, collectionsPage: { ...prev.collectionsPage, ...patch } } : prev);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[#FAF8F5] border border-[#E0D8CE] p-4 text-xs text-[#6B5B4E] leading-relaxed">
        <Sparkles size={13} className="inline text-[#C9A96E] mr-1" />
        Controls the header section of the <strong>Collections page</strong> (label, heading, description). Leave empty to use default copy.
      </div>

      <CmsTextField
        label="Section Label"
        value={col.label || ""}
        placeholder="Private Lookbook"
        onChange={(v) => update({ label: v })}
      />
      <CmsTextField
        label="Page Heading"
        value={col.heading || ""}
        placeholder="The Collection"
        onChange={(v) => update({ heading: v })}
      />
      <CmsTextField
        label="Description Paragraph"
        value={col.description || ""}
        placeholder="Each piece is handcrafted and available for private viewing…"
        multiline
        rows={3}
        onChange={(v) => update({ description: v })}
      />

      {/* Live preview */}
      <div className="border border-[#E0D8CE] bg-[#F2EDE6] py-10 px-8 text-center">
        <p className="text-[0.65rem] uppercase tracking-widest text-[#C9A96E] font-semibold mb-2">
          {col.label || "Private Lookbook"}
        </p>
        <h2 className="text-2xl font-medium text-[#1C1814] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {col.heading || "The Collection"}
        </h2>
        <div className="w-8 h-px bg-[#C9A96E] mx-auto my-3" />
        <p className="text-xs text-[#6B5B4E] max-w-xs mx-auto leading-relaxed">
          {col.description || "Each piece is handcrafted and available for private viewing at your home."}
        </p>
        <p className="text-[0.6rem] text-[#9B8B7E] mt-4 italic">↑ Live preview of Collections page header</p>
      </div>
    </div>
  );
}
