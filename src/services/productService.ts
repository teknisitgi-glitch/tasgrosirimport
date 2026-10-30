import { Product, StoreConfig, UiContentConfig } from '../types/product';
import {
  createBagStudioSvg,
  createHeroLookbookSvg,
  createLiveStudioPosterSvg,
} from '../utils/bagStudioSvg';

const STORAGE_KEY_PRODUCTS = 'tgi_catalog_products_v1';
const STORAGE_KEY_CONFIG = 'tgi_store_config_v1';
const STORAGE_KEY_UI_CONTENT = 'tgi_ui_content_config_v1';

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
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const DEFAULT_UI_CONTENT_CONFIG: UiContentConfig = {
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
      overlayOpacity: 50,
    },
    {
      id: 'slide-2',
      seasonTag: 'PROGRAM RESELLER & PARTAI BESAR · BEBAS CAMPUR SKU',
      headline: 'PROMO GROSIR SERI MIX - UNTUNG MAKSIMAL',
      subheadline:
        'Beli mulai 6 pcs otomatis dapat harga grosir pabrik. Bebas campur model BP-MY-00513, HB-WQ-10670, dan SG-MY-00813 dalam satu nota.',
      ctaLabel: 'Lihat Promo Grosir',
      targetCategory: 'Promo Grosir',
      highlightMetric: 'Subsidi Ongkir Kargo Seluruh Indonesia',
      imageUri: createHeroLookbookSvg(1),
      overlayOpacity: 55,
    },
    {
      id: 'slide-3',
      seasonTag: 'URBAN COMMUTER & LUXURY HANDBAG SERIES',
      headline: 'MATERIAL GRADE A - JAHITAN PRESISI',
      subheadline:
        'Menggunakan Ballistic Nylon Waterproof & Pebbled Vegan Leather pilihan dengan hardware logam anti-karat bergaransi retur 100%.',
      ctaLabel: 'Eksplor Backpack & Handbag',
      targetCategory: 'Backpack',
      highlightMetric: 'Lolos QC 3 Tahap Sebelum Pengiriman',
      imageUri: createHeroLookbookSvg(2),
      overlayOpacity: 55,
    },
  ],
  bentoCards: [
    {
      id: 'bento-1',
      iconType: 'truck',
      badgeText: 'Info Grosir',
      title: 'GRATIS ONGKIR & HARGA GROSIR',
      description:
        'Potongan harga grosir otomatis untuk pembelian minimal 6 pcs (bebas campur SKU) serta subsidi ongkir belanja partai besar seluruh Indonesia.',
      modalTitle: 'KETENTUAN HARGA GROSIR & SUBSIDI ONGKIR',
      modalContent:
        'Sistem keranjang belanja otomatis menghitung potongan harga grosir ketika jumlah pembelian 1 kode SKU mencapai minimal 6 pcs, atau total gabungan seluruh item di keranjang mencapai minimal 6 pcs (Bebas Campur SKU). Subsidi ongkir kargo berlaku otomatis untuk pembelanjaan mencapai batas minimum toko.',
    },
    {
      id: 'bento-2',
      iconType: 'shield',
      badgeText: 'Garansi 7 Hari',
      title: 'JAMINAN RETUR 100%',
      description:
        'Barang cacat pabrik, jahitan lepas, atau resleting macet? Kami ganti unit baru 100% tanpa biaya tambahan dengan menyertakan video unboxing.',
      modalTitle: 'PROSEDUR JAMINAN RETUR 100% TGI',
      modalContent:
        'Setiap tas import yang keluar dari gudang TGI telah melewati 3 tahap pemeriksaan kualitas (jahitan, kepala resleting, dan permukaan kulit/nilon). Garansi tukar baru berlaku 7 hari sejak paket diterima dengan melampirkan video unboxing ke WhatsApp Admin.',
    },
    {
      id: 'bento-3',
      iconType: 'warehouse',
      badgeText: 'Lokasi Gudang',
      title: 'PICKUP GUDANG LANGSUNG',
      description:
        'Reseller & pembeli partai besar dapat mengambil pesanan langsung di Gudang TGI atau menggunakan kurir instan/kargo langganan.',
      modalTitle: 'INFORMASI PICKUP GUDANG TGI',
      modalContent:
        'Anda dapat memilih opsi Pickup Langsung di Gudang TGI pada saat melakukan Checkout WhatsApp di keranjang belanja.',
    },
  ],
  catalogLayout: {
    desktopColumns: 3,
    imageAspectRatio: '4:3',
    imageObjectFit: 'cover',
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
  },
  updatedAt: '2026-10-30T00:00:00.000Z',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-bp-my-00513',
    sku: 'BP-MY-00513',
    name: 'Tas Ransel Urban Commuter Waterproof BP-MY-00513',
    category: 'Backpack',
    normalPrice: 245000,
    salePrice: 139000,
    wholesaleMinQty: 6,
    wholesalePrice: 118000,
    rating: 4.9,
    soldCount: 1420,
    stock: 185,
    isSale: true,
    isPromoGrosir: true,
    imageUrl: createBagStudioSvg({
      variant: 'backpack-black',
      sku: 'BP-MY-00513',
      accentLabel: 'WATERPROOF NYLON',
    }),
    material: 'Ballistic Nylon 1680D Waterproof + YKK Matte Zipper',
    dimensions: '44 × 30 × 15 cm (Muat Laptop 15.6")',
    weightGrams: 720,
    colors: ['Matte Black', 'Charcoal Grey', 'Navy'],
    description:
      'Backpack import premium dengan kompartemen laptop berlapis busa anti-bentur, material tahan cipratan air intensitas tinggi, dan jahitan bartack ganda untuk pemakaian harian maupun travel.',
    updatedAt: '2026-10-29T10:00:00.000Z',
  },
  {
    id: 'prod-hb-wq-10670',
    sku: 'HB-WQ-10670',
    name: 'Luxury Structured Top-Handle Handbag HB-WQ-10670',
    category: 'Handbag',
    normalPrice: 289000,
    salePrice: 165000,
    wholesaleMinQty: 6,
    wholesalePrice: 142000,
    rating: 4.9,
    soldCount: 980,
    stock: 112,
    isSale: true,
    isPromoGrosir: true,
    imageUrl: createBagStudioSvg({
      variant: 'handbag-taupe',
      sku: 'HB-WQ-10670',
      accentLabel: 'PREMIUM PU LEATHER',
    }),
    material: 'Pebbled Vegan Leather Grade A + Gold Plated Turnlock',
    dimensions: '28 × 21 × 12 cm (Dilengkapi Tali Panjang Adjustable)',
    weightGrams: 610,
    colors: ['Warm Taupe', 'Ivory Cream', 'Espresso'],
    description:
      'Handbag import berstruktur elegan dengan detail kunci putar berlapis warna emas muda. Memiliki 3 ruang utama bersekat resleting dan kaki pelindung logam di bagian bawah.',
    updatedAt: '2026-10-29T10:05:00.000Z',
  },
  {
    id: 'prod-sg-my-00813',
    sku: 'SG-MY-00813',
    name: 'Crescent Minimalist Hobo Shoulder Bag SG-MY-00813',
    category: 'Shoulder Bag',
    normalPrice: 195000,
    salePrice: 115000,
    wholesaleMinQty: 6,
    wholesalePrice: 96000,
    rating: 4.8,
    soldCount: 1640,
    stock: 240,
    isSale: true,
    isPromoGrosir: true,
    imageUrl: createBagStudioSvg({
      variant: 'shoulder-caramel',
      sku: 'SG-MY-00813',
      accentLabel: 'BEST SELLER IMPORT',
    }),
    material: 'Smooth Microfiber Leather + Brushed Brass Ring',
    dimensions: '26 × 16 × 8 cm',
    weightGrams: 380,
    colors: ['Caramel Brown', 'Onyx Black', 'Oatmilk'],
    description:
      'Shoulder bag siluet sabit modern yang sangat diminati reseller dan butik. Tekstur kulit lembut, ringan di bahu, dan dilengkapi penutup resleting penuh yang aman.',
    updatedAt: '2026-10-29T10:10:00.000Z',
  },
  {
    id: 'prod-bp-tg-00921',
    sku: 'BP-TG-00921',
    name: 'Tactical Travel & Work Backpack Expandable BP-TG-00921',
    category: 'Backpack',
    normalPrice: 275000,
    salePrice: 158000,
    wholesaleMinQty: 6,
    wholesalePrice: 134000,
    rating: 4.8,
    soldCount: 730,
    stock: 94,
    isSale: true,
    isPromoGrosir: false,
    imageUrl: createBagStudioSvg({
      variant: 'backpack-olive',
      sku: 'BP-TG-00921',
      accentLabel: 'EXPANDABLE 32L',
    }),
    material: 'Cordura Canvas Mix + Breathable Back Mesh',
    dimensions: '46 × 31 × 17 cm',
    weightGrams: 810,
    colors: ['Olive Drab', 'Jet Black', 'Sand Khaki'],
    description:
      'Ransel kapasitas besar dengan slot koper belakang (luggage strap), saku botol minum di kedua sisi, dan kompartemen organisasi dokumen bisnis.',
    updatedAt: '2026-10-29T10:15:00.000Z',
  },
  {
    id: 'prod-hb-kl-20415',
    sku: 'HB-KL-20415',
    name: 'Executive Work Tote Handbag Espresso HB-KL-20415',
    category: 'Handbag',
    normalPrice: 310000,
    salePrice: 179000,
    wholesaleMinQty: 6,
    wholesalePrice: 152000,
    rating: 4.9,
    soldCount: 845,
    stock: 78,
    isSale: true,
    isPromoGrosir: false,
    imageUrl: createBagStudioSvg({
      variant: 'handbag-espresso',
      sku: 'HB-KL-20415',
      accentLabel: 'GOLD HARDWARE',
    }),
    material: 'Saffiano Textured PU Leather Import',
    dimensions: '33 × 25 × 13 cm (Muat iPad / Dokumen A4)',
    weightGrams: 690,
    colors: ['Espresso Brown', 'Classic Black', 'Burgundy'],
    description:
      'Tote handbag formal berkapasitas lega untuk aktivitas kantor dan kasual. Tahan gores, mudah dibersihkan, dan jahitan tepi presisi.',
    updatedAt: '2026-10-29T10:20:00.000Z',
  },
  {
    id: 'prod-sg-pr-00492',
    sku: 'SG-PR-00492',
    name: 'Onyx Quilted Chain Shoulder Bag SG-PR-00492',
    category: 'Shoulder Bag',
    normalPrice: 225000,
    salePrice: 129000,
    wholesaleMinQty: 6,
    wholesalePrice: 108000,
    rating: 4.7,
    soldCount: 615,
    stock: 130,
    isSale: true,
    isPromoGrosir: true,
    imageUrl: createBagStudioSvg({
      variant: 'shoulder-onyx',
      sku: 'SG-PR-00492',
      accentLabel: 'NEW ARRIVAL',
    }),
    material: 'Soft Lambskin-Touch Vegan Leather',
    dimensions: '25 × 15 × 7.5 cm',
    weightGrams: 410,
    colors: ['Onyx Black', 'Silver Pearl', 'Mocha'],
    description:
      'Shoulder bag monokrom minimalis dengan aksen hardware perak satin. Bisa digunakan sebagai shoulder bag maupun sling bag.',
    updatedAt: '2026-10-29T10:25:00.000Z',
  },
  {
    id: 'prod-bp-kr-01104',
    sku: 'BP-KR-01104',
    name: 'Midnight Navy Smart USB Commuter Backpack BP-KR-01104',
    category: 'Backpack',
    normalPrice: 260000,
    salePrice: 149000,
    wholesaleMinQty: 6,
    wholesalePrice: 125000,
    rating: 4.8,
    soldCount: 520,
    stock: 110,
    isSale: true,
    isPromoGrosir: false,
    imageUrl: createBagStudioSvg({
      variant: 'backpack-navy',
      sku: 'BP-KR-01104',
      accentLabel: 'USB PORT EDITION',
    }),
    material: 'High-Density Oxford Polyester Water-Repellent',
    dimensions: '43 × 29 × 14 cm',
    weightGrams: 680,
    colors: ['Midnight Navy', 'Slate Black'],
    description:
      'Dilengkapi port USB eksternal terintegrasi dan saku anti-maling tersembunyi di punggung. Cocok untuk kebutuhan kampus, kantor, dan souvenir korporat grosir.',
    updatedAt: '2026-10-29T10:30:00.000Z',
  },
  {
    id: 'prod-pk-gr-00100',
    sku: 'PK-GR-00100',
    name: 'Paket Usaha Grosir Seri Mix 12 Pcs (Bebas Pilih SKU) PK-GR-00100',
    category: 'Promo Grosir',
    normalPrice: 2100000,
    salePrice: 1290000,
    wholesaleMinQty: 1,
    wholesalePrice: 1250000,
    rating: 5.0,
    soldCount: 390,
    stock: 45,
    isSale: true,
    isPromoGrosir: true,
    imageUrl: createBagStudioSvg({
      variant: 'grosir-bundle',
      sku: 'PK-GR-00100',
      accentLabel: 'PAKET USAHA 12 PCS',
    }),
    material: 'Campuran Koleksi Best Seller (Backpack, Handbag & Shoulder Bag)',
    dimensions: 'Karung / Karton Segel Gudang (12 Pcs Campur Model)',
    weightGrams: 6500,
    colors: ['Mix Best Seller Warna Netral', 'Custom Pilih di WA'],
    description:
      'Paket khusus reseller & toko tas! Berisi 12 pcs tas import best seller (termasuk seri BP-MY-00513, HB-WQ-10670, dan SG-MY-00813). Bebas request komposisi warna saat konfirmasi di WhatsApp.',
    updatedAt: '2026-10-29T10:35:00.000Z',
  },
];

