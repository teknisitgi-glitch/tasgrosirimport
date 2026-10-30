import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  LayoutGrid,
  Sparkles,
  Layers,
  Sliders,
  PhoneCall,
  Share2,
  Radio,
} from 'lucide-react';
import {
  UiContentConfig,
  StoreConfig,
  HeroSlideItem,
  BentoCardItem,
  DesktopColumnsCount,
  ProductImageAspectRatio,
  ProductImageObjectFit,
  ProductCategory,
  LiveShoppingConfig,
} from '../types/product';
import {
  createHeroLookbookSvg,
  createBagStudioSvg,
  createLiveStudioPosterSvg,
} from '../utils/bagStudioSvg';

export type AppearanceTab = 'hero' | 'bento' | 'layout' | 'contact' | 'live';

interface AdminAppearanceModalProps {
  isOpen: boolean;
  initialTab?: AppearanceTab;
  uiConfig: UiContentConfig;
  storeConfig: StoreConfig;
  onClose: () => void;
  onSaveAll: (newUiConfig: UiContentConfig, newStoreConfig: StoreConfig) => void;
  onResetAll: () => void;
}

const TARGET_CATEGORIES: ProductCategory[] = [
  'Semua',
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

export const AdminAppearanceModal: React.FC<AdminAppearanceModalProps> = ({
  isOpen,
  initialTab = 'hero',
  uiConfig,
  storeConfig,
  onClose,
  onSaveAll,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<AppearanceTab>(initialTab);
  const [draft, setDraft] = useState<UiContentConfig>(uiConfig);
  const [contactDraft, setContactDraft] = useState<StoreConfig>(storeConfig);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(uiConfig);
      setContactDraft(storeConfig);
      setActiveTab(initialTab);
      setSelectedSlideIdx(0);
      setConfirmReset(false);
    }
  }, [isOpen, initialTab, uiConfig, storeConfig]);

  if (!isOpen) return null;

  const slides = draft.heroSlides;
  const safeSlideIdx =
    slides.length > 0 ? Math.min(selectedSlideIdx, slides.length - 1) : 0;
  const currentSlide: HeroSlideItem | undefined = slides[safeSlideIdx];

  const updateCurrentSlide = (patch: Partial<HeroSlideItem>) => {
    setDraft((prev) => {
      const updated = prev.heroSlides.map((s, idx) =>
        idx === safeSlideIdx ? { ...s, ...patch } : s
      );
      return {
        ...prev,
        heroSlides: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleAddSlide = () => {
    const nextNum = slides.length + 1;
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      seasonTag: `PROMO SPESIAL SLIDE #${nextNum}`,
      headline: 'KOLEKSI TAS IMPORT TERBARU',
      subheadline:
        'Dapatkan harga grosir tangan pertama langsung dari gudang TGI dengan jaminan kualitas terbaik.',
      ctaLabel: 'Belanja Sekarang!',
      targetCategory: 'Semua',
      highlightMetric: 'Ready Stock Siap Kirim Hari Ini',
      imageUri: createHeroLookbookSvg(((nextNum - 1) % 3) as 0 | 1 | 2),
      overlayOpacity: 45,
    };
    setDraft((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedSlideIdx(slides.length);
  };

  const handleDeleteCurrentSlide = () => {
    if (slides.length <= 1) return;
    setDraft((prev) => {
      const filtered = prev.heroSlides.filter((_, idx) => idx !== safeSlideIdx);
      return {
        ...prev,
        heroSlides: filtered,
        updatedAt: new Date().toISOString(),
      };
    });
    setSelectedSlideIdx((prev) => Math.max(0, prev - 1));
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateCurrentSlide({ imageUri: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const updateBentoCard = (
    index: 0 | 1 | 2,
    patch: Partial<BentoCardItem>
  ) => {
    setDraft((prev) => {
      const nextCards = [...prev.bentoCards] as [
        BentoCardItem,
        BentoCardItem,
        BentoCardItem
      ];
      nextCards[index] = { ...nextCards[index], ...patch };
      return {
        ...prev,
        bentoCards: nextCards,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateLiveShopping = (patch: Partial<LiveShoppingConfig>) => {
    setDraft((prev) => ({
      ...prev,
      liveShopping: {
        ...prev.liveShopping,
        ...patch,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleLivePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateLiveShopping({ posterImageUri: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAll(
      {
        ...draft,
        updatedAt: new Date().toISOString(),
      },
      contactDraft
    );
    onClose();
  };

  const previewOverlayAlpha = currentSlide
    ? Math.min(0.9, Math.max(0, (currentSlide.overlayOpacity ?? 50) / 100))
    : 0.5;

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden border border-zinc-200 shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div>
            <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              KUSTOMISASI VISUAL & KONTAK TANPA KODE · AUTO-SAVE LOCALSTORAGE & SUPABASE
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wide">
              PENGATURAN TAMPILAN, KONTEN & KONTAK PERUSAHAAN
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal pengaturan tampilan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (4 Tabs) */}
        <div className="px-6 pt-3 bg-zinc-100 border-b border-zinc-200 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1. Slide Hero Banner ({slides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bento')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'bento'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>2. Tiga Kartu Info Keunggulan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-amber-500" />
            <span>3. Layout Katalog Produk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-amber-500" />
            <span>4. Kontak & Sosial Media</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-white text-zinc-950 border-red-500 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Radio
              className={`w-4 h-4 ${
                draft.liveShopping?.isTikTokLive ||
                draft.liveShopping?.isShopeeLive
                  ? 'text-red-500 animate-pulse'
                  : 'text-amber-500'
              }`}
            />
            <span>5. Live Streaming (TikTok & Shopee)</span>
            {(draft.liveShopping?.isTikTokLive ||
              draft.liveShopping?.isShopeeLive) && (
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-extrabold">
                ON
              </span>
            )}
          </button>
        </div>

        {/* Tab Body Form */}
        <form
          onSubmit={handleFormSubmit}
          className="p-6 sm:p-8 space-y-6 max-h-[76vh] overflow-y-auto"
        >
          {/* TAB 1: EDIT SLIDE HERO BANNER */}
          {activeTab === 'hero' && currentSlide && (
            <div className="space-y-6">
              {/* Slide Selector Bar + Add / Delete Slide */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
                <div className="flex flex-wrap items-center gap-2">
                  {slides.map((s, idx) => {
                    const isSelected = idx === safeSlideIdx;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSlideIdx(idx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-950 text-amber-400 shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        Slide #{idx + 1}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>+ Tambah Slide</span>
                  </button>
                </div>

                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentSlide}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Slide #{safeSlideIdx + 1}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 6 Columns: Text Inputs */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Label Kecil / Badge Atas (Season Tag)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.seasonTag}
                      onChange={(e) =>
                        updateCurrentSlide({ seasonTag: e.target.value })
                      }
                      placeholder="Contoh: OFFICIAL IMPORTIR TANGAN PERTAMA"
                      className="w-full px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Judul Besar Promosi (Headline) *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentSlide.headline}
                      onChange={(e) =>
                        updateCurrentSlide({ headline: e.target.value })
                      }
                      placeholder="Contoh: KOLEKSI TERBARU - TAS IMPORT PREMIUM"
                      className="w-full px-3.5 py-2 text-sm font-bold rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Deskripsi / Subteks Banner
                    </label>
                    <textarea
                      rows={3}
                      value={currentSlide.subheadline}
                      onChange={(e) =>
                        updateCurrentSlide({ subheadline: e.target.value })
                      }
                      placeholder="Contoh: Harga Grosir Tangan Pertama, Kualitas Terjamin..."
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Teks Tombol CTA Kuning
                      </label>
                      <input
                        type="text"
                        value={currentSlide.ctaLabel}
                        onChange={(e) =>
                          updateCurrentSlide({ ctaLabel: e.target.value })
                        }
                        placeholder="Belanja Sekarang!"
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-amber-400 bg-amber-50/30 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Kategori Tujuan Saat Klik Tombol
                      </label>
                      <select
                        value={currentSlide.targetCategory}
                        onChange={(e) =>
                          updateCurrentSlide({
                            targetCategory: e.target.value as ProductCategory,
                          })
                        }
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      >
                        {TARGET_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Teks Info Tambahan (Sebelah Tombol CTA)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.highlightMetric}
                      onChange={(e) =>
                        updateCurrentSlide({ highlightMetric: e.target.value })
                      }
                      placeholder="Contoh: Diskon s/d 45% + Harga Grosir ≥ 6 Pcs"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Right 6 Columns: Banner Photo Upload/URL, Dark Overlay Opacity Slider & Live Preview */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Live Banner Mini-Preview */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-zinc-700">
                      Pratinjau Langsung Slide #{safeSlideIdx + 1} (Kepekatan Overlay:{' '}
                      <strong className="font-mono text-zinc-950">
                        {currentSlide.overlayOpacity ?? 50}%
                      </strong>
                      )
                    </span>
                    <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-300 min-h-[195px] flex items-center p-5">
                      <img
                        src={
                          currentSlide.imageUri ||
                          createHeroLookbookSvg(
                            (safeSlideIdx % 3) as 0 | 1 | 2
                          )
                        }
                        alt="Preview Banner"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                      <div
                        className="absolute inset-0 transition-opacity duration-150"
                        style={{
                          background: `linear-gradient(90deg, rgba(9,9,11,${Math.min(
                            0.92,
                            previewOverlayAlpha + 0.15
                          )}) 0%, rgba(9,9,11,${previewOverlayAlpha}) 55%, rgba(9,9,11,${Math.max(
                            0,
                            previewOverlayAlpha - 0.25
                          )}) 100%)`,
                        }}
                      />
                      <div className="relative z-10 max-w-md space-y-2 text-white">
                        <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                          {currentSlide.seasonTag}
                        </p>
                        <h4 className="font-display text-xl font-bold leading-tight drop-shadow-xs">
                          {currentSlide.headline || 'JUDUL BANNER'}
                        </h4>
                        <p className="text-xs text-zinc-200 line-clamp-2">
                          {currentSlide.subheadline}
                        </p>
                        <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs">
                          {currentSlide.ctaLabel || 'Belanja Sekarang!'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overlay Opacity Slider (0% - 90%) */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                        <Sliders className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kepekatan Overlay Gelap (0% - 90%)</span>
                      </label>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-950 text-amber-400 tabular-nums">
                        {currentSlide.overlayOpacity ?? 50}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={currentSlide.overlayOpacity ?? 50}
                      onChange={(e) =>
                        updateCurrentSlide({
                          overlayOpacity: Number(e.target.value),
                        })
                      }
                      className="w-full accent-zinc-950 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      {[
                        { label: '0% (Tanpa Gelap)', val: 0 },
                        { label: '25% (Terang)', val: 25 },
                        { label: '50% (Seimbang)', val: 50 },
                        { label: '80% (Kontras Tinggi)', val: 80 },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() =>
                            updateCurrentSlide({ overlayOpacity: preset.val })
                          }
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            (currentSlide.overlayOpacity ?? 50) === preset.val
                              ? 'bg-zinc-950 text-white'
                              : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-900'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload from Laptop or URL Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700">
                      Gambar Banner (Upload Foto dari Laptop atau Tempel URL)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={currentSlide.imageUri}
                          onChange={(e) =>
                            updateCurrentSlide({ imageUri: e.target.value })
                          }
                          placeholder="Tempel URL gambar https://... atau klik Upload"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Quick Studio Banner Presets */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-zinc-500">
                        Preset Studio:
                      </span>
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            updateCurrentSlide({
                              imageUri: createHeroLookbookSvg(
                                idx as 0 | 1 | 2
                              ),
                            })
                          }
                          className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Lookbook #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT 3 KARTU INFO KEUNGGULAN (BENTO GRID) */}
          {activeTab === 'bento' && (
            <div className="space-y-6">
              <p className="text-xs sm:text-sm text-zinc-600">
                Ubah judul, deskripsi singkat, label pojok kanan atas, serta isi pop-up informasi untuk masing-masing dari 3 kartu keunggulan di bawah Hero Banner:
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {draft.bentoCards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                        <span className="font-mono text-xs font-bold uppercase text-zinc-900">
                          KARTU INFO #{idx + 1}
                        </span>
                        <select
                          value={card.iconType}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              iconType: e.target
                                .value as BentoCardItem['iconType'],
                            })
                          }
                          className="px-2 py-1 text-xs font-semibold rounded border border-zinc-300 bg-white"
                        >
                          <option value="truck">Ikon Truk / Ongkir</option>
                          <option value="shield">Ikon Perisai / Garansi</option>
                          <option value="warehouse">Ikon Gudang</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Judul Kartu #{idx + 1} *
                        </label>
                        <input
                          type="text"
                          required
                          value={card.title}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Contoh: GRATIS ONGKIR & HARGA GROSIR"
                          className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Deskripsi Kartu #{idx + 1} *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={card.description}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Label Kanan Atas Kartu
                        </label>
                        <input
                          type="text"
                          value={card.badgeText}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              badgeText: e.target.value,
                            })
                          }
                          placeholder="Contoh: Info Grosir"
                          className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Isi Penjelasan Saat Kartu Diklik (Modal)
                        </label>
                        <textarea
                          rows={2}
                          value={card.modalContent}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              modalContent: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PENGATURAN LAYOUT KATALOG PRODUK */}
          {activeTab === 'layout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Desktop Columns Count */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    1. Jumlah Kolom Produk di Desktop
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([2, 3, 4] as DesktopColumnsCount[]).map((colCount) => {
                      const active =
                        draft.catalogLayout.desktopColumns === colCount;
                      return (
                        <button
                          key={colCount}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              catalogLayout: {
                                ...prev.catalogLayout,
                                desktopColumns: colCount,
                              },
                            }))
                          }
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-amber-400'
                              : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="font-display text-lg font-bold block">
                            {colCount} Kolom
                          </span>
                          <span
                            className={`text-xs ${
                              active ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {colCount === 2 && 'Kartu ekstra besar'}
                            {colCount === 3 && 'Proporsional (Standar)'}
                            {colCount === 4 && 'Padat & banyak SKU'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Product Image Aspect Ratio */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    2. Rasio Bingkai Foto Produk
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        {
                          id: '1:1',
                          title: 'Kotak (1:1)',
                          desc: 'Rasio persegi ala Instagram / Marketplace',
                        },
                        {
                          id: '3:4',
                          title: 'Potret (3:4)',
                          desc: 'Rasio vertikal cocok untuk foto katalog tinggi',
                        },
                        {
                          id: '4:3',
                          title: 'Lebar (4:3)',
                          desc: 'Rasio lanskap studio modern',
                        },
                      ] as {
                        id: ProductImageAspectRatio;
                        title: string;
                        desc: string;
                      }[]
                    ).map((ratio) => {
                      const active =
                        draft.catalogLayout.imageAspectRatio === ratio.id;
                      return (
                        <button
                          key={ratio.id}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              catalogLayout: {
                                ...prev.catalogLayout,
                                imageAspectRatio: ratio.id,
                              },
                            }))
                          }
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-amber-400'
                              : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="font-display text-lg font-bold block">
                            {ratio.title}
                          </span>
                          <span
                            className={`text-xs ${
                              active ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {ratio.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Product Image Object Fit */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    3. Mode Tampilan Gambar Produk
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        {
                          id: 'cover',
                          title: 'Penuh / Cover (object-cover)',
                          desc: 'Foto memenuhi seluruh kotak bingkai tanpa sisa ruang kosong.',
                        },
                        {
                          id: 'contain',
                          title: 'Utuh / Contain (object-contain)',
                          desc: 'Seluruh bagian tas tampil utuh di dalam bingkai tanpa terpotong.',
                        },
                      ] as {
                        id: ProductImageObjectFit;
                        title: string;
                        desc: string;
                      }[]
                    ).map((mode) => {
                      const active =
                        draft.catalogLayout.imageObjectFit === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              catalogLayout: {
                                ...prev.catalogLayout,
                                imageObjectFit: mode.id,
                              },
                            }))
                          }
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-amber-400'
                              : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="font-display text-base font-bold block">
                            {mode.title}
                          </span>
                          <span
                            className={`text-xs mt-1 block ${
                              active ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {mode.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Live Sample Card Preview */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-500">
                    Pratinjau Kartu Produk
                  </span>
                  <span className="font-mono font-semibold text-zinc-800">
                    {draft.catalogLayout.desktopColumns} Kolom ·{' '}
                    {draft.catalogLayout.imageAspectRatio} ·{' '}
                    {draft.catalogLayout.imageObjectFit}
                  </span>
                </div>

                <div className="max-w-xs mx-auto rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-xs">
                  <div
                    className={`relative w-full bg-zinc-100 overflow-hidden flex items-center justify-center ${
                      draft.catalogLayout.imageAspectRatio === '1:1'
                        ? 'aspect-square'
                        : draft.catalogLayout.imageAspectRatio === '3:4'
                        ? 'aspect-3/4'
                        : 'aspect-4/3'
                    }`}
                  >
                    <img
                      src={createBagStudioSvg({
                        variant: 'backpack-black',
                        sku: 'BP-MY-00513',
                      })}
                      alt="Contoh Kartu Produk"
                      className={`w-full h-full ${
                        draft.catalogLayout.imageObjectFit === 'contain'
                          ? 'object-contain p-2'
                          : 'object-cover'
                      }`}
                    />
                    <span className="absolute top-3 left-3 bg-zinc-950 text-amber-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                      SALE -43%
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[11px] font-mono text-zinc-500 block">
                      BACKPACK · BP-MY-00513
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900">
                      Tas Ransel Urban Commuter Waterproof BP-MY-00513
                    </h4>
                    <p className="font-mono text-base font-bold text-zinc-950">
                      Rp 139.000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KONTAK & SOSIAL MEDIA PERUSAHAAN */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 7 Columns: Primary Company Contact & WhatsApp Template */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                    <PhoneCall className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      1. Identitas & Kontak Utama Perusahaan
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Nama Perusahaan / Toko *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactDraft.storeName}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            storeName: e.target.value,
                          })
                        }
                        placeholder="TAS GROSIR IMPORT"
                        className="w-full px-3.5 py-2 text-sm font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Alamat Email Resmi Perusahaan
                      </label>
                      <input
                        type="email"
                        value={contactDraft.email}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            email: e.target.value,
                          })
                        }
                        placeholder="official@tasgrosirimport.co.id"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Slogan Singkat Perusahaan (Tampil di Footer)
                    </label>
                    <textarea
                      rows={2}
                      value={contactDraft.slogan}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          slogan: e.target.value,
                        })
                      }
                      placeholder="Pusat grosir dan eceran tas import tangan pertama..."
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 mb-1">
                        Nomor WhatsApp Admin / Sales (628xxx) *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactDraft.whatsappNumber}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            whatsappNumber: e.target.value,
                          })
                        }
                        placeholder="6281288997766"
                        className="w-full px-3.5 py-2 text-sm font-mono font-bold rounded-lg border border-emerald-500 bg-emerald-50/30 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Jam Operasional Gudang / Kantor
                      </label>
                      <input
                        type="text"
                        value={contactDraft.operatingHours}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            operatingHours: e.target.value,
                          })
                        }
                        placeholder="Senin – Sabtu: 08.30 – 17.30 WIB"
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Template Teks Pembuka Pesan Otomatis WhatsApp
                    </label>
                    <textarea
                      rows={2}
                      value={contactDraft.whatsappGreetingTemplate}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          whatsappGreetingTemplate: e.target.value,
                        })
                      }
                      placeholder="Halo Admin *{storeName}*, saya tertarik dan ingin memesan produk tas import berikut:"
                      className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                    <span className="block text-[11px] text-zinc-500 mt-1">
                      Tips: Gunakan <code className="font-mono font-bold">{'{storeName}'}</code> agar nama toko terisi otomatis pada pesan Checkout, Tombol Pesan WA Produk, dan Tombol Mengambang (Floating WA).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Alamat Lengkap Gudang / Kantor
                    </label>
                    <textarea
                      rows={2}
                      value={contactDraft.warehouseAddress}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          warehouseAddress: e.target.value,
                        })
                      }
                      placeholder="Komp. Pergudangan Terpadu Blok C-18, Jakarta Utara"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Social Media & Marketplace Links */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      2. Link Sosial Media & Marketplace
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Masukkan username (contoh: <code className="font-mono">@tasgrosirimport</code>) atau URL lengkap. Kosongkan kolom jika tidak ingin menampilkan ikon tersebut di Footer.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Instagram (URL atau @username)
                      </label>
                      <input
                        type="text"
                        value={contactDraft.socialLinks.instagram}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            socialLinks: {
                              ...contactDraft.socialLinks,
                              instagram: e.target.value,
                            },
                          })
                        }
                        placeholder="@tasgrosirimport.id atau https://instagram.com/..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        TikTok (URL atau @username)
                      </label>
                      <input
                        type="text"
                        value={contactDraft.socialLinks.tiktok}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            socialLinks: {
                              ...contactDraft.socialLinks,
                              tiktok: e.target.value,
                            },
                          })
                        }
                        placeholder="@tasgrosirimport.official atau https://tiktok.com/@..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Facebook Page (URL)
                      </label>
                      <input
                        type="text"
                        value={contactDraft.socialLinks.facebook}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            socialLinks: {
                              ...contactDraft.socialLinks,
                              facebook: e.target.value,
                            },
                          })
                        }
                        placeholder="https://facebook.com/tasgrosirimport"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        X / Twitter (URL atau @username)
                      </label>
                      <input
                        type="text"
                        value={contactDraft.socialLinks.twitter}
                        onChange={(e) =>
                          setContactDraft({
                            ...contactDraft,
                            socialLinks: {
                              ...contactDraft.socialLinks,
                              twitter: e.target.value,
                            },
                          })
                        }
                        placeholder="https://x.com/tasgrosirimport"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-orange-700 mb-1">
                          Link Toko Shopee
                        </label>
                        <input
                          type="text"
                          value={contactDraft.socialLinks.shopeeUrl}
                          onChange={(e) =>
                            setContactDraft({
                              ...contactDraft,
                              socialLinks: {
                                ...contactDraft.socialLinks,
                                shopeeUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="https://shopee.co.id/..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-700 mb-1">
                          Link Toko Tokopedia
                        </label>
                        <input
                          type="text"
                          value={contactDraft.socialLinks.tokopediaUrl}
                          onChange={(e) =>
                            setContactDraft({
                              ...contactDraft,
                              socialLinks: {
                                ...contactDraft.socialLinks,
                                tokopediaUrl: e.target.value,
                              },
                            })
                          }
                          placeholder="https://tokopedia.com/..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE STREAMING (TIKTOK LIVE & SHOPEE LIVE) */}
          {activeTab === 'live' && draft.liveShopping && (
            <div className="space-y-6">
              {/* Top Toggle Switches Box */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      SAKLAR STATUS SIARAN LANGSUNG (REAL-TIME BANNER & FLOATING WIDGET)
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      STATUS LIVE STREAMING TIKTOK & SHOPEE
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-extrabold ${
                      draft.liveShopping.isTikTokLive ||
                      draft.liveShopping.isShopeeLive
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        draft.liveShopping.isTikTokLive ||
                        draft.liveShopping.isShopeeLive
                          ? 'bg-white animate-ping'
                          : 'bg-zinc-500'
                      }`}
                    />
                    <span>
                      {draft.liveShopping.isTikTokLive ||
                      draft.liveShopping.isShopeeLive
                        ? '🔴 SEDANG LIVE AKTIF'
                        : 'STATUS: OFFLINE (TAMPIL JADWAL)'}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Toggle 1: Sedang Live di TikTok */}
                  <div
                    onClick={() =>
                      updateLiveShopping({
                        isTikTokLive: !draft.liveShopping.isTikTokLive,
                      })
                    }
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      draft.liveShopping.isTikTokLive
                        ? 'bg-zinc-900 border-cyan-400 shadow-md'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-white">
                          Sedang Live di TikTok
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            draft.liveShopping.isTikTokLive
                              ? 'bg-rose-600 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {draft.liveShopping.isTikTokLive ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Aktifkan saat akun TikTok sedang melakukan siaran live.
                      </p>
                    </div>

                    {/* Custom Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={draft.liveShopping.isTikTokLive}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLiveShopping({
                          isTikTokLive: !draft.liveShopping.isTikTokLive,
                        });
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer ${
                        draft.liveShopping.isTikTokLive
                          ? 'bg-gradient-to-r from-cyan-400 to-rose-500'
                          : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          draft.liveShopping.isTikTokLive
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Sedang Live di Shopee */}
                  <div
                    onClick={() =>
                      updateLiveShopping({
                        isShopeeLive: !draft.liveShopping.isShopeeLive,
                      })
                    }
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      draft.liveShopping.isShopeeLive
                        ? 'bg-orange-950/40 border-orange-500 shadow-md'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-white">
                          Sedang Live di Shopee
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            draft.liveShopping.isShopeeLive
                              ? 'bg-orange-500 text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {draft.liveShopping.isShopeeLive ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Aktifkan saat toko Shopee sedang melakukan siaran Shopee Live.
                      </p>
                    </div>

                    {/* Custom Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={draft.liveShopping.isShopeeLive}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateLiveShopping({
                          isShopeeLive: !draft.liveShopping.isShopeeLive,
                        });
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer ${
                        draft.liveShopping.isShopeeLive
                          ? 'bg-orange-500'
                          : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          draft.liveShopping.isShopeeLive
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 Columns: Platform Links, Promo Title & Daily Schedule */}
                <div className="lg:col-span-7 space-y-4">
                  {/* TikTok Live Inputs */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Pengaturan TikTok Live
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Username TikTok
                        </label>
                        <input
                          type="text"
                          value={draft.liveShopping.tiktokUsername}
                          onChange={(e) =>
                            updateLiveShopping({
                              tiktokUsername: e.target.value,
                            })
                          }
                          placeholder="@tasgrosirimport.official"
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Link / URL Live TikTok
                        </label>
                        <input
                          type="text"
                          value={draft.liveShopping.tiktokLiveUrl}
                          onChange={(e) =>
                            updateLiveShopping({
                              tiktokLiveUrl: e.target.value,
                            })
                          }
                          placeholder="https://www.tiktok.com/@.../live"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shopee Live Inputs */}
                  <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900">
                      Pengaturan Shopee Live
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Nama Toko Shopee
                        </label>
                        <input
                          type="text"
                          value={draft.liveShopping.shopeeStoreName}
                          onChange={(e) =>
                            updateLiveShopping({
                              shopeeStoreName: e.target.value,
                            })
                          }
                          placeholder="Tas Grosir Import Official"
                          className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Link / URL Live Shopee
                        </label>
                        <input
                          type="text"
                          value={draft.liveShopping.shopeeLiveUrl}
                          onChange={(e) =>
                            updateLiveShopping({
                              shopeeLiveUrl: e.target.value,
                            })
                          }
                          placeholder="https://live.shopee.co.id/..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Promo Headline & Daily Schedule */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Judul Promo Live *
                      </label>
                      <input
                        type="text"
                        required
                        value={draft.liveShopping.promoTitle}
                        onChange={(e) =>
                          updateLiveShopping({ promoTitle: e.target.value })
                        }
                        placeholder="Contoh: Spill Gudang Tas Import Terbaru - Diskon Khusus Live!"
                        className="w-full px-3.5 py-2 text-sm font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Jadwal Live Harian *
                      </label>
                      <input
                        type="text"
                        required
                        value={draft.liveShopping.dailySchedule}
                        onChange={(e) =>
                          updateLiveShopping({ dailySchedule: e.target.value })
                        }
                        placeholder="Contoh: Senin - Sabtu | Sesi 1: 10.00 WIB, Sesi 2: 19.00 WIB"
                        className="w-full px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Poster / Thumbnail Upload & Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <label className="block text-xs font-bold text-zinc-800">
                      Gambar Thumbnail / Poster Live
                    </label>

                    <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-300 aspect-16/10">
                      <img
                        src={
                          draft.liveShopping.posterImageUri ||
                          createLiveStudioPosterSvg(0)
                        }
                        alt="Preview Poster Live"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
                        PREVIEW POSTER LIVE
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={draft.liveShopping.posterImageUri}
                          onChange={(e) =>
                            updateLiveShopping({
                              posterImageUri: e.target.value,
                            })
                          }
                          placeholder="Tempel URL gambar poster atau Upload..."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLivePosterUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-zinc-500">
                        Preset Poster Studio:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateLiveShopping({
                            posterImageUri: createLiveStudioPosterSvg(0),
                          })
                        }
                        className="px-2.5 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[11px] font-semibold cursor-pointer"
                      >
                        Tema TikTok Studio
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLiveShopping({
                            posterImageUri: createLiveStudioPosterSvg(1),
                          })
                        }
                        className="px-2.5 py-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-900 text-[11px] font-semibold cursor-pointer"
                      >
                        Tema Shopee Studio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer: Reset to Default & Save Button */}
          <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Tampilan, Konten & Kontak ke Default</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-300">
                  <span className="text-xs font-bold text-red-800">
                    Reset Banner, Kartu Info, Layout & Kontak ke Default?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetAll();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Ya, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
