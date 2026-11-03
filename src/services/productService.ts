import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  CategoryItem,
  StoreConfig,
  UiContentConfig,
  CustomerReview,
  OrderRecord,
  BlogArticle,
  WholesalePopupConfig,
  AdminActivityLog,
  AdminActivityType,
} from '../types/product';
import {
  createBagStudioSvg,
  createHeroLookbookSvg,
  createLiveStudioPosterSvg,
  createBentoCardCoverSvg,
} from '../utils/bagStudioSvg';

const STORAGE_KEY_PRODUCTS = 'tgi_catalog_products_v2';
const STORAGE_KEY_CONFIG = 'tgi_store_config_v1';
const STORAGE_KEY_UI_CONTENT = 'tgi_ui_content_config_v1';
const STORAGE_KEY_REVIEWS = 'tgi_customer_reviews_v2';
const STORAGE_KEY_ORDERS = 'tgi_order_history_v2';
const STORAGE_KEY_ARTICLES = 'tgi_blog_articles_v1';
const STORAGE_KEY_ACTIVITY_LOGS = 'tgi_admin_activity_logs_v1';

// Clean up legacy v1 dummy data keys from localStorage
try {
  localStorage.removeItem('tgi_catalog_products_v1');
  localStorage.removeItem('tgi_customer_reviews_v1');
  localStorage.removeItem('tgi_order_history_v1');
} catch {
  // ignore
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'TAS GROSIR IMPORT',
  slogan:
    'Pusat grosir dan eceran tas import tangan pertama kualitas premium. Melayani pengiriman ekspedisi reguler, kargo partai besar seluruh Indonesia, maupun pickup langsung di gudang.',
  whatsappNumber: '6281288997766',
  whatsappGreetingTemplate:
    'Halo Admin *{storeName}*, saya tertarik dan ingin memesan produk tas import berikut:',
  email: 'official@tasgrosirimport.co.id',
  warehouseAddress:
    'Komp. Pergudangan Terpadu Blok C-18, Kapuk Kamal, Jakarta Utara',
  operatingHours: 'Senin – Sabtu: 08.30 – 17.30 WIB (Minggu & Hari Besar Libur)',
  freeShippingThreshold: 500000,
  socialLinks: {
    instagram: '@tasgrosirimport.id',
    tiktok: '@tasgrosirimport.official',
    facebook: 'https://facebook.com/tasgrosirimport',
    twitter: 'https://x.com/tasgrosirimport',
    shopeeUrl: 'https://shopee.co.id/tasgrosirimport',
    tokopediaUrl: 'https://tokopedia.com/tasgrosirimport',
  },
  adminPin: '123456',
  hideAdminInHeader: false,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const DEFAULT_RESELLER_GUIDE_CONFIG: NonNullable<
  UiContentConfig['resellerGuide']
> = {
  menuLabel: 'Panduan Reseller & Syarat Grosir',
  headerBadge: 'OFFICIAL B2B WHOLESALE & DROPSHIP CENTER',
  headerTitle: 'PANDUAN RESELLER, DROPSHIP & SYARAT GROSIR TGI',
  headerSubtitle:
    'Informasi lengkap syarat MOQ 6 pcs, alur resi otomatis marketplace, dan estimasi durasi kargo partai besar ke seluruh Indonesia.',
  customAnnouncement:
    'Seluruh mitra reseller & dropshipper mendapatkan akses katalog foto real-pict polos tanpa watermark serta prioritas pengemasan kargo di hari yang sama.',
  moqSectionTitle: 'Syarat Pembelian Grosir Pabrik (MOQ 6 Pcs Bebas Campur)',
  moqSectionSubtitle:
    'Kemudahan kulakan tas import tangan pertama dengan modal ringan dan perputaran stok cepat.',
  moqPoints: [
    {
      title: 'MOQ 6 Pcs Bebas Mix Model & Warna',
      description:
        'Harga Grosir Pabrik otomatis aktif di Keranjang Belanja begitu total item mencapai minimal 6 pcs. Anda bebas mencampur model tas (SKU berbeda) maupun varian warna dalam 1 nota.',
    },
    {
      title: 'Fitur Quick Add Batch Multi-Warna',
      description:
        'Di setiap detail produk, Anda bisa langsung mengisi jumlah berbeda untuk tiap warna (misal: Hitam = 2, Coklat = 2, Cream = 2) dan memasukkannya sekaligus ke keranjang dalam 1 klik.',
    },
    {
      title: 'Garansi Tukar Barang & Retur 100%',
      description:
        'Seluruh tas melalui proses QC 2 tahap di gudang TGI. Jika terdapat cacat produksi atau resleting macet (dengan video unboxing), kami ganti baru 100% tanpa biaya tambahan.',
    },
  ],
  dropshipSectionTitle: 'Sistem Dropship & Dukungan Resi Otomatis Marketplace',
  dropshipSectionSubtitle:
    'Jualan di Shopee, Tokopedia, TikTok Shop & Lazada tanpa perlu sewa gudang atau stok barang sendiri.',
  dropshipSteps: [
    {
      stepLabel: 'Langkah 1',
      title: 'Upload Katalog Foto Polos',
      description:
        'Ambil foto & video real-pict produk dari website TGI (tanpa watermark) lalu pajang di toko Shopee, TikTok Shop, atau Tokopedia Anda dengan margin harga sendiri.',
    },
    {
      stepLabel: 'Langkah 2',
      title: 'Terima Order & Unduh PDF Resi',
      description:
        'Saat ada pesanan masuk di toko marketplace Anda, atur pengiriman untuk mendapatkan File PDF Label Resi Barcode Otomatis dari marketplace.',
    },
    {
      stepLabel: 'Langkah 3',
      title: 'Kirim File Resi ke WA Admin TGI',
      description:
        'Checkout produk di web TGI atau hubungi WA Admin, kirimkan file PDF resi otomatis Anda, dan bayar hanya sebesar Harga Produk (tanpa bayar ongkir lagi).',
    },
    {
      stepLabel: 'Langkah 4',
      title: 'Cetak Label & Serah Terima Kurir',
      description:
        'Tim gudang TGI mencetak label barcode Anda, mengemas tas dengan aman atas nama toko Anda, dan menyerahkannya ke kurir ekspedisi terkait di hari yang sama.',
    },
  ],
  dropshipCutoffNote:
    'Cut-Off Pengiriman Harian: Order & resi sebelum pukul 16.00 WIB dikirim di hari yang sama.',
  dropshipPackingNote:
    'Gratis Biaya Cetak Thermal & Packing: Sudah termasuk dustbag + plastik polymailer tebal.',
  dropshipCouriersNote:
    'Ekspedisi Resi Otomatis: J&T, JNE, SiCepat, SPX Express, AnterAja, Ninja & ID Express.',
  cargoSectionTitle:
    'Estimasi Durasi & Tarif Kargo Partai Besar ke Seluruh Indonesia',
  cargoSectionSubtitle:
    'Panduan waktu tempuh karungan (JNE JTR, Dakota, Indah Cargo & Ekspedisi Lokal Kapuk/Tanah Abang).',
  cargoSackBadge: '1 Karung Muat ~20 – 25 Pcs Tas (~10 Kg)',
  cargoTipsNote:
    'Tips Hemat Ongkir Karung: Gunakan fitur Kalkulator Estimasi Berat & Ongkir Kargo yang ada di dalam panel Keranjang Belanja untuk menghitung simulasi berat aktual (gram) dan biaya per karung ke kota Anda secara otomatis.',
  cargoTable: [
    {
      region: 'Jabodetabek & Banten',
      cities: 'Jakarta, Bogor, Depok, Tangerang, Bekasi, Serang',
      ekspedisiLokal: '1 Hari (Same/Next Day)',
      jtrDakota: '1 – 2 Hari Kerja',
      indahCargo: '1 – 3 Hari Kerja',
      estRate: 'Rp 3.500 – Rp 5.000 / kg',
    },
    {
      region: 'Jawa Barat & Jawa Tengah',
      cities: 'Bandung, Cirebon, Semarang, Solo, Purwokerto, Tegal',
      ekspedisiLokal: '1 – 2 Hari Kerja',
      jtrDakota: '2 – 3 Hari Kerja',
      indahCargo: '2 – 4 Hari Kerja',
      estRate: 'Rp 4.500 – Rp 7.000 / kg',
    },
    {
      region: 'DI Yogyakarta & Jawa Timur',
      cities: 'Yogyakarta, Surabaya, Malang, Kediri, Sidoarjo, Banyuwangi',
      ekspedisiLokal: '2 – 3 Hari Kerja',
      jtrDakota: '2 – 4 Hari Kerja',
      indahCargo: '3 – 5 Hari Kerja',
      estRate: 'Rp 5.500 – Rp 8.500 / kg',
    },
    {
      region: 'Sumatera (Selatan, Tengah & Utara)',
      cities: 'Lampung, Palembang, Jambi, Pekanbaru, Padang, Medan, Aceh',
      ekspedisiLokal: '3 – 5 Hari Kerja',
      jtrDakota: '4 – 6 Hari Kerja',
      indahCargo: '4 – 7 Hari Kerja',
      estRate: 'Rp 8.500 – Rp 14.500 / kg',
    },
    {
      region: 'Bali, NTB & Kalimantan',
      cities: 'Denpasar, Mataram, Pontianak, Banjarmasin, Balikpapan, Samarinda',
      ekspedisiLokal: '4 – 6 Hari Kerja',
      jtrDakota: '4 – 7 Hari Kerja',
      indahCargo: '5 – 8 Hari Kerja',
      estRate: 'Rp 10.000 – Rp 16.500 / kg',
    },
    {
      region: 'Sulawesi, NTT, Maluku & Papua',
      cities: 'Makassar, Manado, Palu, Kendari, Kupang, Ambon, Jayapura',
      ekspedisiLokal: '5 – 8 Hari Kerja (Laut/Udara)',
      jtrDakota: '6 – 10 Hari Kerja',
      indahCargo: '7 – 12 Hari Kerja',
      estRate: 'Rp 14.000 – Rp 24.000 / kg',
    },
  ],
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-backpack',
    name: 'Backpack',
    description: 'Tas ransel wanita, pria, laptop & anti-air kualitas import',
    badge: 'Populer',
  },
  {
    id: 'cat-handbag',
    name: 'Handbag',
    description: 'Tas tangan pesta, kerja kantor & top handle kualitas butik',
    badge: 'Margin Tinggi',
  },
  {
    id: 'cat-shoulder-bag',
    name: 'Shoulder Bag',
    description: 'Tas bahu & selempang gaya Korea paling cepat repeat order',
    badge: 'Fast Moving',
  },
  {
    id: 'cat-promo-grosir',
    name: 'Promo Grosir',
    description: 'Potongan harga spesial untuk pembelian partai & seri mix 6 pcs',
    badge: 'Hemat',
  },
];

