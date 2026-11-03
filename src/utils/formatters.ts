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

export function getEffectiveUnitPrice(item: CartItem, _totalCartQuantity: number): {
  unitPrice: number;
  isWholesaleApplied: boolean;
} {
  return {
    unitPrice: item.product.salePrice,
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

export function evaluateVoucherDiscount(
  rawCode: string,
  totalQuantity: number,
  subtotalBeforeVoucher: number
): {
  valid: boolean;
  code: string;
  discountAmount: number;
  label: string;
} {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, code: '', discountAmount: 0, label: '' };
  }
  if (code === 'TGIRESELLER20') {
    return {
      valid: true,
      code,
      discountAmount: Math.min(20000, subtotalBeforeVoucher),
      label: 'Voucher Reseller Baru (-Rp 20.000)',
    };
  }
  if (code === 'GROSIRMIX6') {
    if (totalQuantity >= 6) {
      return {
        valid: true,
        code,
        discountAmount: Math.min(50000, subtotalBeforeVoucher),
        label: 'Potongan Grosir Min 6 Pcs (-Rp 50.000)',
      };
    }
    return {
      valid: false,
      code,
      discountAmount: 0,
      label: 'Min. belanja 6 pcs untuk kupon GROSIRMIX6',
    };
  }
  if (code === 'FREEKARGO') {
    return {
      valid: true,
      code,
      discountAmount: Math.min(35000, subtotalBeforeVoucher),
      label: 'Subsidi Ongkir Kargo (-Rp 35.000)',
    };
  }
  return {
    valid: false,
    code,
    discountAmount: 0,
    label: 'Kode kupon tidak ditemukan',
  };
}

export interface CargoCourierEstimate {
  id:
    | 'jne-jtr'
    | 'indah-cargo'
    | 'dakota-cargo'
    | 'ekspedisi-lokal'
    | 'sicepat-gokil';
  name: string;
  shortCode: string;
  etaDays: string;
  ratePerKg: number;
  minChargeKg: number;
  chargeableKg: number;
  estimatedCost: number;
  estimatedSackCount: number;
  costPerSack: number;
  badge: string;
}

