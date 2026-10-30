/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Database,
  RotateCcw,
  SlidersHorizontal,
  PackageOpen,
  X,
  Save,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Copy,
  Check,
  CloudUpload,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Palette,
  Mail,
  Clock,
  PhoneCall,
  ExternalLink,
  ShoppingBag,
  Pencil,
  Radio,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  CartItem,
  StoreConfig,
  UiContentConfig,
} from './types/product';
import {
  getLocalProducts,
  saveLocalProducts,
  resetLocalProducts,
  getStoreConfig,
  saveStoreConfig,
  resetStoreConfig,
  getUiContentConfig,
  saveUiContentConfig,
  resetUiContentConfig,
  SUPABASE_SQL_SCHEMA,
  syncProductsToSupabase,
} from './services/productService';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { PromoBentoGrid } from './components/PromoBentoGrid';
import {
  LiveShoppingSection,
  FloatingLiveWidget,
} from './components/LiveShoppingSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import {
  AdminAppearanceModal,
  AppearanceTab,
} from './components/AdminAppearanceModal';
import { STUDIO_PRESETS, createBagStudioSvg } from './utils/bagStudioSvg';
import {
  formatRupiah,
  calculateDiscountPercent,
  buildDirectWhatsAppUrl,
  resolveSocialUrl,
} from './utils/formatters';

type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'discount-desc';

