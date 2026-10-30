import { CartItem, Product, StoreConfig } from '../types/product';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscountPercent(normalPrice: number, salePrice: number): number {
  if (!normalPrice || normalPrice <= salePrice) return 0;
  return Math.round(((normalPrice - salePrice) / normalPrice) * 100);
}

export function getEffectiveUnitPrice(item: CartItem, totalCartQuantity: number): {
  unitPrice: number;
  isWholesaleApplied: boolean;
} {
  const { product, quantity } = item;
  const qualifiesForWholesale =
    quantity >= product.wholesaleMinQty || totalCartQuantity >= 6;
  if (qualifiesForWholesale && product.wholesalePrice < product.salePrice) {
    return {
      unitPrice: product.wholesalePrice,
      isWholesaleApplied: true,
    };
  }
  return {
    unitPrice: product.salePrice,
    isWholesaleApplied: false,
  };
}

export function cleanWhatsAppNumber(raw: string): string {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (!digits) return '6281288997766';
  if (digits.startsWith('08')) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

export function buildWhatsAppOrderText(params: {
  items: CartItem[];
  customerName: string;
  customerCity: string;
  deliveryMethod: 'ekspedisi' | 'pickup';
  notes: string;
  config: StoreConfig;
}): {
  message: string;
  whatsappUrl: string;
  totalQuantity: number;
  subtotalNormal: number;
  totalPayable: number;
  totalSavings: number;
} {
  const { items, customerName, customerCity, deliveryMethod, notes, config } = params;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  let subtotalNormal = 0;
  let totalPayable = 0;

  const itemLines = items.map((item, idx) => {
    const { unitPrice, isWholesaleApplied } = getEffectiveUnitPrice(item, totalQuantity);
    const lineTotal = unitPrice * item.quantity;
    subtotalNormal += item.product.normalPrice * item.quantity;
    totalPayable += lineTotal;

    const tierLabel = isWholesaleApplied ? ' [Harga Grosir]' : '';
    return `${idx + 1}. *${item.product.name}*\n   • SKU: \`${item.product.sku}\` | Warna: ${item.selectedColor}\n   • Qty: ${item.quantity} pcs × ${formatRupiah(unitPrice)}${tierLabel} = *${formatRupiah(lineTotal)}*`;
  });

  const totalSavings = Math.max(0, subtotalNormal - totalPayable);
  const cleanPhone = cleanWhatsAppNumber(config.whatsappNumber);

  const customGreeting = (
    config.whatsappGreetingTemplate ||
    `Halo Admin *{storeName}*, saya ingin memesan produk berikut:`
  ).replace(/\{storeName\}/gi, config.storeName || 'TAS GROSIR IMPORT');

  const orderId = `TGI-${Date.now().toString().slice(-6)}`;
  const lines = [
    customGreeting,
    `No. Referensi: *#${orderId}*`,
    `----------------------------------------`,
    ...itemLines,
    `----------------------------------------`,
    `• Total Item: *${totalQuantity} pcs*`,
    `• Total Hemat: *${formatRupiah(totalSavings)}*`,
    `• *TOTAL BAYAR: ${formatRupiah(totalPayable)}*`,
    `----------------------------------------`,
    `*Data Pemesan:*`,
    `• Nama: ${customerName.trim() || 'Pelanggan TGI'}`,
    `• Kota / Alamat: ${customerCity.trim() || '-'}`,
    `• Metode Pengiriman: ${
      deliveryMethod === 'pickup'
        ? 'Pickup Langsung di Gudang TGI'
        : 'Kirim via Ekspedisi / Kargo Grosir'
    }`,
    notes.trim() ? `• Catatan: ${notes.trim()}` : '',
    ``,
    `Mohon informasi ketersediaan stok dan total ongkos kirimnya. Terima kasih!`,
  ].filter(Boolean);

  const message = lines.join('\n');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return {
    message,
    whatsappUrl,
    totalQuantity,
    subtotalNormal,
    totalPayable,
    totalSavings,
  };
}

export function buildDirectWhatsAppUrl(
  config: StoreConfig,
  productOrder?: {
    product: Product;
    color: string;
    quantity: number;
    unitPrice: number;
  }
): string {
  const cleanPhone = cleanWhatsAppNumber(config.whatsappNumber);
  const greeting = (
    config.whatsappGreetingTemplate ||
    `Halo Admin *{storeName}*, saya ingin bertanya / memesan produk tas import.`
  ).replace(/\{storeName\}/gi, config.storeName || 'TAS GROSIR IMPORT');

  if (!productOrder) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
  }

  const { product, color, quantity, unitPrice } = productOrder;
  const total = unitPrice * quantity;
  const text = [
    greeting,
    ``,
    `*Detail Produk:*`,
    `• Nama: *${product.name}*`,
    `• Kode SKU: \`${product.sku}\``,
    `• Warna: ${color}`,
    `• Jumlah: ${quantity} pcs × ${formatRupiah(unitPrice)} = *${formatRupiah(total)}*`,
    ``,
    `Apakah stok untuk SKU ini tersedia? Terima kasih!`,
  ].join('\n');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function resolveSocialUrl(
  platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'shopee' | 'tokopedia',
  rawInput: string
): string {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleanHandle = trimmed.replace(/^@/, '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'twitter':
      return `https://x.com/${cleanHandle}`;
    case 'shopee':
      return `https://shopee.co.id/${cleanHandle}`;
    case 'tokopedia':
      return `https://tokopedia.com/${cleanHandle}`;
    default:
      return `https://${trimmed}`;
  }
}