export function calculateCargoEstimates(
  destinationCity: string,
  totalWeightGrams: number,
  totalQuantity: number = 1
): {
  zoneName: string;
  actualWeightKg: number;
  chargeableWeightKg: number;
  estimatedSackCount: number;
  couriers: CargoCourierEstimate[];
} {
  const actualWeightKg = Number(
    Math.max(0.1, totalWeightGrams / 1000).toFixed(2)
  );
  const roundedUpKg = Math.max(1, Math.ceil(actualWeightKg));
  // 1 Karung Goni / Karton Segel Gudang TGI rata-rata memuat ~15 kg atau ~30 pcs tas
  const estimatedSackCount = Math.max(
    1,
    Math.ceil(Math.max(actualWeightKg / 15, totalQuantity / 30))
  );
  const lower = (destinationCity || '').trim().toLowerCase();

  let zoneName = 'Jawa & Jabodetabek (Estimasi Standar)';
  let jtrRate = 4500;
  let indahRate = 4000;
  let dakotaRate = 3600;
  let lokalRate = 3000;
  let gokilRate = 5000;
  let etaJtr = '2 - 4 Hari';
  let etaIndah = '2 - 5 Hari';
  let etaDakota = '2 - 4 Hari';
  let etaLokal = '1 - 3 Hari';
  let etaGokil = '2 - 3 Hari';

  if (
    lower.includes('jakarta') ||
    lower.includes('bogor') ||
    lower.includes('depok') ||
    lower.includes('tangerang') ||
    lower.includes('bekasi') ||
    lower.includes('jabodetabek') ||
    lower.includes('tanah abang') ||
    lower.includes('kapuk')
  ) {
    zoneName = 'Jabodetabek & Pusat Grosir Jakarta';
    jtrRate = 3500;
    indahRate = 3200;
    dakotaRate = 2900;
    lokalRate = 2500;
    gokilRate = 3800;
    etaJtr = '1 - 2 Hari';
    etaIndah = '1 - 3 Hari';
    etaDakota = '1 - 2 Hari';
    etaLokal = 'Same Day / 1 Hari';
    etaGokil = '1 - 2 Hari';
  } else if (
    lower.includes('bandung') ||
    lower.includes('cirebon') ||
    lower.includes('karawang') ||
    lower.includes('sukabumi') ||
    lower.includes('tasik') ||
    lower.includes('jawa barat')
  ) {
    zoneName = 'Jawa Barat';
    jtrRate = 4200;
    indahRate = 3800;
    dakotaRate = 3400;
    lokalRate = 3100;
    gokilRate = 4500;
    etaJtr = '2 - 3 Hari';
    etaIndah = '2 - 4 Hari';
    etaDakota = '2 - 3 Hari';
    etaLokal = '1 - 3 Hari';
    etaGokil = '1 - 3 Hari';
  } else if (
    lower.includes('semarang') ||
    lower.includes('solo') ||
    lower.includes('jogja') ||
    lower.includes('yogyakarta') ||
    lower.includes('pekalongan') ||
    lower.includes('purwokerto') ||
    lower.includes('jawa tengah')
  ) {
    zoneName = 'Jawa Tengah & DIY';
    jtrRate = 5500;
    indahRate = 4800;
    dakotaRate = 4300;
    lokalRate = 3900;
    gokilRate = 5800;
    etaJtr = '2 - 4 Hari';
    etaIndah = '3 - 5 Hari';
    etaDakota = '2 - 4 Hari';
    etaLokal = '2 - 4 Hari';
    etaGokil = '2 - 3 Hari';
  } else if (
    lower.includes('surabaya') ||
    lower.includes('malang') ||
    lower.includes('sidoarjo') ||
    lower.includes('gresik') ||
    lower.includes('kediri') ||
    lower.includes('jawa timur')
  ) {
    zoneName = 'Jawa Timur';
    jtrRate = 6500;
    indahRate = 5500;
    dakotaRate = 4900;
    lokalRate = 4500;
    gokilRate = 6800;
    etaJtr = '3 - 4 Hari';
    etaIndah = '3 - 5 Hari';
    etaDakota = '3 - 5 Hari';
    etaLokal = '2 - 4 Hari';
    etaGokil = '2 - 4 Hari';
  } else if (
    lower.includes('medan') ||
    lower.includes('palembang') ||
    lower.includes('pekanbaru') ||
    lower.includes('lampung') ||
    lower.includes('padang') ||
    lower.includes('batam') ||
    lower.includes('sumatera')
  ) {
    zoneName = 'Sumatera & Kepulauan';
    jtrRate = 9500;
    indahRate = 8200;
    dakotaRate = 7600;
    lokalRate = 7000;
    gokilRate = 10000;
    etaJtr = '4 - 7 Hari';
    etaIndah = '4 - 7 Hari';
    etaDakota = '4 - 6 Hari';
    etaLokal = '4 - 6 Hari';
    etaGokil = '3 - 6 Hari';
  } else if (
    lower.includes('makassar') ||
    lower.includes('balikpapan') ||
    lower.includes('banjarmasin') ||
    lower.includes('pontianak') ||
    lower.includes('samarinda') ||
    lower.includes('manado') ||
    lower.includes('bali') ||
    lower.includes('denpasar') ||
    lower.includes('lombok') ||
    lower.includes('luar pulau') ||
    lower.includes('kalimantan') ||
    lower.includes('sulawesi')
  ) {
    zoneName = 'Bali, Kalimantan, Sulawesi & Luar Pulau';
    jtrRate = 12500;
    indahRate = 11000;
    dakotaRate = 10200;
    lokalRate = 9500;
    gokilRate = 13200;
    etaJtr = '5 - 8 Hari';
    etaIndah = '5 - 9 Hari';
    etaDakota = '5 - 8 Hari';
    etaLokal = '4 - 7 Hari';
    etaGokil = '4 - 7 Hari';
  }

  // Wholesale cargo couriers calculate minimum 5kg-10kg block or tiered per-kg
  const minCargoKg = 5;
  const billedKg = Math.max(minCargoKg, roundedUpKg);

  const buildCourier = (
    id: CargoCourierEstimate['id'],
    name: string,
    shortCode: string,
    etaDays: string,
    ratePerKg: number,
    badge: string
  ): CargoCourierEstimate => {
    const estimatedCost = billedKg * ratePerKg;
    return {
      id,
      name,
      shortCode,
      etaDays,
      ratePerKg,
      minChargeKg: minCargoKg,
      chargeableKg: billedKg,
      estimatedCost,
      estimatedSackCount,
      costPerSack: Math.round(estimatedCost / estimatedSackCount),
      badge,
    };
  };

  const couriers: CargoCourierEstimate[] = [
    buildCourier(
      'jne-jtr',
      'JNE Trucking (JTR)',
      'JNE JTR',
      etaJtr,
      jtrRate,
      'Paling Populer'
    ),
    buildCourier(
      'indah-cargo',
      'Indah Cargo Logistik',
      'Indah Cargo',
      etaIndah,
      indahRate,
      'Langganan Reseller'
    ),
    buildCourier(
      'dakota-cargo',
      'Dakota Cargo (Partai Besar)',
      'Dakota Cargo',
      etaDakota,
      dakotaRate,
      'Hemat Partai'
    ),
    buildCourier(
      'ekspedisi-lokal',
      'Ekspedisi Lokal Kapuk / Tanah Abang',
      'Ekspedisi Lokal',
      etaLokal,
      lokalRate,
      'Termurah Karungan'
    ),
    buildCourier(
      'sicepat-gokil',
      'SiCepat Gokil (Cargo Kilat)',
      'SiCepat Gokil',
      etaGokil,
      gokilRate,
      'Kargo Tercepat'
    ),
  ];

  return {
    zoneName,
    actualWeightKg,
    chargeableWeightKg: billedKg,
    estimatedSackCount,
    couriers,
  };
}

