import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Lock,
  Unlock,
  X,
  Menu,
  Radio,
  Sparkles,
  Truck,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Share2,
  Flame,
  Tag,
  MessageCircle,
  Star,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import {
  ProductCategory,
  CategoryItem,
  StoreConfig,
  BlogArticle,
} from '../types/product';
import { DEFAULT_CATEGORIES } from '../services/productService';
import {
  resolveSocialUrl,
  buildDirectWhatsAppUrl,
} from '../utils/formatters';
import {
  createBagStudioSvg,
  createBentoCardCoverSvg,
} from '../utils/bagStudioSvg';

interface NavbarProps {
  storeName?: string;
  storeConfig?: StoreConfig;
  categories?: CategoryItem[];
  productCountsByCategory?: Record<string, number>;
  totalProductCount?: number;
  onOpenManageCategories?: () => void;
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onSelectSubCategory?: (
    cat: ProductCategory,
    options?: {
      keyword?: string;
      sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'discount-desc';
      stockFilter?: 'all' | 'Ready Stock' | 'Stok Terbatas' | 'wishlist';
      label?: string;
    }
  ) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  wishlistCount?: number;
  isWishlistFilterActive?: boolean;
  onToggleWishlistFilter?: () => void;
  onOpenCart: () => void;
  onOpenOrderTracking: () => void;
  onOpenResellerGuide?: () => void;
  resellerGuideMenuLabel?: string;
  articles?: BlogArticle[];
  isBlogViewActive?: boolean;
  onOpenBlogList?: () => void;
  onSelectArticle?: (article: BlogArticle) => void;
  announcementText?: string;
  showAnnouncementBar?: boolean;
  onEditAnnouncementBar?: () => void;
  isAdminMode: boolean;
  hideAdminInHeader?: boolean;
  onToggleAdminMode: () => void;
  onOpenAddProduct: () => void;
  onOpenStoreSettings: () => void;
}

interface SubCategoryItem {
  label: string;
  description: string;
  badge?: string;
  category: ProductCategory;
  keyword?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'discount-desc';
  stockFilter?: 'all' | 'Ready Stock' | 'Stok Terbatas' | 'wishlist';
}

interface ResellerArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
  highlights: string[];
  content: string[];
}

const RESELLER_ARTICLES: ResellerArticle[] = [
  {
    id: 'strategi-reseller-margin-tinggi',
    title: '5 Strategi Jualan Tas Import dengan Margin hingga 45% untuk Reseller',
    category: 'Tips Bisnis Grosir',
    readTime: '3 Menit Baca',
    date: 'Update Terbaru',
    excerpt:
      'Panduan lengkap memilih SKU Best Seller, mengatur paket mix warna MOQ 6 pcs, dan cara foto ulang produk agar konversi meningkat.',
    image: createBentoCardCoverSvg('new-arrival-backpack'),
    highlights: [
      'Manfaatkan sistem MOQ 6 Pcs boleh campur model untuk tes pasar di kota Anda.',
      'Fokus pada warna netral (Black, Cream, Mocca, Khaki) yang menyumbang 78% penjualan.',
      'Gunakan fitur Live Shopping & video real-pict untuk meningkatkan kepercayaan pembeli.',
    ],
    content: [
      'Memulai bisnis reseller tas import tidak lagi membutuhkan modal puluhan juta rupiah. Dengan sistem grosir MOQ 6 pcs campur model di Tas Grosir Import (TGI), Anda bisa mengambil berbagai varian Backpack, Handbag, dan Shoulder Bag sekaligus untuk melihat model mana yang paling diminati pelanggan Anda.',
      'Kunci utama menjaga margin keuntungan di kisaran 35% hingga 45% adalah memilih produk dengan struktur bahan PU Leather tebal (ketebalan 1.8mm ke atas) dan hardware besi gold/silver anti-karat. Produk dengan spesifikasi ini memiliki nilai jual eceran (perceived value) yang jauh lebih tinggi di mata konsumen akhir.',
      'Selain itu, pastikan Anda selalu memantau label "Ready Stock" dan memanfaatkan pengiriman kargo darat seperti JNE Trucking (JTR) atau Indah Cargo agar ongkos kirim per pcs tas hanya berkisar Rp 2.500 - Rp 4.000 saja.',
    ],
  },
  {
    id: 'panduan-kargo-partai-besar',
    title: 'Cara Hemat Ongkir Kargo Partai Besar (JTR, Indah Cargo & Sicepat Gokil)',
    category: 'Logistik & Ekspedisi',
    readTime: '4 Menit Baca',
    date: 'Panduan Gudang',
    excerpt:
      'Simulasi perhitungan kubikasi vs berat aktual (kg) agar pengiriman luar pulau tetap hemat dan tas tidak penyok di perjalanan.',
    image: createBentoCardCoverSvg('pickup-gudang'),
    highlights: [
      'Pengiriman di atas 10 Kg otomatis jauh lebih hemat menggunakan tarif kargo darat/laut.',
      'Setiap tas TGI dilengkapi bubble wrap + dustbag tebal untuk menjaga bentuk tas.',
      'Gunakan fitur Cek Resi & Kalkulator Kargo di website TGI sebelum checkout.',
    ],
    content: [
      'Salah satu komponen biaya terbesar bagi reseller luar kota dan luar pulau adalah ongkos kirim. Jika menggunakan ekspedisi reguler, 1 lusin tas dengan berat total 7-8 Kg bisa memakan biaya yang tinggi.',
      'Solusinya adalah beralih ke layanan kargo (JNE Trucking / JTR, Indah Cargo, atau Sicepat Gokil). Di TGI, tim gudang kami menyusun tata letak karung/kardus secara presisi dengan pelindung bantal udara di bagian dalam tas agar bentuk struktur tas tetap kokoh tanpa terkena hitungan volume berlebih.',
      'Anda dapat langsung menguji estimasi ongkos kirim berdasarkan berat gram aktual tiap SKU menggunakan Kalkulator Kargo Otomatis yang tersedia di dalam Keranjang Belanja TGI.',
    ],
  },
  {
    id: 'tren-model-tas-import-terlaris',
    title: 'Tren Model & Warna Tas Wanita Import Paling Dicari Reseller Tahun Ini',
    category: 'Riset Katalog',
    readTime: '3 Menit Baca',
    date: 'Tren Pasar',
    excerpt:
      'Daftar sub-kategori tas yang paling cepat habis di sesi Live TikTok & Shopee: dari Shoulder Bag Korea hingga Backpack Anti-Air.',
    image: createBagStudioSvg({ variant: 'shoulder-caramel', sku: 'TREND-2026' }),
    highlights: [
      'Shoulder Bag gaya Korea & Hobo minimalis mendominasi pembelian usia 18-30 tahun.',
      'Handbag Top Handle dengan tali selempang lepas-pasang paling laris untuk pekerja kantor.',
      'Backpack nilon waterproof ukuran Medium-Large stabil dicari sepanjang tahun.',
    ],
    content: [
      'Berdasarkan data pesanan grosir dari lebih dari 1.200 toko dan reseller mitra TGI, permintaan pasar saat ini sangat mengarah pada tas multifungsi yang memiliki 2 tali (tali bahu pendek dan tali panjang adjustable).',
      'Untuk kategori warna, kombinasi Earth Tone seperti Mocca, Cream, Coffee, dan Elephant Grey mengalami lonjakan permintaan tertinggi karena mudah dipadukan dengan berbagai busana kerja maupun kasual.',
      'Pastikan toko Anda memiliki minimal 2 SKU dari masing-masing kategori (Backpack, Handbag, dan Shoulder Bag) agar pelanggan memiliki pilihan lengkap saat berbelanja.',
    ],
  },
];