export const DEFAULT_WHOLESALE_POPUP_CONFIG: WholesalePopupConfig = {
  enabled: true,
  badgeText: 'OFFICIAL B2B WHOLESALE · TANGAN PERTAMA',
  title:
    'Pusat Grosir Tas Import Tangan Pertama — Harga Khusus Partai Besar & Reseller!',
  description:
    'Katalog website menampilkan harga satuan normal. Untuk pemilik toko, reseller aktif, dan pembelian partai besar / karungan, dapatkan penawaran harga khusus pabrik langsung via Tim Admin Sales kami.',
  termsBadgeText: 'SYARAT & KETENTUAN SINGKAT PARTAI BESAR',
  termsTagline:
    'Minimum order partai besar, bebas campur SKU & warna, garansi retur 100%',
  termsPoints: [
    'Minimum Order Partai Besar: Skema harga khusus mulai paket reseller (≥6 pcs), lusinan, hingga partai karungan (≥30 pcs).',
    'Bebas Campur SKU & Warna: Fleksibel mengombinasikan berbagai model tas dan varian warna dalam 1 faktur pesanan gudang.',
    'Garansi Retur 100% (QC Gudang): Jaminan tukar unit baru apabila terdapat kendala produksi dengan klaim cepat & transparan.',
  ],
  whatsappButtonText: 'Chat Admin Sales via WhatsApp',
  closeButtonText: 'Tutup & Lihat Katalog',
  whatsappMessageTemplate:
    'Halo Admin Sales *{storeName}*,\nSaya tertarik dengan penawaran *Pemesanan Partai Besar / Grosir Tas Import Tangan Pertama*.\n\nMohon informasi katalog harga khusus partai besar, syarat MOQ campur SKU, serta estimasi ongkir kargo ke kota saya. Terima kasih!',
};