export function formatBuyerWhatsAppNumber(raw: string): {
  rawDigits: string;
  normalizedInternational: string;
  displayFormatted: string;
  isValid: boolean;
  validationMessage: string;
} {
  const digitsOnly = (raw || '').replace(/[^\d]/g, '');
  if (!digitsOnly) {
    return {
      rawDigits: '',
      normalizedInternational: '',
      displayFormatted: '',
      isValid: false,
      validationMessage: 'Masukkan nomor WhatsApp aktif pembeli',
    };
  }

  let normalized = digitsOnly;
  if (normalized.startsWith('0')) {
    normalized = `62${normalized.slice(1)}`;
  } else if (normalized.startsWith('8')) {
    normalized = `62${normalized}`;
  }

  const subscriberPart = normalized.startsWith('62')
    ? normalized.slice(2)
    : normalized;

  // Format into readable +62 812-3456-7890
  let displayFormatted = `+62 ${subscriberPart}`;
  if (subscriberPart.length > 3 && subscriberPart.length <= 7) {
    displayFormatted = `+62 ${subscriberPart.slice(0, 3)}-${subscriberPart.slice(3)}`;
  } else if (subscriberPart.length > 7) {
    displayFormatted = `+62 ${subscriberPart.slice(0, 3)}-${subscriberPart.slice(3, 7)}-${subscriberPart.slice(7, 13)}`;
  }

  const isValid =
    normalized.startsWith('628') &&
    normalized.length >= 10 &&
    normalized.length <= 15;

  let validationMessage = 'Format nomor WhatsApp valid & siap dihubungi';
  if (!normalized.startsWith('628')) {
    validationMessage = 'Gunakan awalan 08xx atau 628xx (nomor seluler Indonesia)';
  } else if (normalized.length < 10) {
    validationMessage = 'Nomor WhatsApp terlalu pendek (minimal 10 digit)';
  } else if (normalized.length > 15) {
    validationMessage = 'Nomor WhatsApp terlalu panjang (maksimal 15 digit)';
  }

  return {
    rawDigits: digitsOnly,
    normalizedInternational: normalized,
    displayFormatted,
    isValid,
    validationMessage,
  };
}

