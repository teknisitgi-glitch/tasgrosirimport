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
  CloudDownload,
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
  Lock,
  Unlock,
  Scale,
  Trash2,
  EyeOff,
  Eye,
  Truck,
  Heart,
  Filter,
  BookOpen,
  Layers,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  CategoryItem,
  StockStatusLabel,
  CartItem,
  StoreConfig,
  UiContentConfig,
  CustomerReview,
  OrderRecord,
  BlogArticle,
  AdminActivityLog,
  AdminActivityType,
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
  getLocalReviews,
  saveLocalReviews,
  resetLocalReviews,
  getLocalOrders,
  saveLocalOrder,
  saveAllLocalOrders,
  getLocalArticles,
  saveLocalArticles,
  resetLocalArticles,
  getLocalActivityLogs,
  saveLocalActivityLogs,
  appendLocalActivityLog,
  clearLocalActivityLogs,
  DEFAULT_CATEGORIES,
  SUPABASE_SQL_SCHEMA,
  syncProductsToSupabase,
  deleteProductFromSupabase,
  fetchCloudBackupFromSupabase,
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
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import {
  AdminAppearanceModal,
  AppearanceTab,
} from './components/AdminAppearanceModal';
import { ResellerGuideModal } from './components/ResellerGuideModal';
import { WholesalePromoPopupModal } from './components/WholesalePromoPopupModal';
import { BlogSectionPage } from './components/BlogSectionPage';
import { STUDIO_PRESETS, createBagStudioSvg } from './utils/bagStudioSvg';
import {
  formatRupiah,
  calculateDiscountPercent,
  buildDirectWhatsAppUrl,
  cleanWhatsAppNumber,
  resolveSocialUrl,
  compressImageFileToDataUrl,
  getColorSwatchHex,
  getProductSizeOptions,
} from './utils/formatters';

type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'discount-desc'
  | 'savings-desc';

type PriceRangeFilter =
  | 'all'
  | 'under-135k'
  | '135k-165k'
  | 'above-165k';