export const DEFAULT_UI_CONTENT_CONFIG: UiContentConfig = {
  announcementText:
    'Harga Grosir Otomatis Min. 6 Pcs (Bebas Campur SKU & Warna) • Dukungan Resi Otomatis Marketplace & Pengiriman Kargo Partai Besar Se-Indonesia',
  categories: DEFAULT_CATEGORIES,
  heroSlides: [
    {
      id: 'slide-1',
      seasonTag: 'OFFICIAL IMPORTIR TANGAN PERTAMA · READY STOCK GUDANG',
      headline: 'KOLEKSI TERBARU - TAS IMPORT PREMIUM',
      subheadline:
        'Harga Grosir Tangan Pertama, Kualitas Terjamin. Tersedia ribuan stok Backpack, Handbag, dan Shoulder Bag siap kirim hari ini.',
      ctaLabel: 'Belanja Sekarang!',
      targetCategory: 'Semua',
      highlightMetric: 'Diskon s/d 45% + Harga Grosir ≥ 6 Pcs',
      imageUri: createHeroLookbookSvg(0),
      overlayOpacity: 20,
    },
    {
      id: 'slide-2',
      seasonTag: 'PROGRAM RESELLER & PARTAI BESAR · BEBAS CAMPUR SKU',
      headline: 'PROMO GROSIR SERI MIX - HARUS PUNYA!',
      subheadline:
        'Beli mulai 6 pcs otomatis dapat harga grosir pabrik. Bebas campur model BP-MY-00513, HB-WQ-10670, dan SG-MY-00813 dalam satu nota.',
      ctaLabel: 'Harus Punya!',
      targetCategory: 'Promo Grosir',
      highlightMetric: 'Subsidi Ongkir Kargo Seluruh Indonesia',
      imageUri: createHeroLookbookSvg(1),
      overlayOpacity: 20,
    },
    {
      id: 'slide-3',
      seasonTag: 'URBAN COMMUTER & LUXURY HANDBAG SERIES',
      headline: 'MATERIAL GRADE A - JAHITAN PRESISI',
      subheadline:
        'Menggunakan Ballistic Nylon Waterproof & Pebbled Vegan Leather pilihan dengan hardware logam anti-karat bergaransi retur 100%.',
      ctaLabel: 'Belanja Sekarang!',
      targetCategory: 'Backpack',
      highlightMetric: 'Lolos QC 3 Tahap Sebelum Pengiriman',
      imageUri: createHeroLookbookSvg(2),
      overlayOpacity: 20,
    },
  ],
  vouchers: [
    {
      id: 'voucher-1',
      title: 'VOUCHER RESELLER 20K',
      subtitle: 'Potongan langsung member & reseller baru tanpa syarat ribet',
      code: 'TGIRESELLER20',
    },
    {
      id: 'voucher-2',
      title: 'POTONGAN GROSIR 50K MIN 6 PCS',
      subtitle: 'Otomatis harga grosir pabrik bebas campur model & SKU',
      code: 'GROSIRMIX6',
    },
    {
      id: 'voucher-3',
      title: 'SUBSIDI ONGKIR KARGO',
      subtitle: 'Gratis / subsidi ongkir pengiriman partai besar se-Indonesia',
      code: 'FREEKARGO',
    },
  ],
  bentoCards: [
    {
      id: 'bento-1',
      iconType: 'truck',
      badgeText: 'KEUNGGULAN TGI',
      title: 'KENAPA HARUS BELI DI WEBSITE TGI?',
      description:
        'Harga Grosir Tangan Pertama • Jaminan Retur 100% • Bebas Campur SKU Mulai 6 Pcs',
      bulletPoints: [
        'Harga Grosir Tangan Pertama Langsung Gudang',
        'Jaminan Retur 100% Jika Cacat Pabrik',
        'Bebas Campur SKU Mulai 6 Pcs Otomatis Grosir',
      ],
      modalTitle: 'KENAPA HARUS BELI DI WEBSITE RESMI TGI?',
      modalContent:
        'Sistem keranjang belanja otomatis menghitung potongan harga grosir ketika jumlah pembelian mencapai minimal 6 pcs (Bebas Campur SKU). Setiap unit juga dilindungi Garansi Retur 100% tukar baru selama 7 hari.',
    },
    {
      id: 'bento-2',
      iconType: 'shield',
      badgeText: 'KOLEKSI BARU',
      title: 'NEW ARRIVAL BACKPACK',
      description:
        'Koleksi ransel import waterproof & urban commuter terbaru siap kirim dari gudang.',
      imageUri: createBentoCardCoverSvg('new-arrival-backpack'),
      modalTitle: 'KOLEKSI NEW ARRIVAL BACKPACK IMPORT',
      modalContent:
        'Ransel seri terbaru (BP-MY-00513, BP-TG-00921, BP-KR-01104) menggunakan material Ballistic Nylon Waterproof 1680D dengan kompartemen laptop berlapis busa anti-bentur.',
    },
    {
      id: 'bento-3',
      iconType: 'warehouse',
      badgeText: 'LOKASI GUDANG',
      title: 'PICKUP DI GUDANG TGI',
      description:
        'Reseller & pembeli partai besar dapat mengambil pesanan langsung di Gudang TGI atau via kargo.',
      imageUri: createBentoCardCoverSvg('pickup-gudang'),
      modalTitle: 'INFORMASI PICKUP LANGSUNG DI GUDANG TGI',
      modalContent:
        'Anda dapat memilih opsi Pickup Langsung di Gudang TGI pada saat melakukan Checkout WhatsApp di keranjang belanja tanpa antre.',
    },
  ],
  catalogLayout: {
    desktopColumns: 3,
    imageAspectRatio: '1:1',
    imageObjectFit: 'contain',
    sectionVisibility: {
      showAnnouncementBar: true,
      showVoucherBar: true,
      showHeroBanner: true,
      showPromoBento: true,
      showLiveShopping: true,
      showCustomerReviews: true,
    },
  },
  liveShopping: {
    isTikTokLive: true,
    isShopeeLive: true,
    tiktokLiveUrl: 'https://www.tiktok.com/@tasgrosirimport.official/live',
    tiktokUsername: '@tasgrosirimport.official',
    shopeeLiveUrl: 'https://live.shopee.co.id/share?from=live',
    shopeeStoreName: 'Tas Grosir Import Official',
    promoTitle: 'Spill Gudang Tas Import Terbaru - Diskon Khusus Live!',
    dailySchedule: 'Senin - Sabtu | Sesi 1: 10.00 WIB, Sesi 2: 19.00 WIB',
    posterImageUri: createLiveStudioPosterSvg(0),
    liveVideoUrl: '',
  },
  resellerGuide: DEFAULT_RESELLER_GUIDE_CONFIG,
  wholesalePopup: DEFAULT_WHOLESALE_POPUP_CONFIG,
  updatedAt: '2026-10-30T00:00:00.000Z',
};