export function buildWhatsAppOrderText(params: {
  items: CartItem[];
  customerName: string;
  customerPhone?: string;
  customerCity: string;
  deliveryMethod: 'ekspedisi' | 'pickup';
  cargoCourierNote?: string;
  notes: string;
  voucherCode?: string;
  selectedCargoName?: string;
  selectedCargoCost?: number;
  overrideTotalWeightGrams?: number;
  estimatedSackCount?: number;
  config: StoreConfig;
}): {
  orderReference: string;
  message: string;
  whatsappUrl: string;
  totalQuantity: number;
  totalWeightGrams: number;
  totalWeightKg: number;
  subtotalNormal: number;
  subtotalItems: number;
  voucherDiscount: number;
  voucherLabel: string;
  totalPayable: number;
  totalSavings: number;
  isWholesaleOrder: boolean;
} {
  const {
    items,
    customerName,
    customerPhone = '',
    customerCity,
    deliveryMethod,
    cargoCourierNote = '',
    notes,
    voucherCode = '',
    selectedCargoName = '',
    selectedCargoCost = 0,
    overrideTotalWeightGrams,
    estimatedSackCount = 1,
    config,
  } = params;
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const skuTotalWeightGrams = items.reduce(
    (acc, item) => acc + (item.product.weightGrams || 500) * item.quantity,
    0
  );
  const totalWeightGrams =
    typeof overrideTotalWeightGrams === 'number' && overrideTotalWeightGrams > 0
      ? overrideTotalWeightGrams
      : skuTotalWeightGrams;
  const totalWeightKg = Number((totalWeightGrams / 1000).toFixed(2));

  let subtotalNormal = 0;
  let subtotalItems = 0;

  const itemLines = items.map((item, idx) => {
    const { unitPrice } = getEffectiveUnitPrice(item, totalQuantity);
    const lineTotal = unitPrice * item.quantity;
    subtotalNormal += unitPrice * item.quantity;
    subtotalItems += lineTotal;

    const sizeText = item.selectedSize || 'Medium (Standar)';
    return [
      `${idx + 1}. *${item.product.name}*`,
      `   • Kode SKU: \`${item.product.sku}\``,
      `   • Pilihan Warna: *${item.selectedColor}*`,
      `   • Pilihan Ukuran: *${sizeText}*`,
      `   • Jumlah: *${item.quantity} pcs* × ${formatRupiah(unitPrice)}`,
      `   • Subtotal Item: *${formatRupiah(lineTotal)}*`,
    ].join('\n');
  });

  const voucherEval = evaluateVoucherDiscount(
    voucherCode,
    totalQuantity,
    subtotalItems
  );
  const voucherDiscount = voucherEval.valid ? voucherEval.discountAmount : 0;
  const totalPayable = Math.max(0, subtotalItems - voucherDiscount);
  const totalSavings = Math.max(0, subtotalItems - totalPayable);
  const cleanPhone = cleanWhatsAppNumber(config.whatsappNumber);

  const phoneFormatted = formatBuyerWhatsAppNumber(customerPhone);

  const customGreeting = (
    config.whatsappGreetingTemplate ||
    `Halo Admin *{storeName}*, saya ingin memesan produk berikut:`
  ).replace(/\{storeName\}/gi, config.storeName || 'TAS GROSIR IMPORT');

  const orderReference = `TGI-${Date.now().toString().slice(-6)}`;
  const lines = [
    customGreeting,
    `No. Referensi Order: *#${orderReference}*`,
    `========================================`,
    ...itemLines,
    `========================================`,
    `• Total Jumlah Barang: *${totalQuantity} pcs* (Est. Berat: *${totalWeightGrams.toLocaleString('id-ID')} gr / ~${totalWeightKg} kg* · *~${estimatedSackCount} Karung*)`,
    `• Subtotal Produk: *${formatRupiah(subtotalItems)}*`,
    voucherDiscount > 0
      ? `• Kupon Promo (${voucherEval.code}): *-${formatRupiah(voucherDiscount)}*`
      : '',
    deliveryMethod === 'ekspedisi' && selectedCargoName
      ? `• Estimasi Ongkir Kargo (${selectedCargoName} · ~${estimatedSackCount} Karung): *~${formatRupiah(selectedCargoCost)}*`
      : '',
    `• *TOTAL ESTIMASI BAYAR PRODUK: ${formatRupiah(totalPayable)}*`,
    deliveryMethod === 'ekspedisi' && selectedCargoCost > 0
      ? `• *ESTIMASI TOTAL + ONGKIR KARGO: ${formatRupiah(totalPayable + selectedCargoCost)}*`
      : '',
    `========================================`,
    `*Data Pengiriman Pemesan:*`,
    `• Nama Pemesan / Toko: *${customerName.trim() || 'Pelanggan Website TGI'}*`,
    phoneFormatted.displayFormatted
      ? `• No. WhatsApp Pemesan: *${phoneFormatted.displayFormatted}* (wa.me/${phoneFormatted.normalizedInternational})`
      : '',
    `• Kota / Kabupaten Tujuan: *${customerCity.trim() || '-'}*`,
    `• Metode Pengiriman: *${
      deliveryMethod === 'pickup'
        ? 'Pickup Langsung di Gudang TGI'
        : selectedCargoName
        ? `Ekspedisi Kargo (${selectedCargoName})`
        : 'Kirim via Ekspedisi / Kargo Grosir'
    }*`,
    cargoCourierNote.trim()
      ? `• Catatan Ekspedisi Kargo Pilihan: *${cargoCourierNote.trim()}*`
      : '',
    notes.trim() ? `• Catatan Tambahan Pesanan: ${notes.trim()}` : '',
    ``,
    `_Catatan: Untuk pemesanan partai besar / grosir, mohon info harga khusus partai dari Admin Sales._`,
    `Mohon info ketersediaan stok, rincian ongkir final, dan rekening pembayaran. Terima kasih!`,
  ].filter(Boolean);

  const message = lines.join('\n');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return {
    orderReference,
    message,
    whatsappUrl,
    totalQuantity,
    totalWeightGrams,
    totalWeightKg,
    subtotalNormal,
    subtotalItems,
    voucherDiscount,
    voucherLabel: voucherEval.label,
    totalPayable,
    totalSavings,
    isWholesaleOrder: false,
  };
}

