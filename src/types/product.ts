export type ProductCategory =
  | 'Semua'
  | 'Backpack'
  | 'Handbag'
  | 'Shoulder Bag'
  | 'Promo Grosir';

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
  isSale: boolean;
  isPromoGrosir: boolean;
  imageUrl: string;
  material: string;
  dimensions: string;
  weightGrams: number;
  colors: string[];
  description: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
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
  modalTitle: string;
  modalContent: string;
}

export type DesktopColumnsCount = 2 | 3 | 4;
export type ProductImageAspectRatio = '1:1' | '3:4' | '4:3';
export type ProductImageObjectFit = 'cover' | 'contain';

export interface CatalogLayoutConfig {
  desktopColumns: DesktopColumnsCount;
  imageAspectRatio: ProductImageAspectRatio;
  imageObjectFit: ProductImageObjectFit;
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
}

export interface UiContentConfig {
  heroSlides: HeroSlideItem[];
  bentoCards: [BentoCardItem, BentoCardItem, BentoCardItem];
  catalogLayout: CatalogLayoutConfig;
  liveShopping: LiveShoppingConfig;
  updatedAt: string;
}