export const INITIAL_PRODUCTS: Product[] = [];

export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.warn(
      'Quota warning when saving products, compacting oversized images:',
      err
    );
    try {
      const compacted = products.map((p) => ({
        ...p,
        imageUrl:
          p.imageUrl && p.imageUrl.length > 450_000
            ? createBagStudioSvg({
                variant:
                  p.category === 'Backpack'
                    ? 'backpack-black'
                    : p.category === 'Handbag'
                    ? 'handbag-taupe'
                    : p.category === 'Shoulder Bag'
                    ? 'shoulder-caramel'
                    : 'grosir-bundle',
                sku: p.sku,
              })
            : p.imageUrl,
      }));
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(compacted));
    } catch (innerErr) {
      console.error('Failed to save products to localStorage:', innerErr);
    }
  }
}

export function resetLocalProducts(): Product[] {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function getStoreConfig(): StoreConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_CONFIG,
        JSON.stringify(DEFAULT_STORE_CONFIG)
      );
      return DEFAULT_STORE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_STORE_CONFIG;
    }
    return {
      ...DEFAULT_STORE_CONFIG,
      ...parsed,
      adminPin: parsed.adminPin?.trim() || '123456',
      hideAdminInHeader: Boolean(parsed.hideAdminInHeader),
      socialLinks: {
        ...DEFAULT_STORE_CONFIG.socialLinks,
        ...(parsed.socialLinks || {}),
      },
    };
  } catch (err) {
    console.warn('Fallback to DEFAULT_STORE_CONFIG due to parse error:', err);
    return DEFAULT_STORE_CONFIG;
  }
}

export function saveStoreConfig(config: StoreConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save store config to localStorage:', err);
  }
}

export function resetStoreConfig(): StoreConfig {
  localStorage.setItem(
    STORAGE_KEY_CONFIG,
    JSON.stringify(DEFAULT_STORE_CONFIG)
  );
  return DEFAULT_STORE_CONFIG;
}

export function getUiContentConfig(): UiContentConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UI_CONTENT);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_UI_CONTENT,
        JSON.stringify(DEFAULT_UI_CONTENT_CONFIG)
      );
      return DEFAULT_UI_CONTENT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_UI_CONTENT_CONFIG;
    }

    const legacyBentoTitles = [
      'GRATIS ONGKIR & HARGA GROSIR',
      'JAMINAN RETUR 100%',
      'PICKUP GUDANG LANGSUNG',
    ];

    const normalizedBentoCards =
      Array.isArray(parsed.bentoCards) && parsed.bentoCards.length === 3
        ? (parsed.bentoCards.map((c: any, idx: number) => {
            const def = DEFAULT_UI_CONTENT_CONFIG.bentoCards[idx];
            const isLegacyDefault = legacyBentoTitles.includes(c?.title);
            const isOldSvgBento =
              typeof c?.imageUri === 'string' &&
              c.imageUri.startsWith('data:image/svg+xml');
            return {
              ...def,
              ...c,
              title: isLegacyDefault ? def.title : c.title || def.title,
              description: isLegacyDefault
                ? def.description
                : c.description || def.description,
              badgeText: isLegacyDefault
                ? def.badgeText
                : c.badgeText || def.badgeText,
              bulletPoints:
                Array.isArray(c?.bulletPoints) && c.bulletPoints.length > 0
                  ? c.bulletPoints
                  : def.bulletPoints,
              imageUri: isOldSvgBento
                ? def.imageUri
                : c?.imageUri || def.imageUri,
            };
          }) as UiContentConfig['bentoCards'])
        : DEFAULT_UI_CONTENT_CONFIG.bentoCards;

    const normalizedSlides =
      Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
        ? parsed.heroSlides.map((s: any, idx: number) => {
            const def =
              DEFAULT_UI_CONTENT_CONFIG.heroSlides[
                idx % DEFAULT_UI_CONTENT_CONFIG.heroSlides.length
              ];
            const isOldSvgSlide =
              typeof s?.imageUri === 'string' &&
              s.imageUri.startsWith('data:image/svg+xml');
            return {
              ...def,
              ...s,
              imageUri: isOldSvgSlide
                ? createHeroLookbookSvg((idx % 3) as 0 | 1 | 2)
                : s.imageUri || def.imageUri,
              overlayOpacity:
                isOldSvgSlide && (s.overlayOpacity === 50 || s.overlayOpacity === 55)
                  ? 20
                  : s.overlayOpacity ?? 20,
            };
          })
        : DEFAULT_UI_CONTENT_CONFIG.heroSlides;

    const rawLayout = parsed.catalogLayout || {};
    const isLegacy43Cover =
      rawLayout.imageAspectRatio === '4:3' &&
      rawLayout.imageObjectFit === 'cover' &&
      !rawLayout.userCustomizedLayout;

    const mergedVisibility = {
      ...DEFAULT_UI_CONTENT_CONFIG.catalogLayout.sectionVisibility!,
      ...(rawLayout.sectionVisibility || {}),
    };

    const normalizedCategories: CategoryItem[] =
      Array.isArray(parsed.categories) && parsed.categories.length > 0
        ? parsed.categories
            .filter(
              (c: any) =>
                c && typeof c.name === 'string' && c.name.trim() !== '' && c.name.trim() !== 'Semua'
            )
            .map((c: any, idx: number) => ({
              id: c.id || `cat-${idx}-${Date.now()}`,
              name: c.name.trim(),
              description:
                typeof c.description === 'string' && c.description.trim()
                  ? c.description.trim()
                  : `Koleksi produk ${c.name.trim()} import tangan pertama`,
              badge: typeof c.badge === 'string' ? c.badge.trim() : undefined,
            }))
        : DEFAULT_CATEGORIES;

    const result: UiContentConfig = {
      announcementText:
        typeof parsed.announcementText === 'string'
          ? parsed.announcementText
          : DEFAULT_UI_CONTENT_CONFIG.announcementText,
      categories:
        normalizedCategories.length > 0
          ? normalizedCategories
          : DEFAULT_CATEGORIES,
      heroSlides: normalizedSlides,
      vouchers:
        Array.isArray(parsed.vouchers) && parsed.vouchers.length === 3
          ? (parsed.vouchers as UiContentConfig['vouchers'])
          : DEFAULT_UI_CONTENT_CONFIG.vouchers,
      bentoCards: normalizedBentoCards,
      catalogLayout: isLegacy43Cover
        ? {
            desktopColumns: rawLayout.desktopColumns || 3,
            imageAspectRatio: '1:1',
            imageObjectFit: 'contain',
            sectionVisibility: mergedVisibility,
          }
        : {
            ...DEFAULT_UI_CONTENT_CONFIG.catalogLayout,
            ...rawLayout,
            sectionVisibility: mergedVisibility,
          },
      liveShopping: {
        ...DEFAULT_UI_CONTENT_CONFIG.liveShopping,
        ...(parsed.liveShopping || {}),
      },
      resellerGuide: {
        ...DEFAULT_RESELLER_GUIDE_CONFIG,
        ...(parsed.resellerGuide || {}),
        moqPoints:
          Array.isArray(parsed.resellerGuide?.moqPoints) &&
          parsed.resellerGuide.moqPoints.length === 3
            ? parsed.resellerGuide.moqPoints
            : DEFAULT_RESELLER_GUIDE_CONFIG.moqPoints,
        dropshipSteps:
          Array.isArray(parsed.resellerGuide?.dropshipSteps) &&
          parsed.resellerGuide.dropshipSteps.length === 4
            ? parsed.resellerGuide.dropshipSteps
            : DEFAULT_RESELLER_GUIDE_CONFIG.dropshipSteps,
        cargoTable:
          Array.isArray(parsed.resellerGuide?.cargoTable) &&
          parsed.resellerGuide.cargoTable.length > 0
            ? parsed.resellerGuide.cargoTable
            : DEFAULT_RESELLER_GUIDE_CONFIG.cargoTable,
      },
      wholesalePopup: {
        ...DEFAULT_WHOLESALE_POPUP_CONFIG,
        ...(parsed.wholesalePopup || {}),
        enabled:
          typeof parsed.wholesalePopup?.enabled === 'boolean'
            ? parsed.wholesalePopup.enabled
            : DEFAULT_WHOLESALE_POPUP_CONFIG.enabled,
        termsPoints:
          Array.isArray(parsed.wholesalePopup?.termsPoints) &&
          parsed.wholesalePopup.termsPoints.length > 0
            ? parsed.wholesalePopup.termsPoints.filter(
                (pt: any) => typeof pt === 'string' && pt.trim() !== ''
              )
            : DEFAULT_WHOLESALE_POPUP_CONFIG.termsPoints,
      },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
    return result;
  } catch (err) {
    console.warn('Fallback to DEFAULT_UI_CONTENT_CONFIG due to parse error:', err);
    return DEFAULT_UI_CONTENT_CONFIG;
  }
}