export interface ProductSizeOption {
  code: string;
  label: string;
  dimensionInfo: string;
}

export function getProductSizeOptions(product: Product): ProductSizeOption[] {
  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.map((s) => ({
      code: s,
      label: s,
      dimensionInfo: product.dimensions || 'Dimensi Standar',
    }));
  }

  if (product.category === 'Backpack') {
    return [
      {
        code: 'Small (14" · 39×27×12 cm)',
        label: 'Small (14")',
        dimensionInfo: '39 × 27 × 12 cm',
      },
      {
        code: 'Medium (15.6" · 44×30×15 cm)',
        label: 'Medium (15.6")',
        dimensionInfo: product.dimensions?.split('(')[0]?.trim() || '44 × 30 × 15 cm',
      },
      {
        code: 'Large (17" · 47×32×18 cm)',
        label: 'Large (17" Max)',
        dimensionInfo: '47 × 32 × 18 cm',
      },
    ];
  }

  if (product.category === 'Handbag') {
    return [
      {
        code: 'Small Petite (23×17×9 cm)',
        label: 'Small (S)',
        dimensionInfo: '23 × 17 × 9 cm',
      },
      {
        code: 'Medium Standar (28×21×12 cm)',
        label: 'Medium (M)',
        dimensionInfo: product.dimensions?.split('(')[0]?.trim() || '28 × 21 × 12 cm',
      },
      {
        code: 'Large Tote (33×25×13 cm)',
        label: 'Large (L)',
        dimensionInfo: '33 × 25 × 13 cm',
      },
    ];
  }

  if (product.category === 'Shoulder Bag') {
    return [
      {
        code: 'Small Mini (21×13×6.5 cm)',
        label: 'Small (S)',
        dimensionInfo: '21 × 13 × 6.5 cm',
      },
      {
        code: 'Medium Standar (26×16×8 cm)',
        label: 'Medium (M)',
        dimensionInfo: product.dimensions?.split('(')[0]?.trim() || '26 × 16 × 8 cm',
      },
      {
        code: 'Large Hobo (30×19×10 cm)',
        label: 'Large (L)',
        dimensionInfo: '30 × 19 × 10 cm',
      },
    ];
  }

  return [
    {
      code: 'Seri Mix S/M/L (Standar)',
      label: 'Mix S/M/L',
      dimensionInfo: 'Kombinasi Ukuran S, M & L',
    },
    {
      code: 'Khusus Size Medium (M)',
      label: 'Medium (M)',
      dimensionInfo: 'Fokus Ukuran Medium',
    },
    {
      code: 'Khusus Size Large (L)',
      label: 'Large (L)',
      dimensionInfo: 'Fokus Ukuran Large',
    },
  ];
}