const EDITABLE_CATEGORIES: Exclude<ProductCategory, 'Semua'>[] = [
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

export default function App() {
  // Catalog, Store & UI Content State (persisted in localStorage)
  const [products, setProducts] = useState<Product[]>(() => getLocalProducts());
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() =>
    getStoreConfig()
  );
  const [uiConfig, setUiConfig] = useState<UiContentConfig>(() =>
    getUiContentConfig()
  );

  // Filter & Search State
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Shopping Cart State (persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tgi_cart_items_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Quick View Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin Mode & Admin Modals State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] =
    useState<boolean>(false);
  const [appearanceInitialTab, setAppearanceInitialTab] =
    useState<AppearanceTab>('hero');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmResetInline, setConfirmResetInline] = useState<boolean>(false);

  // Admin Product Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] =
    useState<Exclude<ProductCategory, 'Semua'>>('Backpack');
  const [formNormalPrice, setFormNormalPrice] = useState<number>(245000);
  const [formSalePrice, setFormSalePrice] = useState<number>(139000);
  const [formWholesaleMinQty, setFormWholesaleMinQty] = useState<number>(6);
  const [formWholesalePrice, setFormWholesalePrice] = useState<number>(118000);
  const [formRating, setFormRating] = useState<number>(4.9);
  const [formStock, setFormStock] = useState<number>(100);
  const [formIsSale, setFormIsSale] = useState<boolean>(true);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formMaterial, setFormMaterial] = useState<string>('');
  const [formDimensions, setFormDimensions] = useState<string>('');
  const [formColors, setFormColors] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Store Settings & Supabase Sync State
  const [configDraft, setConfigDraft] = useState<StoreConfig>(storeConfig);
  const [syncState, setSyncState] = useState<{
    loading: boolean;
    ok?: boolean;
    message?: string;
  }>({ loading: false });
  const [copiedSql, setCopiedSql] = useState(false);

  // Persist products to localStorage whenever modified
  useEffect(() => {
    saveLocalProducts(products);
  }, [products]);

  // Persist UI & Content config to localStorage whenever modified
  useEffect(() => {
    saveUiContentConfig(uiConfig);
  }, [uiConfig]);

  // Persist Store & Contact config to localStorage whenever modified
  useEffect(() => {
    saveStoreConfig(storeConfig);
  }, [storeConfig]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tgi_cart_items_v1', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((item) => {
      const matchesCategory =
        activeCategory === 'Semua'
          ? true
          : activeCategory === 'Promo Grosir'
          ? item.category === 'Promo Grosir' || item.isPromoGrosir
          : item.category === activeCategory;

      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
      if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'discount-desc') {
        const discA = calculateDiscountPercent(a.normalPrice, a.salePrice);
        const discB = calculateDiscountPercent(b.normalPrice, b.salePrice);
        return discB - discA;
      }
      return 0;
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    color: string = product.colors?.[0] || 'Default',
    qtyToAdd: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          product,
          quantity: updated[existingIndex].quantity + qtyToAdd,
        };
        return updated;
      }
      return [...prev, { product, selectedColor: color, quantity: qtyToAdd }];
    });
    showToast(`${product.sku} ditambahkan ke Keranjang Belanja`);
  };

  const handleUpdateCartQty = (
    productId: string,
    color: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedColor === color) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string, color: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === color)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Admin Product Modal Initializer
  const openAddProductModal = () => {
    const randomCode = Math.floor(10000 + Math.random() * 89999);
    const defaultSku = `BP-TG-${randomCode}`;
    setEditingProduct(null);
    setFormName('');
    setFormSku(defaultSku);
    setFormCategory('Backpack');
    setFormNormalPrice(249000);
    setFormSalePrice(145000);
    setFormWholesaleMinQty(6);
    setFormWholesalePrice(122000);
    setFormRating(4.9);
    setFormStock(120);
    setFormIsSale(true);
    setFormImageUrl(
      createBagStudioSvg({
        variant: 'backpack-black',
        sku: defaultSku,
        accentLabel: 'NEW COLLECTION',
      })
    );
    setFormMaterial('Material Import Grade A + Hardware Anti-Karat');
    setFormDimensions('40 × 29 × 14 cm');
    setFormColors('Matte Black, Warm Taupe, Caramel');
    setFormDescription(
      'Tas import kualitas tangan pertama dari gudang TGI. Jahitan bartack rapi, material tebal, dan bergaransi retur 100%.'
    );
    setFormError('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormCategory(product.category);
    setFormNormalPrice(product.normalPrice);
    setFormSalePrice(product.salePrice);
    setFormWholesaleMinQty(product.wholesaleMinQty || 6);
    setFormWholesalePrice(product.wholesalePrice || product.salePrice);
    setFormRating(product.rating);
    setFormStock(product.stock);
    setFormIsSale(product.isSale);
    setFormImageUrl(product.imageUrl);
    setFormMaterial(product.material || '');
    setFormDimensions(product.dimensions || '');
    setFormColors((product.colors || ['Default']).join(', '));
    setFormDescription(product.description || '');
    setFormError('');
    setIsProductModalOpen(true);
  };

  const openAppearanceModal = (tab: AppearanceTab = 'hero') => {
    setAppearanceInitialTab(tab);
    setIsAppearanceModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) {
      setFormError('Nama Produk dan Kode SKU wajib diisi.');
      return;
    }
    if (formSalePrice <= 0) {
      setFormError('Harga Promo / Sale harus lebih dari Rp 0.');
      return;
    }

    const cleanSku = formSku.trim().toUpperCase();
    const parsedColors = formColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const finalImageUrl =
      formImageUrl.trim() ||
      createBagStudioSvg({
        variant:
          formCategory === 'Backpack'
            ? 'backpack-black'
            : formCategory === 'Handbag'
            ? 'handbag-taupe'
            : formCategory === 'Shoulder Bag'
            ? 'shoulder-caramel'
            : 'grosir-bundle',
        sku: cleanSku,
      });

    const newProductObj: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: cleanSku,
      name: formName.trim(),
      category: formCategory,
      normalPrice: Math.max(formNormalPrice, formSalePrice),
      salePrice: Number(formSalePrice),
      wholesaleMinQty: Math.max(1, Number(formWholesaleMinQty) || 6),
      wholesalePrice: Math.min(
        Number(formSalePrice),
        Number(formWholesalePrice) || Number(formSalePrice)
      ),
      rating: Math.min(5, Math.max(1, Number(formRating) || 4.9)),
      soldCount: editingProduct ? editingProduct.soldCount : 150,
      stock: Math.max(0, Number(formStock) || 0),
      isSale: formIsSale,
      isPromoGrosir:
        formCategory === 'Promo Grosir' ||
        Number(formWholesalePrice) < Number(formSalePrice),
      imageUrl: finalImageUrl,
      material: formMaterial.trim() || 'Material Import Grade A',
      dimensions: formDimensions.trim() || 'Ukuran Standar',
      weightGrams: editingProduct ? editingProduct.weightGrams : 600,
      colors: parsedColors.length > 0 ? parsedColors : ['Default'],
      description:
        formDescription.trim() ||
        'Koleksi tas import tangan pertama kualitas premium TGI.',
      updatedAt: new Date().toISOString(),
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? newProductObj : p))
      );
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === editingProduct.id
            ? { ...item, product: newProductObj }
            : item
        )
      );
      showToast(`Produk ${newProductObj.sku} berhasil diperbarui!`);
    } else {
      setProducts((prev) => [newProductObj, ...prev]);
      showToast(`Produk baru ${newProductObj.sku} berhasil ditambahkan!`);
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
    showToast(`Produk ${target?.sku || ''} telah dihapus dari katalog.`);
  };

  const handleResetCatalog = () => {
    const defaults = resetLocalProducts();
    const defaultUi = resetUiContentConfig();
    const defaultStore = resetStoreConfig();
    setProducts(defaults);
    setUiConfig(defaultUi);
    setStoreConfig(defaultStore);
    setConfirmResetInline(false);
    showToast('Katalog, tampilan & kontak dikembalikan ke pengaturan default.');
  };

  const handleSaveAppearanceAndContact = (
    newUiConfig: UiContentConfig,
    newStoreConfig: StoreConfig
  ) => {
    setUiConfig(newUiConfig);
    saveUiContentConfig(newUiConfig);
    setStoreConfig(newStoreConfig);
    saveStoreConfig(newStoreConfig);

    if (newStoreConfig.supabaseUrl && newStoreConfig.supabaseAnonKey) {
      syncProductsToSupabase(newStoreConfig, products, newUiConfig).catch(
        () => {}
      );
    }
    showToast('Pengaturan Tampilan, Konten & Kontak Perusahaan berhasil disimpan!');
  };

  const handleResetAppearanceAndContact = () => {
    const defaultUi = resetUiContentConfig();
    const defaultStore = resetStoreConfig();
    setUiConfig(defaultUi);
    setStoreConfig(defaultStore);
    showToast('Tampilan, Banner, Live Studio & Kontak direset ke Default!');
  };

  const handleQuickToggleLivePlatform = (platform: 'tiktok' | 'shopee') => {
    setUiConfig((prev) => {
      const nextLive = {
        ...prev.liveShopping,
        isTikTokLive:
          platform === 'tiktok'
            ? !prev.liveShopping.isTikTokLive
            : prev.liveShopping.isTikTokLive,
        isShopeeLive:
          platform === 'shopee'
            ? !prev.liveShopping.isShopeeLive
            : prev.liveShopping.isShopeeLive,
      };
      const nextConfig: UiContentConfig = {
        ...prev,
        liveShopping: nextLive,
        updatedAt: new Date().toISOString(),
      };
      saveUiContentConfig(nextConfig);
      if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
        syncProductsToSupabase(storeConfig, products, nextConfig).catch(
          () => {}
        );
      }
      const statusText =
        platform === 'tiktok'
          ? `TikTok Live: ${nextLive.isTikTokLive ? 'AKTIF (ON)' : 'MATI (OFF)'}`
          : `Shopee Live: ${nextLive.isShopeeLive ? 'AKTIF (ON)' : 'MATI (OFF)'}`;
      showToast(`Status ${statusText}`);
      return nextConfig;
    });
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreConfig(configDraft);
    saveStoreConfig(configDraft);
    setIsSettingsModalOpen(false);
    showToast('Konfigurasi Supabase & Toko berhasil disimpan!');
  };

  const handleSyncToSupabase = async () => {
    setSyncState({ loading: true });
    setStoreConfig(configDraft);
    saveStoreConfig(configDraft);
    const res = await syncProductsToSupabase(configDraft, products, uiConfig);
    setSyncState({ loading: false, ok: res.ok, message: res.message });
  };

  const desktopGridColsClass =
    uiConfig.catalogLayout.desktopColumns === 2
      ? 'lg:grid-cols-2'
      : uiConfig.catalogLayout.desktopColumns === 4
      ? 'lg:grid-cols-4'
      : 'lg:grid-cols-3';

  const floatingWhatsAppUrl = buildDirectWhatsAppUrl(storeConfig);

  // Active social & marketplace links
  const instagramUrl = resolveSocialUrl(
    'instagram',
    storeConfig.socialLinks?.instagram
  );
  const tiktokUrl = resolveSocialUrl('tiktok', storeConfig.socialLinks?.tiktok);
  const facebookUrl = resolveSocialUrl(
    'facebook',
    storeConfig.socialLinks?.facebook
  );
  const twitterUrl = resolveSocialUrl(
    'twitter',
    storeConfig.socialLinks?.twitter
  );
  const shopeeUrl = resolveSocialUrl(
    'shopee',
    storeConfig.socialLinks?.shopeeUrl
  );
  const tokopediaUrl = resolveSocialUrl(
    'tokopedia',
    storeConfig.socialLinks?.tokopediaUrl
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      {/* 1. Sticky Header (Erigo-Inspired Modern Storefront Bar) */}
      <Navbar
        storeName={storeConfig.storeName}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => {
          setIsAdminMode((prev) => {
            const next = !prev;
            showToast(
              next
                ? 'Admin Mode Aktif: Anda dapat mengedit produk, tampilan banner, & kontak.'
                : 'Admin Mode Dinonaktifkan.'
            );
            return next;
          });
        }}
        onOpenAddProduct={openAddProductModal}
        onOpenStoreSettings={() => {
          setConfigDraft(storeConfig);
          setSyncState({ loading: false });
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Admin Mode Active Control Banner */}
        {isAdminMode && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            <div className="rounded-2xl bg-zinc-950 text-white p-4 sm:p-5 border border-amber-400/50 shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                    PANEL MANAJEMEN ADMIN AKTIF (TERSIMPAN OTOMATIS DI LOCALSTORAGE)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300">
                  Kelola katalog produk, ubah gambar/teks Hero Banner, edit 3 kartu keunggulan, atur layout katalog, atau ubah Kontak & Sosial Media perusahaan secara langsung.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Tambah Produk Baru</span>
                </button>

                {/* Tombol Pengaturan Tampilan & Konten */}
                <button
                  type="button"
                  onClick={() => openAppearanceModal('hero')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-amber-500 stroke-[2.2]" />
                  <span>Pengaturan Tampilan & Konten</span>
                </button>

                {/* Shortcut Langsung ke Tab Live Streaming */}
                <button
                  type="button"
                  onClick={() => openAppearanceModal('live')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Live Streaming</span>
                  {(uiConfig.liveShopping?.isTikTokLive ||
                    uiConfig.liveShopping?.isShopeeLive) && (
                    <span className="px-1.5 py-0.5 rounded bg-white text-red-600 font-mono text-[10px] font-extrabold">
                      ON
                    </span>
                  )}
                </button>

                {/* Shortcut Langsung ke Tab Kontak & Sosial Media Perusahaan */}
                <button
                  type="button"
                  onClick={() => openAppearanceModal('contact')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold border border-zinc-700 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Kontak & Sosmed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfigDraft(storeConfig);
                    setSyncState({ loading: false });
                    setIsSettingsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-semibold border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Database Supabase</span>
                </button>

                {!confirmResetInline ? (
                  <button
                    type="button"
                    onClick={() => setConfirmResetInline(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/80 text-zinc-300 hover:text-red-300 text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-red-950 px-3 py-1.5 rounded-xl border border-red-500">
                    <span className="text-xs text-red-200 font-semibold">
                      Reset semua ke awal?
                    </span>
                    <button
                      type="button"
                      onClick={handleResetCatalog}
                      className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetInline(false)}
                      className="px-2 py-1 text-xs text-zinc-300 hover:text-white cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2. Hero Banner Slider (Dynamic Slides & Overlay Opacity) */}
        <HeroSlider
          slides={uiConfig.heroSlides}
          onExploreCategory={setActiveCategory}
          isAdminMode={isAdminMode}
          onEditBanner={() => openAppearanceModal('hero')}
        />

        {/* 3. Promo Bento Grid (Dynamic 3 Kartu Informasi) */}
        <PromoBentoGrid
          cards={uiConfig.bentoCards}
          storeConfig={storeConfig}
          onSelectCategory={setActiveCategory}
          isAdminMode={isAdminMode}
          onEditBento={() => openAppearanceModal('bento')}
        />

        {/* 3.5. TGI Live Shopping Studio Banner (TikTok Live & Shopee Live) */}
        <LiveShoppingSection
          liveConfig={uiConfig.liveShopping}
          isAdminMode={isAdminMode}
          onEditLiveConfig={() => openAppearanceModal('live')}
          onQuickTogglePlatform={handleQuickToggleLivePlatform}
        />

        {/* 4. Dynamic Product Catalog Section */}
        <section
          id="katalog-produk"
          aria-label="Katalog Produk Tas Grosir Import"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6"
        >
          {/* Catalog Header & Filter/Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                OFFICIAL CATALOG · TANGAN PERTAMA GUDANG TGI
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight mt-0.5">
                {activeCategory === 'Semua'
                  ? 'SEMUA KOLEKSI TAS IMPORT'
                  : `KOLEKSI ${activeCategory.toUpperCase()}`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => openAppearanceModal('layout')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>
                    Layout: {uiConfig.catalogLayout.desktopColumns} Kolom ·{' '}
                    {uiConfig.catalogLayout.imageAspectRatio}
                  </span>
                </button>
              )}

              <span className="text-xs text-zinc-500 font-mono tabular-nums">
                Menampilkan <strong>{filteredProducts.length}</strong> dari{' '}
                {products.length} SKU
              </span>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs font-semibold text-zinc-600"
                >
                  Urutkan:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-900 focus:border-zinc-950 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Unggulan & Terbaru</option>
                  <option value="price-asc">Harga Promo: Terendah</option>
                  <option value="price-desc">Harga Promo: Tertinggi</option>
                  <option value="discount-desc">Diskon Terbesar</option>
                  <option value="rating-desc">Rating Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Search / Filter Indicator */}
          {(searchQuery.trim() !== '' || activeCategory !== 'Semua') && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-100 px-4 py-2.5 rounded-xl text-xs text-zinc-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Filter Aktif:</span>
                <strong className="text-zinc-950">
                  Kategori: {activeCategory}
                </strong>
                {searchQuery.trim() && (
                  <>
                    <span>·</span>
                    <strong className="text-zinc-950">
                      Pencarian: "{searchQuery}"
                    </strong>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('Semua');
                  setSearchQuery('');
                }}
                className="font-semibold text-zinc-900 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Product Grid (Dynamic 2, 3, or 4 Columns Desktop) */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl bg-white border border-zinc-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <PackageOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-xl font-bold text-zinc-900">
                  PRODUK TIDAK DITEMUKAN
                </h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  Tidak ada tas dengan nama atau kode SKU yang cocok dengan pencarian Anda.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('Semua');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                >
                  Tampilkan Semua Produk
                </button>
                {isAdminMode && (
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-bold hover:bg-amber-300 cursor-pointer"
                  >
                    + Tambah Produk Baru
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${desktopGridColsClass} gap-6 sm:gap-8`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdminMode={isAdminMode}
                  imageAspectRatio={uiConfig.catalogLayout.imageAspectRatio}
                  imageObjectFit={uiConfig.catalogLayout.imageObjectFit}
                  onAddToCart={(prod, color) => handleAddToCart(prod, color, 1)}
                  onQuickView={(prod) => setSelectedProduct(prod)}
                  onEditProduct={openEditProductModal}
                  onDeleteProduct={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modern Integrated Storefront Footer (Connected to Company Contact & Social Media Config) */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {isAdminMode && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openAppearanceModal('contact')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Kontak, Alamat & Sosial Media Perusahaan</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Column 1: Brand, Slogan, Address, Email & Operating Hours */}
            <div className="md:col-span-5 space-y-4">
              <span className="font-display text-2xl font-bold text-white tracking-tight block uppercase">
                {storeConfig.storeName || 'TAS GROSIR IMPORT'}
              </span>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                {storeConfig.slogan}
              </p>

              <div className="space-y-2.5 text-xs text-zinc-300 pt-1">
                {storeConfig.warehouseAddress && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{storeConfig.warehouseAddress}</span>
                  </div>
                )}

                {storeConfig.operatingHours && (
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{storeConfig.operatingHours}</span>
                  </div>
                )}

                {storeConfig.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <a
                      href={`mailto:${storeConfig.email}`}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {storeConfig.email}
                    </a>
                  </div>
                )}

                {storeConfig.whatsappNumber && (
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                    <a
                      href={floatingWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-semibold text-white hover:text-amber-400 transition-colors"
                    >
                      +{storeConfig.whatsappNumber.replace(/[^0-9]/g, '')} (WhatsApp Admin)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Social Media & Marketplace Links */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Sosial Media & Official Marketplace
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ikuti update katalog tas import terbaru dan kunjungi toko resmi kami di sosial media & marketplace:
              </p>

              <div className="flex flex-wrap gap-2">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 text-xs font-semibold border border-zinc-800 transition-colors"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 text-xs font-semibold border border-zinc-800 transition-colors"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 text-xs font-semibold border border-zinc-800 transition-colors"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 text-xs font-semibold border border-zinc-800 transition-colors"
                  >
                    <span>X / Twitter</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}

                {shopeeUrl && (
                  <a
                    href={shopeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-950/50 hover:bg-orange-900/60 text-orange-300 text-xs font-bold border border-orange-800/60 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Shopee Official</span>
                  </a>
                )}

                {tokopediaUrl && (
                  <a
                    href={tokopediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-800/60 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Tokopedia Official</span>
                  </a>
                )}
              </div>

              <div className="pt-2">
                <h4 className="text-[11px] font-mono uppercase text-zinc-500 mb-2">
                  Filter Kategori Cepat
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(
                    [
                      'Semua',
                      'Backpack',
                      'Handbag',
                      'Shoulder Bag',
                      'Promo Grosir',
                    ] as ProductCategory[]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        document
                          .getElementById('katalog-produk')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Direct WhatsApp Order & Cart Action */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Layanan Reseller & Grosir WA
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hubungi Admin Sales kami via WhatsApp untuk pemesanan partai besar, pengiriman kargo, atau jadwal pickup gudang:
              </p>

              <a
                href={floatingWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp Admin</span>
              </a>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buka Keranjang ({totalCartCount} pcs)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            © {new Date().getFullYear()} {storeConfig.storeName}. Hak Cipta Dilindungi.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Harga Grosir Tangan Pertama · Garansi Retur 100%</span>
          </span>
        </div>
      </footer>

      {/* Floating Live Badge Widget (Appears at bottom-left when TikTok/Shopee Live is ON) */}
      <FloatingLiveWidget liveConfig={uiConfig.liveShopping} />

      {/* Floating WhatsApp Button (Connected to Dynamic WhatsApp Number & Greeting Template) */}
      <a
        href={floatingWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Admin"
        title={`Hubungi WhatsApp ${storeConfig.storeName}`}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg border border-emerald-400/30 transition-transform hover:-translate-y-0.5 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 fill-white/15" />
        <span className="hidden sm:inline">Chat WA Grosir</span>
      </a>

      {/* 5. Slide-Out Cart Drawer & WhatsApp Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        storeConfig={storeConfig}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Product Quick View / Detail Modal (with Direct WA Order Button) */}
      <ProductDetailModal
        product={selectedProduct}
        storeConfig={storeConfig}
        isAdminMode={isAdminMode}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onEditProduct={openEditProductModal}
      />

      {/* Pengaturan Tampilan, Konten & Kontak Perusahaan Modal (4 Tabs) */}
      <AdminAppearanceModal
        isOpen={isAppearanceModalOpen}
        initialTab={appearanceInitialTab}
        uiConfig={uiConfig}
        storeConfig={storeConfig}
        onClose={() => setIsAppearanceModalOpen(false)}
        onSaveAll={handleSaveAppearanceAndContact}
        onResetAll={handleResetAppearanceAndContact}
      />

      {/* 6. Admin Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden border border-zinc-200 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div>
                <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  PANEL ADMIN TGI · EDIT BEBAS & SIMPAN OTOMATIS
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wide">
                  {editingProduct
                    ? `EDIT PRODUK: ${editingProduct.sku}`
                    : 'TAMBAH PRODUK TAS IMPORT BARU'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProductForm}
              className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Inputs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Kode SKU *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSku}
                        onChange={(e) =>
                          setFormSku(e.target.value.toUpperCase())
                        }
                        placeholder="BP-MY-00513"
                        className="w-full px-3 py-2 text-sm font-mono font-bold uppercase rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) =>
                          setFormCategory(
                            e.target.value as Exclude<ProductCategory, 'Semua'>
                          )
                        }
                        className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      >
                        {EDITABLE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Nama Produk (Beserta Kode SKU) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Tas Ransel Urban Waterproof BP-MY-00513"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Harga Normal (Coret)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={formNormalPrice}
                        onChange={(e) =>
                          setFormNormalPrice(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-950 mb-1">
                        Harga Promo / Sale *
                      </label>
                      <input
                        type="number"
                        required
                        min={1000}
                        step={1000}
                        value={formSalePrice}
                        onChange={(e) =>
                          setFormSalePrice(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-amber-400 bg-amber-50/40 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-800 mb-1">
                        Harga Grosir (≥{formWholesaleMinQty} pcs)
                      </label>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={formWholesalePrice}
                        onChange={(e) =>
                          setFormWholesalePrice(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm font-mono font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Rating Bintang
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formRating}
                        onChange={(e) => setFormRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Stok Gudang
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col justify-end pb-1">
                      <label className="inline-flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formIsSale}
                          onChange={(e) => setFormIsSale(e.target.checked)}
                          className="w-4 h-4 rounded accent-zinc-950"
                        />
                        <span>Badge SALE</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Varian Warna (Pisahkan Koma)
                      </label>
                      <input
                        type="text"
                        value={formColors}
                        onChange={(e) => setFormColors(e.target.value)}
                        placeholder="Matte Black, Taupe, Caramel"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Material Tas
                      </label>
                      <input
                        type="text"
                        value={formMaterial}
                        onChange={(e) => setFormMaterial(e.target.value)}
                        placeholder="Ballistic Nylon / PU Leather Grade A"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Deskripsi Produk
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Right Column: Photo URL, Upload & Studio Presets */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-100">
                    <div className="relative aspect-4/3 w-full bg-zinc-200">
                      <img
                        src={
                          formImageUrl ||
                          createBagStudioSvg({
                            variant: 'backpack-black',
                            sku: formSku || 'TGI-NEW',
                          })
                        }
                        alt="Preview Produk"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            createBagStudioSvg({
                              variant: 'backpack-black',
                              sku: formSku || 'TGI-NEW',
                            });
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 bg-white flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-zinc-800 truncate">
                        {formSku || 'SKU-BARU'}
                      </span>
                      <span className="font-mono font-bold text-zinc-950">
                        {formatRupiah(formSalePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700">
                      URL Foto Produk / Upload Gambar Lokal
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="Tempel URL foto https://... atau pilih preset"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Atau Pilih Render Studio TGI (1-Klik):</span>
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {STUDIO_PRESETS.map((preset) => {
                        const customUri = createBagStudioSvg({
                          variant: preset.id as Parameters<
                            typeof createBagStudioSvg
                          >[0]['variant'],
                          sku: formSku || 'TGI-PRO',
                        });
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormImageUrl(customUri)}
                            title={preset.label}
                            className="rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-950 transition-all p-0.5 bg-white cursor-pointer"
                          >
                            <img
                              src={preset.dataUri}
                              alt={preset.label}
                              className="w-full aspect-4/3 object-cover rounded"
                            />
                            <span className="block text-[10px] font-medium text-zinc-600 truncate px-1 py-0.5">
                              {preset.category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingProduct
                      ? 'Simpan Perubahan'
                      : 'Tambahkan ke Katalog'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Supabase Connection Modal */}
      {isSettingsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden border border-zinc-200 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-400" />
                <h2 className="font-display text-xl font-bold tracking-wide">
                  KONEKSI DATABASE SUPABASE & SINKRONISASI CLOUD
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveStoreSettings}
              className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto"
            >
              {/* Supabase Integration Box */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Integrasi Database Supabase (Siap Sambung)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Secara default seluruh perubahan produk, tampilan, & kontak disimpan di{' '}
                    <code className="font-mono font-bold text-zinc-800">
                      localStorage
                    </code>{' '}
                    agar tidak hilang saat di-refresh. Masukkan URL & Anon Key Supabase Anda di bawah untuk sinkronisasi ke cloud database.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={configDraft.supabaseUrl}
                      onChange={(e) =>
                        setConfigDraft({
                          ...configDraft,
                          supabaseUrl: e.target.value,
                        })
                      }
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Supabase Anon Public Key
                    </label>
                    <input
                      type="password"
                      value={configDraft.supabaseAnonKey}
                      onChange={(e) =>
                        setConfigDraft({
                          ...configDraft,
                          supabaseAnonKey: e.target.value,
                        })
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={syncState.loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CloudUpload className="w-4 h-4 text-amber-400" />
                    <span>
                      {syncState.loading
                        ? 'Menyinkronkan...'
                        : `Sinkronkan Produk, Tampilan & Kontak ke Supabase`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          SUPABASE_SQL_SCHEMA
                        );
                        setCopiedSql(true);
                        window.setTimeout(() => setCopiedSql(false), 2000);
                      } catch {
                        // ignore
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-semibold cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SQL Schema Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin SQL Tabel Supabase</span>
                      </>
                    )}
                  </button>
                </div>

                {syncState.message && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      syncState.ok
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {syncState.message}
                  </div>
                )}

                <details className="text-xs">
                  <summary className="font-semibold text-zinc-700 cursor-pointer hover:text-zinc-950">
                    Lihat Skema SQL Supabase (tgi_products & tgi_site_settings)
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto max-h-40">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </details>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Non-intrusive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 text-xs sm:text-sm font-medium">
          <span className="text-amber-400 font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