export function saveUiContentConfig(config: UiContentConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_UI_CONTENT, JSON.stringify(config));
  } catch (err) {
    console.warn(
      'Quota warning when saving UI content config, compacting oversized images:',
      err
    );
    try {
      const compacted: UiContentConfig = {
        ...config,
        heroSlides: config.heroSlides.map((s, idx) => ({
          ...s,
          imageUri:
            s.imageUri && s.imageUri.length > 450_000
              ? createHeroLookbookSvg((idx % 3) as 0 | 1 | 2)
              : s.imageUri,
        })),
        liveShopping: {
          ...config.liveShopping,
          posterImageUri:
            config.liveShopping.posterImageUri &&
            config.liveShopping.posterImageUri.length > 450_000
              ? createLiveStudioPosterSvg(0)
              : config.liveShopping.posterImageUri,
        },
      };
      localStorage.setItem(STORAGE_KEY_UI_CONTENT, JSON.stringify(compacted));
    } catch (innerErr) {
      console.error('Failed to save UI content config to localStorage:', innerErr);
    }
  }
}

export function resetUiContentConfig(): UiContentConfig {
  localStorage.setItem(
    STORAGE_KEY_UI_CONTENT,
    JSON.stringify(DEFAULT_UI_CONTENT_CONFIG)
  );
  return DEFAULT_UI_CONTENT_CONFIG;
}

export const INITIAL_REVIEWS: CustomerReview[] = [];

export function getLocalReviews(): CustomerReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalReviews(reviews: CustomerReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

export function resetLocalReviews(): CustomerReview[] {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  } catch {
    // ignore
  }
  return INITIAL_REVIEWS;
}

export const INITIAL_ORDERS: OrderRecord[] = [];

