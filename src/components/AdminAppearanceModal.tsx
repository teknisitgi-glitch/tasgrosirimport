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
  ClipboardList,
  ShieldCheck,
  Clock,
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
  CategoryItem,
  LiveShoppingConfig,
  ResellerGuideConfig,
  ResellerGuideCargoRow,
  SectionVisibilityConfig,
  BlogArticle,
  WholesalePopupConfig,
  AdminActivityLog,
  AdminActivityType,
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
  DEFAULT_WHOLESALE_POPUP_CONFIG,
  DEFAULT_CATEGORIES,
} from '../services/productService';
import { compressImageFileToDataUrl, formatRupiah } from '../utils/formatters';

export type AppearanceTab =
  | 'hero'
  | 'popup'
  | 'bento'
  | 'products'
  | 'categories'
  | 'reseller-guide'
  | 'articles'
  | 'layout'
  | 'live'
  | 'contact'
  | 'audit-log';

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
  articles?: BlogArticle[];
  onUpdateArticles?: (nextArticles: BlogArticle[]) => void;
  initialEditArticle?: BlogArticle | null;
  onPreviewWholesalePopup?: () => void;
  activityLogs?: AdminActivityLog[];
  onClearActivityLogs?: () => void;
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
  articles = [],
  onUpdateArticles,
  initialEditArticle = null,
  onPreviewWholesalePopup,
  activityLogs = [],
  onClearActivityLogs,
  onClose,
  onSaveAll,
  onLiveChange,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<AppearanceTab>(initialTab);
  const [auditFilter, setAuditFilter] = useState<'all' | AdminActivityType>('all');
  const [draft, setDraft] = useState<UiContentConfig>(uiConfig);
  const [contactDraft, setContactDraft] = useState<StoreConfig>(storeConfig);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>('');
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(
    null
  );

  // State for Manajemen Artikel
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState<string>('');
  const [artCategory, setArtCategory] = useState<string>('Strategi Bisnis');
  const [artPublishedAt, setArtPublishedAt] = useState<string>(() =>
    new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  );
  const [artReadTime, setArtReadTime] = useState<string>('4 Menit Baca');
  const [artAuthor, setArtAuthor] = useState<string>('Tim Edukasi Bisnis TGI');
  const [artExcerpt, setArtExcerpt] = useState<string>('');
  const [artContent, setArtContent] = useState<string>('');
  const [artImageUrl, setArtImageUrl] = useState<string>(() =>
    createHeroLookbookSvg(0)
  );
  const [confirmDeleteArticleId, setConfirmDeleteArticleId] = useState<
    string | null
  >(null);
  const [articleStatusMsg, setArticleStatusMsg] = useState<string | null>(null);

  // State for Manajemen Kategori
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatOriginalName, setEditingCatOriginalName] =
    useState<string>('');
  const [catName, setCatName] = useState<string>('');
  const [catDescription, setCatDescription] = useState<string>('');
  const [catBadge, setCatBadge] = useState<string>('');
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(
    null
  );
  const [categoryStatusMsg, setCategoryStatusMsg] = useState<string | null>(
    null
  );

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setEditingCatOriginalName('');
    setCatName('');
    setCatDescription('');
    setCatBadge('');
  };

  const loadCategoryIntoForm = (cat: CategoryItem) => {
    setEditingCatId(cat.id);
    setEditingCatOriginalName(cat.name);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatBadge(cat.badge || '');
    setCategoryStatusMsg(null);
  };

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtCategory('Strategi Bisnis');
    setArtPublishedAt(
      new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    );
    setArtReadTime('4 Menit Baca');
    setArtAuthor('Tim Edukasi Bisnis TGI');
    setArtExcerpt('');
    setArtContent('');
    setArtImageUrl(createHeroLookbookSvg(0));
  };

  const loadArticleIntoForm = (article: BlogArticle) => {
    setEditingArticleId(article.id);
    setArtTitle(article.title);
    setArtCategory(article.category || 'Strategi Bisnis');
    setArtPublishedAt(article.publishedAt || '12 Mei 2025');
    setArtReadTime(article.readTime || '4 Menit Baca');
    setArtAuthor(article.author || 'Tim Edukasi Bisnis TGI');
    setArtExcerpt(article.excerpt || '');
    setArtContent(article.content || '');
    setArtImageUrl(article.imageUrl || createHeroLookbookSvg(0));
    setArticleStatusMsg(null);
  };

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
      setArticleStatusMsg(null);
      setCategoryStatusMsg(null);
      resetCategoryForm();
      if (initialEditArticle) {
        loadArticleIntoForm(initialEditArticle);
      } else {
        resetArticleForm();
      }
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
    }
  }, [isOpen, initialTab, uiConfig, storeConfig, initialEditArticle]);

  if (!isOpen) return null;

  const draftCategories: CategoryItem[] =
    Array.isArray(draft.categories) && draft.categories.length > 0
      ? draft.categories
      : DEFAULT_CATEGORIES;
  const dynamicEditableCategoryNames: string[] = draftCategories.map(
    (c) => c.name
  );
  const dynamicTargetCategoryNames: string[] = [
    'Semua',
    ...dynamicEditableCategoryNames,
  ];

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

  // Wholesale Promo Popup Helper
  const wholesalePopup: WholesalePopupConfig = {
    ...DEFAULT_WHOLESALE_POPUP_CONFIG,
    ...(draft.wholesalePopup || {}),
    termsPoints:
      Array.isArray(draft.wholesalePopup?.termsPoints) &&
      draft.wholesalePopup.termsPoints.length > 0
        ? draft.wholesalePopup.termsPoints
        : DEFAULT_WHOLESALE_POPUP_CONFIG.termsPoints,
  };

  const updateWholesalePopup = (patch: Partial<WholesalePopupConfig>) => {
    applyDraftUpdate((prev) => ({
      ...prev,
      wholesalePopup: {
        ...DEFAULT_WHOLESALE_POPUP_CONFIG,
        ...(prev.wholesalePopup || {}),
        ...patch,
      },
    }));
  };

  const updateWholesalePopupPoint = (index: number, value: string) => {
    const nextPoints = [...wholesalePopup.termsPoints];
    nextPoints[index] = value;
    updateWholesalePopup({ termsPoints: nextPoints });
  };

  const handleAddWholesalePopupPoint = () => {
    updateWholesalePopup({
      termsPoints: [
        ...wholesalePopup.termsPoints,
        'Poin syarat & ketentuan grosir baru...',
      ],
    });
  };

  const handleRemoveWholesalePopupPoint = (index: number) => {
    if (wholesalePopup.termsPoints.length <= 1) return;
    updateWholesalePopup({
      termsPoints: wholesalePopup.termsPoints.filter((_, idx) => idx !== index),
    });
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
            onClick={() => setActiveTab('popup')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'popup'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
            <span>Pop-Up Promo Grosir</span>
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold ${
                wholesalePopup.enabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              {wholesalePopup.enabled ? 'ON' : 'OFF'}
            </span>
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
            onClick={() => setActiveTab('categories')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Manajemen Kategori ({draftCategories.length})</span>
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
            onClick={() => setActiveTab('articles')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-white text-zinc-950 border-amber-400 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Manajemen Artikel ({articles.length})</span>
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
            <span>Layout & Visibilitas</span>
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
            <span>Live Studio</span>
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
            <span>Kontak & PIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit-log')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'audit-log'
                ? 'bg-white text-zinc-950 border-emerald-500 shadow-2xs'
                : 'text-zinc-600 border-transparent hover:text-zinc-950'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
            <span>Log Aktivitas & Stok</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-extrabold">
              {activityLogs.length}
            </span>
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
                        {dynamicTargetCategoryNames.map((cat) => (
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

              {/* Quick Link Card to Pop-Up Banner Promo Grosir Editor */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-950">
                      Ingin Mengubah Teks Pop-Up Banner Promo Grosir?
                    </h4>
                    <p className="text-xs text-zinc-600">
                      Atur Judul Pop-Up, Deskripsi Penawaran, Poin Syarat Singkat, dan Teks Tombol WhatsApp secara real-time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('popup')}
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-400 font-bold text-xs cursor-pointer transition-colors shrink-0"
                >
                  Edit Teks Pop-Up Promo →
                </button>
              </div>
            </div>
          )}

          {/* TAB POP-UP: EDIT TEKS POP-UP BANNER PROMO GROSIR */}
          {activeTab === 'popup' && (
            <div className="space-y-6">
              {/* Top Header & Toggle Controls */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-extrabold uppercase tracking-wider">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>PENGATURAN POP-UP BANNER PROMO GROSIR (MODAL TENGAH)</span>
                  </div>
                  <p className="text-xs text-zinc-300 max-w-2xl">
                    Sesuaikan seluruh isi teks pada Pop-Up Promo Partai Besar. Setiap perubahan langsung tersimpan otomatis ke <strong>localStorage</strong> dan tersinkronisasi ke <strong>Supabase</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateWholesalePopup({ enabled: !wholesalePopup.enabled })
                    }
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-extrabold cursor-pointer transition-all ${
                      wholesalePopup.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {wholesalePopup.enabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>POP-UP OTOMATIS: AKTIF</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>POP-UP OTOMATIS: NONAKTIF</span>
                      </>
                    )}
                  </button>

                  {onPreviewWholesalePopup && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.setTimeout(() => onPreviewWholesalePopup(), 120);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tes Buka Pop-Up di Web</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      updateWholesalePopup(DEFAULT_WHOLESALE_POPUP_CONFIG)
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold cursor-pointer"
                    title="Kembalikan teks pop-up ke standar awal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 Columns: Form Inputs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-2">
                      A. Judul Banner & Deskripsi Penawaran
                    </h3>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Label Lencana Atas (Badge Text)
                      </label>
                      <input
                        type="text"
                        value={wholesalePopup.badgeText}
                        onChange={(e) =>
                          updateWholesalePopup({ badgeText: e.target.value })
                        }
                        placeholder="OFFICIAL B2B WHOLESALE · TANGAN PERTAMA"
                        className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Judul Utama Banner Pop-Up *
                      </label>
                      <input
                        type="text"
                        value={wholesalePopup.title}
                        onChange={(e) =>
                          updateWholesalePopup({ title: e.target.value })
                        }
                        placeholder="Pusat Grosir Tas Import Tangan Pertama — Harga Khusus Partai Besar & Reseller!"
                        className="w-full px-3.5 py-2 text-sm font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Deskripsi Penawaran Grosir
                      </label>
                      <textarea
                        rows={3}
                        value={wholesalePopup.description}
                        onChange={(e) =>
                          updateWholesalePopup({ description: e.target.value })
                        }
                        placeholder="Katalog website menampilkan harga satuan normal. Untuk pemilik toko, reseller aktif, dan pembelian partai besar..."
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Poin-Poin Syarat Singkat */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-900">
                        B. Poin-Poin Syarat Singkat Partai Besar
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddWholesalePopupPoint}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Tambah Poin Syarat</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Subjudul Kotak Syarat
                        </label>
                        <input
                          type="text"
                          value={wholesalePopup.termsBadgeText}
                          onChange={(e) =>
                            updateWholesalePopup({
                              termsBadgeText: e.target.value,
                            })
                          }
                          placeholder="SYARAT & KETENTUAN SINGKAT PARTAI BESAR"
                          className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Kalimat Kutipan Ringkas (Tagline Syarat)
                        </label>
                        <input
                          type="text"
                          value={wholesalePopup.termsTagline}
                          onChange={(e) =>
                            updateWholesalePopup({
                              termsTagline: e.target.value,
                            })
                          }
                          placeholder="Minimum order partai besar, bebas campur SKU & warna, garansi retur 100%"
                          className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-zinc-700">
                        Daftar Poin Syarat ({wholesalePopup.termsPoints.length} Poin)
                      </label>
                      {wholesalePopup.termsPoints.map((pt, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-8 flex items-center justify-center font-mono text-xs font-extrabold text-zinc-500 shrink-0">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={pt}
                            onChange={(e) =>
                              updateWholesalePopupPoint(idx, e.target.value)
                            }
                            placeholder={`Poin syarat ke-${idx + 1}...`}
                            className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                          />
                          {wholesalePopup.termsPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveWholesalePopupPoint(idx)
                              }
                              aria-label={`Hapus poin ${idx + 1}`}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teks Tombol WhatsApp & Pesan WA */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                    <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-2">
                      C. Teks Tombol WhatsApp & Tombol Tutup
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-1">
                          Teks Tombol Utama WhatsApp
                        </label>
                        <input
                          type="text"
                          value={wholesalePopup.whatsappButtonText}
                          onChange={(e) =>
                            updateWholesalePopup({
                              whatsappButtonText: e.target.value,
                            })
                          }
                          placeholder="Chat Admin Sales via WhatsApp"
                          className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-emerald-400 bg-emerald-50/40 focus:border-zinc-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Teks Tombol Tutup Bawah
                        </label>
                        <input
                          type="text"
                          value={wholesalePopup.closeButtonText}
                          onChange={(e) =>
                            updateWholesalePopup({
                              closeButtonText: e.target.value,
                            })
                          }
                          placeholder="Tutup & Lihat Katalog"
                          className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Template Pesan Saat Tombol WhatsApp Diklik (Gunakan{' '}
                        <code className="text-amber-700 font-mono">
                          {'{storeName}'}
                        </code>{' '}
                        untuk Nama Toko)
                      </label>
                      <textarea
                        rows={3}
                        value={wholesalePopup.whatsappMessageTemplate}
                        onChange={(e) =>
                          updateWholesalePopup({
                            whatsappMessageTemplate: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Live Card Modal Preview */}
                <div className="lg:col-span-5 space-y-2 lg:sticky lg:top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700">
                      Pratinjau Langsung Kartu Pop-Up (Real-Time)
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Ukuran Proporsional (max-w-lg)
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/65 backdrop-blur-md border border-zinc-300 shadow-inner">
                    <div className="rounded-2xl bg-zinc-950 text-white border border-white/15 ring-1 ring-amber-400/35 shadow-xl overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400" />
                      <div className="p-4 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950 relative">
                        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 flex items-center justify-center text-[10px]">
                          ✕
                        </span>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 font-mono text-[9px] font-extrabold uppercase tracking-wider mb-2">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          <span>{wholesalePopup.badgeText}</span>
                        </div>
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-white leading-snug pr-6">
                          {wholesalePopup.title}
                        </h4>
                        <p className="text-[11px] text-zinc-300 mt-1.5 leading-relaxed">
                          {wholesalePopup.description}
                        </p>
                      </div>

                      <div className="p-4 space-y-3 bg-zinc-950">
                        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                            <span className="font-mono text-[9px] font-extrabold uppercase text-amber-400">
                              {wholesalePopup.termsBadgeText}
                            </span>
                            <span className="font-mono text-[9px] text-emerald-300">
                              ● Import Original
                            </span>
                          </div>
                          {wholesalePopup.termsTagline && (
                            <p className="text-[10px] font-bold text-amber-200 italic">
                              “{wholesalePopup.termsTagline}”
                            </p>
                          )}
                          <ul className="space-y-1 text-[10px] text-zinc-300">
                            {wholesalePopup.termsPoints.map((pt, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-1.5">
                          <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white font-extrabold text-[10px] text-center">
                            {wholesalePopup.whatsappButtonText}
                          </span>
                          <span className="py-2 px-3 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-700 font-bold text-[10px] text-center">
                            {wholesalePopup.closeButtonText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                                    category: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs font-semibold rounded border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                              >
                                {Array.from(
                                  new Set([
                                    ...dynamicEditableCategoryNames,
                                    prod.category,
                                  ])
                                )
                                  .filter(Boolean)
                                  .map((cat) => (
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

          {/* TAB MANAJEMEN ARTIKEL & BLOG SEO */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Top Info Banner */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    MANAJEMEN ARTIKEL & BLOG EDUKASI RESELLER (SEO)
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    KELOLA ARTIKEL & TIPS BISNIS ({articles.length} ARTIKEL AKTIF)
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Tambah artikel baru, perbarui isi panduan bisnis, atau hapus artikel. Semua perubahan langsung tersimpan ke localStorage & tersinkronisasi ke Cloud Supabase.
                  </p>
                </div>
                {editingArticleId && (
                  <button
                    type="button"
                    onClick={resetArticleForm}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Buat Artikel Baru
                  </button>
                )}
              </div>

              {articleStatusMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{articleStatusMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArticleStatusMsg(null)}
                    className="text-emerald-700 hover:text-emerald-950 font-black px-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: Form Tambah / Edit Artikel */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                        {editingArticleId ? 'MODE EDIT ARTIKEL' : 'FORM ARTIKEL BARU'}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-zinc-950">
                        {editingArticleId
                          ? `Edit Artikel: ${artTitle || 'Tanpa Judul'}`
                          : 'Tambah Artikel & Tips Bisnis Baru'}
                      </h4>
                    </div>
                    {editingArticleId && (
                      <button
                        type="button"
                        onClick={resetArticleForm}
                        className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold cursor-pointer"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  {/* Judul Artikel */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Judul Artikel SEO *
                    </label>
                    <input
                      type="text"
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                      placeholder="Contoh: 5 Strategi Jualan Tas Import Laris Manis untuk Reseller Pemula"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  {/* Kategori, Tanggal & Estimasi Baca */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Kategori Artikel *
                      </label>
                      <input
                        type="text"
                        value={artCategory}
                        onChange={(e) => setArtCategory(e.target.value)}
                        placeholder="Strategi Bisnis"
                        className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Strategi Bisnis', 'Logistik & Kargo', 'Riset Produk', 'Tips Dropship'].map(
                          (presetCat) => (
                            <button
                              key={presetCat}
                              type="button"
                              onClick={() => setArtCategory(presetCat)}
                              className="px-2 py-0.5 rounded bg-zinc-200/80 hover:bg-amber-200 text-[10px] font-semibold text-zinc-700 cursor-pointer"
                            >
                              {presetCat}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Tanggal Posting
                      </label>
                      <input
                        type="text"
                        value={artPublishedAt}
                        onChange={(e) => setArtPublishedAt(e.target.value)}
                        placeholder="14 Mei 2025"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Estimasi Baca & Penulis
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={artReadTime}
                          onChange={(e) => setArtReadTime(e.target.value)}
                          placeholder="4 Menit Baca"
                          className="w-full px-2.5 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={artAuthor}
                          onChange={(e) => setArtAuthor(e.target.value)}
                          placeholder="Tim Edukasi TGI"
                          className="w-full px-2.5 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Singkat (Excerpt) */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Ringkasan Singkat (Tampil di Kartu Daftar Artikel) *
                    </label>
                    <textarea
                      rows={2}
                      value={artExcerpt}
                      onChange={(e) => setArtExcerpt(e.target.value)}
                      placeholder="Tuliskan 1-2 kalimat ringkasan menarik yang mengajak pengunjung mengklik Baca Selengkapnya..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  {/* Isi Artikel / Rich Text */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <label className="block text-xs font-bold text-zinc-800">
                        Isi Artikel Lengkap (Mendukung Paragraf, Subjudul ## & Poin - ) *
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setArtContent((prev) =>
                              `${prev ? `${prev}\n\n` : ''}## Subjudul Bagian Baru\n\nTuliskan penjelasan paragraf di sini...`
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-[10px] font-bold cursor-pointer"
                        >
                          + Subjudul (##)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setArtContent((prev) =>
                              `${prev ? `${prev}\n\n` : ''}- Poin penting pertama: Penjelasan singkat untuk mitra reseller.\n- Poin penting kedua: Tips tambahan agar margin tetap tebal.\n- Poin penting ketiga: Strategi pengiriman kargo hemat.`
                            )
                          }
                          className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold cursor-pointer"
                        >
                          + Daftar Poin Bullet (-)
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={artContent}
                      onChange={(e) => setArtContent(e.target.value)}
                      placeholder={`Tuliskan paragraf pembuka artikel di sini...\n\n## Subjudul Strategi Reseller\n\n- Poin pertama yang mudah dipahami\n- Poin kedua tentang pemilihan SKU tas import\n- Poin ketiga tentang ekspedisi kargo`}
                      className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none font-sans"
                    />
                  </div>

                  {/* URL Gambar Utama / Upload Banner Artikel */}
                  <div className="p-3.5 rounded-xl bg-white border border-zinc-200 space-y-3">
                    <label className="block text-xs font-bold text-zinc-800">
                      URL Gambar Utama / Banner Artikel
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4 h-24 rounded-xl bg-zinc-900 overflow-hidden border border-zinc-200">
                        <img
                          src={artImageUrl || createHeroLookbookSvg(0)}
                          alt="Preview Artikel"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = createHeroLookbookSvg(0);
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="sm:col-span-8 space-y-2">
                        <input
                          type="text"
                          value={artImageUrl}
                          onChange={(e) => setArtImageUrl(e.target.value)}
                          placeholder="https://... atau pilih foto dari perangkat"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-zinc-950 focus:outline-none"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>Upload Gambar Banner</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const compressed =
                                    await compressImageFileToDataUrl(
                                      file,
                                      1200,
                                      0.82
                                    );
                                  setArtImageUrl(compressed);
                                } catch {
                                  // ignore
                                }
                              }}
                            />
                          </label>
                          {[0, 1, 2].map((presetIdx) => (
                            <button
                              key={presetIdx}
                              type="button"
                              onClick={() =>
                                setArtImageUrl(
                                  createHeroLookbookSvg(presetIdx as 0 | 1 | 2)
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold cursor-pointer"
                            >
                              Ilustrasi #{presetIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button: Save New or Update Article */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    {editingArticleId && (
                      <button
                        type="button"
                        onClick={resetArticleForm}
                        className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 cursor-pointer"
                      >
                        Reset Form
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const cleanTitle = artTitle.trim();
                        const cleanExcerpt = artExcerpt.trim();
                        const cleanContent = artContent.trim();
                        if (!cleanTitle || !cleanContent) {
                          setArticleStatusMsg(
                            'Mohon lengkapi minimal Judul Artikel dan Isi Artikel terlebih dahulu.'
                          );
                          return;
                        }
                        const articlePayload: BlogArticle = {
                          id: editingArticleId || `art-${Date.now()}`,
                          title: cleanTitle,
                          category: artCategory.trim() || 'Strategi Bisnis',
                          publishedAt:
                            artPublishedAt.trim() ||
                            new Date().toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }),
                          readTime: artReadTime.trim() || '4 Menit Baca',
                          author: artAuthor.trim() || 'Tim Edukasi Bisnis TGI',
                          excerpt:
                            cleanExcerpt ||
                            cleanContent.replace(/^#+\s+/gm, '').slice(0, 150) +
                              '...',
                          content: cleanContent,
                          imageUrl:
                            artImageUrl.trim() || createHeroLookbookSvg(0),
                          updatedAt: new Date().toISOString(),
                        };

                        const nextArticles = editingArticleId
                          ? articles.map((a) =>
                              a.id === editingArticleId ? articlePayload : a
                            )
                          : [articlePayload, ...articles];

                        onUpdateArticles?.(nextArticles);
                        setArticleStatusMsg(
                          editingArticleId
                            ? `Artikel "${cleanTitle}" berhasil diperbarui & disimpan ke Cloud!`
                            : `Artikel baru "${cleanTitle}" berhasil diterbitkan & disimpan ke Cloud!`
                        );
                        resetArticleForm();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-amber-400 text-white hover:text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {editingArticleId
                          ? 'Simpan Perubahan Artikel'
                          : 'Terbitkan Artikel Baru'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right 5 Columns: Daftar Artikel Terbit */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
                      Daftar Artikel Terbit ({articles.length})
                    </h4>
                  </div>

                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {articles.map((art, idx) => {
                      const isBeingEdited = editingArticleId === art.id;
                      return (
                        <div
                          key={art.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isBeingEdited
                              ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                              : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={
                                art.imageUrl ||
                                createHeroLookbookSvg((idx % 3) as 0 | 1 | 2)
                              }
                              alt={art.title}
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = createHeroLookbookSvg(
                                  (idx % 3) as 0 | 1 | 2
                                );
                              }}
                              className="w-16 h-16 rounded-xl object-cover bg-zinc-900 shrink-0 border border-zinc-200"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-2 py-0.5 rounded bg-amber-400/30 text-amber-950 text-[10px] font-black uppercase">
                                  {art.category}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {art.publishedAt}
                                </span>
                              </div>
                              <h5 className="text-xs font-black text-zinc-900 line-clamp-2 leading-snug">
                                {art.title}
                              </h5>
                              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                                {art.excerpt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-zinc-100">
                            <button
                              type="button"
                              onClick={() => loadArticleIntoForm(art)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-400 text-white hover:text-zinc-950 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit Artikel</span>
                            </button>

                            {confirmDeleteArticleId === art.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = articles.filter(
                                      (a) => a.id !== art.id
                                    );
                                    onUpdateArticles?.(next);
                                    if (editingArticleId === art.id) {
                                      resetArticleForm();
                                    }
                                    setConfirmDeleteArticleId(null);
                                    setArticleStatusMsg(
                                      `Artikel "${art.title}" telah dihapus.`
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeleteArticleId(null)
                                  }
                                  className="px-2 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-bold cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteArticleId(art.id)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB MANAJEMEN KATEGORI PRODUK (SINKRONISASI REAL-TIME DROPDOWN & KATALOG) */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Top Info Banner */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    MANAJEMEN KATEGORI PRODUK · SINKRONISASI REAL-TIME DROPDOWN MENU & DATABASE
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    KELOLA DAFTAR KATEGORI TAS ({draftCategories.length} KATEGORI AKTIF)
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Tambah kategori baru (seperti Sling Bag, Wallet, Travel Bag, Tote Bag), ubah nama kategori, atau hapus kategori yang tidak terpakai. Perubahan langsung memperbarui menu dropdown "Kategori" di navigasi utama, filter katalog, serta tersimpan otomatis ke localStorage & Supabase.
                  </p>
                </div>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-black cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Kategori Baru
                  </button>
                )}
              </div>

              {categoryStatusMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{categoryStatusMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryStatusMsg(null)}
                    className="text-emerald-700 hover:text-emerald-950 font-black px-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 5 Columns: Form Tambah / Edit Kategori */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                        {editingCatId ? 'MODE EDIT KATEGORI' : 'FORM KATEGORI BARU'}
                      </span>
                      <h4 className="text-sm sm:text-base font-black text-zinc-950">
                        {editingCatId
                          ? `Edit Kategori: ${editingCatOriginalName}`
                          : 'Tambah Kategori Produk Baru'}
                      </h4>
                    </div>
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold cursor-pointer"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  {/* Quick Preset Chips for Fast Category Creation */}
                  {!editingCatId && (
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-bold text-zinc-600">
                        Preset Cepat Kategori Populer (Klik untuk Isi Otomatis):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            name: 'Sling Bag',
                            desc: 'Tas selempang ringkas harian wanita & pria import',
                            badge: 'Laris',
                          },
                          {
                            name: 'Wallet',
                            desc: 'Dompet kartu, dompet panjang & pouch koin kulit import',
                            badge: 'Margin Tinggi',
                          },
                          {
                            name: 'Travel Bag',
                            desc: 'Tas duffel & koper kabin lipat kapasitas besar',
                            badge: 'Kargo Hemat',
                          },
                          {
                            name: 'Tote Bag',
                            desc: 'Tas bahu kapasitas besar muat laptop & dokumen kerja',
                            badge: 'Best Seller',
                          },
                          {
                            name: 'Clutch Pesta',
                            desc: 'Tas genggam kondangan & pesta aksen kristal mewah',
                            badge: 'Premium',
                          },
                          {
                            name: 'Waist Bag',
                            desc: 'Tas pinggang & dada sporty tahan air untuk aktivitas harian',
                            badge: 'Baru',
                          },
                        ].map((preset) => {
                          const alreadyExists = draftCategories.some(
                            (c) =>
                              c.name.toLowerCase() === preset.name.toLowerCase()
                          );
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setCatName(preset.name);
                                setCatDescription(preset.desc);
                                setCatBadge(preset.badge);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                alreadyExists
                                  ? 'bg-zinc-100 text-zinc-400 border-zinc-200'
                                  : 'bg-white hover:bg-amber-50 text-zinc-800 border-zinc-300 hover:border-amber-400'
                              }`}
                            >
                              + {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Nama / Label Kategori *
                    </label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="Contoh: Sling Bag, Wallet, Travel Bag..."
                      className="w-full px-3.5 py-2 text-sm font-bold rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Deskripsi Singkat (Tampil di Dropdown Menu Kategori)
                    </label>
                    <textarea
                      rows={2}
                      value={catDescription}
                      onChange={(e) => setCatDescription(e.target.value)}
                      placeholder="Contoh: Koleksi tas selempang import bahan kulit & nilon anti-air"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Label Badge Kecil (Opsional)
                    </label>
                    <input
                      type="text"
                      value={catBadge}
                      onChange={(e) => setCatBadge(e.target.value)}
                      placeholder="Contoh: Populer, Baru, Best Seller, Hemat..."
                      className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const cleanName = catName.trim();
                        if (!cleanName) {
                          setCategoryStatusMsg(
                            'Nama kategori tidak boleh kosong.'
                          );
                          return;
                        }
                        if (cleanName.toLowerCase() === 'semua') {
                          setCategoryStatusMsg(
                            'Label "Semua" sudah dicadangkan untuk opsi Semua Katalog Produk.'
                          );
                          return;
                        }

                        const duplicate = draftCategories.find(
                          (c) =>
                            c.name.toLowerCase() === cleanName.toLowerCase() &&
                            c.id !== editingCatId
                        );
                        if (duplicate) {
                          setCategoryStatusMsg(
                            `Kategori "${cleanName}" sudah ada di dalam daftar.`
                          );
                          return;
                        }

                        const cleanDesc =
                          catDescription.trim() ||
                          `Koleksi produk ${cleanName} import tangan pertama`;
                        const cleanBadge = catBadge.trim() || undefined;

                        if (editingCatId) {
                          const nextCategories = draftCategories.map((c) =>
                            c.id === editingCatId
                              ? {
                                  ...c,
                                  name: cleanName,
                                  description: cleanDesc,
                                  badge: cleanBadge,
                                }
                              : c
                          );
                          applyDraftUpdate((prev) => ({
                            ...prev,
                            categories: nextCategories,
                            heroSlides: prev.heroSlides.map((s) =>
                              s.targetCategory === editingCatOriginalName
                                ? { ...s, targetCategory: cleanName }
                                : s
                            ),
                          }));

                          // Jika nama kategori berubah, perbarui juga seluruh produk yang memakai kategori lama
                          if (
                            editingCatOriginalName &&
                            editingCatOriginalName !== cleanName &&
                            onUpdateProducts
                          ) {
                            const updatedProds = products.map((p) =>
                              p.category === editingCatOriginalName
                                ? {
                                    ...p,
                                    category: cleanName,
                                    updatedAt: new Date().toISOString(),
                                  }
                                : p
                            );
                            onUpdateProducts(updatedProds);
                          }

                          setCategoryStatusMsg(
                            `Kategori "${editingCatOriginalName}" berhasil diperbarui menjadi "${cleanName}" & disinkronkan!`
                          );
                          resetCategoryForm();
                        } else {
                          const newCategory: CategoryItem = {
                            id: `cat-${Date.now()}`,
                            name: cleanName,
                            description: cleanDesc,
                            badge: cleanBadge,
                          };
                          const nextCategories = [
                            ...draftCategories,
                            newCategory,
                          ];
                          applyDraftUpdate((prev) => ({
                            ...prev,
                            categories: nextCategories,
                          }));
                          setCategoryStatusMsg(
                            `Kategori baru "${cleanName}" berhasil ditambahkan ke dropdown menu utama & database!`
                          );
                          resetCategoryForm();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-amber-400 text-white hover:text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>
                        {editingCatId
                          ? 'Simpan Perubahan Kategori'
                          : '+ Tambah Kategori'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Right 7 Columns: Tabel Daftar Kategori */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900">
                      Tabel Kategori Sistem ({draftCategories.length} Kategori)
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Otomatis tampil di tombol dropdown "Kategori"
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-zinc-200 rounded-2xl bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-950 text-white font-mono text-[10px] uppercase">
                          <th className="py-3 px-3 border-b border-zinc-800 w-10 text-center">
                            No
                          </th>
                          <th className="py-3 px-3 border-b border-zinc-800">
                            Nama Kategori & Deskripsi
                          </th>
                          <th className="py-3 px-3 border-b border-zinc-800 w-28 text-center">
                            Badge
                          </th>
                          <th className="py-3 px-3 border-b border-zinc-800 w-28 text-center">
                            Jumlah Produk
                          </th>
                          <th className="py-3 px-3 border-b border-zinc-800 w-40 text-right">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {draftCategories.map((cat, idx) => {
                          const prodCount =
                            cat.name === 'Promo Grosir'
                              ? products.filter(
                                  (p) =>
                                    p.category === 'Promo Grosir' ||
                                    p.isPromoGrosir
                                ).length
                              : products.filter((p) => p.category === cat.name)
                                  .length;
                          const isBeingEdited = editingCatId === cat.id;

                          return (
                            <tr
                              key={cat.id || cat.name}
                              className={`transition-colors ${
                                isBeingEdited
                                  ? 'bg-amber-50/70'
                                  : 'hover:bg-zinc-50'
                              }`}
                            >
                              <td className="py-3 px-3 text-center font-mono font-bold text-zinc-500">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3">
                                <p className="font-bold text-zinc-950 text-xs sm:text-sm">
                                  {cat.name}
                                </p>
                                <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                                  {cat.description}
                                </p>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {cat.badge ? (
                                  <span className="inline-block px-2 py-0.5 bg-zinc-950 text-amber-400 font-mono text-[10px] font-bold uppercase">
                                    {cat.badge}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-zinc-400">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="inline-block px-2.5 py-1 rounded-lg bg-zinc-100 font-mono text-xs font-bold text-zinc-900">
                                  {prodCount} SKU
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => loadCategoryIntoForm(cat)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-400 text-white hover:text-zinc-950 text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>

                                  {confirmDeleteCatId === cat.id ? (
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (draftCategories.length <= 1) {
                                            setCategoryStatusMsg(
                                              'Minimal harus terdapat 1 kategori aktif di dalam sistem.'
                                            );
                                            setConfirmDeleteCatId(null);
                                            return;
                                          }
                                          const nextCategories =
                                            draftCategories.filter(
                                              (c) => c.id !== cat.id
                                            );
                                          const fallbackCategory =
                                            nextCategories[0]?.name ||
                                            'Backpack';

                                          applyDraftUpdate((prev) => ({
                                            ...prev,
                                            categories: nextCategories,
                                          }));

                                          if (
                                            prodCount > 0 &&
                                            onUpdateProducts
                                          ) {
                                            const reassigned = products.map(
                                              (p) =>
                                                p.category === cat.name
                                                  ? {
                                                      ...p,
                                                      category:
                                                        fallbackCategory,
                                                      updatedAt:
                                                        new Date().toISOString(),
                                                    }
                                                  : p
                                            );
                                            onUpdateProducts(reassigned);
                                          }

                                          if (editingCatId === cat.id) {
                                            resetCategoryForm();
                                          }
                                          setConfirmDeleteCatId(null);
                                          setCategoryStatusMsg(
                                            prodCount > 0
                                              ? `Kategori "${cat.name}" dihapus & ${prodCount} produk dialihkan ke "${fallbackCategory}".`
                                              : `Kategori "${cat.name}" berhasil dihapus.`
                                          );
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                                      >
                                        Ya, Hapus
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteCatId(null)
                                        }
                                        className="px-2 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-bold cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmDeleteCatId(cat.id)
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Hapus</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: LOG AKTIVITAS ADMIN (AUDIT TRAIL) & MANAJEMEN STOK OTOMATIS */}
          {activeTab === 'audit-log' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>AUDIT TRAIL & REAL-TIME INVENTORY SYNC</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold">
                    Sistem Log Aktivitas Admin & Sinkronisasi Stok Gudang Otomatis
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                    Setiap penambahan ke keranjang, checkout pesanan WhatsApp, pembaruan stok produk, perubahan harga, atau publikasi artikel tercatat secara otomatis dan tersinkronisasi ke LocalStorage & Supabase.
                  </p>
                </div>

                {onClearActivityLogs && activityLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearActivityLogs}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-rose-600 text-zinc-200 hover:text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bersihkan Log</span>
                  </button>
                )}
              </div>

              {/* Real-Time Warehouse Stock Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold">
                    Total Model Katalog
                  </span>
                  <p className="font-mono text-2xl font-black text-zinc-950 mt-1">
                    {products.length} SKU
                  </p>
                  <span className="text-[11px] text-zinc-500">
                    Tersinkronisasi otomatis
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-mono uppercase text-emerald-800 font-bold">
                    Total Stok Aktual Gudang
                  </span>
                  <p className="font-mono text-2xl font-black text-emerald-900 mt-1">
                    {products
                      .reduce((acc, p) => acc + Math.max(0, p.stock || 0), 0)
                      .toLocaleString('id-ID')}{' '}
                    pcs
                  </p>
                  <span className="text-[11px] text-emerald-700">
                    Anti-overselling aktif
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[11px] font-mono uppercase text-amber-800 font-bold">
                    SKU Stok Terbatas (≤25 pcs)
                  </span>
                  <p className="font-mono text-2xl font-black text-amber-900 mt-1">
                    {products.filter((p) => p.stock > 0 && p.stock <= 25).length}{' '}
                    SKU
                  </p>
                  <span className="text-[11px] text-amber-800">
                    Perlu restock segera
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="text-[11px] font-mono uppercase text-rose-800 font-bold">
                    SKU Stok Habis (0 pcs)
                  </span>
                  <p className="font-mono text-2xl font-black text-rose-900 mt-1">
                    {products.filter((p) => p.stock <= 0).length} SKU
                  </p>
                  <span className="text-[11px] text-rose-700">
                    Otomatis terkunci di katalog
                  </span>
                </div>
              </div>

              {/* Quick Restock Panel for Low/Out-of-Stock Products */}
              {products.some((p) => p.stock <= 25) && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                      Peringatan Restock Gudang (SKU Stok ≤ 25 pcs)
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-amber-800">
                      Klik +50 Pcs untuk tambah stok instan
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {products
                      .filter((p) => p.stock <= 25)
                      .slice(0, 6)
                      .map((lowProd) => (
                        <div
                          key={lowProd.id}
                          className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-[10px] font-bold text-zinc-900 bg-amber-100 px-1.5 py-0.5 rounded">
                              {lowProd.sku}
                            </span>
                            <p className="text-xs font-bold text-zinc-900 truncate mt-0.5">
                              {lowProd.name}
                            </p>
                            <p className="font-mono text-[11px] text-rose-700 font-bold">
                              Sisa: {lowProd.stock} pcs
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleInlineProductChange(lowProd.id, {
                                stock: (lowProd.stock || 0) + 50,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-emerald-600 text-white font-mono text-[10px] font-extrabold shrink-0 transition-colors cursor-pointer"
                          >
                            +50 Pcs
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Activity Filter & Audit Trail Feed */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-700" />
                    <span>Riwayat Aktivitas Admin & Transaksi Stok Terbaru</span>
                  </h4>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'Semua' },
                        { id: 'stock', label: 'Stok & Inventori' },
                        { id: 'order-checkout', label: 'Checkout Pembeli' },
                        { id: 'product', label: 'Produk' },
                        { id: 'article', label: 'Artikel' },
                        { id: 'category', label: 'Kategori' },
                        { id: 'ui-popup', label: 'UI & Pop-Up' },
                        { id: 'auth', label: 'Sesi Admin' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAuditFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          auditFilter === f.id
                            ? 'bg-zinc-950 text-amber-400 border-zinc-950'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100 max-h-96 overflow-y-auto">
                  {activityLogs
                    .filter((l) =>
                      auditFilter === 'all' ? true : l.type === auditFilter
                    )
                    .map((log) => {
                      const badgeColors: Record<AdminActivityType, string> = {
                        stock: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        'order-checkout':
                          'bg-sky-100 text-sky-800 border-sky-200',
                        product:
                          'bg-amber-100 text-amber-900 border-amber-200',
                        article:
                          'bg-purple-100 text-purple-800 border-purple-200',
                        category:
                          'bg-indigo-100 text-indigo-800 border-indigo-200',
                        'ui-popup':
                          'bg-pink-100 text-pink-800 border-pink-200',
                        auth: 'bg-zinc-900 text-amber-300 border-zinc-800',
                      };
                      const formattedTime = new Date(
                        log.createdAt
                      ).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });
                      return (
                        <div
                          key={log.id}
                          className="p-3.5 hover:bg-zinc-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase border ${
                                  badgeColors[log.type] ||
                                  'bg-zinc-100 text-zinc-800 border-zinc-200'
                                }`}
                              >
                                {log.type}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-zinc-950">
                                {log.actionTitle}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              {log.details}
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0 font-mono text-[11px] text-zinc-500">
                            <p className="font-bold text-zinc-700">
                              {log.actor}
                            </p>
                            <p>{formattedTime}</p>
                          </div>
                        </div>
                      );
                    })}

                  {activityLogs.filter((l) =>
                    auditFilter === 'all' ? true : l.type === auditFilter
                  ).length === 0 && (
                    <div className="p-8 text-center text-xs text-zinc-500">
                      Belum ada catatan aktivitas untuk filter ini.
                    </div>
                  )}
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