const CATEGORY_DROPDOWN_MAP: Record<ProductCategory, SubCategoryItem[]> = {
  Semua: [
    {
      label: 'Semua Katalog Produk',
      description: 'Tampilkan seluruh koleksi tas import TGI',
      badge: 'Lengkap',
      category: 'Semua',
    },
    {
      label: 'Stok Siap Kirim (Ready Stock)',
      description: 'Filter produk yang langsung siap dikirim hari ini',
      badge: 'Prioritas',
      category: 'Semua',
      stockFilter: 'Ready Stock',
    },
    {
      label: 'Harga Grosir Termurah',
      description: 'Urutkan dari harga grosir paling ekonomis',
      category: 'Semua',
      sortBy: 'price-asc',
    },
    {
      label: 'Koleksi Baru Masuk Gudang',
      description: 'Model tas import rilisan terbaru minggu ini',
      badge: 'New',
      category: 'Semua',
      sortBy: 'newest',
    },
  ],
  Backpack: [
    {
      label: 'Semua Backpack Import',
      description: 'Koleksi lengkap tas ransel wanita & pria import',
      badge: 'Populer',
      category: 'Backpack',
    },
    {
      label: 'Ransel Wanita & Gaya Korea',
      description: 'Desain modis untuk kuliah, hangout & kerja harian',
      category: 'Backpack',
      keyword: 'Ransel',
    },
    {
      label: 'Backpack Nilon & Anti-Air',
      description: 'Bahan waterproof ringan dengan banyak kompartemen',
      badge: 'Best Seller',
      category: 'Backpack',
      stockFilter: 'Ready Stock',
    },
    {
      label: 'Backpack Kapasitas Besar / Laptop',
      description: 'Muat buku, dokumen & perlengkapan travel',
      category: 'Backpack',
      sortBy: 'featured',
    },
  ],
  Handbag: [
    {
      label: 'Semua Handbag Import',
      description: 'Koleksi tas tangan mewah & formal kualitas butik',
      badge: 'Margin Tinggi',
      category: 'Handbag',
    },
    {
      label: 'Handbag Pesta & Kondangan',
      description: 'Aksen hardware gold mewah & kulit sintetis tebal',
      badge: 'Hot',
      category: 'Handbag',
      stockFilter: 'Ready Stock',
    },
    {
      label: 'Top Handle & Tas Kerja Kantor',
      description: 'Dilengkapi tali panjang selempang lepas-pasang',
      category: 'Handbag',
      sortBy: 'featured',
    },
    {
      label: 'Handbag Koleksi Terbaru',
      description: 'Urutkan model handbag import yang baru tiba',
      category: 'Handbag',
      sortBy: 'newest',
    },
  ],
  'Shoulder Bag': [
    {
      label: 'Semua Shoulder Bag Import',
      description: 'Tas bahu & selempang wanita paling cepat laku',
      badge: 'Fast Moving',
      category: 'Shoulder Bag',
    },
    {
      label: 'Shoulder Bag Vintage & Korea',
      description: 'Model kekinian favorit reseller online & live',
      badge: 'Trending',
      category: 'Shoulder Bag',
      stockFilter: 'Ready Stock',
    },
    {
      label: 'Sling Bag & Crossbody Harian',
      description: 'Ukuran ringkas dengan pilihan warna pastel & netral',
      category: 'Shoulder Bag',
      sortBy: 'price-asc',
    },
    {
      label: 'Shoulder Bag Rilisan Baru',
      description: 'Koleksi tas bahu import batch terbaru',
      category: 'Shoulder Bag',
      sortBy: 'newest',
    },
  ],
  'Promo Grosir': [
    {
      label: 'Semua Produk Promo Grosir',
      description: 'Potongan harga spesial untuk pembelian partai & seri',
      badge: 'Hemat',
      category: 'Promo Grosir',
    },
    {
      label: 'Paket Usaha Reseller (MOQ 6 Pcs)',
      description: 'Bebas campur model & warna langsung harga grosir',
      badge: 'MOQ 6',
      category: 'Promo Grosir',
      stockFilter: 'Ready Stock',
    },
    {
      label: 'Diskon Partai Terbesar',
      description: 'Urutkan dari potongan diskon tertinggi hingga 45%',
      badge: 'Sale',
      category: 'Promo Grosir',
      sortBy: 'discount-desc',
    },
    {
      label: 'Stok Terbatas / Cuci Gudang',
      description: 'Sisa stok gudang dengan diskon margin ekstra',
      badge: 'Limited',
      category: 'Promo Grosir',
      stockFilter: 'Stok Terbatas',
    },
  ],
};