export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products to localStorage:', err);
  }
}

export function resetLocalProducts(): Product[] {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function getStoreConfig(): StoreConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return DEFAULT_STORE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORE_CONFIG,
      ...parsed,
      socialLinks: {
        ...DEFAULT_STORE_CONFIG.socialLinks,
        ...(parsed.socialLinks || {}),
      },
    };
  } catch {
    return DEFAULT_STORE_CONFIG;
  }
}

export function saveStoreConfig(config: StoreConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save store config:', err);
  }
}

export function resetStoreConfig(): StoreConfig {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_STORE_CONFIG));
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
    return {
      heroSlides:
        Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0
          ? parsed.heroSlides
          : DEFAULT_UI_CONTENT_CONFIG.heroSlides,
      bentoCards:
        Array.isArray(parsed.bentoCards) && parsed.bentoCards.length === 3
          ? parsed.bentoCards
          : DEFAULT_UI_CONTENT_CONFIG.bentoCards,
      catalogLayout: {
        ...DEFAULT_UI_CONTENT_CONFIG.catalogLayout,
        ...(parsed.catalogLayout || {}),
      },
      liveShopping: {
        ...DEFAULT_UI_CONTENT_CONFIG.liveShopping,
        ...(parsed.liveShopping || {}),
      },
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return DEFAULT_UI_CONTENT_CONFIG;
  }
}