export function getLocalOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: OrderRecord): OrderRecord[] {
  try {
    const current = getLocalOrders();
    const next = [order, ...current].slice(0, 100);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export const DEFAULT_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'art-1',
    title: 'Cara Memulai Bisnis Reseller Tas Import Modal Kecil namun Untung Maksimal',
    category: 'Strategi Bisnis',
    publishedAt: '12 Mei 2025',
    readTime: '4 Menit Baca',
    author: 'Tim Edukasi Bisnis TGI',
    imageUrl: createHeroLookbookSvg(0),
    excerpt:
      'Pelajari cara memanfaatkan sistem MOQ 6 pcs bebas campur SKU untuk menguji pasar di kota Anda tanpa risiko stok menumpuk di gudang.',
    content: `Memulai usaha toko tas import tidak harus langsung menyetok ratusan pcs per model. Di Tas Grosir Import (TGI), Anda cukup mengambil minimal 6 pcs (bebas campur model & warna) untuk langsung mendapatkan Harga Grosir Pabrik tangan pertama.

## Langkah Praktis Memulai Bisnis Tas Import untuk Pemula

- Pilih 6 model tas dari 3 kategori paling laris: 2 Backpack, 2 Shoulder Bag, dan 2 Slingbag agar calon pembeli memiliki variasi pilihan.
- Gunakan foto studio & real-pict katalog TGI untuk diposting lebih dulu di WhatsApp Status, Instagram, Shopee, dan TikTok Shop.
- Tetapkan margin keuntungan ideal 35% hingga 60% dari harga grosir pabrik (rata-rata reseller meraih profit Rp 35.000 – Rp 65.000 per pcs).
- Manfaatkan sistem Dropship Resi Otomatis jika Anda baru mulai berjualan di marketplace tanpa harus stok barang di rumah.

## Mengapa Sistem Seri Mix 6 Pcs Lebih Menguntungkan?

Dengan sistem bebas campur SKU dan warna, perputaran modal (cashflow) toko Anda menjadi jauh lebih sehat. Anda bisa melihat model mana yang paling cepat habis di daerah Anda, lalu melakukan repeat order karungan khusus untuk SKU pemenang tersebut.`,
    updatedAt: '2025-05-12T08:00:00.000Z',
  },
  {
    id: 'art-2',
    title: 'Rahasia Hemat Ongkir Kargo Partai Besar ke Luar Pulau Jawa hingga 70%',
    category: 'Logistik & Kargo',
    publishedAt: '10 Mei 2025',
    readTime: '5 Menit Baca',
    author: 'Divisi Logistik Gudang TGI',
    imageUrl: createHeroLookbookSvg(1),
    excerpt:
      'Tips memilih ekspedisi darat dan laut (Indah Cargo, JTR, Dakota & Ekspedisi Kapuk/Tanah Abang) agar margin keuntungan per pcs tidak tergerus ongkir.',
    content: `Salah satu kunci profitabilitas reseller luar pulau (Sumatera, Kalimantan, Sulawesi, Bali, hingga Papua) adalah efisiensi biaya kirim per kilogram. Pengiriman reguler udara seringkali memakan biaya tinggi, sedangkan kargo karungan mampu menekan ongkos kirim hingga 70%.

## Tips Mengoptimalkan Berat Karung & Kubikasi Kargo

- Gabungkan pesanan hingga mencapai bobot ideal kargo (minimal 10 kg atau setara 20–25 pcs tas) agar tarif per kg jauh lebih murah dibandingkan ekspedisi reguler.
- Manfaatkan fitur Kalkulator Estimasi Berat & Ongkir Kargo di halaman Keranjang Belanja TGI untuk menghitung total gramasi aktual pesanan Anda secara otomatis.
- Gunakan kode voucher FREEKARGO saat checkout untuk mendapatkan subsidi ongkir kargo langsung dari gudang TGI.
- Untuk partai besar di atas 50 pcs, mintalah tim gudang TGI menyusun tas dengan teknik nesting (tas kecil dimasukkan ke ruang tas besar yang aman) guna menghemat kubikasi karung.`,
    updatedAt: '2025-05-10T09:30:00.000Z',
  },
  {
    id: 'art-3',
    title: '5 Karakteristik Model Tas Wanita yang Paling Cepat Repeat Order di Live & Toko Offline',
    category: 'Riset Produk',
    publishedAt: '08 Mei 2025',
    readTime: '4 Menit Baca',
    author: 'Tim Kurator Katalog TGI',
    imageUrl: createHeroLookbookSvg(2),
    excerpt:
      'Data penjualan gudang TGI menunjukkan warna netral, material waterproof, dan kompartemen multifungsi menyumbang 78% transaksi repeat order.',
    content: `Berdasarkan ribuan nota transaksi reseller dan pemilik butik mitra TGI di seluruh Indonesia, pembeli akhir cenderung mencari tas yang memadukan tampilan elegan dengan fungsi harian yang tahan lama.

## 5 Ciri Tas Import yang Paling Cepat Laku Keras

- Warna Earth-Tone & Netral: Varian warna Black, Coffee, Khaki, dan Cream menyumbang perputaran stok tercepat karena mudah dipadukan dengan outfit kerja maupun kasual.
- Material Tahan Cuaca: Bahan Ballistic Nylon Waterproof pada Backpack dan Pebbled Vegan Leather anti-gores pada Handbag menjadi daya tarik utama saat di-spill ke pembeli.
- Hardware Logam Tebal & Resleting Halus: Pembeli sangat memperhatikan detail pengait strap dan kelancaran zipper sebagai indikator tas kualitas premium.
- Bobot Tas Ringan (350g – 550g): Selain nyaman dipakai seharian oleh pelanggan, bobot ini juga membuat ongkir per kg bisa memuat hingga 2–3 pcs tas sekaligus.
- Kelengkapan Tali Panjang & Dustbag: Tas dengan strap adjustable yang bisa dijadikan handbag sekaligus slingbag memiliki tingkat konversi pembelian 2x lebih tinggi.`,
    updatedAt: '2025-05-08T10:15:00.000Z',
  },
];

export function getLocalArticles(): BlogArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARTICLES);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY_ARTICLES,
        JSON.stringify(DEFAULT_BLOG_ARTICLES)
      );
      return DEFAULT_BLOG_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_BLOG_ARTICLES;
    return parsed;
  } catch {
    return DEFAULT_BLOG_ARTICLES;
  }
}

export function saveLocalArticles(articles: BlogArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
  } catch {
    // ignore
  }
}

export function resetLocalArticles(): BlogArticle[] {
  try {
    localStorage.setItem(
      STORAGE_KEY_ARTICLES,
      JSON.stringify(DEFAULT_BLOG_ARTICLES)
    );
  } catch {
    // ignore
  }
  return DEFAULT_BLOG_ARTICLES;
}

export function saveAllLocalOrders(orders: OrderRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function getLocalActivityLogs(): AdminActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY_LOGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalActivityLogs(logs: AdminActivityLog[]): void {
  try {
    localStorage.setItem(
      STORAGE_KEY_ACTIVITY_LOGS,
      JSON.stringify(logs.slice(0, 150))
    );
  } catch {
    // ignore
  }
}

export function appendLocalActivityLog(params: {
  type: AdminActivityType;
  actionTitle: string;
  details: string;
  actor?: string;
}): AdminActivityLog[] {
  const entry: AdminActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: params.type,
    actionTitle: params.actionTitle,
    details: params.details,
    actor: params.actor || 'Admin Gudang TGI',
    createdAt: new Date().toISOString(),
  };
  const next = [entry, ...getLocalActivityLogs()].slice(0, 150);
  saveLocalActivityLogs(next);
  return next;
}

