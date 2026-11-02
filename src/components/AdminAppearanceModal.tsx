import React, { useState, useEffect, useRef } from 'react';
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
  TicketPercent,
  Package,
  BookOpen,
  Scale,
  Search,
  Eye,
  EyeOff,
  Megaphone,
  Truck,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import {
  Product,
  UiContentConfig,
  StoreConfig,
  HeroSlideItem,
  BentoCardItem,
  VoucherItem,
  DesktopColumnsCount,
  ProductImageAspectRatio,
  ProductImageObjectFit,
  ProductCategory,
  LiveShoppingConfig,
  ResellerGuideConfig,
  ResellerGuideCargoRow,
  SectionVisibilityConfig,
} from '../types/product';
import {
  createHeroLookbookSvg,
  createBagStudioSvg,
  createLiveStudioPosterSvg,
  createBentoCardCoverSvg,
} from '../utils/bagStudioSvg';
import {
  saveUiContentConfig,
  saveStoreConfig,
  DEFAULT_RESELLER_GUIDE_CONFIG,
} from '../services/productService';
import { compressImageFileToDataUrl, formatRupiah } from '../utils/formatters';

export type AppearanceTab =
  | 'hero'
  | 'bento'
  | 'products'
  | 'reseller-guide'
  | 'layout'
  | 'live'
  | 'contact';

interface AdminAppearanceModalProps {
  isOpen: boolean;
  initialTab?: AppearanceTab;
  uiConfig: UiContentConfig;
  storeConfig: StoreConfig;
  products?: Product[];
  onUpdateProducts?: (nextProducts: Product[]) => void;
  onOpenAddProductModal?: () => void;
  onOpenEditProductModal?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onClose: () => void;
  onSaveAll: (newUiConfig: UiContentConfig, newStoreConfig: StoreConfig) => void;
  onLiveChange?: (newUiConfig: UiContentConfig, newStoreConfig: StoreConfig) => void;
  onResetAll: () => void;
}