export function saveUiContentConfig(config: UiContentConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_UI_CONTENT, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save UI content config to localStorage:', err);
  }
}

export function resetUiContentConfig(): UiContentConfig {
  localStorage.setItem(
    STORAGE_KEY_UI_CONTENT,
    JSON.stringify(DEFAULT_UI_CONTENT_CONFIG)
  );
  return DEFAULT_UI_CONTENT_CONFIG;
}

export async function syncProductsToSupabase(
  config: StoreConfig,
  products: Product[],
  uiConfig?: UiContentConfig
): Promise<{ ok: boolean; message: string }> {
  const url = config.supabaseUrl.trim().replace(/\/$/, '');
  const key = config.supabaseAnonKey.trim();

  if (!url || !key) {
    return {
      ok: false,
      message:
        'URL Supabase atau Anon Key belum diisi. Data tetap tersimpan aman di localStorage.',
    };
  }

  try {
    const response = await fetch(`${url}/rest/v1/tgi_products`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(
        products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          normal_price: p.normalPrice,
          sale_price: p.salePrice,
          wholesale_min_qty: p.wholesaleMinQty,
          wholesale_price: p.wholesalePrice,
          rating: p.rating,
          sold_count: p.soldCount,
          stock: p.stock,
          is_sale: p.isSale,
          is_promo_grosir: p.isPromoGrosir,
          image_url: p.imageUrl,
          material: p.material,
          dimensions: p.dimensions,
          weight_grams: p.weightGrams,
          colors: p.colors,
          description: p.description,
          updated_at: p.updatedAt,
        }))
      ),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        ok: false,
        message: `Supabase merespons status ${response.status}: ${errText.slice(0, 120)}`,
      };
    }

    // Sync UI & Contact settings
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
    };

    await fetch(`${url}/rest/v1/tgi_site_settings`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify([
        {
          id: 'main_ui_config',
          config_json: {
            uiConfig: uiConfig || DEFAULT_UI_CONTENT_CONFIG,
            storeConfig: safeStoreMeta,
          },
          updated_at: new Date().toISOString(),
        },
      ]),
    }).catch(() => {});

    return {
      ok: true,
      message: `Berhasil sinkronisasi ${products.length} produk, pengaturan tampilan & kontak perusahaan ke Supabase!`,
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

export const SUPABASE_SQL_SCHEMA = `-- Jalankan SQL ini di Supabase SQL Editor untuk membuat tabel katalog & pengaturan tampilan/kontak TGI:
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

alter table public.tgi_products enable row level security;
alter table public.tgi_site_settings enable row level security;

create policy "Allow public read access on tgi_products"
  on public.tgi_products for select using (true);

create policy "Allow anon write access on tgi_products"
  on public.tgi_products for all using (true) with check (true);

create policy "Allow public read access on tgi_site_settings"
  on public.tgi_site_settings for select using (true);

create policy "Allow anon write access on tgi_site_settings"
  on public.tgi_site_settings for all using (true) with check (true);`;