const CATEGORIES: ProductCategory[] = [
  'Semua',
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

type DropdownKey =
  | null
  | 'mega-kategori'
  | 'menu-kategori'
  | 'menu-koleksi'
  | 'menu-sosmed'
  | 'menu-blog';

export const Navbar: React.FC<NavbarProps> = ({
  storeName = 'TAS GROSIR IMPORT',
  storeConfig,
  categories = DEFAULT_CATEGORIES,
  productCountsByCategory = {},
  totalProductCount = 0,
  onOpenManageCategories,
  activeCategory,
  onSelectCategory,
  onSelectSubCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount = 0,
  isWishlistFilterActive = false,
  onToggleWishlistFilter,
  onOpenCart,
  onOpenOrderTracking,
  onOpenResellerGuide,
  resellerGuideMenuLabel = 'Panduan Reseller & Syarat Grosir',
  articles = [],
  isBlogViewActive = false,
  onOpenBlogList,
  onSelectArticle,
  announcementText = 'Harga Grosir Otomatis Min. 6 Pcs (Bebas Campur SKU & Warna)',
  showAnnouncementBar = true,
  onEditAnnouncementBar,
  isAdminMode,
  hideAdminInHeader = false,
  onToggleAdminMode,
}) => {
  const effectiveCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : DEFAULT_CATEGORIES;
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [activeArticle, setActiveArticle] = useState<ResellerArticle | null>(
    null
  );

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnterDropdown = (key: DropdownKey) => {
    clearCloseTimer();
    setOpenDropdown(key);
  };

  const handleMouseLeaveDropdown = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleToggleDropdownClick = (key: DropdownKey) => {
    clearCloseTimer();
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setIsQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      clearCloseTimer();
    };
  }, []);

  const handleCategoryClick = (category: ProductCategory) => {
    onSelectCategory(category);
    setOpenDropdown(null);
    setIsQuickMenuOpen(false);
    const catalogEl = document.getElementById('katalog-produk');
    if (catalogEl && category !== 'Semua') {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubCategorySelect = (item: SubCategoryItem) => {
    if (onSelectSubCategory) {
      onSelectSubCategory(item.category, {
        keyword: item.keyword,
        sortBy: item.sortBy,
        stockFilter: item.stockFilter,
        label: item.label,
      });
    } else {
      onSelectCategory(item.category);
      if (item.keyword !== undefined) {
        onSearchChange(item.keyword);
      }
    }
    setOpenDropdown(null);
    setIsQuickMenuOpen(false);
    const catalogEl = document.getElementById('katalog-produk');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    setOpenDropdown(null);
    setIsQuickMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const instagramUrl =
    resolveSocialUrl('instagram', storeConfig?.socialLinks?.instagram || '') ||
    'https://instagram.com/tasgrosirimport.id';
  const tiktokUrl =
    resolveSocialUrl('tiktok', storeConfig?.socialLinks?.tiktok || '') ||
    'https://tiktok.com/@tasgrosirimport.id';
  const shopeeUrl =
    resolveSocialUrl('shopee', storeConfig?.socialLinks?.shopeeUrl || '') ||
    'https://shopee.co.id/tasgrosirimport';
  const tokopediaUrl =
    resolveSocialUrl('tokopedia', storeConfig?.socialLinks?.tokopediaUrl || '') ||
    'https://tokopedia.com/tasgrosirimport';
  const facebookUrl =
    resolveSocialUrl('facebook', storeConfig?.socialLinks?.facebook || '') ||
    'https://facebook.com/tasgrosirimport';
  const whatsappUrl = storeConfig
    ? buildDirectWhatsAppUrl(storeConfig)
    : 'https://wa.me/6281234567890';

  return (
    <>
      <header
        ref={navContainerRef}
        className="sticky top-0 z-40 bg-white border-b border-zinc-200 transition-colors"
      >
        {/* TOP SLIM BAR ALA ZALORA: Pengumuman Berjalan, Info Grosir & Akses Cepat Cek Resi */}
        {showAnnouncementBar && (
          <div className="bg-zinc-950 text-zinc-300 text-[11px] border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                <span className="font-mono font-bold uppercase tracking-widest text-amber-400 shrink-0">
                  OFFICIAL WHOLESALE
                </span>
                <span className="hidden md:inline text-zinc-600 shrink-0">|</span>
                <span className="truncate text-zinc-200 font-medium">
                  {announcementText ||
                    'Harga Grosir Otomatis Min. 6 Pcs (Bebas Campur SKU & Warna)'}
                </span>
                {isAdminMode && onEditAnnouncementBar && (
                  <button
                    type="button"
                    onClick={onEditAnnouncementBar}
                    className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 font-mono text-[10px] font-extrabold shrink-0 hover:bg-amber-300 cursor-pointer"
                  >
                    Edit Teks
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {onOpenBlogList && (
                  <button
                    type="button"
                    onClick={onOpenBlogList}
                    className={`inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isBlogViewActive
                        ? 'text-amber-400 font-bold'
                        : 'text-zinc-200 hover:text-amber-400'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Artikel & Tips Bisnis</span>
                  </button>
                )}
                {onOpenResellerGuide && (
                  <button
                    type="button"
                    onClick={onOpenResellerGuide}
                    className="hidden md:inline-flex items-center gap-1.5 text-zinc-200 hover:text-amber-400 font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{resellerGuideMenuLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => scrollToSection('tgi-live-studio')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Radio className="w-3 h-3 text-rose-500" />
                  <span>Live Shopping</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenOrderTracking}
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Cek Resi & Status Pesanan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BARIS UTAMA HEADER ZALORA: Kiri Mega Menu Trigger, Tengah Brand Wordmark, Kanan Search + Wishlist + Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* ZONA KIRI: Tombol Mega Menu Kategori & Quick Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickMenuOpen((prev) => !prev)}
                aria-expanded={isQuickMenuOpen}
                aria-label="Mega Menu Kategori"
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold uppercase tracking-widest border transition-colors cursor-pointer whitespace-nowrap ${
                  isQuickMenuOpen
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white hover:bg-zinc-100 text-zinc-950 border-zinc-300'
                }`}
              >
                {isQuickMenuOpen ? (
                  <X className="w-4 h-4 stroke-[2.2]" />
                ) : (
                  <Menu className="w-4 h-4 stroke-[2.2]" />
                )}
                <span className="hidden sm:inline">Mega Menu</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isQuickMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* ZONA TENGAH: Brand Wordmark Fashion Internasional */}
            <div className="flex-1 flex items-center justify-center px-2 min-w-0">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('Semua');
                  onSearchChange('');
                  setOpenDropdown(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-center focus:outline-none cursor-pointer group max-w-full"
              >
                <span className="block font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.14em] uppercase text-zinc-950 group-hover:text-zinc-700 transition-colors whitespace-nowrap truncate">
                  {storeName || 'TAS GROSIR IMPORT'}
                </span>
              </button>
            </div>

            {/* ZONA KANAN: Search Bar Minimalis, Wishlist, Shopping Bag & Admin */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
              {/* Desktop Search Input (Zalora Underline / Clean Box Style) */}
              <div className="hidden lg:block relative w-56 xl:w-68">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Cari tas, model, atau SKU..."
                  aria-label="Cari produk atau kode SKU"
                  className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-zinc-100/90 hover:bg-zinc-100 focus:bg-white text-zinc-900 placeholder:text-zinc-500 border border-zinc-200 focus:border-zinc-950 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                aria-label="Cari Produk"
                className={`lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border transition-colors cursor-pointer ${
                  isMobileSearchOpen || searchQuery
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-950'
                }`}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => {
                  onToggleWishlistFilter?.();
                  const catalogEl = document.getElementById('katalog-produk');
                  if (catalogEl) {
                    catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                aria-label={`Wishlist Saya (${wishlistCount} produk)`}
                title="Lihat Produk di Wishlist Saya"
                className={`relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border transition-colors shrink-0 cursor-pointer ${
                  isWishlistFilterActive
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-950'
                }`}
              >
                <Heart
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                    isWishlistFilterActive
                      ? 'fill-white text-white'
                      : wishlistCount > 0
                      ? 'fill-rose-600 text-rose-600'
                      : ''
                  }`}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center border border-white tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={onOpenCart}
                aria-label={`Keranjang Belanja (${cartCount} item)`}
                className="relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-400 text-zinc-950 font-mono text-[10px] font-black flex items-center justify-center border-2 border-white tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Admin Mode Button */}
              {(isAdminMode || !hideAdminInHeader) && (
                <button
                  type="button"
                  onClick={onToggleAdminMode}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isAdminMode
                      ? 'bg-amber-400 text-zinc-950 border-zinc-950'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950'
                  }`}
                  title={
                    isAdminMode
                      ? 'Klik untuk mengunci / keluar dari Mode Admin'
                      : 'Buka Mode Admin (Memerlukan PIN)'
                  }
                >
                  {isAdminMode ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Admin Aktif</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">Admin</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Expandable Search Bar on Mobile */}
          {isMobileSearchOpen && (
            <div className="lg:hidden pb-3 pt-1">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ketik nama tas atau kode SKU (contoh: BP-MY-00513)..."
                  autoFocus
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-zinc-100 focus:bg-white text-zinc-900 border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FULL-WIDTH ZALORA MEGA MENU PANEL (When "Mega Menu" Button is Clicked) */}
          {isQuickMenuOpen && (
            <div className="py-6 px-5 mb-4 bg-zinc-950 text-white border border-zinc-800 shadow-2xl space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>MEGA MENU DIREKTORI KATALOG & RESELLER TGI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="text-zinc-400 hover:text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Tutup</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* Kolom 1: Kategori & Sub-Kategori Tas */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                      01. Kategori Utama
                    </p>
                    {isAdminMode && onOpenManageCategories && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          onOpenManageCategories();
                        }}
                        className="text-[10px] font-mono font-bold text-amber-300 hover:underline cursor-pointer"
                      >
                        + Kelola
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick('Semua')}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        activeCategory === 'Semua'
                          ? 'bg-white text-zinc-950'
                          : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <span>Semua Katalog</span>
                      <span className="text-[10px] font-mono opacity-70">
                        {totalProductCount} SKU
                      </span>
                    </button>
                    {effectiveCategories.map((cat) => (
                      <button
                        key={cat.id || cat.name}
                        type="button"
                        onClick={() => handleCategoryClick(cat.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                          activeCategory === cat.name
                            ? 'bg-white text-zinc-950'
                            : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] font-mono opacity-70">
                          {productCountsByCategory[cat.name] ?? 0} SKU
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kolom 2: Koleksi Baru & Diskon Grosir */}
                <div className="space-y-2.5">
                  <p className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                    02. Koleksi & Diskon Grosir
                  </p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSubCategorySelect({
                          label: 'New Arrival (Koleksi Terbaru)',
                          description: '',
                          category: 'Semua',
                          sortBy: 'newest',
                        })
                      }
                      className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>New Arrival Minggu Ini</span>
                      <span className="px-1.5 py-0.5 bg-amber-400 text-zinc-950 text-[10px] font-mono font-black">
                        NEW
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSubCategorySelect({
                          label: 'Diskon Grosir Terbesar',
                          description: '',
                          category: 'Promo Grosir',
                          sortBy: 'discount-desc',
                        })
                      }
                      className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Diskon Grosir Terbesar</span>
                      <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-mono font-black">
                        SALE
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSubCategorySelect({
                          label: 'Produk Ready Stock Siap Kirim',
                          description: '',
                          category: 'Semua',
                          stockFilter: 'Ready Stock',
                        })
                      }
                      className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Ready Stock Gudang</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenOrderTracking();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 border border-amber-400/40 hover:bg-zinc-800 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>Cek Resi & Status Pesanan</span>
                      <Truck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Kolom 3: Kanal Sosial Media & Official Store */}
                <div className="space-y-2.5">
                  <p className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                    03. Official Store & Sosmed
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold transition-colors"
                    >
                      <span>TikTok Live</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                    <a
                      href={shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-orange-300 text-xs font-semibold transition-colors"
                    >
                      <span>Shopee</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                    <a
                      href={tokopediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      <span>Tokopedia</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 flex items-center justify-between px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                    >
                      <span>Hubungi WhatsApp Admin Gudang</span>
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Kolom 4: Artikel & Tips Bisnis + Panduan Reseller */}
                <div className="space-y-2.5">
                  <p className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                    04. Artikel & Tips Bisnis
                  </p>
                  <div className="space-y-1.5">
                    {onOpenBlogList && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          onOpenBlogList();
                        }}
                        className="w-full text-left p-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-colors cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wide">
                            Artikel & Tips Bisnis (Blog SEO)
                          </p>
                          <span className="text-[10px] font-mono font-bold text-zinc-800 block">
                            Baca Semua Panduan Bisnis & Strategi Reseller ({articles.length || RESELLER_ARTICLES.length} Artikel)
                          </span>
                        </div>
                        <BookOpen className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                    {onOpenResellerGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          onOpenResellerGuide();
                        }}
                        className="w-full text-left p-2 bg-zinc-900 hover:bg-zinc-800 border border-amber-400/40 text-amber-300 transition-colors cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide">
                            {resellerGuideMenuLabel}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            Sistem Dropship · Resi Otomatis · Durasi Kargo
                          </span>
                        </div>
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    )}
                    {(articles.length > 0 ? articles.slice(0, 3) : []).map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          if (onSelectArticle) {
                            onSelectArticle(article);
                          } else if (onOpenBlogList) {
                            onOpenBlogList();
                          }
                        }}
                        className="w-full text-left p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer group"
                      >
                        <p className="text-xs font-bold text-zinc-100 group-hover:text-amber-400 line-clamp-1">
                          {article.title}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {article.category} · {article.publishedAt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BARIS KEDUA: Bar Kategori & Mega Dropdown Luas Gaya Zalora */}
        <div className="bg-white border-t border-zinc-200/90 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Navigasi Kategori Utama & Mega Dropdown"
              className="flex items-center justify-start lg:justify-center gap-1 sm:gap-2 overflow-x-auto lg:overflow-visible py-2 no-scrollbar"
            >
              {/* 1. DROPDOWN TUNGGAL: KATEGORI (MENCAKUP SEMUA JENIS KATEGORI DINAMIS) */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => handleMouseEnterDropdown('menu-kategori')}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  aria-expanded={openDropdown === 'menu-kategori'}
                  onClick={() => handleToggleDropdownClick('menu-kategori')}
                  className={`px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    openDropdown === 'menu-kategori' ||
                    (activeCategory !== 'Semua' && !isWishlistFilterActive && !isBlogViewActive)
                      ? 'border-zinc-950 text-zinc-950 bg-zinc-100/80'
                      : 'border-transparent text-zinc-800 hover:text-zinc-950 hover:border-zinc-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Kategori
                    {activeCategory !== 'Semua' &&
                    !isWishlistFilterActive &&
                    !isBlogViewActive
                      ? `: ${activeCategory}`
                      : ''}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'menu-kategori' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Desktop Dropdown Panel untuk Seluruh Kategori */}
                {openDropdown === 'menu-kategori' && (
                  <div className="hidden lg:block absolute left-0 top-full pt-2 w-88 z-50 animate-in fade-in duration-150">
                    <div className="bg-white border border-zinc-200 shadow-2xl p-3 space-y-1 max-h-[75vh] overflow-y-auto">
                      <div className="px-2.5 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                          Daftar Kategori Produk ({effectiveCategories.length})
                        </span>
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                      </div>

                      {/* Opsi Utama: Semua Katalog Produk */}
                      <button
                        type="button"
                        onClick={() => handleCategoryClick('Semua')}
                        className={`w-full text-left px-3 py-2.5 transition-colors flex items-start justify-between gap-2 group cursor-pointer ${
                          activeCategory === 'Semua' && !isWishlistFilterActive
                            ? 'bg-zinc-950 text-white'
                            : 'hover:bg-zinc-50 text-zinc-900'
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-extrabold uppercase tracking-wide ${
                              activeCategory === 'Semua' && !isWishlistFilterActive
                                ? 'text-amber-400'
                                : 'text-zinc-900 group-hover:text-zinc-950'
                            }`}
                          >
                            Semua Katalog Produk
                          </p>
                          <p
                            className={`text-[11px] line-clamp-1 mt-0.5 ${
                              activeCategory === 'Semua' && !isWishlistFilterActive
                                ? 'text-zinc-300'
                                : 'text-zinc-500'
                            }`}
                          >
                            Tampilkan seluruh koleksi tas import siap kirim ({totalProductCount} SKU)
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            activeCategory === 'Semua' && !isWishlistFilterActive
                              ? 'bg-amber-400 text-zinc-950'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          Semua
                        </span>
                      </button>

                      {/* Daftar Seluruh Kategori Dinamis */}
                      {effectiveCategories.map((cat) => {
                        const isSelected =
                          activeCategory === cat.name && !isWishlistFilterActive;
                        const isPromo =
                          cat.name.toLowerCase().includes('promo') ||
                          cat.name.toLowerCase().includes('sale');
                        const skuCount = productCountsByCategory[cat.name] ?? 0;

                        return (
                          <button
                            key={cat.id || cat.name}
                            type="button"
                            onClick={() => handleCategoryClick(cat.name)}
                            className={`w-full text-left px-3 py-2.5 transition-colors flex items-start justify-between gap-2 group cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-950 text-white'
                                : 'hover:bg-zinc-50 text-zinc-900'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p
                                  className={`text-xs font-bold ${
                                    isSelected
                                      ? 'text-amber-400'
                                      : isPromo
                                      ? 'text-rose-600 group-hover:text-rose-700'
                                      : 'text-zinc-900 group-hover:text-zinc-950'
                                  }`}
                                >
                                  {cat.name}
                                </p>
                                <span
                                  className={`text-[10px] font-mono ${
                                    isSelected ? 'text-zinc-400' : 'text-zinc-400'
                                  }`}
                                >
                                  ({skuCount})
                                </span>
                              </div>
                              <p
                                className={`text-[11px] line-clamp-1 mt-0.5 ${
                                  isSelected ? 'text-zinc-300' : 'text-zinc-500'
                                }`}
                              >
                                {cat.description ||
                                  `Koleksi produk ${cat.name} import tangan pertama`}
                              </p>
                            </div>
                            {cat.badge && (
                              <span
                                className={`shrink-0 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                                  isSelected
                                    ? 'bg-amber-400 text-zinc-950'
                                    : isPromo
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-zinc-950 text-white'
                                }`}
                              >
                                {cat.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Shortcut Admin: Kelola Kategori */}
                      {isAdminMode && onOpenManageCategories && (
                        <div className="pt-2 mt-1 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              onOpenManageCategories();
                            }}
                            className="w-full px-3 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>+ Kelola / Tambah Kategori Baru</span>
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="hidden sm:inline-block h-4 w-px bg-zinc-200 mx-2 shrink-0" />

              {/* 2. DROPDOWN: KOLEKSI TERBARU & DISKON GROSIR */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => handleMouseEnterDropdown('menu-koleksi')}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  aria-expanded={openDropdown === 'menu-koleksi'}
                  onClick={() => handleToggleDropdownClick('menu-koleksi')}
                  className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    openDropdown === 'menu-koleksi'
                      ? 'border-zinc-950 text-zinc-950'
                      : 'border-transparent text-zinc-700 hover:text-zinc-950'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Koleksi Terbaru</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'menu-koleksi' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'menu-koleksi' && (
                  <div className="hidden lg:block absolute left-0 top-full pt-2 w-80 z-50 animate-in fade-in duration-150">
                    <div className="bg-white border border-zinc-200 shadow-2xl p-3 space-y-1">
                      <div className="px-2.5 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                          Kurasi & Diskon Grosir
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSubCategorySelect({
                            label: 'New Arrival Minggu Ini',
                            description: '',
                            category: 'Semua',
                            sortBy: 'newest',
                          })
                        }
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            New Arrival (Koleksi Terbaru)
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Model tas import yang baru tiba di gudang
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-zinc-950 text-white font-mono text-[10px] font-bold uppercase">
                          NEW
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSubCategorySelect({
                            label: 'Diskon Grosir Terbesar',
                            description: '',
                            category: 'Promo Grosir',
                            sortBy: 'discount-desc',
                          })
                        }
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-rose-600">
                            Diskon Grosir Spesial (Hingga 45%)
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Potongan harga tertinggi untuk reseller partai
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold uppercase">
                          SALE
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Klaim Voucher Grosir
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Gunakan kode TGIRESELLER20 & FREEKARGO
                          </p>
                        </div>
                        <Tag className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollToSection('tgi-live-studio')}
                        className="w-full text-left px-3 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white transition-colors flex items-start justify-between gap-2 cursor-pointer mt-1"
                      >
                        <div>
                          <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span>TGI Live Shopping Studio</span>
                          </p>
                          <p className="text-[11px] text-zinc-300">
                            Preview etalase spill live & gabung sesi gudang
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold uppercase">
                          LIVE
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. DROPDOWN: SOSIAL MEDIA & OFFICIAL MARKETPLACE */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => handleMouseEnterDropdown('menu-sosmed')}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  aria-expanded={openDropdown === 'menu-sosmed'}
                  onClick={() => handleToggleDropdownClick('menu-sosmed')}
                  className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    openDropdown === 'menu-sosmed'
                      ? 'border-zinc-950 text-zinc-950'
                      : 'border-transparent text-zinc-700 hover:text-zinc-950'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>Sosmed Resmi</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'menu-sosmed' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'menu-sosmed' && (
                  <div className="hidden lg:block absolute right-0 top-full pt-2 w-76 z-50 animate-in fade-in duration-150">
                    <div className="bg-white border border-zinc-200 shadow-2xl p-3 space-y-1">
                      <div className="px-2.5 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                          Kanal Resmi & Marketplace
                        </span>
                        <Share2 className="w-3.5 h-3.5 text-zinc-900" />
                      </div>

                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Instagram Official TGI
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Lookbook & update katalog harian
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 shrink-0" />
                      </a>

                      <a
                        href={tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            TikTok Live & Katalog Video
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Review langsung dari gudang TGI
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 shrink-0" />
                      </a>

                      <a
                        href={shopeeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Shopee Official Store
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Checkout via marketplace Shopee
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 shrink-0" />
                      </a>

                      <a
                        href={tokopediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Tokopedia Official Store
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Pengiriman instan & kargo seluruh Indonesia
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 shrink-0" />
                      </a>

                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpenDropdown(null)}
                        className="w-full px-3 py-2 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900">
                            Facebook Page Komunitas
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Komunitas reseller & grosir partai
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-950 shrink-0" />
                      </a>

                      <div className="pt-1.5 border-t border-zinc-100">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setOpenDropdown(null)}
                          className="w-full px-3 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-between transition-colors"
                        >
                          <span>Chat WhatsApp Admin TGI</span>
                          <MessageCircle className="w-4 h-4 text-amber-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. DROPDOWN: ARTIKEL & TIPS BISNIS + PANDUAN RESELLER */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => handleMouseEnterDropdown('menu-blog')}
                onMouseLeave={handleMouseLeaveDropdown}
              >
                <button
                  type="button"
                  aria-expanded={openDropdown === 'menu-blog'}
                  onClick={() => {
                    if (onOpenBlogList) {
                      setOpenDropdown(null);
                      onOpenBlogList();
                    } else {
                      handleToggleDropdownClick('menu-blog');
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer border-b-2 ${
                    isBlogViewActive || openDropdown === 'menu-blog'
                      ? 'border-zinc-950 text-zinc-950 bg-amber-50/70'
                      : 'border-transparent text-zinc-700 hover:text-zinc-950'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Artikel & Tips Bisnis</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openDropdown === 'menu-blog' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {openDropdown === 'menu-blog' && (
                  <div className="hidden lg:block absolute right-0 top-full pt-2 w-92 z-50 animate-in fade-in duration-150">
                    <div className="bg-white border border-zinc-200 shadow-2xl p-3 space-y-2">
                      <div className="px-2.5 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                          Artikel & Tips Bisnis (Blog SEO)
                        </span>
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      </div>

                      {onOpenBlogList && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdown(null);
                            onOpenBlogList();
                          }}
                          className="w-full text-left p-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 transition-colors flex items-center justify-between gap-2.5 cursor-pointer"
                        >
                          <div>
                            <span className="inline-block px-1.5 py-0.5 bg-zinc-950 text-amber-300 font-mono text-[9px] font-extrabold uppercase mb-0.5">
                              BLOG & EDUKASI BISNIS
                            </span>
                            <p className="text-xs font-black text-zinc-950">
                              Buka Halaman Daftar Artikel Lengkap ({articles.length})
                            </p>
                            <p className="text-[11px] text-zinc-800 leading-snug">
                              Tips kulakan tas import, hemat ongkir kargo & tren produk laris
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-zinc-950 shrink-0" />
                        </button>
                      )}

                      {(articles.length > 0 ? articles.slice(0, 3) : []).map((article) => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => {
                            setOpenDropdown(null);
                            if (onSelectArticle) {
                              onSelectArticle(article);
                            } else if (onOpenBlogList) {
                              onOpenBlogList();
                            }
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-zinc-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover shrink-0 border border-zinc-200 bg-zinc-100"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="inline-block text-[10px] font-mono font-bold uppercase text-amber-700">
                              {article.category} · {article.publishedAt}
                            </span>
                            <p className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950 line-clamp-1">
                              {article.title}
                            </p>
                            <p className="text-[11px] text-zinc-500 line-clamp-1">
                              Baca Selengkapnya →
                            </p>
                          </div>
                        </button>
                      ))}

                      {onOpenResellerGuide && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdown(null);
                            onOpenResellerGuide();
                          }}
                          className="w-full text-left p-2.5 bg-zinc-950 hover:bg-zinc-900 text-white transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-bold text-amber-400">
                              {resellerGuideMenuLabel}
                            </p>
                            <p className="text-[10px] text-zinc-300">
                              Dropship, Resi Otomatis Marketplace & Tabel Kargo
                            </p>
                          </div>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile / Tablet Expandable Dropdown Tray */}
          {openDropdown && (
            <div className="lg:hidden border-t border-zinc-200 bg-white px-4 py-3 shadow-lg animate-in fade-in duration-150">
              <div className="max-w-7xl mx-auto space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                    {openDropdown === 'menu-kategori'
                      ? `Pilih Kategori Produk (${effectiveCategories.length})`
                      : openDropdown === 'menu-koleksi'
                      ? 'Koleksi Terbaru & Diskon Grosir'
                      : openDropdown === 'menu-sosmed'
                      ? 'Sosial Media & Official Store'
                      : 'Blog & Layanan Reseller'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="p-1 text-zinc-400 hover:text-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {openDropdown === 'menu-kategori' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick('Semua')}
                      className={`text-left p-2.5 border flex items-center justify-between gap-2 ${
                        activeCategory === 'Semua' && !isWishlistFilterActive
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                      }`}
                    >
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            activeCategory === 'Semua' && !isWishlistFilterActive
                              ? 'text-amber-400'
                              : 'text-zinc-900'
                          }`}
                        >
                          Semua Katalog Produk
                        </p>
                        <p
                          className={`text-[11px] ${
                            activeCategory === 'Semua' && !isWishlistFilterActive
                              ? 'text-zinc-300'
                              : 'text-zinc-500'
                          }`}
                        >
                          Seluruh koleksi tas import ({totalProductCount} SKU)
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 bg-amber-400 text-zinc-950 font-mono text-[10px] font-bold uppercase shrink-0">
                        Semua
                      </span>
                    </button>

                    {effectiveCategories.map((cat) => {
                      const isSelected =
                        activeCategory === cat.name && !isWishlistFilterActive;
                      const skuCount = productCountsByCategory[cat.name] ?? 0;
                      return (
                        <button
                          key={cat.id || cat.name}
                          type="button"
                          onClick={() => handleCategoryClick(cat.name)}
                          className={`text-left p-2.5 border flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                          }`}
                        >
                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isSelected ? 'text-amber-400' : 'text-zinc-900'
                              }`}
                            >
                              {cat.name} ({skuCount})
                            </p>
                            <p
                              className={`text-[11px] line-clamp-1 ${
                                isSelected ? 'text-zinc-300' : 'text-zinc-500'
                              }`}
                            >
                              {cat.description || `Koleksi ${cat.name} import`}
                            </p>
                          </div>
                          {cat.badge && (
                            <span className="px-1.5 py-0.5 bg-zinc-950 text-white font-mono text-[10px] font-bold uppercase shrink-0">
                              {cat.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {isAdminMode && onOpenManageCategories && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          onOpenManageCategories();
                        }}
                        className="sm:col-span-2 text-left p-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between"
                      >
                        <span>+ Kelola / Tambah Kategori Baru (Admin)</span>
                        <Layers className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {openDropdown === 'menu-koleksi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSubCategorySelect({
                          label: 'New Arrival (Koleksi Terbaru)',
                          description: '',
                          category: 'Semua',
                          sortBy: 'newest',
                        })
                      }
                      className="text-left p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
                    >
                      <p className="text-xs font-bold text-zinc-900">
                        New Arrival (Koleksi Terbaru)
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Rilisan terbaru minggu ini
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSubCategorySelect({
                          label: 'Diskon Grosir Terbesar',
                          description: '',
                          category: 'Promo Grosir',
                          sortBy: 'discount-desc',
                        })
                      }
                      className="text-left p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                    >
                      <p className="text-xs font-bold text-rose-700">
                        Diskon Grosir Terbesar
                      </p>
                      <p className="text-[11px] text-rose-600">
                        Potongan partai besar hingga 45%
                      </p>
                    </button>
                  </div>
                )}

                {openDropdown === 'menu-sosmed' && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 flex items-center justify-between"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 flex items-center justify-between"
                    >
                      <span>TikTok Live</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                    <a
                      href={shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 flex items-center justify-between"
                    >
                      <span>Shopee Official</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                    <a
                      href={tokopediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 flex items-center justify-between"
                    >
                      <span>Tokopedia</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>
                  </div>
                )}

                {openDropdown === 'menu-blog' && (
                  <div className="space-y-1.5">
                    {onOpenBlogList && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          onOpenBlogList();
                        }}
                        className="w-full text-left p-2.5 bg-amber-400 text-zinc-950 border border-amber-500 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-black text-zinc-950">
                            Semua Artikel & Tips Bisnis ({articles.length})
                          </p>
                          <p className="text-[11px] text-zinc-800">
                            Buka halaman daftar artikel & blog edukasi reseller
                          </p>
                        </div>
                        <BookOpen className="w-4 h-4 text-zinc-950 shrink-0" />
                      </button>
                    )}
                    {onOpenResellerGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          onOpenResellerGuide();
                        }}
                        className="w-full text-left p-2.5 bg-zinc-950 text-white border border-zinc-900 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-amber-400">
                            {resellerGuideMenuLabel}
                          </p>
                          <p className="text-[11px] text-zinc-300">
                            Sistem Dropship, Resi Otomatis Marketplace & Kargo
                          </p>
                        </div>
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      </button>
                    )}
                    {(articles.length > 0 ? articles : []).map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          setOpenDropdown(null);
                          if (onSelectArticle) {
                            onSelectArticle(article);
                          } else if (onOpenBlogList) {
                            onOpenBlogList();
                          }
                        }}
                        className="w-full text-left p-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {article.title}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {article.category} · {article.publishedAt}
                          </p>
                        </div>
                        <BookOpen className="w-4 h-4 text-zinc-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modal Baca Artikel / Blog Edukasi Reseller TGI */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 sm:h-56 bg-zinc-900">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-3.5 right-3.5 w-9 h-9 bg-zinc-950/80 hover:bg-zinc-950 text-white flex items-center justify-center cursor-pointer"
                aria-label="Tutup Artikel"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                  <span>{activeArticle.category}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeArticle.readTime}
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold leading-snug">
                  {activeArticle.title}
                </h3>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-1.5">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                  Ringkasan Penting untuk Reseller:
                </p>
                <ul className="space-y-1">
                  {activeArticle.highlights.map((pt, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-zinc-700 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                {activeArticle.content.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>Konsultasi Paket Usaha via WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Tutup Artikel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