export function clearLocalActivityLogs(): AdminActivityLog[] {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVITY_LOGS);
  } catch {
    // ignore
  }
  return [];
}

let cachedSupabaseClient: SupabaseClient | null = null;
let cachedSupabaseSignature = '';

/**
 * Returns a memoized, type-safe Supabase client instance.
 * Enforces HTTPS/HTTP URL validation and uses parameterized PostgREST query builders
 * to prevent SQL/filter injection vulnerabilities.
 */
export function getSupabaseClient(config: StoreConfig): SupabaseClient | null {
  const url = (config.supabaseUrl || '').trim().replace(/\/$/, '');
  const key = (config.supabaseAnonKey || '').trim();
  if (!url || !key) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return null;
    }
  } catch {
    return null;
  }

  const signature = `${url}::${key}`;
  if (cachedSupabaseClient && cachedSupabaseSignature === signature) {
    return cachedSupabaseClient;
  }

  cachedSupabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  cachedSupabaseSignature = signature;
  return cachedSupabaseClient;
}

export async function syncProductsToSupabase(
  config: StoreConfig,
  products: Product[],
  uiConfig?: UiContentConfig,
  orders?: OrderRecord[],
  reviews?: CustomerReview[],
  articles?: BlogArticle[],
  activityLogs?: AdminActivityLog[]
): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseClient(config);

  if (!supabase) {
    return {
      ok: false,
      message:
        'URL Supabase atau Anon Key belum diisi / tidak valid. Data tetap tersimpan aman di localStorage.',
    };
  }

  try {
    if (products.length > 0) {
      const productRows = products.map((p) => ({
        id: String(p.id).trim(),
        sku: String(p.sku).trim(),
        name: String(p.name).trim(),
        category: String(p.category || 'Backpack').trim(),
        normal_price: Math.max(0, Math.round(Number(p.normalPrice) || 0)),
        sale_price: Math.max(0, Math.round(Number(p.salePrice) || 0)),
        wholesale_min_qty: Math.max(1, Math.round(Number(p.wholesaleMinQty) || 6)),
        wholesale_price: Math.max(0, Math.round(Number(p.wholesalePrice) || 0)),
        rating: Number(p.rating) || 4.9,
        sold_count: Math.max(0, Math.round(Number(p.soldCount) || 0)),
        stock: Math.max(0, Math.round(Number(p.stock) ?? 100)),
        is_sale: Boolean(p.isSale),
        is_promo_grosir: Boolean(p.isPromoGrosir),
        image_url: String(p.imageUrl || ''),
        material: String(p.material || ''),
        dimensions: String(p.dimensions || ''),
        weight_grams: Math.max(50, Math.round(Number(p.weightGrams) || 500)),
        colors: Array.isArray(p.colors) ? p.colors : ['Black'],
        description: String(p.description || ''),
        updated_at: p.updatedAt || new Date().toISOString(),
      }));

      const { error: prodError } = await supabase
        .from('tgi_products')
        .upsert(productRows, { onConflict: 'id' });

      if (prodError) {
        return {
          ok: false,
          message: `Supabase gagal menyimpan produk: ${prodError.message.slice(0, 120)}`,
        };
      }
    }

    const localOrders = orders || getLocalOrders();
    const localReviews = reviews || getLocalReviews();
    const localArticles = articles || getLocalArticles();
    const localActivityLogs = activityLogs || getLocalActivityLogs();

    const safeStoreMeta = {
      storeName: config.storeName,
      slogan: config.slogan,
      whatsappNumber: config.whatsappNumber,
      whatsappGreetingTemplate: config.whatsappGreetingTemplate,
      email: config.email,
      warehouseAddress: config.warehouseAddress,
      operatingHours: config.operatingHours,
      freeShippingThreshold: config.freeShippingThreshold,
      socialLinks: config.socialLinks,
      hideAdminInHeader: config.hideAdminInHeader,
    };

    await supabase.from('tgi_site_settings').upsert(
      [
        {
          id: 'main_ui_config',
          config_json: {
            uiConfig: uiConfig || DEFAULT_UI_CONTENT_CONFIG,
            storeConfig: safeStoreMeta,
            reviews: localReviews,
            ordersBackup: localOrders,
            articles: localArticles,
            activityLogs: localActivityLogs,
            productExtraMeta: products.map((p) => ({
              id: p.id,
              stockStatus: p.stockStatus,
              galleryImages: p.galleryImages || [],
            })),
          },
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );

    if (localArticles.length > 0) {
      await supabase.from('tgi_articles').upsert(
        localArticles.map((art) => ({
          id: String(art.id).trim(),
          title: String(art.title).trim(),
          category: String(art.category || 'Strategi Bisnis'),
          excerpt: String(art.excerpt || ''),
          content: String(art.content || ''),
          image_url: String(art.imageUrl || ''),
          published_at: String(art.publishedAt || ''),
          read_time: String(art.readTime || '4 Menit Baca'),
          author: String(art.author || 'Tim Edukasi TGI'),
          updated_at: art.updatedAt || new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );
    }

    if (localOrders.length > 0) {
      await supabase.from('tgi_orders').upsert(
        localOrders.map((ord) => ({
          id: String(ord.id).trim(),
          reference_code: String(ord.referenceCode).trim(),
          customer_name: String(ord.customerName).trim(),
          customer_city: String(ord.customerCity || ''),
          delivery_method: ord.deliveryMethod,
          voucher_code: String(ord.voucherCode || ''),
          total_quantity: Math.max(1, Math.round(Number(ord.totalQuantity) || 1)),
          total_payable: Math.max(0, Math.round(Number(ord.totalPayable) || 0)),
          items_summary: String(ord.itemsSummary || ''),
          created_at: ord.createdAt || new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );
    }

    return {
      ok: true,
      message: `Berhasil sinkronisasi ${products.length} produk, ${localArticles.length} artikel blog, ${localReviews.length} ulasan reseller & pengaturan toko ke Cloud Supabase!`,
    };
  } catch (err) {
    return {
      ok: false,
      message: `Gagal terhubung ke Supabase: ${
        err instanceof Error ? err.message : 'Network error'
      }`,
    };
  }
}

export async function deleteProductFromSupabase(
  config: StoreConfig,
  productId: string
): Promise<boolean> {
  const supabase = getSupabaseClient(config);
  const sanitizedId = (productId || '').trim();
  if (!supabase || !sanitizedId) return false;

  try {
    const { error } = await supabase
      .from('tgi_products')
      .delete()
      .eq('id', sanitizedId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchCloudBackupFromSupabase(
  config: StoreConfig
): Promise<{
  ok: boolean;
  message: string;
  products?: Product[];
  uiConfig?: UiContentConfig;
  storeConfig?: Partial<StoreConfig>;
  reviews?: CustomerReview[];
  orders?: OrderRecord[];
  articles?: BlogArticle[];
  activityLogs?: AdminActivityLog[];
}> {
  const supabase = getSupabaseClient(config);

  if (!supabase) {
    return {
      ok: false,
      message: 'Masukkan Supabase Project URL dan Anon Public Key terlebih dahulu.',
    };
  }

  try {
    const [prodResult, settingsResult] = await Promise.all([
      supabase
        .from('tgi_products')
        .select('*')
        .order('updated_at', { ascending: false }),
      supabase
        .from('tgi_site_settings')
        .select('*')
        .eq('id', 'main_ui_config')
        .maybeSingle(),
    ]);

    if (prodResult.error) {
      return {
        ok: false,
        message: `Gagal memuat tabel tgi_products: ${prodResult.error.message.slice(0, 100)}`,
      };
    }

    const rawProducts = prodResult.data || [];
    const configBlob = settingsResult.data?.config_json || {};
    const extraMetaMap = new Map<
      string,
      { stockStatus?: Product['stockStatus']; galleryImages?: string[] }
    >();

    if (Array.isArray(configBlob.productExtraMeta)) {
      for (const item of configBlob.productExtraMeta) {
        if (item?.id) {
          extraMetaMap.set(item.id, {
            stockStatus: item.stockStatus,
            galleryImages: item.galleryImages,
          });
        }
      }
    }

    const mappedProducts: Product[] = Array.isArray(rawProducts)
      ? rawProducts.map((row: any) => {
          const extra = extraMetaMap.get(row.id);
          return {
            id: row.id,
            sku: row.sku,
            name: row.name,
            category: row.category || 'Backpack',
            normalPrice: Number(row.normal_price) || 0,
            salePrice: Number(row.sale_price) || 0,
            wholesaleMinQty: Number(row.wholesale_min_qty) || 6,
            wholesalePrice: Number(row.wholesale_price) || 0,
            rating: Number(row.rating) || 4.9,
            soldCount: Number(row.sold_count) || 0,
            stock: Number(row.stock) ?? 100,
            stockStatus: extra?.stockStatus,
            isSale: Boolean(row.is_sale),
            isPromoGrosir: Boolean(row.is_promo_grosir),
            imageUrl: row.image_url || '',
            galleryImages: extra?.galleryImages || [],
            material: row.material || '',
            dimensions: row.dimensions || '',
            weightGrams: Number(row.weight_grams) || 500,
            colors: Array.isArray(row.colors) ? row.colors : ['Black'],
            description: row.description || '',
            updatedAt: row.updated_at || new Date().toISOString(),
          };
        })
      : [];

    return {
      ok: true,
      message: `Berhasil memuat ${mappedProducts.length} produk dari tabel Supabase!`,
      products: mappedProducts,
      uiConfig: configBlob.uiConfig,
      storeConfig: configBlob.storeConfig,
      reviews: Array.isArray(configBlob.reviews) ? configBlob.reviews : [],
      orders: Array.isArray(configBlob.ordersBackup)
        ? configBlob.ordersBackup
        : [],
      articles: Array.isArray(configBlob.articles)
        ? configBlob.articles
        : undefined,
      activityLogs: Array.isArray(configBlob.activityLogs)
        ? configBlob.activityLogs
        : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      message: `Gagal mengambil data dari Supabase: ${
        err instanceof Error ? err.message : 'Network error'
      }`,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Jalankan SQL ini di Supabase SQL Editor untuk membuat tabel katalog, pesanan & pengaturan TGI:
create table if not exists public.tgi_products (
  id text primary key,
  sku text not null unique,
  name text not null,
  category text not null,
  normal_price integer not null default 0,
  sale_price integer not null default 0,
  wholesale_min_qty integer not null default 6,
  wholesale_price integer not null default 0,
  rating numeric(3,1) not null default 4.9,
  sold_count integer not null default 0,
  stock integer not null default 100,
  is_sale boolean not null default true,
  is_promo_grosir boolean not null default false,
  image_url text not null,
  material text default '',
  dimensions text default '',
  weight_grams integer default 500,
  colors text[] default '{}',
  description text default '',
  updated_at timestamptz default now()
);

create table if not exists public.tgi_site_settings (
  id text primary key,
  config_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.tgi_orders (
  id text primary key,
  reference_code text not null,
  customer_name text not null,
  customer_city text default '',
  delivery_method text default 'ekspedisi',
  voucher_code text default '',
  total_quantity integer not null default 1,
  total_payable integer not null default 0,
  items_summary text default '',
  created_at timestamptz default now()
);

create table if not exists public.tgi_articles (
  id text primary key,
  title text not null,
  category text default 'Strategi Bisnis',
  excerpt text default '',
  content text default '',
  image_url text default '',
  published_at text default '',
  read_time text default '4 Menit Baca',
  author text default 'Tim Edukasi TGI',
  updated_at timestamptz default now()
);

alter table public.tgi_products enable row level security;
alter table public.tgi_site_settings enable row level security;
alter table public.tgi_orders enable row level security;
alter table public.tgi_articles enable row level security;

create policy "Allow public read access on tgi_products"
  on public.tgi_products for select using (true);

create policy "Allow anon write access on tgi_products"
  on public.tgi_products for all using (true) with check (true);

create policy "Allow public read access on tgi_site_settings"
  on public.tgi_site_settings for select using (true);

create policy "Allow anon write access on tgi_site_settings"
  on public.tgi_site_settings for all using (true) with check (true);

create policy "Allow public read access on tgi_orders"
  on public.tgi_orders for select using (true);

create policy "Allow anon write access on tgi_orders"
  on public.tgi_orders for all using (true) with check (true);

create policy "Allow public read access on tgi_articles"
  on public.tgi_articles for select using (true);

create policy "Allow anon write access on tgi_articles"
  on public.tgi_articles for all using (true) with check (true);`;
