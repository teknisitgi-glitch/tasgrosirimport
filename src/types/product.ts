export type ProductCategory =
  | 'Semua'
  | 'Backpack'
  | 'Handbag'
  | 'Shoulder Bag'
  | 'Promo Grosir';

export type StockStatusLabel =
  | 'Ready Stock'
  | 'Stok Terbatas'
  | 'Pre-Order'
  | 'Habis';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Exclude<ProductCategory, 'Semua'>;
  normalPrice: number;
  salePrice: number;
  wholesaleMinQty: number;
  wholesalePrice: number;
  rating: number;
  soldCount: number;
  stock: number;
  stockStatus?: StockStatusLabel;
  isSale: boolean;
  isPromoGrosir: boolean;
  imageUrl: string;
  galleryImages?: string[];
  material: string;
  dimensions: string;
  weightGrams: number;
  colors: string[];
  sizes?: string[];
  description: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize?: string;
}

export interface SocialAndMarketplaceLinks {
  instagram: string;
  tiktok: string;
  facebook: string;
  twitter: string;
  shopeeUrl: string;
  tokopediaUrl: string;
}

export interface StoreConfig {
  storeName: string;
  slogan: string;
  whatsappNumber: string;
  whatsappGreetingTemplate: string;
  email: string;
  warehouseAddress: string;
  operatingHours: string;
  freeShippingThreshold: number;
  socialLinks: SocialAndMarketplaceLinks;
  adminPin?: string;
  hideAdminInHeader?: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface HeroSlideItem {
  id: string;
  seasonTag: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  targetCategory: ProductCategory;
  highlightMetric: string;
  imageUri: string;
  overlayOpacity: number; // 0 to 90 (%)
}

export interface BentoCardItem {
  id: string;
  iconType: 'truck' | 'shield' | 'warehouse';
  badgeText: string;
  title: string;
  description: string;
  bulletPoints?: string[];
  imageUri?: string;
  modalTitle: string;
  modalContent: string;
}

export interface VoucherItem {
  id: string;
  title: string;
  subtitle: string;
  code: string;
}

export type DesktopColumnsCount = 2 | 3 | 4;
export type ProductImageAspectRatio = '1:1' | '3:4' | '4:3';
export type ProductImageObjectFit = 'cover' | 'contain';

export interface SectionVisibilityConfig {
  showAnnouncementBar: boolean;
  showVoucherBar: boolean;
  showHeroBanner: boolean;
  showPromoBento: boolean;
  showLiveShopping: boolean;
  showCustomerReviews: boolean;
}

export interface CatalogLayoutConfig {
  desktopColumns: DesktopColumnsCount;
  imageAspectRatio: ProductImageAspectRatio;
  imageObjectFit: ProductImageObjectFit;
  sectionVisibility?: SectionVisibilityConfig;
}

export interface LiveShoppingConfig {
  isTikTokLive: boolean;
  isShopeeLive: boolean;
  tiktokLiveUrl: string;
  tiktokUsername: string;
  shopeeLiveUrl: string;
  shopeeStoreName: string;
  promoTitle: string;
  dailySchedule: string;
  posterImageUri: string;
  liveVideoUrl?: string;
}

export interface ResellerGuideMoqPoint {
  title: string;
  description: string;
}

export interface ResellerGuideDropshipStep {
  stepLabel: string;
  title: string;
  description: string;
}

export interface ResellerGuideCargoRow {
  id?: string;
  region: string;
  cities: string;
  ekspedisiLokal: string;
  jtrDakota: string;
  indahCargo: string;
  estRate: string;
}

export interface ResellerGuideConfig {
  menuLabel: string;
  headerBadge: string;
  headerTitle: string;
  headerSubtitle: string;
  customAnnouncement: string;
  moqSectionTitle: string;
  moqSectionSubtitle: string;
  moqPoints: ResellerGuideMoqPoint[];
  dropshipSectionTitle: string;
  dropshipSectionSubtitle: string;
  dropshipSteps: ResellerGuideDropshipStep[];
  dropshipCutoffNote: string;
  dropshipPackingNote: string;
  dropshipCouriersNote: string;
  cargoSectionTitle: string;
  cargoSectionSubtitle: string;
  cargoSackBadge: string;
  cargoTipsNote: string;
  cargoTable: ResellerGuideCargoRow[];
}

export interface UiContentConfig {
  announcementText?: string;
  heroSlides: HeroSlideItem[];
  vouchers: [VoucherItem, VoucherItem, VoucherItem];
  bentoCards: [BentoCardItem, BentoCardItem, BentoCardItem];
  catalogLayout: CatalogLayoutConfig;
  liveShopping: LiveShoppingConfig;
  resellerGuide?: ResellerGuideConfig;
  updatedAt: string;
}

export interface CustomerReview {
  id: string;
  reviewerName: string;
  storeName: string;
  city: string;
  rating: number;
  orderBatchInfo: string;
  productSku: string;
  productName: string;
  comment: string;
  verifiedWholesale: boolean;
  createdAt: string;
}

export type OrderShipmentStatus =
  | 'Diproses Gudang'
  | 'Packing Karung QC'
  | 'Dikirim Kargo'
  | 'Selesai Diterima';

export interface OrderRecord {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone?: string;
  customerCity: string;
  deliveryMethod: 'ekspedisi' | 'pickup';
  cargoCourier?: string;
  trackingNumber?: string;
  orderStatus?: OrderShipmentStatus;
  totalWeightKg?: number;
  voucherCode?: string;
  discountAmount?: number;
  totalQuantity: number;
  totalPayable: number;
  itemsSummary: string;
  createdAt: string;
}