export function buildDirectWhatsAppUrl(
  config: StoreConfig,
  productOrder?: {
    product: Product;
    color: string;
    size?: string;
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

  const { product, color, size, quantity, unitPrice } = productOrder;
  const total = unitPrice * quantity;
  const text = [
    greeting,
    ``,
    `*Detail Produk:*`,
    `• Nama: *${product.name}*`,
    `• Kode SKU: \`${product.sku}\``,
    `• Warna: ${color}`,
    size ? `• Ukuran: *${size}*` : '',
    `• Jumlah: ${quantity} pcs × ${formatRupiah(unitPrice)} = *${formatRupiah(total)}*`,
    ``,
    `Apakah stok untuk SKU & ukuran ini tersedia? Terima kasih!`,
  ]
    .filter(Boolean)
    .join('\n');

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

export function compressImageFileToDataUrl(
  file: File,
  maxWidth: number = 1280,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // If it's an SVG or very small WebP image (< 120KB), keep as-is
      if (
        file.type === 'image/svg+xml' ||
        (file.type === 'image/webp' && dataUrl.length < 120 * 1024)
      ) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Encode to WebP first for superior compression & fast catalog loading
          const webpCompressed = canvas.toDataURL('image/webp', quality);
          if (webpCompressed.startsWith('data:image/webp')) {
            resolve(webpCompressed);
            return;
          }
          // Fallback to JPEG if browser canvas does not support WebP encoding
          const jpegCompressed = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegCompressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function getColorSwatchHex(colorName: string): string {
  const lower = (colorName || '').trim().toLowerCase();
  if (!lower) return '#18181B';

  if (lower.includes('black') || lower.includes('hitam') || lower.includes('onyx')) {
    return '#18181B';
  }
  if (lower.includes('cream') || lower.includes('krem') || lower.includes('ivory') || lower.includes('oat') || lower.includes('broken white')) {
    return '#F5EFE6';
  }
  if (lower.includes('white') || lower.includes('putih')) {
    return '#FFFFFF';
  }
  if (lower.includes('mocca') || lower.includes('moka') || lower.includes('taupe') || lower.includes('khaki') || lower.includes('beige') || lower.includes('sand')) {
    return '#A68A71';
  }
  if (lower.includes('caramel') || lower.includes('tan') || lower.includes('camel') || lower.includes('cognac')) {
    return '#B4652F';
  }
  if (lower.includes('espresso') || lower.includes('coffee') || lower.includes('coklat') || lower.includes('brown') || lower.includes('choco')) {
    return '#4A2E2B';
  }
  if (lower.includes('navy') || lower.includes('dongker')) {
    return '#1E293B';
  }
  if (lower.includes('blue') || lower.includes('biru') || lower.includes('denim')) {
    return '#3B82F6';
  }
  if (lower.includes('olive') || lower.includes('army') || lower.includes('sage') || lower.includes('matcha') || lower.includes('green') || lower.includes('hijau')) {
    return '#4D5D4B';
  }
  if (lower.includes('charcoal') || lower.includes('dark grey')) {
    return '#3F3F46';
  }
  if (lower.includes('grey') || lower.includes('gray') || lower.includes('abu') || lower.includes('silver')) {
    return '#9CA3AF';
  }
  if (lower.includes('pink') || lower.includes('rose') || lower.includes('blush') || lower.includes('dusty')) {
    return '#E5989B';
  }
  if (lower.includes('maroon') || lower.includes('burgundy') || lower.includes('wine') || lower.includes('red') || lower.includes('merah')) {
    return '#7F1D1D';
  }
  if (lower.includes('yellow') || lower.includes('mustard') || lower.includes('gold') || lower.includes('kuning') || lower.includes('amber')) {
    return '#EAB308';
  }
  if (lower.includes('lilac') || lower.includes('purple') || lower.includes('ungu') || lower.includes('lavender')) {
    return '#C084FC';
  }
  return '#71717A';
}