type StockStatusFilter =
  | 'all'
  | 'bestseller-only'
  | 'ready-only'
  | 'limited-only'
  | 'wishlist-only';

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
  const [reviews, setReviews] = useState<CustomerReview[]>(() =>
    getLocalReviews()
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() => getLocalOrders());
  const [articles, setArticles] = useState<BlogArticle[]>(() =>
    getLocalArticles()
  );
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(() =>
    getLocalActivityLogs()
  );
  const [activeView, setActiveView] = useState<'catalog' | 'blog'>('catalog');
  const [selectedBlogArticle, setSelectedBlogArticle] =
    useState<BlogArticle | null>(null);
  const [adminEditingArticle, setAdminEditingArticle] =
    useState<BlogArticle | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<string>('');

  // Helper to append an Audit Trail entry and persist to localStorage
  const recordActivity = (
    type: AdminActivityType,
    actionTitle: string,
    details: string,
    actor: string = 'Admin Utama'
  ) => {
    const nextLogs = appendLocalActivityLog({
      type,
      actionTitle,
      details,
      actor,
    });
    setActivityLogs(nextLogs);
    return nextLogs;
  };

  // Filter & Search State
  const [activeCategory, setActiveCategory] =
    useState<ProductCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRangeFilter, setPriceRangeFilter] =
    useState<PriceRangeFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockStatusFilter>('all');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Wishlist State (persisted in localStorage)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      localStorage.removeItem('tgi_wishlist_ids_v1');
      const saved = localStorage.getItem('tgi_wishlist_ids_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Shopping Cart State (persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      localStorage.removeItem('tgi_cart_items_v1');
      const saved = localStorage.getItem('tgi_cart_items_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(false);

  // Quick View Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Admin Mode & Admin Modals State (persisted in localStorage so refresh keeps Admin Mode state)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tgi_admin_mode_v1') === 'true';
    } catch {
      return false;
    }
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] =
    useState<boolean>(false);
  const [appearanceInitialTab, setAppearanceInitialTab] =
    useState<AppearanceTab>('hero');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastShowCartBtn, setToastShowCartBtn] = useState<boolean>(false);
  const [toastKey, setToastKey] = useState<number>(0);
  const [toastCartMeta, setToastCartMeta] = useState<{
    productName: string;
    sku: string;
    colorLabel: string;
    sizeLabel: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string;
  } | null>(null);
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
  const [formStockStatus, setFormStockStatus] =
    useState<StockStatusLabel>('Ready Stock');
  const [formIsSale, setFormIsSale] = useState<boolean>(true);
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [formNewGalleryUrl, setFormNewGalleryUrl] = useState<string>('');
  const [formMaterial, setFormMaterial] = useState<string>('');
  const [formDimensions, setFormDimensions] = useState<string>('');
  const [formWeightGrams, setFormWeightGrams] = useState<number>(650);
  const [formColors, setFormColors] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Admin PIN / Passcode Protection Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showPinPassword, setShowPinPassword] = useState<boolean>(false);
  const [pinFailedAttempts, setPinFailedAttempts] = useState<number>(0);
  const [pendingAdminAction, setPendingAdminAction] = useState<
    (() => void) | null
  >(null);

  // Interactive "Tanya Stok / Live Chat" Floating WhatsApp Widget State
  const [isQuickChatOpen, setIsQuickChatOpen] = useState<boolean>(false);
  const [quickChatSku, setQuickChatSku] = useState<string>('');
  const [quickChatQty, setQuickChatQty] = useState<string>('12 - 24 Pcs (Grosir)');

  // Order & Cargo Resi Tracking Modal State
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  // Panduan Reseller & Syarat Grosir Modal State
  const [isResellerGuideOpen, setIsResellerGuideOpen] = useState<boolean>(false);
  // Automatic Wholesale Promo Banner Pop-Up State (Opens automatically on page load / refresh if enabled)
  const [isWholesalePromoOpen, setIsWholesalePromoOpen] = useState<boolean>(
    () => getUiContentConfig().wholesalePopup?.enabled !== false
  );

  // Store Settings & Supabase Sync State
  const [configDraft, setConfigDraft] = useState<StoreConfig>(storeConfig);
  const [syncState, setSyncState] = useState<{
    loading: boolean;
    ok?: boolean;
    message?: string;
  }>({ loading: false });
  const [copiedSql, setCopiedSql] = useState(false);

  // Automatically fetch live products, reviews, orders & settings from Supabase
  useEffect(() => {
    const url = storeConfig.supabaseUrl?.trim();
    const key = storeConfig.supabaseAnonKey?.trim();
    if (!url || !key) return;

    let isCancelled = false;
    setIsLoadingSupabase(true);

    fetchCloudBackupFromSupabase(storeConfig)
      .then((res) => {
        if (isCancelled || !res.ok) return;
        if (Array.isArray(res.products)) {
          setProducts(res.products);
          saveLocalProducts(res.products);
        }
        if (res.uiConfig) {
          setUiConfig(res.uiConfig);
          saveUiContentConfig(res.uiConfig);
        }
        if (Array.isArray(res.reviews)) {
          setReviews(res.reviews);
          saveLocalReviews(res.reviews);
        }
        if (Array.isArray(res.orders)) {
          setOrders(res.orders);
          saveAllLocalOrders(res.orders);
        }
        if (Array.isArray(res.articles) && res.articles.length > 0) {
          setArticles(res.articles);
          saveLocalArticles(res.articles);
        }
        if (Array.isArray(res.activityLogs) && res.activityLogs.length > 0) {
          setActivityLogs(res.activityLogs);
          saveLocalActivityLogs(res.activityLogs);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingSupabase(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [storeConfig.supabaseUrl, storeConfig.supabaseAnonKey]);

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

  // Persist articles to localStorage whenever modified
  useEffect(() => {
    saveLocalArticles(articles);
  }, [articles]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tgi_cart_items_v2', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Persist wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tgi_wishlist_ids_v2', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  // Persist Admin Mode state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tgi_admin_mode_v1', String(isAdminMode));
    } catch {
      // ignore
    }
  }, [isAdminMode]);

  const showToast = (
    msg: string,
    withCartButton: boolean = false,
    cartMeta: {
      productName: string;
      sku: string;
      colorLabel: string;
      sizeLabel: string;
      quantity: number;
      unitPrice: number;
      imageUrl: string;
    } | null = null
  ) => {
    setToastMessage(msg);
    setToastShowCartBtn(withCartButton);
    setToastCartMeta(cartMeta);
    setToastKey((prev) => prev + 1);
    window.setTimeout(() => {
      setToastMessage((prev) => {
        if (prev === msg) {
          setToastCartMeta(null);
          return null;
        }
        return prev;
      });
    }, 3600);
  };

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlistIds.includes(product.id);
    setWishlistIds((prev) =>
      exists ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
    showToast(
      exists
        ? `${product.name} dihapus dari Wishlist.`
        : `♥ ${product.name} disimpan ke Wishlist Anda!`
    );
  };

  // Dynamic Categories List (synced with uiConfig.categories & products)
  const dynamicCategories = useMemo<CategoryItem[]>(() => {
    const base =
      Array.isArray(uiConfig.categories) && uiConfig.categories.length > 0
        ? uiConfig.categories
        : DEFAULT_CATEGORIES;
    const map = new Map<string, CategoryItem>();
    base.forEach((cat) => {
      if (cat && cat.name && cat.name !== 'Semua') {
        map.set(cat.name, cat);
      }
    });
    // Ensure any custom category assigned to existing products is also represented
    products.forEach((p) => {
      const cName = (p.category || '').trim();
      if (cName && cName !== 'Semua' && !map.has(cName)) {
        map.set(cName, {
          id: `cat-prod-${cName.toLowerCase().replace(/\s+/g, '-')}`,
          name: cName,
          description: `Koleksi produk ${cName} import tangan pertama`,
        });
      }
    });
    return Array.from(map.values());
  }, [uiConfig.categories, products]);

  const editableCategoryNames = useMemo<string[]>(() => {
    const names = dynamicCategories.map((c) => c.name);
    return names.length > 0 ? names : EDITABLE_CATEGORIES;
  }, [dynamicCategories]);

  const productCountsByCategory = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    dynamicCategories.forEach((cat) => {
      if (cat.name === 'Promo Grosir') {
        counts[cat.name] = products.filter(
          (p) => p.category === 'Promo Grosir' || p.isPromoGrosir
        ).length;
      } else {
        counts[cat.name] = products.filter(
          (p) => p.category === cat.name
        ).length;
      }
    });
    return counts;
  }, [dynamicCategories, products]);

  // Reset activeCategory to 'Semua' if the selected category was deleted
  useEffect(() => {
    if (
      activeCategory !== 'Semua' &&
      !dynamicCategories.some((c) => c.name === activeCategory)
    ) {
      setActiveCategory('Semua');
    }
  }, [activeCategory, dynamicCategories]);

  // Extract unique available colors across products for Sidebar Color Filter
  const availableColors = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      (p.colors || []).forEach((raw) => {
        const clean = raw.trim();
        if (!clean) return;
        map.set(clean, (map.get(clean) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color, count]) => ({ color, count }));
  }, [products]);

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

      const matchesPrice =
        priceRangeFilter === 'all'
          ? true
          : priceRangeFilter === 'under-135k'
          ? item.salePrice <= 135000
          : priceRangeFilter === '135k-165k'
          ? item.salePrice > 135000 && item.salePrice <= 165000
          : item.salePrice > 165000;

      const matchesColor =
        selectedColorFilter === 'all'
          ? true
          : (item.colors || []).some(
              (c) => c.trim().toLowerCase() === selectedColorFilter.toLowerCase()
            );

      const resolvedStock: StockStatusLabel =
        item.stockStatus ||
        (item.stock <= 0
          ? 'Habis'
          : item.stock <= 25
          ? 'Stok Terbatas'
          : 'Ready Stock');
      const isItemLowStock =
        resolvedStock === 'Stok Terbatas' ||
        (item.stock > 0 && item.stock <= 15);
      const isItemBestSeller = Boolean(
        item.isPromoGrosir ||
          (typeof item.soldCount === 'number' && item.soldCount >= 750) ||
          item.rating >= 4.9
      );

      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'wishlist-only'
          ? wishlistIds.includes(item.id)
          : stockFilter === 'bestseller-only'
          ? isItemBestSeller
          : stockFilter === 'ready-only'
          ? resolvedStock === 'Ready Stock' && !isItemLowStock
          : isItemLowStock && resolvedStock !== 'Habis';

      return (
        matchesCategory &&
        matchesSearch &&
        matchesPrice &&
        matchesColor &&
        matchesStock
      );
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
      if (sortBy === 'savings-desc') {
        const savA = Math.max(0, a.salePrice - a.wholesalePrice);
        const savB = Math.max(0, b.salePrice - b.wholesalePrice);
        return savB - savA;
      }
      return 0;
    });
  }, [
    products,
    activeCategory,
    searchQuery,
    priceRangeFilter,
    selectedColorFilter,
    stockFilter,
    sortBy,
    wishlistIds,
  ]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Helper to mutate product stock in real-time and sync with localStorage/Supabase
  const adjustProductStockInCatalog = (
    adjustments: Array<{ productId: string; delta: number; soldDelta?: number }>
  ): Product[] => {
    let nextProductsSnapshot: Product[] = [];
    setProducts((prev) => {
      const next = prev.map((p) => {
        const adj = adjustments.find((a) => a.productId === p.id);
        if (!adj) return p;
        const nextStock = Math.max(0, (p.stock || 0) + adj.delta);
        const nextSold = Math.max(0, (p.soldCount || 0) + (adj.soldDelta || 0));
        const nextStatus: StockStatusLabel =
          nextStock <= 0
            ? 'Habis'
            : nextStock <= 25
            ? 'Stok Terbatas'
            : 'Ready Stock';
        return {
          ...p,
          stock: nextStock,
          soldCount: nextSold,
          stockStatus: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      });
      nextProductsSnapshot = next;
      saveLocalProducts(next);
      return next;
    });
    setSelectedProduct((prevSel) => {
      if (!prevSel) return null;
      const updatedMatch = nextProductsSnapshot.find(
        (p) => p.id === prevSel.id
      );
      return updatedMatch || prevSel;
    });
    return nextProductsSnapshot;
  };

  // Cart Handlers with Real-Time Inventory Sync (Prevents Overselling)
  const handleAddToCart = (
    product: Product,
    color: string = product.colors?.[0] || 'Default',
    qtyToAdd: number = 1,
    size?: string
  ) => {
    const liveProduct =
      products.find((p) => p.id === product.id) || product;
    if (liveProduct.stock <= 0) {
      showToast(
        `Maaf, stok gudang untuk ${liveProduct.sku} (${liveProduct.name}) saat ini habis.`
      );
      return;
    }

    const actualQty = Math.min(Math.max(1, qtyToAdd), liveProduct.stock);
    const defaultSizes = getProductSizeOptions(liveProduct);
    const resolvedSize =
      size || defaultSizes[1]?.code || defaultSizes[0]?.code || 'Medium (Standar)';

    // Deduct stock immediately in real-time to prevent overselling
    const nextProds = adjustProductStockInCatalog([
      { productId: liveProduct.id, delta: -actualQty },
    ]);
    const updatedProductRef =
      nextProds.find((p) => p.id === liveProduct.id) || {
        ...liveProduct,
        stock: Math.max(0, liveProduct.stock - actualQty),
      };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === liveProduct.id &&
          item.selectedColor === color &&
          (item.selectedSize || 'Medium (Standar)') === resolvedSize
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          product: updatedProductRef,
          selectedSize: resolvedSize,
          quantity: updated[existingIndex].quantity + actualQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product: updatedProductRef,
          selectedColor: color,
          selectedSize: resolvedSize,
          quantity: actualQty,
        },
      ];
    });

    recordActivity(
      'stock',
      `Reservasi Keranjang: ${liveProduct.sku} (-${actualQty} pcs)`,
      `Pembeli menambahkan ${actualQty} pcs ${liveProduct.name} (${color}) ke keranjang. Sisa stok aktual: ${updatedProductRef.stock} pcs.`,
      'Sistem Inventori'
    );

    showToast(
      `${liveProduct.sku} (${color} · ${resolvedSize}) masuk Keranjang! Sisa stok: ${updatedProductRef.stock} pcs`,
      true,
      {
        productName: liveProduct.name,
        sku: liveProduct.sku,
        colorLabel: color,
        sizeLabel: resolvedSize,
        quantity: actualQty,
        unitPrice: liveProduct.salePrice,
        imageUrl: liveProduct.imageUrl,
      }
    );
  };

  const handleAddBatchToCart = (
    product: Product,
    batchItems: Array<{ color: string; quantity: number }>,
    size?: string
  ) => {
    const liveProduct =
      products.find((p) => p.id === product.id) || product;
    if (liveProduct.stock <= 0) {
      showToast(
        `Maaf, stok gudang untuk ${liveProduct.sku} saat ini habis.`
      );
      return;
    }

    const validBatch = batchItems.filter((b) => b.quantity > 0);
    if (validBatch.length === 0) return;

    // Cap total batch quantity to available live stock to prevent overselling
    let remainingStockBudget = liveProduct.stock;
    const cappedBatch: Array<{ color: string; quantity: number }> = [];
    for (const entry of validBatch) {
      if (remainingStockBudget <= 0) break;
      const take = Math.min(entry.quantity, remainingStockBudget);
      if (take > 0) {
        cappedBatch.push({ color: entry.color, quantity: take });
        remainingStockBudget -= take;
      }
    }
    if (cappedBatch.length === 0) return;

    const totalAdded = cappedBatch.reduce((acc, b) => acc + b.quantity, 0);
    const defaultSizes = getProductSizeOptions(liveProduct);
    const resolvedSize =
      size || defaultSizes[1]?.code || defaultSizes[0]?.code || 'Medium (Standar)';

    const nextProds = adjustProductStockInCatalog([
      { productId: liveProduct.id, delta: -totalAdded },
    ]);
    const updatedProductRef =
      nextProds.find((p) => p.id === liveProduct.id) || {
        ...liveProduct,
        stock: Math.max(0, liveProduct.stock - totalAdded),
      };

    setCartItems((prev) => {
      const updated = [...prev];
      cappedBatch.forEach(({ color, quantity }) => {
        const existingIndex = updated.findIndex(
          (item) =>
            item.product.id === liveProduct.id &&
            item.selectedColor === color &&
            (item.selectedSize || 'Medium (Standar)') === resolvedSize
        );
        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            product: updatedProductRef,
            selectedSize: resolvedSize,
            quantity: updated[existingIndex].quantity + quantity,
          };
        } else {
          updated.push({
            product: updatedProductRef,
            selectedColor: color,
            selectedSize: resolvedSize,
            quantity,
          });
        }
      });
      return updated;
    });

    const colorSummary = cappedBatch
      .map((b) => `${b.color} x${b.quantity}`)
      .join(', ');

    recordActivity(
      'stock',
      `Quick Add Batch: ${liveProduct.sku} (-${totalAdded} pcs)`,
      `Batch multi-warna (${colorSummary}) masuk keranjang. Sisa stok aktual: ${updatedProductRef.stock} pcs.`,
      'Sistem Inventori'
    );

    showToast(
      `Batch ${totalAdded} pcs ${liveProduct.sku} (${colorSummary}) berhasil masuk Keranjang!`,
      true,
      {
        productName: liveProduct.name,
        sku: liveProduct.sku,
        colorLabel: colorSummary,
        sizeLabel: resolvedSize,
        quantity: totalAdded,
        unitPrice: liveProduct.salePrice,
        imageUrl: liveProduct.imageUrl,
      }
    );
  };

  const handleUpdateCartQty = (
    productId: string,
    color: string,
    delta: number,
    size?: string
  ) => {
    const targetItem = cartItems.find((item) => {
      const matchesSize = size
        ? (item.selectedSize || 'Medium (Standar)') === size
        : true;
      return (
        item.product.id === productId &&
        item.selectedColor === color &&
        matchesSize
      );
    });
    if (!targetItem) return;

    const liveProd = products.find((p) => p.id === productId);
    if (delta > 0 && liveProd && liveProd.stock < delta) {
      showToast(
        `Stok gudang ${liveProd.sku} tersisa ${liveProd.stock} pcs lagi.`
      );
      return;
    }

    const actualStockDelta =
      delta > 0
        ? -delta
        : Math.min(targetItem.quantity, Math.abs(delta));

    adjustProductStockInCatalog([
      { productId, delta: actualStockDelta },
    ]);

    setCartItems((prev) =>
      prev
        .map((item) => {
          const matchesSize = size
            ? (item.selectedSize || 'Medium (Standar)') === size
            : true;
          if (
            item.product.id === productId &&
            item.selectedColor === color &&
            matchesSize
          ) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (
    productId: string,
    color: string,
    size?: string
  ) => {
    const removedItem = cartItems.find((item) => {
      const matchesSize = size
        ? (item.selectedSize || 'Medium (Standar)') === size
        : true;
      return (
        item.product.id === productId &&
        item.selectedColor === color &&
        matchesSize
      );
    });
    if (removedItem) {
      adjustProductStockInCatalog([
        { productId, delta: removedItem.quantity },
      ]);
    }
    setCartItems((prev) =>
      prev.filter((item) => {
        const matchesSize = size
          ? (item.selectedSize || 'Medium (Standar)') === size
          : true;
        return !(
          item.product.id === productId &&
          item.selectedColor === color &&
          matchesSize
        );
      })
    );
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      const restoreMap = new Map<string, number>();
      cartItems.forEach((item) => {
        restoreMap.set(
          item.product.id,
          (restoreMap.get(item.product.id) || 0) + item.quantity
        );
      });
      const adjustments = Array.from(restoreMap.entries()).map(
        ([productId, qty]) => ({ productId, delta: qty })
      );
      adjustProductStockInCatalog(adjustments);
    }
    setCartItems([]);
  };

  // Admin Session Guard: Requires PIN Authentication if Admin Mode is not active
  const requireAdminAuth = (action: () => void) => {
    if (isAdminMode) {
      action();
      return;
    }
    setPendingAdminAction(() => action);
    setPinInput('');
    setPinError('');
    setIsPinModalOpen(true);
  };

  // Admin Product Modal Initializer
  const openAddProductModal = () => {
    requireAdminAuth(() => {
      const randomCode = Math.floor(10000 + Math.random() * 89999);
      const defaultSku = `BP-TG-${randomCode}`;
      setEditingProduct(null);
      setFormName('');
      setFormSku(defaultSku);
      setFormCategory(
        (activeCategory !== 'Semua' &&
        editableCategoryNames.includes(activeCategory)
          ? activeCategory
          : editableCategoryNames[0]) || 'Backpack'
      );
      setFormNormalPrice(249000);
      setFormSalePrice(145000);
      setFormWholesaleMinQty(6);
      setFormWholesalePrice(122000);
      setFormRating(4.9);
      setFormStock(120);
      setFormStockStatus('Ready Stock');
      setFormIsSale(true);
      setFormImageUrl(
        createBagStudioSvg({
          variant: 'backpack-black',
          sku: defaultSku,
          accentLabel: 'NEW COLLECTION',
        })
      );
      setFormMaterial('Material Import Grade A + Hardware Anti-Karat');
      setFormDimensions('30 × 14 × 42 cm');
      setFormWeightGrams(650);
      setFormGalleryImages([]);
      setFormNewGalleryUrl('');
      setFormColors('Black, Cream, Mocca');
      setFormDescription(
        'Tas import kualitas tangan pertama dari gudang TGI. Jahitan bartack rapi, material tebal, dan bergaransi retur 100%.'
      );
      setFormError('');
      setIsProductModalOpen(true);
    });
  };

  const openEditProductModal = (product: Product) => {
    requireAdminAuth(() => {
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
      setFormStockStatus(
        product.stockStatus ||
          (product.stock <= 0
            ? 'Habis'
            : product.stock <= 25
            ? 'Stok Terbatas'
            : 'Ready Stock')
      );
      setFormIsSale(product.isSale);
      setFormImageUrl(product.imageUrl);
      setFormGalleryImages(
        Array.isArray(product.galleryImages)
          ? product.galleryImages.filter(
              (img) => img && img !== product.imageUrl
            )
          : []
      );
      setFormNewGalleryUrl('');
      setFormMaterial(product.material || '');
      setFormDimensions(product.dimensions || '');
      setFormWeightGrams(product.weightGrams || 650);
      setFormColors(
        (product.colors || ['Black', 'Cream', 'Mocca']).join(', ')
      );
      setFormDescription(product.description || '');
      setFormError('');
      setIsProductModalOpen(true);
    });
  };

  const openAppearanceModal = (
    tab: AppearanceTab = 'hero',
    articleToEdit: BlogArticle | null = null
  ) => {
    requireAdminAuth(() => {
      setAdminEditingArticle(articleToEdit);
      setAppearanceInitialTab(tab);
      setIsAppearanceModalOpen(true);
    });
  };

  const handleRequestToggleAdminMode = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      recordActivity(
        'auth',
        'Sesi Mode Admin Dikunci (Logout)',
        'Admin mengunci kembali sesi Master Panel Admin untuk keamanan publik.',
        'Admin Utama'
      );
      showToast('Mode Admin dikunci kembali.');
      return;
    }
    setPendingAdminAction(null);
    setPinInput('');
    setPinError('');
    setIsPinModalOpen(true);
  };

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = (storeConfig.adminPin || '123456').trim() || '123456';
    if (pinInput.trim() === expectedPin) {
      setIsAdminMode(true);
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError('');
      setPinFailedAttempts(0);
      recordActivity(
        'auth',
        'Autentikasi PIN Admin Berhasil',
        'Akses Master Panel Admin dibuka menggunakan kode PIN rahasia.',
        'Admin Utama'
      );
      showToast('PIN Valid! Sesi Master Panel Admin diaktifkan.');
      if (pendingAdminAction) {
        const cb = pendingAdminAction;
        setPendingAdminAction(null);
        cb();
      }
    } else {
      const nextAttempts = pinFailedAttempts + 1;
      setPinFailedAttempts(nextAttempts);
      setPinError(
        `PIN Admin tidak sesuai (Percobaan gagal #${nextAttempts}). Silakan periksa kembali kode PIN Anda.`
      );
      recordActivity(
        'auth',
        `Percobaan Login Admin Gagal (#${nextAttempts})`,
        'Seseorang mencoba membuka Mode Admin dengan kode PIN yang salah.',
        'Sistem Keamanan'
      );
    }
  };

  const handleQuickToggleHideHeaderAdmin = () => {
    const nextStore: StoreConfig = {
      ...storeConfig,
      hideAdminInHeader: !storeConfig.hideAdminInHeader,
    };
    setStoreConfig(nextStore);
    saveStoreConfig(nextStore);
    showToast(
      nextStore.hideAdminInHeader
        ? 'Tombol Admin disembunyikan dari Header (akses via ikon gembok di Footer bawah).'
        : 'Tombol Admin ditampilkan kembali di Header utama.'
    );
  };

  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file, 1000, 0.82);
      setFormImageUrl(compressedDataUrl);
    } catch {
      // ignore
    }
  };

  const handleGalleryFilesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const uploadedList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await compressImageFileToDataUrl(files[i], 1000, 0.82);
        uploadedList.push(dataUrl);
      } catch {
        // ignore single file error
      }
    }
    if (uploadedList.length > 0) {
      setFormGalleryImages((prev) => [...prev, ...uploadedList]);
    }
    e.target.value = '';
  };

  const handleAddGalleryUrl = () => {
    const trimmed = formNewGalleryUrl.trim();
    if (!trimmed) return;
    setFormGalleryImages((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setFormNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
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
      stockStatus: formStockStatus,
      isSale: formIsSale,
      isPromoGrosir:
        formCategory === 'Promo Grosir' ||
        Number(formWholesalePrice) < Number(formSalePrice),
      imageUrl: finalImageUrl,
      galleryImages: formGalleryImages.filter(
        (img) => Boolean(img) && img !== finalImageUrl
      ),
      material: formMaterial.trim() || 'Material Import Grade A',
      dimensions: formDimensions.trim() || 'Ukuran Standar',
      weightGrams: Math.max(50, Number(formWeightGrams) || 650),
      colors: parsedColors.length > 0 ? parsedColors : ['Black'],
      description:
        formDescription.trim() ||
        'Koleksi tas import tangan pertama kualitas premium TGI.',
      updatedAt: new Date().toISOString(),
    };

    if (editingProduct) {
      const nextLogs = recordActivity(
        'product',
        `Perbarui Produk: ${newProductObj.sku}`,
        `Mengubah detail ${newProductObj.name} (Harga: ${formatRupiah(
          newProductObj.salePrice
        )}, Stok: ${newProductObj.stock} pcs, Berat: ${
          newProductObj.weightGrams
        }g).`,
        'Admin Utama'
      );
      setProducts((prev) => {
        const next = prev.map((p) =>
          p.id === editingProduct.id ? newProductObj : p
        );
        saveLocalProducts(next);
        if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
          syncProductsToSupabase(
            storeConfig,
            next,
            uiConfig,
            orders,
            reviews,
            articles,
            nextLogs
          ).catch(() => {});
        }
        return next;
      });
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === editingProduct.id
            ? { ...item, product: newProductObj }
            : item
        )
      );
      showToast(`Produk ${newProductObj.sku} berhasil diperbarui!`);
    } else {
      const nextLogs = recordActivity(
        'product',
        `Tambah Produk Baru: ${newProductObj.sku}`,
        `Menambahkan SKU baru "${newProductObj.name}" kategori ${
          newProductObj.category
        } dengan stok awal ${newProductObj.stock} pcs.`,
        'Admin Utama'
      );
      setProducts((prev) => {
        const next = [newProductObj, ...prev];
        saveLocalProducts(next);
        if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
          syncProductsToSupabase(
            storeConfig,
            next,
            uiConfig,
            orders,
            reviews,
            articles,
            nextLogs
          ).catch(() => {});
        }
        return next;
      });
      showToast(`Produk baru ${newProductObj.sku} berhasil ditambahkan!`);
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    const nextLogs = recordActivity(
      'product',
      `Hapus Produk: ${target?.sku || productId}`,
      `Menghapus produk "${target?.name || productId}" dari katalog utama.`,
      'Admin Utama'
    );
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      saveLocalProducts(next);
      if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
        deleteProductFromSupabase(storeConfig, productId).catch(() => {});
        syncProductsToSupabase(
          storeConfig,
          next,
          uiConfig,
          orders,
          reviews,
          articles,
          nextLogs
        ).catch(() => {});
      }
      return next;
    });
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
    showToast(`Produk ${target?.sku || ''} telah dihapus dari katalog.`);
  };

  const handleResetCatalog = () => {
    const defaults = resetLocalProducts();
    const defaultUi = resetUiContentConfig();
    const defaultStore = resetStoreConfig();
    const defaultReviews = resetLocalReviews();
    const defaultArticles = resetLocalArticles();
    setProducts(defaults);
    setUiConfig(defaultUi);
    setStoreConfig(defaultStore);
    setReviews(defaultReviews);
    setArticles(defaultArticles);
    setConfirmResetInline(false);
    recordActivity(
      'ui-popup',
      'Reset Katalog & Pengaturan ke Default',
      'Mengembalikan seluruh produk, banner, artikel, dan konfigurasi ke pengaturan awal pabrik.',
      'Admin Utama'
    );
    showToast('Katalog, tampilan, artikel, ulasan & kontak dikembalikan ke pengaturan default.');
  };

  const handleSaveAppearanceAndContact = (
    newUiConfig: UiContentConfig,
    newStoreConfig: StoreConfig
  ) => {
    setUiConfig(newUiConfig);
    saveUiContentConfig(newUiConfig);
    setStoreConfig(newStoreConfig);
    saveStoreConfig(newStoreConfig);

    const nextLogs = recordActivity(
      'ui-popup',
      'Simpan Pengaturan Master Panel Admin',
      `Memperbarui konfigurasi tampilan, banner, pop-up promo grosir (${
        newUiConfig.wholesalePopup?.enabled ? 'Aktif' : 'Nonaktif'
      }), kategori (${newUiConfig.categories?.length || 0}), dan kontak toko.`,
      'Admin Utama'
    );

    if (newStoreConfig.supabaseUrl && newStoreConfig.supabaseAnonKey) {
      syncProductsToSupabase(
        newStoreConfig,
        products,
        newUiConfig,
        orders,
        reviews,
        articles,
        nextLogs
      ).catch(() => {});
    }
    showToast('Pengaturan Tampilan, Konten & Kontak Perusahaan berhasil disimpan!');
  };

  const handleResetAppearanceAndContact = () => {
    const defaultUi = resetUiContentConfig();
    const defaultStore = resetStoreConfig();
    const defaultArticles = resetLocalArticles();
    setUiConfig(defaultUi);
    setStoreConfig(defaultStore);
    setArticles(defaultArticles);
    showToast('Tampilan, Banner, Artikel & Kontak direset ke Default!');
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
      const nextUi = { ...prev, liveShopping: nextLive };
      saveUiContentConfig(nextUi);
      return nextUi;
    });
    showToast(
      `Status ${
        platform === 'tiktok' ? 'TikTok Live' : 'Shopee Live'
      } berhasil diperbarui!`
    );
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
    const res = await syncProductsToSupabase(
      configDraft,
      products,
      uiConfig,
      orders,
      reviews,
      articles,
      activityLogs
    );
    setSyncState({ loading: false, ok: res.ok, message: res.message });
    if (res.ok) {
      showToast('Backup Cloud Supabase berhasil diperbarui!');
    }
  };

  const handleRestoreFromSupabase = async () => {
    setSyncState({ loading: true });
    setStoreConfig(configDraft);
    saveStoreConfig(configDraft);
    const res = await fetchCloudBackupFromSupabase(configDraft);
    if (res.ok) {
      if (Array.isArray(res.products)) {
        setProducts(res.products);
        saveLocalProducts(res.products);
      }
      if (res.uiConfig) {
        setUiConfig(res.uiConfig);
        saveUiContentConfig(res.uiConfig);
      }
      if (res.storeConfig) {
        const mergedStore: StoreConfig = {
          ...configDraft,
          ...res.storeConfig,
          supabaseUrl: configDraft.supabaseUrl,
          supabaseAnonKey: configDraft.supabaseAnonKey,
        };
        setStoreConfig(mergedStore);
        setConfigDraft(mergedStore);
        saveStoreConfig(mergedStore);
      }
      if (Array.isArray(res.reviews)) {
        setReviews(res.reviews);
        saveLocalReviews(res.reviews);
      }
      if (Array.isArray(res.orders)) {
        setOrders(res.orders);
        saveAllLocalOrders(res.orders);
      }
      if (Array.isArray(res.articles) && res.articles.length > 0) {
        setArticles(res.articles);
        saveLocalArticles(res.articles);
      }
      if (Array.isArray(res.activityLogs) && res.activityLogs.length > 0) {
        setActivityLogs(res.activityLogs);
        saveLocalActivityLogs(res.activityLogs);
      }
      showToast('Data berhasil dimuat dari Cloud Supabase!');
    }
    setSyncState({ loading: false, ok: res.ok, message: res.message });
  };

  const handleAddCustomerReview = (newReview: CustomerReview) => {
    setReviews((prev) => {
      const next = [newReview, ...prev];
      saveLocalReviews(next);
      if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
        syncProductsToSupabase(
          storeConfig,
          products,
          uiConfig,
          orders,
          next,
          articles,
          activityLogs
        ).catch(() => {});
      }
      return next;
    });
    showToast(
      `Terima kasih ${newReview.reviewerName}! Ulasan bintang ${newReview.rating} Anda telah ditampilkan.`
    );
  };

  const handleDeleteCustomerReview = (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId);
    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== reviewId);
      saveLocalReviews(next);
      if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
        syncProductsToSupabase(
          storeConfig,
          products,
          uiConfig,
          orders,
          next,
          articles,
          activityLogs
        ).catch(() => {});
      }
      return next;
    });
    showToast(
      `Ulasan dari ${target?.reviewerName || 'pelanggan'} berhasil dihapus & disimpan.`
    );
  };

  const handleRecordWhatsAppOrder = (newOrder: OrderRecord) => {
    const nextOrders = saveLocalOrder(newOrder);
    setOrders(nextOrders);

    // Increment soldCount for each ordered product (stock was already deducted when added to cart)
    const soldAdjustments: Array<{
      productId: string;
      delta: number;
      soldDelta: number;
    }> = [];
    cartItems.forEach((item) => {
      soldAdjustments.push({
        productId: item.product.id,
        delta: 0,
        soldDelta: item.quantity,
      });
    });
    const nextProducts = adjustProductStockInCatalog(soldAdjustments);

    // Clear cart without restoring stock since checkout is committed
    setCartItems([]);

    const nextLogs = recordActivity(
      'order-checkout',
      `Checkout WhatsApp #${newOrder.referenceCode} (${newOrder.totalQuantity} pcs)`,
      `Pemesan: ${newOrder.customerName} (${newOrder.customerPhone}) · Tujuan: ${
        newOrder.customerCity
      } · Kargo: ${newOrder.cargoCourier} · Total: ${formatRupiah(
        newOrder.totalPayable
      )}. Stok dikomit permanen.`,
      newOrder.customerName || 'Pembeli Website'
    );

    if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
      syncProductsToSupabase(
        storeConfig,
        nextProducts,
        uiConfig,
        nextOrders,
        reviews,
        articles,
        nextLogs
      ).catch(() => {});
    }
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
      {/* 1. Sticky Header (Zalora-Inspired Modern Storefront Bar) */}
      <Navbar
        storeName={storeConfig.storeName}
        storeConfig={storeConfig}
        products={products}
        onSelectProduct={setSelectedProduct}
        onQuickAddToCart={(prod) => handleAddToCart(prod)}
        categories={dynamicCategories}
        productCountsByCategory={productCountsByCategory}
        totalProductCount={products.length}
        onOpenManageCategories={() => openAppearanceModal('categories')}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveView('catalog');
          setSelectedBlogArticle(null);
          setActiveCategory(cat);
          setStockFilter('all');
        }}
        onSelectSubCategory={(cat, options) => {
          setActiveView('catalog');
          setSelectedBlogArticle(null);
          setActiveCategory(cat);
          setSearchQuery(options?.keyword || '');
          if (options?.stockFilter === 'Ready Stock') {
            setStockFilter('ready-only');
          } else if (options?.stockFilter === 'Stok Terbatas') {
            setStockFilter('limited-only');
          } else if (options?.stockFilter === 'wishlist') {
            setStockFilter('wishlist-only');
          } else {
            setStockFilter('all');
          }
          if (options?.sortBy === 'price-asc') {
            setSortBy('price-asc');
          } else if (options?.sortBy === 'price-desc') {
            setSortBy('price-desc');
          } else if (options?.sortBy === 'discount-desc') {
            setSortBy('discount-desc');
          } else if (options?.sortBy === 'newest') {
            setSortBy('rating-desc');
          } else {
            setSortBy('featured');
          }
          if (options?.label) {
            showToast(`Filter Katalog: ${options.label}`);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeView === 'blog' && q.trim()) {
            setActiveView('catalog');
          }
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        isWishlistFilterActive={stockFilter === 'wishlist-only'}
        onToggleWishlistFilter={() => {
          setActiveView('catalog');
          setStockFilter((prev) =>
            prev === 'wishlist-only' ? 'all' : 'wishlist-only'
          );
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onOpenResellerGuide={() => setIsResellerGuideOpen(true)}
        resellerGuideMenuLabel={uiConfig.resellerGuide?.menuLabel}
        articles={articles}
        isBlogViewActive={activeView === 'blog'}
        onOpenBlogList={() => {
          setSelectedBlogArticle(null);
          setActiveView('blog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectArticle={(article) => {
          setSelectedBlogArticle(article);
          setActiveView('blog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        announcementText={uiConfig.announcementText}
        showAnnouncementBar={
          uiConfig.catalogLayout?.sectionVisibility?.showAnnouncementBar !==
          false
        }
        onEditAnnouncementBar={() => openAppearanceModal('hero')}
        isAdminMode={isAdminMode}
        hideAdminInHeader={Boolean(storeConfig.hideAdminInHeader)}
        onToggleAdminMode={handleRequestToggleAdminMode}
        onOpenAddProduct={openAddProductModal}
        onOpenStoreSettings={() => {
          setConfigDraft(storeConfig);
          setSyncState({ loading: false });
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Admin Mode Active Compact 1-Line Toolbar */}
        {isAdminMode && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5">
            <div className="rounded-xl bg-zinc-950 text-white px-3.5 py-2 border border-amber-400/50 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-[11px] font-extrabold text-amber-400 uppercase tracking-wider truncate">
                  MASTER PANEL ADMIN AKTIF
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                  Real-Time localStorage & Supabase
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Produk Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('hero')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                  <span>Master Panel Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('popup')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold border border-amber-400/40 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Pop-Up Promo</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('categories')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold border border-amber-400/40 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manajemen Kategori ({dynamicCategories.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('products')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold border border-amber-400/40 transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Produk & Berat Kargo</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('reseller-guide')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Panduan Reseller</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('articles')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold border border-amber-400/40 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manajemen Artikel ({articles.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('audit-log')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-400/40 transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log Aktivitas & Stok ({activityLogs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('layout')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Visibilitas Layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAppearanceModal('live')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Live Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfigDraft(storeConfig);
                    setSyncState({ loading: false });
                    setIsSettingsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Supabase</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickToggleHideHeaderAdmin}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                  title="Sembunyikan atau tampilkan tombol Admin di Header atas"
                >
                  {storeConfig.hideAdminInHeader ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Tampilkan di Header</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Sembunyikan dari Header</span>
                    </>
                  )}
                </button>

                {!confirmResetInline ? (
                  <button
                    type="button"
                    onClick={() => setConfirmResetInline(true)}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 text-[11px] font-semibold border border-zinc-800 transition-colors cursor-pointer"
                    title="Reset semua ke default"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-red-950 px-2 py-1 rounded-lg border border-red-500">
                    <span className="text-[11px] text-red-200 font-semibold">
                      Reset?
                    </span>
                    <button
                      type="button"
                      onClick={handleResetCatalog}
                      className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetInline(false)}
                      className="px-1.5 py-0.5 text-[11px] text-zinc-300 hover:text-white cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRequestToggleAdminMode}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-bold border border-amber-400/40 transition-colors cursor-pointer"
                  title="Kunci & keluar dari Mode Admin"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kunci</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeView === 'blog' ? (
          <BlogSectionPage
            articles={articles}
            selectedArticle={selectedBlogArticle}
            onSelectArticle={(article) => setSelectedBlogArticle(article)}
            onBackToCatalog={() => {
              setSelectedBlogArticle(null);
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            storeConfig={storeConfig}
            isAdminMode={isAdminMode}
            onOpenAdminArticleManager={(articleToEdit) =>
              openAppearanceModal('articles', articleToEdit || null)
            }
            onDeleteArticle={(articleId) => {
              const target = articles.find((a) => a.id === articleId);
              const next = articles.filter((a) => a.id !== articleId);
              setArticles(next);
              saveLocalArticles(next);
              if (selectedBlogArticle?.id === articleId) {
                setSelectedBlogArticle(null);
              }
              if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
                syncProductsToSupabase(
                  storeConfig,
                  products,
                  uiConfig,
                  orders,
                  reviews,
                  next
                ).catch(() => {});
              }
              showToast(
                `Artikel "${target?.title || ''}" berhasil dihapus & disimpan!`
              );
            }}
          />
        ) : (
          <>
            {/* 2. Hero Banner Slider (Dynamic Slides, Overlay Opacity & Bar Voucher Grosir) */}
        <HeroSlider
          slides={uiConfig.heroSlides}
          vouchers={uiConfig.vouchers}
          showVoucherBar={
            uiConfig.catalogLayout?.sectionVisibility?.showVoucherBar !== false
          }
          showHeroBanner={
            uiConfig.catalogLayout?.sectionVisibility?.showHeroBanner !== false
          }
          onExploreCategory={setActiveCategory}
          onCopyVoucher={(code) => {
            setAppliedVoucher(code);
            showToast(
              `Kupon promo ${code} berhasil disalin & siap digunakan di Keranjang!`,
              true
            );
          }}
          isAdminMode={isAdminMode}
          onEditBanner={() => openAppearanceModal('hero')}
        />

        {/* 3. Promo Bento Grid (Dynamic 3 Kartu Informasi) */}
        {uiConfig.catalogLayout?.sectionVisibility?.showPromoBento !==
          false && (
          <PromoBentoGrid
            cards={uiConfig.bentoCards}
            storeConfig={storeConfig}
            onSelectCategory={setActiveCategory}
            isAdminMode={isAdminMode}
            onEditBento={() => openAppearanceModal('bento')}
          />
        )}

        {/* 3.5. TGI Live Shopping Studio (Preview Etalase Spill Live & Direct App Link) */}
        {uiConfig.catalogLayout?.sectionVisibility?.showLiveShopping !==
          false && (
          <LiveShoppingSection
            liveConfig={uiConfig.liveShopping}
            isAdminMode={isAdminMode}
            onEditLiveConfig={() => openAppearanceModal('live')}
            onQuickTogglePlatform={handleQuickToggleLivePlatform}
          />
        )}

        {/* 4. Dynamic Product Catalog Section with Zalora-Style Left Sidebar Filter */}
        <section
          id="katalog-produk"
          aria-label="Katalog Produk Tas Grosir Import"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 sm:pb-12 space-y-6"
        >
          {/* Catalog Header & Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-zinc-200">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                OFFICIAL CATALOG · TANGAN PERTAMA GUDANG TGI
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-wider uppercase">
                {stockFilter === 'wishlist-only'
                  ? 'WISHLIST FAVORIT SAYA'
                  : activeCategory === 'Semua'
                  ? 'SEMUA KOLEKSI TAS IMPORT'
                  : `KOLEKSI ${activeCategory.toUpperCase()}`}
              </h2>
              <p className="text-xs text-zinc-600 italic">
                *Untuk pemesanan partai besar / grosir, silakan langsung chat Admin Sales kami via WhatsApp
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Button to Re-open Wholesale Promo Banner Pop-Up */}
              <button
                type="button"
                onClick={() => setIsWholesalePromoOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Info Partai Besar / Grosir</span>
              </button>

              {/* Mobile Filter Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen((prev) => !prev)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Katalog</span>
              </button>

              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => openAppearanceModal('layout')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>
                    Layout: {uiConfig.catalogLayout.desktopColumns} Kolom ·{' '}
                    {uiConfig.catalogLayout.imageAspectRatio}
                  </span>
                </button>
              )}

              <span className="text-xs text-zinc-500 font-mono tabular-nums">
                Menampilkan <strong className="text-zinc-950">{filteredProducts.length}</strong> dari{' '}
                {products.length} SKU
              </span>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-500"
                >
                  Urutkan:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 text-xs font-bold bg-white border border-zinc-300 text-zinc-950 focus:border-zinc-950 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Unggulan & Terbaru</option>
                  <option value="price-asc">Harga: Rendah ke Tinggi</option>
                  <option value="price-desc">Harga: Tinggi ke Rendah</option>
                  <option value="rating-desc">Rating Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* ZALORA 2-COLUMN CATALOG ARCHITECTURE: LEFT SIDEBAR FILTER + RIGHT PRODUCT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT SIDEBAR FILTER (Sticky on Desktop, Collapsible on Mobile) */}
            <aside
              aria-label="Sidebar Filter Katalog"
              className={`lg:col-span-3 lg:sticky lg:top-32 bg-white border border-zinc-200 p-5 space-y-6 ${
                isMobileFilterOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-950" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-widest text-zinc-950">
                    Filter Produk
                  </h3>
                </div>
                {(activeCategory !== 'Semua' ||
                  priceRangeFilter !== 'all' ||
                  selectedColorFilter !== 'all' ||
                  stockFilter !== 'all' ||
                  searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('Semua');
                      setPriceRangeFilter('all');
                      setSelectedColorFilter('all');
                      setStockFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Filter Kategori Tas */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                    Kategori Tas
                  </h4>
                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={() => openAppearanceModal('categories')}
                      className="text-[10px] font-mono font-bold text-amber-700 hover:text-zinc-950 underline cursor-pointer"
                    >
                      + Kelola Kategori
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {(['Semua', ...editableCategoryNames] as ProductCategory[]).map(
                    (cat) => {
                      const active = activeCategory === cat;
                      const count =
                        cat === 'Semua'
                          ? products.length
                          : productCountsByCategory[cat] ?? 0;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                            active
                              ? 'bg-zinc-950 text-white font-bold'
                              : 'text-zinc-700 hover:bg-zinc-100 font-medium'
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`font-mono text-[11px] tabular-nums ${
                              active ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            ({count})
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 2. Filter Rentang Harga / Budget */}
              <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Rentang Harga Produk
                </h4>
                <div className="space-y-1.5">
                  {(
                    [
                      { id: 'all', label: 'Semua Rentang Harga' },
                      { id: 'under-135k', label: 'Di Bawah Rp 135.000' },
                      { id: '135k-165k', label: 'Rp 135.000 – Rp 165.000' },
                      { id: 'above-165k', label: 'Di Atas Rp 165.000' },
                    ] as { id: PriceRangeFilter; label: string }[]
                  ).map((range) => {
                    const active = priceRangeFilter === range.id;
                    return (
                      <label
                        key={range.id}
                        onClick={() => setPriceRangeFilter(range.id)}
                        className="flex items-center gap-2.5 py-1 text-xs cursor-pointer group"
                      >
                        <span
                          className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                            active
                              ? 'bg-zinc-950 border-zinc-950 text-white'
                              : 'border-zinc-300 group-hover:border-zinc-950 bg-white'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span
                          className={
                            active
                              ? 'font-bold text-zinc-950'
                              : 'text-zinc-700 group-hover:text-zinc-950'
                          }
                        >
                          {range.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Filter Pilihan Warna (Interactive Color Swatches) */}
              <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                    Pilihan Warna
                  </h4>
                  {selectedColorFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedColorFilter('all')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950 underline cursor-pointer"
                    >
                      Semua Warna
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableColors.map(({ color, count }) => {
                    const isSelected =
                      selectedColorFilter.toLowerCase() === color.toLowerCase();
                    const hex = getColorSwatchHex(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setSelectedColorFilter(isSelected ? 'all' : color)
                        }
                        title={`${color} (${count} SKU)`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                            : 'border-zinc-200 bg-white hover:border-zinc-900 text-zinc-700'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-zinc-300 shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Filter Status Stok & Wishlist */}
              <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Status Stok & Koleksi
                </h4>
                <div className="space-y-1.5">
                  {(
                    [
                      { id: 'all', label: 'Semua Status Stok' },
                      { id: 'ready-only', label: 'Ready Stock Siap Kirim' },
                      { id: 'limited-only', label: 'Stok Terbatas' },
                      { id: 'bestseller-only', label: 'Best Seller Partai Besar' },
                      {
                        id: 'wishlist-only',
                        label: `Wishlist Saya (${wishlistIds.length})`,
                      },
                    ] as { id: StockStatusFilter; label: string }[]
                  ).map((stk) => {
                    const active = stockFilter === stk.id;
                    return (
                      <label
                        key={stk.id}
                        onClick={() => setStockFilter(stk.id)}
                        className="flex items-center gap-2.5 py-1 text-xs cursor-pointer group"
                      >
                        <span
                          className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                            active
                              ? 'bg-zinc-950 border-zinc-950 text-white'
                              : 'border-zinc-300 group-hover:border-zinc-950 bg-white'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span
                          className={
                            active
                              ? 'font-bold text-zinc-950'
                              : 'text-zinc-700 group-hover:text-zinc-950'
                          }
                        >
                          {stk.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: ACTIVE FILTER TAGS + PRODUCT CATALOG GRID */}
            <div className="lg:col-span-9 space-y-5">
              {/* Active Search / Filter Summary Bar */}
              {(searchQuery.trim() !== '' ||
                activeCategory !== 'Semua' ||
                priceRangeFilter !== 'all' ||
                selectedColorFilter !== 'all' ||
                stockFilter !== 'all') && (
                <div className="bg-white border border-zinc-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                      Filter Aktif:
                    </span>
                    {activeCategory !== 'Semua' && (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold">
                        Kategori: {activeCategory}
                      </span>
                    )}
                    {priceRangeFilter !== 'all' && (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold">
                        Harga:{' '}
                        {priceRangeFilter === 'under-135k'
                          ? '< Rp135.000'
                          : priceRangeFilter === '135k-165k'
                          ? 'Rp135.000 – Rp165.000'
                          : '> Rp165.000'}
                      </span>
                    )}
                    {selectedColorFilter !== 'all' && (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold inline-flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                          style={{
                            backgroundColor:
                              getColorSwatchHex(selectedColorFilter),
                          }}
                        />
                        <span>Warna: {selectedColorFilter}</span>
                      </span>
                    )}
                    {stockFilter !== 'all' && (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold">
                        Status:{' '}
                        {stockFilter === 'wishlist-only'
                          ? 'Wishlist Saya ♥'
                          : stockFilter === 'bestseller-only'
                          ? 'Best Seller'
                          : stockFilter === 'ready-only'
                          ? 'Ready Stock'
                          : 'Stok Terbatas'}
                      </span>
                    )}
                    {searchQuery.trim() && (
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-900 font-bold">
                        Pencarian: "{searchQuery}"
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('Semua');
                      setPriceRangeFilter('all');
                      setSelectedColorFilter('all');
                      setStockFilter('all');
                      setSearchQuery('');
                    }}
                    className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer uppercase tracking-wider text-[11px]"
                  >
                    Hapus Semua Filter
                  </button>
                </div>
              )}

              {/* Product Grid */}
              {isLoadingSupabase ? (
                <div className="bg-white border border-zinc-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 text-amber-400 mx-auto flex items-center justify-center animate-pulse">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-zinc-900">
                    MEMUAT DATA KATALOG DARI SUPABASE...
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Sedang mengambil daftar produk terbaru secara dinamis dari tabel database Supabase Anda.
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white border border-zinc-200 p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <PackageOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold uppercase tracking-wider text-zinc-900">
                      KATALOG PRODUK MASIH KOSONG
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                      Belum ada data produk di dalam tabel database. Silakan tambahkan produk pertama Anda melalui Panel Admin atau sinkronkan dari tabel Supabase.
                    </p>
                  </div>
                  {isAdminMode && (
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={openAddProductModal}
                        className="px-5 py-2.5 bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-300 cursor-pointer"
                      >
                        + Tambah Produk Pertama
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfigDraft(storeConfig);
                          setSyncState({ loading: false });
                          setIsSettingsModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer inline-flex items-center gap-2"
                      >
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pengaturan Database Supabase</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white border border-zinc-200 p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                    <PackageOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold uppercase tracking-wider text-zinc-900">
                      PRODUK TIDAK DITEMUKAN
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                      Tidak ada produk tas yang cocok dengan kombinasi filter kategori, harga, warna, atau status stok yang dipilih.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('Semua');
                        setPriceRangeFilter('all');
                        setSelectedColorFilter('all');
                        setStockFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-5 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer"
                    >
                      Reset Semua Filter
                    </button>
                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={openAddProductModal}
                        className="px-5 py-2.5 bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-300 cursor-pointer"
                      >
                        + Tambah Produk Baru
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 ${desktopGridColsClass} gap-6`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdminMode={isAdminMode}
                      availableCategories={editableCategoryNames}
                      imageAspectRatio={uiConfig.catalogLayout.imageAspectRatio}
                      imageObjectFit={uiConfig.catalogLayout.imageObjectFit}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={(prod, color) =>
                        handleAddToCart(prod, color, 1)
                      }
                      onQuickView={(prod) => setSelectedProduct(prod)}
                      onEditProduct={openEditProductModal}
                      onQuickUpdateProduct={(updatedProd) => {
                        setProducts((prev) => {
                          const next = prev.map((p) =>
                            p.id === updatedProd.id ? updatedProd : p
                          );
                          saveLocalProducts(next);
                          if (
                            storeConfig.supabaseUrl &&
                            storeConfig.supabaseAnonKey
                          ) {
                            syncProductsToSupabase(
                              storeConfig,
                              next,
                              uiConfig,
                              orders,
                              reviews
                            ).catch(() => {});
                          }
                          return next;
                        });
                        setCartItems((prev) =>
                          prev.map((item) =>
                            item.product.id === updatedProd.id
                              ? { ...item, product: updatedProd }
                              : item
                          )
                        );
                        showToast(
                          `Produk ${updatedProd.sku} (${updatedProd.weightGrams || 400}g) berhasil diperbarui!`
                        );
                      }}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4.5. Verified Wholesale Customer Reviews & Social Proof Section */}
        {uiConfig.catalogLayout?.sectionVisibility?.showCustomerReviews !==
          false && (
          <CustomerReviewsSection
            reviews={reviews}
            products={products}
            isAdminMode={isAdminMode}
            onAddReview={handleAddCustomerReview}
            onDeleteReview={handleDeleteCustomerReview}
            onSelectProductBySku={(sku) => {
              const target = products.find((p) => p.sku === sku);
              if (target) {
                setSelectedProduct(target);
              }
            }}
          />
        )}
          </>
        )}
      </main>

      {/* Corporate Wholesale Standard Footer (Connected to Company Contact & Social Media Config) */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 mt-8 pb-20 sm:pb-4">
        {/* Top Corporate Credentials Ribbon */}
        <div className="border-b border-zinc-900 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2 text-zinc-300 font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">
                PUSAT DISTRIBUSI GROSIR & IMPORTIR TANGAN PERTAMA
              </span>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="hidden sm:inline text-amber-400 font-semibold">
                DIVISI PENJUALAN PARTAI BESAR (B2B) & MITRA RESELLER NASIONAL
              </span>
            </div>

            {isAdminMode ? (
              <button
                type="button"
                onClick={() => openAppearanceModal('contact')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Kontak, Alamat & Jam Operasional</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 text-zinc-400 font-mono">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>QC Standar Gudang</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pengiriman Kargo Seluruh Indonesia</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1: Formal Corporate Profile, Warehouse Address & Structured Operating Hours */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/35 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  OFFICIAL CORPORATE HEADQUARTERS & WAREHOUSE
                </span>
                <span className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight block uppercase">
                  {storeConfig.storeName || 'TAS GROSIR IMPORT'}
                </span>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {storeConfig.slogan}
                </p>
              </div>

              {/* Formal Contact & Operating Hours Card Grid */}
              <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 divide-y divide-zinc-800/90 text-xs text-zinc-300">
                {/* Warehouse Address */}
                {storeConfig.warehouseAddress && (
                  <div className="p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Kantor Pusat & Gudang Distribusi Utama
                      </span>
                      <span className="text-zinc-100 font-medium leading-relaxed block">
                        {storeConfig.warehouseAddress}
                      </span>
                    </div>
                  </div>
                )}

                {/* Formal Operating Hours Schedule */}
                <div className="p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Jam Operasional Gudang & Layanan B2B
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-[9px] font-bold text-emerald-400 uppercase">
                        Aktif Setiap Hari Kerja
                      </span>
                    </div>

                    {storeConfig.operatingHours && (
                      <p className="text-white font-semibold leading-snug">
                        {storeConfig.operatingHours}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-zinc-400">
                      <div className="px-2.5 py-1.5 rounded bg-zinc-950/80 border border-zinc-800/80">
                        <span className="block font-mono text-[10px] text-zinc-500">
                          Senin – Sabtu (Gudang)
                        </span>
                        <span className="font-mono font-bold text-zinc-200">
                          08.00 – 17.00 WIB
                        </span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded bg-zinc-950/80 border border-zinc-800/80">
                        <span className="block font-mono text-[10px] text-zinc-500">
                          Batas Pickup / Kargo Harian
                        </span>
                        <span className="font-mono font-bold text-amber-400">
                          Cutoff 15.30 WIB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Corporate Hotline & Email */}
                <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {storeConfig.whatsappNumber && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Hotline Sales Grosir (WA)
                        </span>
                        <a
                          href={floatingWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-white hover:text-amber-400 transition-colors block truncate"
                        >
                          +{storeConfig.whatsappNumber.replace(/[^0-9]/g, '')}
                        </a>
                      </div>
                    </div>
                  )}

                  {storeConfig.email && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Email Korporat & Kemitraan
                        </span>
                        <a
                          href={`mailto:${storeConfig.email}`}
                          className="font-mono font-semibold text-zinc-200 hover:text-amber-400 transition-colors block truncate"
                        >
                          {storeConfig.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Social Media, Official Marketplace & Category Directory */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Saluran Resmi & Official Marketplace
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Terhubung dengan kanal distribusi resmi TGI untuk pembaruan katalog mingguan dan verifikasi toko:
                </p>
              </div>

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

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 space-y-2.5">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Direktori Kategori Katalog & Artikel
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(['Semua', ...editableCategoryNames] as ProductCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setActiveView('catalog');
                          setSelectedBlogArticle(null);
                          setActiveCategory(cat);
                          document
                            .getElementById('katalog-produk')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors cursor-pointer"
                      >
                        {cat}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBlogArticle(null);
                      setActiveView('blog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1 rounded-md bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 font-bold transition-colors cursor-pointer"
                  >
                    Artikel & Tips Bisnis
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Direct B2B Wholesale Services & Quick Actions */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Divisi Layanan Mitra & Partai Besar
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Konsultasikan kebutuhan stok toko, negosiasi harga partai karungan, atau jadwal ekspedisi kargo bersama Admin Sales kami:
              </p>

              <a
                href={floatingWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Admin Sales (WA)</span>
              </a>

              <button
                type="button"
                onClick={() => setIsWholesalePromoOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Info Promo & Syarat Partai Besar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-800 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Buka Keranjang ({totalCartCount} pcs)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOrderTrackingOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold text-xs border border-zinc-800 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Cek Resi & Status Kargo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResellerGuideOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-amber-400 font-bold text-xs border border-zinc-800 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>
                  {uiConfig.resellerGuide?.menuLabel ||
                    'Panduan Reseller & Syarat Grosir'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 py-5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            © {new Date().getFullYear()} {storeConfig.storeName}. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </span>
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Importir Tangan Pertama · Jaminan Produk Original & Retur 100%</span>
            </span>
            <button
              type="button"
              onClick={handleRequestToggleAdminMode}
              title={
                isAdminMode
                  ? 'Mode Admin Aktif (Klik untuk mengunci)'
                  : 'Akses Panel Admin (PIN)'
              }
              aria-label="Akses Panel Admin"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                isAdminMode
                  ? 'bg-amber-400/15 border-amber-400/50 text-amber-300 hover:bg-amber-400/25'
                  : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {isAdminMode ? (
                <>
                  <Unlock className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-mono font-bold">Admin ON</span>
                </>
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Widgets (Hidden when any Modal or Cart Drawer is open so they never cover mobile UI controls) */}
      {!isCartOpen &&
        !isOrderTrackingOpen &&
        !isResellerGuideOpen &&
        !selectedProduct &&
        !isProductModalOpen &&
        !isAppearanceModalOpen &&
        !isSettingsModalOpen &&
        !isPinModalOpen && (
          <>
            {/* Bottom-Right: Interactive "Tanya Stok / Live Chat" Cepat (WhatsApp Floating Widget) + Cart Pill */}
            <div className="fixed bottom-3.5 right-3.5 z-30 flex flex-col items-end gap-2.5">
              {/* Interactive Reseller Greeting Popover */}
              {isQuickChatOpen && (
                <div className="w-[310px] sm:w-[340px] rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-4 py-3 bg-zinc-950 text-white flex items-center justify-between gap-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-sm font-bold tracking-wide text-white truncate">
                          LIVE CHAT · TANYA STOK GROSIR
                        </h4>
                        <p className="text-[10px] text-amber-400 font-mono">
                          Admin Gudang TGI Aktif · Respon Cepat
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuickChatOpen(false)}
                      aria-label="Tutup Live Chat"
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 space-y-3 text-xs">
                    {/* Greeting Bubble from Admin */}
                    <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200/80 text-zinc-700 leading-relaxed text-[11px]">
                      Halo Kak Reseller! 👋 Mau cek ketersediaan stok partai besar atau minta foto realpic gudang? Pilih atau ketik SKU di bawah:
                    </div>

                    {/* Quick SKU Selector */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500">
                        Pilih / Ketik Kode SKU Produk:
                      </label>
                      <input
                        type="text"
                        value={quickChatSku}
                        onChange={(e) => setQuickChatSku(e.target.value)}
                        placeholder="Contoh: BP-MY-00513 / Semua SKU"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 font-mono text-xs font-bold text-zinc-900 focus:border-zinc-950 focus:outline-none"
                      />
                      <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5">
                        {products.slice(0, 4).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setQuickChatSku(p.sku)}
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border shrink-0 transition-colors cursor-pointer ${
                              quickChatSku === p.sku
                                ? 'bg-zinc-950 text-amber-400 border-zinc-950'
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {p.sku}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Quantity Selector */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500">
                        Estimasi Pengambilan Partai / Grosir:
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          '6 - 12 Pcs',
                          '12 - 24 Pcs (Grosir)',
                          '50+ Pcs (Partai)',
                        ].map((qtyLabel) => (
                          <button
                            key={qtyLabel}
                            type="button"
                            onClick={() => setQuickChatQty(qtyLabel)}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border truncate transition-colors cursor-pointer ${
                              quickChatQty === qtyLabel
                                ? 'bg-amber-400 text-zinc-950 border-amber-400'
                                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {qtyLabel}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview Auto-Greeting Message */}
                    <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950 font-mono leading-snug">
                      "Halo Admin TGI, saya mau tanya ketersediaan stok partai besar untuk SKU{' '}
                      <strong>{quickChatSku || '...'}</strong> (Estimasi ambil:{' '}
                      {quickChatQty}). Mohon info stok warna & harga grosir terbaiknya."
                    </div>

                    <a
                      href={`https://wa.me/${cleanWhatsAppNumber(
                        storeConfig.whatsappNumber
                      )}?text=${encodeURIComponent(
                        `Halo Admin TGI, saya mau tanya ketersediaan stok partai besar untuk SKU ${
                          quickChatSku.trim() || '...'
                        } (Estimasi ambil: ${quickChatQty}). Mohon info ketersediaan stok warna di gudang & harga grosir terbaiknya. Terima kasih!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsQuickChatOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white/20" />
                      <span>Kirim Chat Tanya Stok via WA</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>
                </div>
              )}

              {/* Floating Action Buttons Row */}
              <div className="flex items-center gap-2">
                {totalCartCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    aria-label="Buka Keranjang Belanja"
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-full bg-zinc-950 hover:bg-zinc-900 text-amber-400 font-bold text-xs shadow-lg border border-amber-400/50 transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="font-mono font-extrabold">
                      {totalCartCount} pcs
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsQuickChatOpen((prev) => !prev)}
                  aria-label="Tanya Stok / Live Chat WhatsApp"
                  title="Tanya Stok Partai Besar / Live Chat Admin TGI"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg border border-emerald-400/40 transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white/15 shrink-0" />
                  <span>Tanya Stok / Live Chat</span>
                </button>
              </div>
            </div>

            {/* Floating Live Notification Widget (Bottom Left) */}
            <FloatingLiveWidget liveConfig={uiConfig.liveShopping} />
          </>
        )}

      {/* 5. Slide-Out Cart Drawer & WhatsApp Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        storeConfig={storeConfig}
        appliedVoucher={appliedVoucher}
        onApplyVoucher={(code) => setAppliedVoucher(code)}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onRecordOrder={handleRecordWhatsAppOrder}
        onShowToast={(msg) => showToast(msg, false)}
      />

      {/* 5.5. Cek Status Pesanan & Riwayat Resi Kargo Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orders={orders}
        storeConfig={storeConfig}
        isAdminMode={isAdminMode}
        onUpdateOrder={(updatedOrd) => {
          setOrders((prev) => {
            const next = prev.map((o) =>
              o.id === updatedOrd.id ? updatedOrd : o
            );
            saveAllLocalOrders(next);
            return next;
          });
        }}
        onShowToast={(msg) => showToast(msg, false)}
      />

      {/* 5.6. Panduan Reseller, Dropship & Syarat Grosir Modal */}
      <ResellerGuideModal
        isOpen={isResellerGuideOpen}
        onClose={() => setIsResellerGuideOpen(false)}
        storeConfig={storeConfig}
        guideConfig={uiConfig.resellerGuide}
        isAdminMode={isAdminMode}
        onEditGuide={() => {
          setIsResellerGuideOpen(false);
          openAppearanceModal('reseller-guide');
        }}
        onStartShopping={() => {
          const catalogEl = document.getElementById('katalog-produk');
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Product Quick View / Detail Modal (with Quick Add Batch Multi-Color & Direct WA Order Button) */}
      <ProductDetailModal
        product={selectedProduct}
        storeConfig={storeConfig}
        isAdminMode={isAdminMode}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onAddBatchToCart={handleAddBatchToCart}
        onEditProduct={openEditProductModal}
      />

      {/* Pop-Up Banner Promo Grosir Otomatis Saat Kunjungan / Refresh Web */}
      <WholesalePromoPopupModal
        isOpen={isWholesalePromoOpen}
        onClose={() => setIsWholesalePromoOpen(false)}
        storeConfig={storeConfig}
        popupConfig={uiConfig.wholesalePopup}
        isAdminMode={isAdminMode}
        onOpenAdminEditor={() => openAppearanceModal('popup')}
        onOpenResellerGuide={() => setIsResellerGuideOpen(true)}
      />

      {/* Master Panel Admin Terpadu (including Pop-Up Promo, Manajemen Artikel & Audit Log) */}
      <AdminAppearanceModal
        isOpen={isAppearanceModalOpen}
        initialTab={appearanceInitialTab}
        uiConfig={uiConfig}
        storeConfig={storeConfig}
        products={products}
        onUpdateProducts={(nextProducts) => {
          setProducts(nextProducts);
          saveLocalProducts(nextProducts);
          recordActivity(
            'product',
            'Pembaruan Cepat Produk & Stok (Inline Table)',
            `Admin memperbarui data harga/stok/berat produk dari tabel Master Panel (${nextProducts.length} SKU aktif)`
          );
          setCartItems((prev) =>
            prev.map((item) => {
              const updatedMatch = nextProducts.find(
                (p) => p.id === item.product.id
              );
              return updatedMatch
                ? { ...item, product: updatedMatch }
                : item;
            })
          );
          if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
            syncProductsToSupabase(
              storeConfig,
              nextProducts,
              uiConfig,
              orders,
              reviews,
              articles
            ).catch(() => {});
          }
        }}
        onOpenAddProductModal={openAddProductModal}
        onOpenEditProductModal={openEditProductModal}
        onDeleteProduct={handleDeleteProduct}
        articles={articles}
        initialEditArticle={adminEditingArticle}
        onPreviewWholesalePopup={() => setIsWholesalePromoOpen(true)}
        onUpdateArticles={(nextArticles) => {
          const isAdded = nextArticles.length > articles.length;
          const isRemoved = nextArticles.length < articles.length;
          setArticles(nextArticles);
          saveLocalArticles(nextArticles);
          recordActivity(
            'article',
            isAdded
              ? 'Publikasi Artikel Blog Baru'
              : isRemoved
              ? 'Penghapusan Artikel Blog'
              : 'Pembaruan Konten Artikel Blog',
            `Total artikel aktif saat ini: ${nextArticles.length} artikel`
          );
          if (selectedBlogArticle) {
            const updatedCurrent = nextArticles.find(
              (a) => a.id === selectedBlogArticle.id
            );
            setSelectedBlogArticle(updatedCurrent || null);
          }
          if (storeConfig.supabaseUrl && storeConfig.supabaseAnonKey) {
            syncProductsToSupabase(
              storeConfig,
              products,
              uiConfig,
              orders,
              reviews,
              nextArticles
            ).catch(() => {});
          }
        }}
        activityLogs={activityLogs}
        onClearActivityLogs={() => {
          const cleared = clearLocalActivityLogs();
          setActivityLogs(cleared);
          showToast('Riwayat log aktivitas admin berhasil dibersihkan.');
        }}
        onClose={() => {
          setIsAppearanceModalOpen(false);
          setAdminEditingArticle(null);
        }}
        onSaveAll={handleSaveAppearanceAndContact}
        onLiveChange={(nextUi, nextStore) => {
          setUiConfig(nextUi);
          saveUiContentConfig(nextUi);
          setStoreConfig(nextStore);
          saveStoreConfig(nextStore);
          if (nextStore.supabaseUrl && nextStore.supabaseAnonKey) {
            syncProductsToSupabase(
              nextStore,
              products,
              nextUi,
              orders,
              reviews,
              articles
            ).catch(() => {});
          }
        }}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-zinc-700">
                          Kategori *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProductModalOpen(false);
                            openAppearanceModal('categories');
                          }}
                          className="text-[10px] font-mono font-bold text-amber-700 hover:text-zinc-950 underline cursor-pointer"
                        >
                          + Kelola / Tambah Kategori Baru
                        </button>
                      </div>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      >
                        {Array.from(
                          new Set([...editableCategoryNames, formCategory])
                        )
                          .filter(Boolean)
                          .map((cat) => (
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Pilihan Warna (Opsional — misal: Black, Cream, Mocca)
                      </label>
                      <input
                        type="text"
                        value={formColors}
                        onChange={(e) => setFormColors(e.target.value)}
                        placeholder="Black, Cream, Mocca"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                      {/* Live Color Dots Preview */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {formColors
                          .split(',')
                          .map((c) => c.trim())
                          .filter(Boolean)
                          .map((color, idx) => (
                            <span
                              key={`${color}-${idx}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-[10px] font-medium text-zinc-700"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                                style={{
                                  backgroundColor: getColorSwatchHex(color),
                                }}
                              />
                              <span>{color}</span>
                            </span>
                          ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Status Stok (Tampil di Kartu Produk)
                      </label>
                      <select
                        value={formStockStatus}
                        onChange={(e) =>
                          setFormStockStatus(e.target.value as StockStatusLabel)
                        }
                        className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      >
                        <option value="Ready Stock">Ready Stock</option>
                        <option value="Stok Terbatas">Stok Terbatas</option>
                        <option value="Pre-Order">Pre-Order</option>
                        <option value="Habis">Habis</option>
                      </select>
                      <p className="text-[11px] text-zinc-500 mt-1.5">
                        Ditampilkan berdampingan dengan titik warna (color dots) di kartu katalog.
                      </p>
                    </div>
                  </div>

                  {/* Spesifikasi Grosir: Bahan, Ukuran (PxLxT cm) & Berat (gram) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800">
                        Spesifikasi Grosir & Estimasi Kargo
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-amber-900">
                        1 Lusin (12 pcs) ≈{' '}
                        {(((Number(formWeightGrams) || 650) * 12) / 1000).toFixed(
                          1
                        )}{' '}
                        kg
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Bahan (Material)
                        </label>
                        <input
                          type="text"
                          value={formMaterial}
                          onChange={(e) => setFormMaterial(e.target.value)}
                          placeholder="PU Leather Grade A / Nylon"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Ukuran (PxLxT cm)
                        </label>
                        <input
                          type="text"
                          value={formDimensions}
                          onChange={(e) => setFormDimensions(e.target.value)}
                          placeholder="30 × 14 × 42 cm"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Berat (gram / pcs)
                        </label>
                        <div className="relative">
                          <Scale className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min={50}
                            step={10}
                            value={formWeightGrams}
                            onChange={(e) =>
                              setFormWeightGrams(Number(e.target.value))
                            }
                            placeholder="650"
                            className="w-full pl-8 pr-11 py-2 text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500">
                            gram
                          </span>
                        </div>
                      </div>
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

                {/* Right Column: Main Photo, Multi-Photo Gallery & Studio Presets */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                    <div className="relative aspect-square w-full bg-white p-3 border-b border-zinc-100 flex items-center justify-center">
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
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-zinc-950/80 text-white font-mono text-[10px] font-bold">
                        FOTO UTAMA ({1 + formGalleryImages.length} Foto)
                      </span>
                    </div>
                    <div className="p-3 bg-zinc-50 flex items-center justify-between text-xs">
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
                      Foto Utama Produk (URL / Upload Lokal)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          placeholder="Tempel URL foto utama https://..."
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

                  {/* Galeri Multi-Foto Produk (Detail Dalam Tas, Resleting, Bagian Belakang) */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-zinc-800">
                          Galeri Multi-Foto (Detail Dalam Tas / Sudut Lain)
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Tambahkan beberapa foto detail untuk dilihat pembeli grosir.
                        </span>
                      </div>
                      <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[11px] font-bold cursor-pointer shrink-0">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Upload Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryFilesUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={formNewGalleryUrl}
                        onChange={(e) => setFormNewGalleryUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGalleryUrl();
                          }
                        }}
                        placeholder="Atau tempel URL foto detail tambahan..."
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold cursor-pointer shrink-0"
                      >
                        + Tambah
                      </button>
                    </div>

                    {formGalleryImages.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {formGalleryImages.map((imgUrl, idx) => (
                          <div
                            key={`${idx}-${imgUrl.slice(0, 18)}`}
                            className="relative group aspect-square rounded-lg border border-zinc-200 bg-white p-1 overflow-hidden"
                          >
                            <img
                              src={imgUrl}
                              alt={`Detail ${idx + 2}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              title="Hapus foto ini"
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-zinc-950/75 text-white font-mono text-[9px] font-bold">
                              #{idx + 2}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400 italic">
                        Belum ada foto tambahan. Anda bisa upload beberapa foto sekaligus.
                      </p>
                    )}
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

                {/* Cloud Backup Summary Counters */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-center">
                    <span className="block font-mono text-base font-extrabold text-zinc-950">
                      {products.length}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-zinc-500">
                      SKU Produk
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-center">
                    <span className="block font-mono text-base font-extrabold text-emerald-700">
                      {orders.length}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-zinc-500">
                      Pesanan WA
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-center">
                    <span className="block font-mono text-base font-extrabold text-amber-600">
                      {reviews.length}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-zinc-500">
                      Ulasan Reseller
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
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
                          : 'Backup Semua Data ke Supabase'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRestoreFromSupabase}
                      disabled={syncState.loading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <CloudDownload className="w-4 h-4" />
                      <span>Muat dari Cloud</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          SUPABASE_SQL_SCHEMA
                        );
                        setCopiedSql(true);
                        showToast('Skema SQL Supabase berhasil disalin!');
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

                {orders.length > 0 && (
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                      Riwayat Checkout WhatsApp Terbaru ({orders.length})
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs">
                      {orders.slice(0, 5).map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between gap-2 py-1 border-b border-zinc-100 last:border-0"
                        >
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-zinc-900">
                              #{ord.referenceCode}
                            </span>{' '}
                            ·{' '}
                            <span className="font-semibold text-zinc-700">
                              {ord.customerName}
                            </span>{' '}
                            <span className="text-zinc-400">
                              ({ord.totalQuantity} pcs)
                            </span>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            {formatRupiah(ord.totalPayable)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="text-xs">
                  <summary className="font-semibold text-zinc-700 cursor-pointer hover:text-zinc-950">
                    Lihat Skema SQL Supabase (tgi_products, tgi_site_settings & tgi_orders)
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

      {/* Modal Verifikasi PIN / Passcode Sesi Login Master Panel Admin */}
      {isPinModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setIsPinModalOpen(false);
            setPendingAdminAction(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-zinc-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="font-display text-lg font-bold tracking-wide uppercase leading-none">
                    AUTENTIKASI MASTER ADMIN
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Protected Session Guard · TGI Security
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPendingAdminAction(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyAdminPin} className="p-5 space-y-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Masukkan <strong className="text-zinc-900">PIN / Passcode Rahasia Admin</strong>{' '}
                untuk membuka sesi <strong className="text-zinc-900">Master Panel Admin</strong>{' '}
                (manajemen stok gudang, harga katalog, artikel blog & audit trail).
              </p>

              {pinError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Kode PIN / Passcode Admin
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPinPassword((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showPinPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                <input
                  type={showPinPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  placeholder="••••••"
                  className="w-full px-3.5 py-2.5 text-center font-mono text-lg font-bold tracking-[0.35em] rounded-xl border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                />
                <p className="mt-1.5 text-[10px] text-zinc-400 text-center">
                  Setiap aktivitas login & perubahan tercatat otomatis pada Audit Trail.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setPendingAdminAction(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold cursor-pointer shadow-xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Verifikasi & Buka Panel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Elegant Floating Toast Notification with Product Preview & Progress Bar */}
      {toastMessage && (
        <div
          key={toastKey}
          role="status"
          aria-live="polite"
          className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 sm:w-[410px] max-w-full bg-zinc-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl shadow-zinc-950/50 border border-zinc-800/90 overflow-hidden animate-toast-in"
        >
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            {toastCartMeta ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative w-12 h-12 rounded-xl bg-white p-1 shrink-0 border border-zinc-700/60 overflow-hidden shadow-xs">
                  <img
                    src={toastCartMeta.imageUrl}
                    alt={toastCartMeta.productName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                    ✓
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[9px] font-bold uppercase tracking-wider">
                      + Masuk Keranjang
                    </span>
                    <span className="font-mono text-[10px] text-amber-400 font-bold truncate">
                      {toastCartMeta.sku}
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-bold text-white truncate">
                    {toastCartMeta.productName}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {toastCartMeta.colorLabel} · {toastCartMeta.quantity} pcs (
                    <span className="font-mono text-zinc-200 font-semibold">
                      {formatRupiah(
                        toastCartMeta.unitPrice * toastCartMeta.quantity
                      )}
                    </span>
                    )
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold flex items-center justify-center shrink-0 text-xs">
                  ✓
                </span>
                <span className="text-xs sm:text-sm font-medium text-zinc-100 leading-snug">
                  {toastMessage}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              {toastShowCartBtn && (
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage(null);
                    setToastCartMeta(null);
                    setIsCartOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 font-extrabold text-[11px] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[2.3]" />
                  <span>Keranjang ({totalCartCount})</span>
                </button>
              )}
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => {
                  setToastMessage(null);
                  setToastCartMeta(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Animated Auto-Dismiss Progress Bar */}
          <div className="h-1 w-full bg-zinc-800/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-amber-300 animate-toast-progress" />
          </div>
        </div>
      )}
    </div>
  );
}