const TARGET_CATEGORIES: ProductCategory[] = [
  'Semua',
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

const EDITABLE_PRODUCT_CATEGORIES: Exclude<ProductCategory, 'Semua'>[] = [
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

const DEFAULT_SECTION_VISIBILITY: SectionVisibilityConfig = {
  showAnnouncementBar: true,
  showVoucherBar: true,
  showHeroBanner: true,
  showPromoBento: true,
  showLiveShopping: true,
  showCustomerReviews: true,
};

export const AdminAppearanceModal: React.FC<AdminAppearanceModalProps> = ({
  isOpen,
  initialTab = 'hero',
  uiConfig,
  storeConfig,
  products = [],
  onUpdateProducts,
  onOpenAddProductModal,
  onOpenEditProductModal,
  onDeleteProduct,
  onClose,
  onSaveAll,
  onLiveChange,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<AppearanceTab>(initialTab);
  const [draft, setDraft] = useState<UiContentConfig>(uiConfig);
  const [contactDraft, setContactDraft] = useState<StoreConfig>(storeConfig);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(
    null
  );

  const wasOpenRef = useRef<boolean>(false);
  const initialUiSnapshotRef = useRef<UiContentConfig>(uiConfig);
  const initialStoreSnapshotRef = useRef<StoreConfig>(storeConfig);
  const latestDraftRef = useRef<UiContentConfig>(uiConfig);
  const latestContactRef = useRef<StoreConfig>(storeConfig);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      initialUiSnapshotRef.current = uiConfig;
      initialStoreSnapshotRef.current = storeConfig;
      latestDraftRef.current = uiConfig;
      latestContactRef.current = storeConfig;
      setDraft(uiConfig);
      setContactDraft(storeConfig);
      setActiveTab(initialTab);
      setSelectedSlideIdx(0);
      setConfirmReset(false);
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
  }, [isOpen, initialTab, uiConfig, storeConfig]);

  if (!isOpen) return null;

  const applyDraftUpdate = (
    updater: (prev: UiContentConfig) => UiContentConfig
  ) => {
    setDraft((prev) => {
      const next = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      latestDraftRef.current = next;
      saveUiContentConfig(next);
      onLiveChange?.(next, latestContactRef.current);
      return next;
    });
  };

  const applyContactUpdate = (updater: (prev: StoreConfig) => StoreConfig) => {
    setContactDraft((prev) => {
      const next = updater(prev);
      latestContactRef.current = next;
      saveStoreConfig(next);
      onLiveChange?.(latestDraftRef.current, next);
      return next;
    });
  };

  // Section Visibility Helper
  const sectionVisibility: SectionVisibilityConfig = {
    ...DEFAULT_SECTION_VISIBILITY,
    ...(draft.catalogLayout?.sectionVisibility || {}),
  };

  const toggleSectionVisibility = (key: keyof SectionVisibilityConfig) => {
    applyDraftUpdate((prev) => {
      const currentVis: SectionVisibilityConfig = {
        ...DEFAULT_SECTION_VISIBILITY,
        ...(prev.catalogLayout?.sectionVisibility || {}),
      };
      return {
        ...prev,
        catalogLayout: {
          ...prev.catalogLayout,
          sectionVisibility: {
            ...currentVis,
            [key]: !currentVis[key],
          },
        },
      };
    });
  };

  // Reseller Guide Helper
  const resellerGuide: ResellerGuideConfig =
    draft.resellerGuide || DEFAULT_RESELLER_GUIDE_CONFIG;

  const updateResellerGuide = (patch: Partial<ResellerGuideConfig>) => {
    applyDraftUpdate((prev) => ({
      ...prev,
      resellerGuide: {
        ...(prev.resellerGuide || DEFAULT_RESELLER_GUIDE_CONFIG),
        ...patch,
      },
    }));
  };

  const updateMoqPoint = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const nextPoints = [...(resellerGuide.moqPoints || [])];
    if (!nextPoints[index]) return;
    nextPoints[index] = { ...nextPoints[index], [field]: value };
    updateResellerGuide({ moqPoints: nextPoints });
  };

  const updateDropshipStep = (
    index: number,
    field: 'stepLabel' | 'title' | 'description',
    value: string
  ) => {
    const nextSteps = [...(resellerGuide.dropshipSteps || [])];
    if (!nextSteps[index]) return;
    nextSteps[index] = { ...nextSteps[index], [field]: value };
    updateResellerGuide({ dropshipSteps: nextSteps });
  };

  const updateCargoRow = (
    index: number,
    patch: Partial<ResellerGuideCargoRow>
  ) => {
    const nextRows = [...(resellerGuide.cargoTable || [])];
    if (!nextRows[index]) return;
    nextRows[index] = { ...nextRows[index], ...patch };
    updateResellerGuide({ cargoTable: nextRows });
  };

  const handleAddCargoRow = () => {
    const newRow: ResellerGuideCargoRow = {
      id: `cargo-${Date.now()}`,
      region: 'Zona Wilayah Baru',
      cities: 'Daftar kota tujuan...',
      ekspedisiLokal: '2 – 4 Hari Kerja',
      jtrDakota: '3 – 5 Hari Kerja',
      indahCargo: '3 – 6 Hari Kerja',
      estRate: 'Rp 6.000 – Rp 10.000 / kg',
    };
    updateResellerGuide({
      cargoTable: [...(resellerGuide.cargoTable || []), newRow],
    });
  };

  const handleDeleteCargoRow = (index: number) => {
    const currentRows = resellerGuide.cargoTable || [];
    if (currentRows.length <= 1) return;
    updateResellerGuide({
      cargoTable: currentRows.filter((_, idx) => idx !== index),
    });
  };

  // Inline Product Table Helpers
  const handleInlineProductChange = (
    productId: string,
    patch: Partial<Product>
  ) => {
    if (!onUpdateProducts) return;
    const nextProducts = products.map((p) => {
      if (p.id !== productId) return p;
      const merged: Product = {
        ...p,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      if (typeof patch.stock === 'number') {
        merged.stockStatus =
          patch.stock <= 0
            ? 'Habis'
            : patch.stock <= 25
            ? 'Stok Terbatas'
            : 'Ready Stock';
      }
      if (typeof patch.salePrice === 'number') {
        merged.normalPrice = Math.max(merged.normalPrice, patch.salePrice);
      }
      return merged;
    });
    onUpdateProducts(nextProducts);
  };

  const handleInlineProductImageUpload = async (
    productId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 1000, 0.8);
      handleInlineProductChange(productId, { imageUrl: compressedDataUrl });
    } catch {
      // ignore
    }
  };

  const filteredTableProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const slides = draft.heroSlides;
  const safeSlideIdx =
    slides.length > 0 ? Math.min(selectedSlideIdx, slides.length - 1) : 0;
  const currentSlide: HeroSlideItem | undefined = slides[safeSlideIdx];

  const updateCurrentSlide = (patch: Partial<HeroSlideItem>) => {
    applyDraftUpdate((prev) => {
      const updated = prev.heroSlides.map((s, idx) =>
        idx === safeSlideIdx ? { ...s, ...patch } : s
      );
      return {
        ...prev,
        heroSlides: updated,
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
    applyDraftUpdate((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
    setSelectedSlideIdx(slides.length);
  };

  const handleDeleteCurrentSlide = () => {
    if (slides.length <= 1) return;
    applyDraftUpdate((prev) => {
      const filtered = prev.heroSlides.filter((_, idx) => idx !== safeSlideIdx);
      return {
        ...prev,
        heroSlides: filtered,
      };
    });
    setSelectedSlideIdx((prev) => Math.max(0, prev - 1));
  };

  const handleBannerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 1400, 0.8);
      updateCurrentSlide({ imageUri: compressedDataUrl });
    } catch {
      // ignore
    }
  };

  const updateBentoCard = (
    index: 0 | 1 | 2,
    patch: Partial<BentoCardItem>
  ) => {
    applyDraftUpdate((prev) => {
      const nextCards = [...prev.bentoCards] as [
        BentoCardItem,
        BentoCardItem,
        BentoCardItem
      ];
      nextCards[index] = { ...nextCards[index], ...patch };
      return {
        ...prev,
        bentoCards: nextCards,
      };
    });
  };

  const handleBentoImageUpload = async (
    index: 1 | 2,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 1000, 0.8);
      updateBentoCard(index, { imageUri: compressedDataUrl });
    } catch {
      // ignore
    }
  };

  const updateVoucher = (index: 0 | 1 | 2, patch: Partial<VoucherItem>) => {
    applyDraftUpdate((prev) => {
      const currentVouchers = prev.vouchers || [
        {
          id: 'voucher-1',
          title: 'VOUCHER RESELLER 20K',
          subtitle: 'Potongan langsung member & reseller baru',
          code: 'TGIRESELLER20',
        },
        {
          id: 'voucher-2',
          title: 'POTONGAN GROSIR 50K MIN 6 PCS',
          subtitle: 'Otomatis harga grosir pabrik bebas campur SKU',
          code: 'GROSIRMIX6',
        },
        {
          id: 'voucher-3',
          title: 'SUBSIDI ONGKIR KARGO',
          subtitle: 'Gratis / subsidi ongkir pengiriman partai besar',
          code: 'FREEKARGO',
        },
      ];
      const nextVouchers = [...currentVouchers] as [
        VoucherItem,
        VoucherItem,
        VoucherItem
      ];
      nextVouchers[index] = { ...nextVouchers[index], ...patch };
      return {
        ...prev,
        vouchers: nextVouchers,
      };
    });
  };

  const updateLiveShopping = (patch: Partial<LiveShoppingConfig>) => {
    applyDraftUpdate((prev) => ({
      ...prev,
      liveShopping: {
        ...prev.liveShopping,
        ...patch,
      },
    }));
  };

  const handleLivePosterUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 1200, 0.8);
      updateLiveShopping({ posterImageUri: compressedDataUrl });
    } catch {
      // ignore
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUi: UiContentConfig = {
      ...latestDraftRef.current,
      updatedAt: new Date().toISOString(),
    };
    const finalStore: StoreConfig = latestContactRef.current;
    saveUiContentConfig(finalUi);
    saveStoreConfig(finalStore);
    onSaveAll(finalUi, finalStore);
    onClose();
  };

  const handleCancelChanges = () => {
    const restoredUi = initialUiSnapshotRef.current;
    const restoredStore = initialStoreSnapshotRef.current;
    saveUiContentConfig(restoredUi);
    saveStoreConfig(restoredStore);
    onLiveChange?.(restoredUi, restoredStore);
    onClose();
  };

  const previewOverlayAlpha = currentSlide
    ? Math.min(0.9, Math.max(0, (currentSlide.overlayOpacity ?? 50) / 100))
    : 0.5;

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full overflow-hidden border border-zinc-200 shadow-2xl my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                MASTER PANEL ADMIN TERPADU · AUTO-SAVE LOCALSTORAGE & SINKRONISASI SUPABASE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>REAL-TIME SYNC</span>
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-bold tracking-wide">
              PUSAT KENDALI KONTEN, PRODUK, PANDUAN RESELLER & LAYOUT WEBSITE TGI
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Master Panel Admin"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (7 Unified Master Admin Tabs) */}
        <div className="px-4 sm:px-6 pt-2.5 bg-zinc-100 border-b border-zinc-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1. Banner, Voucher & Pengumuman</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bento')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'bento'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Kartu Keunggulan (Bento)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-500" />
            <span>3. Edit Produk & Berat Kargo ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reseller-guide')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reseller-guide'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>4. Panduan Reseller & Tabel Kargo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
            <span>5. Layout & Visibilitas Section</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-white text-zinc-950 border-red-500 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                draft.liveShopping?.isTikTokLive ||
                draft.liveShopping?.isShopeeLive
                  ? 'text-red-500 animate-pulse'
                  : 'text-amber-500'
              }`}
            />
            <span>6. Live Studio</span>
            {(draft.liveShopping?.isTikTokLive ||
              draft.liveShopping?.isShopeeLive) && (
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-extrabold">
                ON
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
            <span>7. Kontak & Keamanan PIN</span>
          </button>
        </div>

        {/* Tab Body Form */}
        <form
          noValidate
          onSubmit={handleFormSubmit}
          className="p-5 sm:p-7 space-y-6 max-h-[76vh] overflow-y-auto"
        >
          {/* TAB 1: EDIT PENGUMUMAN BERJALAN, SLIDE HERO BANNER & BAR VOUCHER GROSIR */}
          {activeTab === 'hero' && currentSlide && (
            <div className="space-y-6">
              {/* Top Running Announcement Bar Editor */}
              <div className="p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                      Teks Bar Pengumuman Berjalan (Paling Atas Header)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggleSectionVisibility('showAnnouncementBar')
                    }
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                      sectionVisibility.showAnnouncementBar
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {sectionVisibility.showAnnouncementBar ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>DITAMPILKAN</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>DISEMBUNYIKAN</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    value={draft.announcementText || ''}
                    onChange={(e) =>
                      applyDraftUpdate((prev) => ({
                        ...prev,
                        announcementText: e.target.value,
                      }))
                    }
                    placeholder="PUSAT GROSIR TAS IMPORT TANGAN PERTAMA · HARGA GROSIR OTOMATIS MULAI 6 PCS (BEBAS CAMPUR SKU)"
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

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
                      Judul Besar Banner Utama (Headline) *
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

                    {/* Quick Unsplash Aesthetic Bag Presets */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-semibold text-zinc-500">
                        Preset Foto Tas Asli:
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
                          Foto Tas #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BAR VOUCHER GROSIR EDITOR */}
              {draft.vouchers && (
                <div className="pt-6 border-t border-zinc-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TicketPercent className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900">
                        Edit 3 Bar Voucher Grosir (Di Atas Hero Banner)
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility('showVoucherBar')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                        sectionVisibility.showVoucherBar
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}
                    >
                      {sectionVisibility.showVoucherBar ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>BAR VOUCHER AKTIF</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>BAR VOUCHER DISEMBUNYIKAN</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {draft.vouchers.map((voucher, vIdx) => (
                      <div
                        key={voucher.id || vIdx}
                        className="p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <span className="font-mono text-[11px] font-bold text-amber-400 uppercase">
                            VOUCHER #{vIdx + 1}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            Tersimpan Otomatis
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                            Judul Voucher (Teks Besar Kuning)
                          </label>
                          <input
                            type="text"
                            value={voucher.title}
                            onChange={(e) =>
                              updateVoucher(vIdx as 0 | 1 | 2, {
                                title: e.target.value,
                              })
                            }
                            placeholder="VOUCHER RESELLER 20K"
                            className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                            Subteks Singkat Voucher
                          </label>
                          <input
                            type="text"
                            value={voucher.subtitle}
                            onChange={(e) =>
                              updateVoucher(vIdx as 0 | 1 | 2, {
                                subtitle: e.target.value,
                              })
                            }
                            placeholder="Potongan langsung member & reseller baru"
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                            Kode Klaim Voucher
                          </label>
                          <input
                            type="text"
                            value={voucher.code}
                            onChange={(e) =>
                              updateVoucher(vIdx as 0 | 1 | 2, {
                                code: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="TGIRESELLER20"
                            className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDIT 3 KARTU BENTO VISUAL */}
          {activeTab === 'bento' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-zinc-600">
                  Sesuaikan <strong>Kartu #1 (Latar Kuning Keunggulan)</strong> beserta poin keunggulannya, serta <strong>Kartu #2 & Kartu #3 (Latar Foto Tas Full-Cover)</strong> lengkap dengan upload foto latar:
                </p>
                <button
                  type="button"
                  onClick={() => toggleSectionVisibility('showPromoBento')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                    sectionVisibility.showPromoBento
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                  }`}
                >
                  {sectionVisibility.showPromoBento ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Section Bento Ditampilkan</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Section Bento Disembunyikan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {draft.bentoCards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between ${
                      idx === 0
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2.5">
                        <span className="font-mono text-xs font-extrabold uppercase text-zinc-900">
                          {idx === 0
                            ? 'KARTU #1 (KUNING KEUNGGULAN)'
                            : `KARTU #${idx + 1} (FOTO FULL-COVER)`}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-amber-400 font-mono text-[10px] font-bold">
                          {idx === 0 ? 'Kiri' : idx === 1 ? 'Tengah' : 'Kanan'}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Judul Besar Kartu #{idx + 1} (Uppercase)
                        </label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              title: e.target.value,
                            })
                          }
                          placeholder={
                            idx === 0
                              ? 'KENAPA HARUS BELI DI WEBSITE TGI?'
                              : idx === 1
                              ? 'NEW ARRIVAL BACKPACK'
                              : 'PICKUP DI GUDANG TGI'
                          }
                          className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      {idx === 0 ? (
                        <div>
                          <label className="block text-xs font-bold text-zinc-800 mb-1">
                            Daftar Poin Keunggulan (1 Poin per Baris)
                          </label>
                          <textarea
                            rows={4}
                            value={
                              Array.isArray(card.bulletPoints) &&
                              card.bulletPoints.length > 0
                                ? card.bulletPoints.join('\n')
                                : 'Harga Grosir Tangan Pertama Langsung Gudang\nJaminan Retur 100% Jika Cacat Pabrik\nBebas Campur SKU Mulai 6 Pcs Otomatis Grosir'
                            }
                            onChange={(e) => {
                              const lines = e.target.value.split('\n');
                              updateBentoCard(0, {
                                bulletPoints: lines,
                                description: lines.filter(Boolean).join(' • '),
                              });
                            }}
                            placeholder="Ketik 1 keunggulan per baris..."
                            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              Subteks / Deskripsi Singkat Kartu #{idx + 1}
                            </label>
                            <textarea
                              rows={2}
                              value={card.description}
                              onChange={(e) =>
                                updateBentoCard(idx as 0 | 1 | 2, {
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2 pt-1">
                            <label className="block text-xs font-bold text-zinc-800">
                              Foto Latar Full-Cover Kartu #{idx + 1}
                            </label>
                            <div className="relative h-28 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-300">
                              <img
                                src={
                                  card.imageUri ||
                                  createBentoCardCoverSvg(
                                    idx === 1
                                      ? 'new-arrival-backpack'
                                      : 'pickup-gudang'
                                  )
                                }
                                alt={`Preview Kartu ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-center"
                              />
                              <div className="absolute inset-0 bg-zinc-950/45 flex items-end p-2.5">
                                <span className="font-display text-sm font-black uppercase text-white leading-none">
                                  {card.title}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={card.imageUri || ''}
                                onChange={(e) =>
                                  updateBentoCard(idx as 0 | 1 | 2, {
                                    imageUri: e.target.value,
                                  })
                                }
                                placeholder="Tempel URL foto atau klik Upload..."
                                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                              />
                              <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer shrink-0">
                                <Upload className="w-3.5 h-3.5 text-amber-400" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleBentoImageUpload(idx as 1 | 2, e)
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateBentoCard(idx as 0 | 1 | 2, {
                                    imageUri: createBentoCardCoverSvg(
                                      idx === 1
                                        ? 'new-arrival-backpack'
                                        : 'pickup-gudang'
                                    ),
                                  })
                                }
                                className="px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[10px] font-bold cursor-pointer"
                              >
                                Reset Foto Studio Default
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Label Badge Pojok Kiri Atas
                        </label>
                        <input
                          type="text"
                          value={card.badgeText}
                          onChange={(e) =>
                            updateBentoCard(idx as 0 | 1 | 2, {
                              badgeText: e.target.value,
                            })
                          }
                          placeholder="Contoh: KOLEKSI BARU"
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

          {/* TAB 3: MANAJEMEN DETAIL PRODUK (MODEL, HARGA, BERAT KARGO & GAMBAR REAL-PIC) */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              {/* Top Controls Bar */}
              <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      TERHUBUNG LANGSUNG DENGAN KALKULATOR ONGKIR KARGO KERANJANG
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white">
                    TABEL EDIT CEPAT PRODUK: SKU, HARGA ECER/GROSIR, STOK, BERAT (GRAM) & GAMBAR
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ubah langsung di baris tabel di bawah ini. Setiap perubahan langsung tersimpan ke localStorage dan sinkron ke Supabase.
                  </p>
                </div>

                {onOpenAddProductModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddProductModal();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ Tambah Produk Baru</span>
                  </button>
                )}
              </div>

              {/* Search & Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari kode SKU, nama tas, atau kategori..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600 font-mono">
                  <span>
                    Total Produk: <strong className="text-zinc-950">{products.length} SKU</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Ditampilkan: <strong className="text-zinc-950">{filteredTableProducts.length} SKU</strong>
                  </span>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="p-10 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
                  <Package className="w-10 h-10 text-zinc-400 mx-auto" />
                  <h4 className="font-display text-base font-bold text-zinc-900 uppercase">
                    Belum Ada Produk di Database
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Tabel produk saat ini masih kosong. Klik tombol di bawah untuk menambahkan produk tas pertama Anda.
                  </p>
                  {onOpenAddProductModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAddProductModal();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 text-amber-400 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Produk Pertama</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto border border-zinc-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-950 text-white font-mono text-[10px] uppercase">
                        <th className="py-3 px-3 border-b border-zinc-800 w-48">
                          Foto Real-Pic & URL
                        </th>
                        <th className="py-3 px-3 border-b border-zinc-800 min-w-[200px]">
                          Kode SKU & Nama Model
                        </th>
                        <th className="py-3 px-2.5 border-b border-zinc-800 w-36">
                          Kategori
                        </th>
                        <th className="py-3 px-2.5 border-b border-zinc-800 w-32">
                          Harga Eceran (Rp)
                        </th>
                        <th className="py-3 px-2.5 border-b border-zinc-800 w-32">
                          Harga Grosir (Rp)
                        </th>
                        <th className="py-3 px-2.5 border-b border-zinc-800 w-24">
                          Stok (Pcs)
                        </th>
                        <th className="py-3 px-2.5 border-b border-zinc-800 w-36">
                          Berat / Tas (gram)
                        </th>
                        <th className="py-3 px-3 border-b border-zinc-800 text-right w-28">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                      {filteredTableProducts.map((prod) => {
                        const weightGram = prod.weightGrams || 400;
                        const dozenKg = ((weightGram * 12) / 1000).toFixed(1);
                        return (
                          <tr
                            key={prod.id}
                            className="hover:bg-zinc-50/80 transition-colors align-top"
                          >
                            {/* 1. Foto Real-Pic & URL */}
                            <td className="py-3 px-3">
                              <div className="flex items-start gap-2">
                                <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                                  <img
                                    src={
                                      prod.imageUrl ||
                                      createBagStudioSvg({
                                        variant: 'backpack-black',
                                        sku: prod.sku,
                                      })
                                    }
                                    alt={prod.sku}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={prod.imageUrl}
                                    onChange={(e) =>
                                      handleInlineProductChange(prod.id, {
                                        imageUrl: e.target.value,
                                      })
                                    }
                                    placeholder="URL Gambar https://..."
                                    className="w-full px-2 py-1 text-[11px] rounded border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                                  />
                                  <label className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold cursor-pointer">
                                    <Upload className="w-2.5 h-2.5 text-amber-400" />
                                    <span>Upload Foto</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleInlineProductImageUpload(
                                          prod.id,
                                          e
                                        )
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </td>

                            {/* 2. Kode SKU & Nama Model */}
                            <td className="py-3 px-3 space-y-1.5">
                              <input
                                type="text"
                                value={prod.sku}
                                onChange={(e) =>
                                  handleInlineProductChange(prod.id, {
                                    sku: e.target.value.toUpperCase(),
                                  })
                                }
                                placeholder="KODE-SKU"
                                className="w-full px-2 py-1 text-xs font-mono font-bold uppercase rounded border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-zinc-950 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) =>
                                  handleInlineProductChange(prod.id, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Nama Model Produk Tas..."
                                className="w-full px-2 py-1 text-xs font-medium rounded border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                              />
                            </td>

                            {/* 3. Kategori */}
                            <td className="py-3 px-2.5">
                              <select
                                value={prod.category}
                                onChange={(e) =>
                                  handleInlineProductChange(prod.id, {
                                    category: e.target.value as Exclude<
                                      ProductCategory,
                                      'Semua'
                                    >,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs font-semibold rounded border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                              >
                                {EDITABLE_PRODUCT_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* 4. Harga Eceran */}
                            <td className="py-3 px-2.5 space-y-1">
                              <input
                                type="number"
                                min={1000}
                                step={1000}
                                value={prod.salePrice}
                                onChange={(e) =>
                                  handleInlineProductChange(prod.id, {
                                    salePrice: Math.max(
                                      0,
                                      Number(e.target.value)
                                    ),
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                              />
                              <span className="block text-[10px] font-mono text-zinc-500">
                                {formatRupiah(prod.salePrice)}
                              </span>
                            </td>

                            {/* 5. Harga Grosir */}
                            <td className="py-3 px-2.5 space-y-1">
                              <input
                                type="number"
                                min={1000}
                                step={1000}
                                value={prod.wholesalePrice}
                                onChange={(e) =>
                                  handleInlineProductChange(prod.id, {
                                    wholesalePrice: Math.max(
                                      0,
                                      Number(e.target.value)
                                    ),
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded border border-emerald-400 bg-emerald-50/40 text-emerald-950 focus:border-zinc-950 focus:outline-none"
                              />
                              <span className="block text-[10px] font-mono text-emerald-700 font-semibold">
                                {formatRupiah(prod.wholesalePrice)}
                              </span>
                            </td>

                            {/* 6. Stok */}
                            <td className="py-3 px-2.5 space-y-1">
                              <input
                                type="number"
                                min={0}
                                value={prod.stock}
                                onChange={(e) =>
                                  handleInlineProductChange(prod.id, {
                                    stock: Math.max(0, Number(e.target.value)),
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                              />
                              <span
                                className={`block text-[10px] font-semibold ${
                                  prod.stock <= 0
                                    ? 'text-rose-600'
                                    : prod.stock <= 25
                                    ? 'text-amber-700'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {prod.stock <= 0
                                  ? 'Habis'
                                  : prod.stock <= 25
                                  ? 'Terbatas'
                                  : 'Ready'}
                              </span>
                            </td>

                            {/* 7. Estimasi Berat per Tas (gram) */}
                            <td className="py-3 px-2.5 space-y-1">
                              <div className="relative">
                                <input
                                  type="number"
                                  min={50}
                                  step={10}
                                  value={weightGram}
                                  onChange={(e) =>
                                    handleInlineProductChange(prod.id, {
                                      weightGrams: Math.max(
                                        50,
                                        Number(e.target.value) || 400
                                      ),
                                    })
                                  }
                                  className="w-full pl-2 pr-8 py-1.5 text-xs font-mono font-bold rounded border border-amber-400 bg-amber-50/40 text-zinc-950 focus:border-zinc-950 focus:outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500">
                                  gr
                                </span>
                              </div>
                              <span className="block text-[10px] font-mono text-zinc-500">
                                1 Lusin ≈ {dozenKg} kg
                              </span>
                            </td>

                            {/* 8. Aksi Detail / Hapus */}
                            <td className="py-3 px-3 text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                {onOpenEditProductModal && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onOpenEditProductModal(prod);
                                    }}
                                    title="Buka Modal Edit Lengkap (Galeri & Warna)"
                                    className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-950 text-zinc-700 hover:text-amber-400 transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {onDeleteProduct && (
                                  <>
                                    {confirmDeleteProdId !== prod.id ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteProdId(prod.id)
                                        }
                                        title="Hapus Produk"
                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <div className="inline-flex items-center gap-1 bg-rose-600 text-white px-2 py-1 rounded-lg">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onDeleteProduct(prod.id);
                                            setConfirmDeleteProdId(null);
                                          }}
                                          className="text-[10px] font-extrabold underline cursor-pointer"
                                        >
                                          Hapus
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setConfirmDeleteProdId(null)
                                          }
                                          className="text-[10px] opacity-80 hover:opacity-100 cursor-pointer"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MANAJEMEN MENU & ISI "PANDUAN RESELLER & SYARAT GROSIR" */}
          {activeTab === 'reseller-guide' && (
            <div className="space-y-6">
              {/* Header & Menu Label Config */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      EDITOR LENGKAP MODAL PANDUAN RESELLER, DROPSHIP & KARGO
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      1. PENGATURAN LABEL MENU, JUDUL & CATATAN PENGUMUMAN RESELLER
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Teks Tombol Menu di Navigasi & Footer
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.menuLabel}
                      onChange={(e) =>
                        updateResellerGuide({ menuLabel: e.target.value })
                      }
                      placeholder="Panduan Reseller & Syarat Grosir"
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-200 mb-1">
                      Judul Utama di Header Modal Panduan
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.headerTitle}
                      onChange={(e) =>
                        updateResellerGuide({ headerTitle: e.target.value })
                      }
                      placeholder="PANDUAN RESELLER, DROPSHIP & SYARAT GROSIR TGI"
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1">
                    Subjudul Header Modal Panduan
                  </label>
                  <input
                    type="text"
                    value={resellerGuide.headerSubtitle}
                    onChange={(e) =>
                      updateResellerGuide({ headerSubtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    Catatan Khusus / Rich-Text Pengumuman Reseller (Tampil di Bagian Atas Panduan)
                  </label>
                  <textarea
                    rows={3}
                    value={resellerGuide.customAnnouncement || ''}
                    onChange={(e) =>
                      updateResellerGuide({
                        customAnnouncement: e.target.value,
                      })
                    }
                    placeholder="Tuliskan pengumuman penting, syarat tambahan, atau info promo khusus mitra reseller & dropshipper..."
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-900 border border-amber-400/50 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 1 Editor: Syarat MOQ 6 Pcs */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                  <h4 className="font-display text-sm sm:text-base font-bold uppercase text-zinc-950">
                    2. Edit Bagian Syarat Grosir Pabrik (MOQ 6 Pcs)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Judul Bagian 01 (Syarat MOQ)
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.moqSectionTitle}
                      onChange={(e) =>
                        updateResellerGuide({ moqSectionTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Subjudul Bagian 01
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.moqSectionSubtitle}
                      onChange={(e) =>
                        updateResellerGuide({
                          moqSectionSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(resellerGuide.moqPoints || []).map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2"
                    >
                      <span className="font-mono text-[10px] font-bold text-amber-600 uppercase">
                        POIN SYARAT GROSIR #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={pt.title}
                        onChange={(e) =>
                          updateMoqPoint(idx, 'title', e.target.value)
                        }
                        placeholder="Judul Poin..."
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                      <textarea
                        rows={3}
                        value={pt.description}
                        onChange={(e) =>
                          updateMoqPoint(idx, 'description', e.target.value)
                        }
                        placeholder="Penjelasan poin syarat grosir..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2 Editor: Tahapan Dropship & Resi Otomatis */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                  <h4 className="font-display text-sm sm:text-base font-bold uppercase text-zinc-950">
                    3. Edit Tahapan Sistem Dropship & Resi Otomatis Marketplace
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Judul Bagian 02 (Dropship)
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.dropshipSectionTitle}
                      onChange={(e) =>
                        updateResellerGuide({
                          dropshipSectionTitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Subjudul Bagian 02
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.dropshipSectionSubtitle}
                      onChange={(e) =>
                        updateResellerGuide({
                          dropshipSectionSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(resellerGuide.dropshipSteps || []).map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-2"
                    >
                      <input
                        type="text"
                        value={st.stepLabel}
                        onChange={(e) =>
                          updateDropshipStep(idx, 'stepLabel', e.target.value)
                        }
                        className="w-full px-2 py-1 text-[11px] font-mono font-bold text-amber-700 rounded border border-zinc-200 bg-amber-50/40"
                      />
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) =>
                          updateDropshipStep(idx, 'title', e.target.value)
                        }
                        placeholder="Judul Langkah..."
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                      <textarea
                        rows={3}
                        value={st.description}
                        onChange={(e) =>
                          updateDropshipStep(idx, 'description', e.target.value)
                        }
                        placeholder="Deskripsi langkah..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Info Cut-Off Pengiriman Harian
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.dropshipCutoffNote}
                      onChange={(e) =>
                        updateResellerGuide({
                          dropshipCutoffNote: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Info Biaya Cetak & Packing
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.dropshipPackingNote}
                      onChange={(e) =>
                        updateResellerGuide({
                          dropshipPackingNote: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Info Ekspedisi Resi Otomatis
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.dropshipCouriersNote}
                      onChange={(e) =>
                        updateResellerGuide({
                          dropshipCouriersNote: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3 Editor: Tabel Estimasi Durasi & Tarif Kargo */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div>
                    <h4 className="font-display text-sm sm:text-base font-bold uppercase text-zinc-950 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>
                        4. Edit Tabel Estimasi Durasi & Tarif Ongkir Kargo Indonesia
                      </span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCargoRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Wilayah Kargo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Judul Bagian 03 (Tabel Kargo)
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.cargoSectionTitle}
                      onChange={(e) =>
                        updateResellerGuide({
                          cargoSectionTitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Subjudul Tabel Kargo
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.cargoSectionSubtitle}
                      onChange={(e) =>
                        updateResellerGuide({
                          cargoSectionSubtitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Badge Info Karung (Kanan Atas)
                    </label>
                    <input
                      type="text"
                      value={resellerGuide.cargoSackBadge}
                      onChange={(e) =>
                        updateResellerGuide({ cargoSackBadge: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white"
                    />
                  </div>
                </div>

                {/* Cargo Rows Table Editor */}
                <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-900 text-white font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-2.5">Zona Wilayah</th>
                        <th className="py-2.5 px-2.5">Kota Tujuan Utama</th>
                        <th className="py-2.5 px-2.5">Ekspedisi Lokal</th>
                        <th className="py-2.5 px-2.5">JTR / Dakota</th>
                        <th className="py-2.5 px-2.5">Indah Cargo</th>
                        <th className="py-2.5 px-2.5">Kisaran Tarif / Kg</th>
                        <th className="py-2.5 px-2 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {(resellerGuide.cargoTable || []).map((row, rIdx) => (
                        <tr key={row.id || rIdx} className="align-top">
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.region}
                              onChange={(e) =>
                                updateCargoRow(rIdx, { region: e.target.value })
                              }
                              className="w-full px-2 py-1 text-xs font-bold rounded border border-zinc-300"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.cities}
                              onChange={(e) =>
                                updateCargoRow(rIdx, { cities: e.target.value })
                              }
                              className="w-full px-2 py-1 text-xs rounded border border-zinc-300"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.ekspedisiLokal}
                              onChange={(e) =>
                                updateCargoRow(rIdx, {
                                  ekspedisiLokal: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-xs font-mono rounded border border-zinc-300"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.jtrDakota}
                              onChange={(e) =>
                                updateCargoRow(rIdx, {
                                  jtrDakota: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-xs font-mono rounded border border-zinc-300"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.indahCargo}
                              onChange={(e) =>
                                updateCargoRow(rIdx, {
                                  indahCargo: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-xs font-mono rounded border border-zinc-300"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.estRate}
                              onChange={(e) =>
                                updateCargoRow(rIdx, {
                                  estRate: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-zinc-300"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {(resellerGuide.cargoTable || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCargoRow(rIdx)}
                                className="p-1.5 rounded bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer"
                                title="Hapus baris wilayah"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Catatan Tips Hemat Ongkir Karung (Bawah Tabel)
                  </label>
                  <input
                    type="text"
                    value={resellerGuide.cargoTipsNote}
                    onChange={(e) =>
                      updateResellerGuide({ cargoTipsNote: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PENGATURAN LAYOUT & VISIBILITAS SECTION HALAMAN UTAMA */}
          {activeTab === 'layout' && (
            <div className="space-y-8">
              {/* Section Visibility Switches */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      KUSTOMISASI TATA LETAK & VISIBILITAS KOMPONEN HOMEPAGE
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      TAMPILKAN / SEMBUNYIKAN SECTION HALAMAN UTAMA
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(
                    [
                      {
                        key: 'showAnnouncementBar',
                        title: '1. Bar Pengumuman Atas',
                        desc: 'Bar teks info grosir di bagian paling atas navigasi.',
                      },
                      {
                        key: 'showVoucherBar',
                        title: '2. Bar 3 Voucher Grosir',
                        desc: 'Deretan 3 kartu klaim kode kupon di atas banner.',
                      },
                      {
                        key: 'showHeroBanner',
                        title: '3. Slide Hero Banner Utama',
                        desc: 'Banner promosi besar dengan tombol CTA kategori.',
                      },
                      {
                        key: 'showPromoBento',
                        title: '4. Kartu Keunggulan (Bento Grid)',
                        desc: '3 kartu informasi keunggulan & pickup gudang TGI.',
                      },
                      {
                        key: 'showLiveShopping',
                        title: '5. TGI Live Shopping Studio',
                        desc: 'Banner promosi live streaming TikTok & Shopee Live.',
                      },
                      {
                        key: 'showCustomerReviews',
                        title: '6. Ulasan Mitra Reseller',
                        desc: 'Section testimoni & rating asli pembeli partai besar.',
                      },
                    ] as Array<{
                      key: keyof SectionVisibilityConfig;
                      title: string;
                      desc: string;
                    }>
                  ).map((sec) => {
                    const isVisible = sectionVisibility[sec.key];
                    return (
                      <div
                        key={sec.key}
                        onClick={() => toggleSectionVisibility(sec.key)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isVisible
                            ? 'bg-zinc-900 border-amber-400/60'
                            : 'bg-zinc-900/40 border-zinc-800 opacity-75'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">
                            {sec.title}
                          </span>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            {sec.desc}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-extrabold shrink-0 inline-flex items-center gap-1 ${
                            isVisible
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {isVisible ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>TAMPIL</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>HIDDEN</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid & Image Aspect Ratio Settings */}
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
                              applyDraftUpdate((prev) => ({
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
                              applyDraftUpdate((prev) => ({
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
                              applyDraftUpdate((prev) => ({
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
            </div>
          )}

          {/* TAB 6: LIVE STREAMING (TIKTOK LIVE & SHOPEE LIVE) */}
          {activeTab === 'live' && draft.liveShopping && (
            <div className="space-y-6">
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggleSectionVisibility('showLiveShopping')
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold cursor-pointer ${
                        sectionVisibility.showLiveShopping
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {sectionVisibility.showLiveShopping ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Section Live Tampil</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Section Live Disembunyikan</span>
                        </>
                      )}
                    </button>
                  </div>
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
                <div className="lg:col-span-7 space-y-4">
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

                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <label className="block text-xs font-bold text-zinc-800">
                      Banner Visual Promo Live Studio
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
                        LATAR STUDIO LIVE
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KONTAK & SOSIAL MEDIA PERUSAHAAN */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                        value={contactDraft.storeName}
                        onChange={(e) =>
                          applyContactUpdate((prev) => ({
                            ...prev,
                            storeName: e.target.value,
                          }))
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
                          applyContactUpdate((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
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
                        applyContactUpdate((prev) => ({
                          ...prev,
                          slogan: e.target.value,
                        }))
                      }
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
                        value={contactDraft.whatsappNumber}
                        onChange={(e) =>
                          applyContactUpdate((prev) => ({
                            ...prev,
                            whatsappNumber: e.target.value,
                          }))
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
                          applyContactUpdate((prev) => ({
                            ...prev,
                            operatingHours: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Alamat Lengkap Gudang / Kantor
                    </label>
                    <textarea
                      rows={2}
                      value={contactDraft.warehouseAddress}
                      onChange={(e) =>
                        applyContactUpdate((prev) => ({
                          ...prev,
                          warehouseAddress: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-5">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      2. Link Sosial Media & Marketplace
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Instagram (URL atau @username)
                      </label>
                      <input
                        type="text"
                        value={contactDraft.socialLinks.instagram}
                        onChange={(e) =>
                          applyContactUpdate((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              instagram: e.target.value,
                            },
                          }))
                        }
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
                          applyContactUpdate((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              tiktok: e.target.value,
                            },
                          }))
                        }
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
                            applyContactUpdate((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                shopeeUrl: e.target.value,
                              },
                            }))
                          }
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
                            applyContactUpdate((prev) => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                tokopediaUrl: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      3. Keamanan PIN Admin & Lokasi Tombol
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-200 mb-1">
                        PIN Akses Mode Admin
                      </label>
                      <input
                        type="text"
                        value={contactDraft.adminPin ?? '123456'}
                        onChange={(e) =>
                          applyContactUpdate((prev) => ({
                            ...prev,
                            adminPin: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 text-xs font-mono font-bold tracking-widest rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(contactDraft.hideAdminInHeader)}
                        onChange={(e) =>
                          applyContactUpdate((prev) => ({
                            ...prev,
                            hideAdminInHeader: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 mt-0.5 rounded accent-amber-400 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-white block">
                          Sembunyikan Tombol Admin dari Header Utama
                        </span>
                      </div>
                    </label>
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
                  <span>Reset Pengaturan Konten & Layout ke Default</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-300">
                  <span className="text-xs font-bold text-red-800">
                    Reset Banner, Kartu Info, Panduan & Layout ke Default?
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
                onClick={handleCancelChanges}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Sinkronkan Semua Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
