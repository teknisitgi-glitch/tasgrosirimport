import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Truck,
  TicketPercent,
  AlertCircle,
  Scale,
  MapPin,
  Calculator,
  Package,
} from 'lucide-react';
import { CartItem, OrderRecord, StoreConfig } from '../types/product';
import {
  formatRupiah,
  getEffectiveUnitPrice,
  buildWhatsAppOrderText,
  buildDirectWhatsAppUrl,
  calculateCargoEstimates,
  CargoCourierEstimate,
  getColorSwatchHex,
  formatBuyerWhatsAppNumber,
} from '../utils/formatters';
import {
  createBagStudioSvg,
  createColorMatchedBagSvg,
} from '../utils/bagStudioSvg';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  storeConfig: StoreConfig;
  appliedVoucher?: string;
  onApplyVoucher?: (code: string) => void;
  onUpdateQuantity: (
    productId: string,
    color: string,
    delta: number,
    size?: string
  ) => void;
  onRemoveItem: (productId: string, color: string, size?: string) => void;
  onClearCart: () => void;
  onRecordOrder?: (order: OrderRecord) => void;
  onShowToast?: (msg: string) => void;
}

const QUICK_VOUCHERS = [
  { code: 'TGIRESELLER20', label: 'Potongan 20K' },
  { code: 'GROSIRMIX6', label: 'Grosir 50K (≥6 pcs)' },
  { code: 'FREEKARGO', label: 'Subsidi Kargo 35K' },
];

const QUICK_CARGO_CITIES = [
  'Jakarta',
  'Bandung',
  'Semarang',
  'Surabaya',
  'Medan',
  'Makassar',
];

const QUICK_CARGO_NOTES = [
  'Packing Karung Double Plastik Aman',
  'Titip Ekspedisi Langganan Tanah Abang / Kapuk',
  'Dropship Reseller (Tanpa Label TGI)',
  'Kirim Cepat via JNE JTR / Indah Cargo',
];

type BagWeightPreset = 'auto-sku' | '300' | '400' | '500' | 'custom';

const GLOBAL_MOQ_PCS = 6;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  storeConfig,
  appliedVoucher = '',
  onApplyVoucher,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onRecordOrder,
  onShowToast,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('Jakarta');
  const [deliveryMethod, setDeliveryMethod] = useState<'ekspedisi' | 'pickup'>(
    'ekspedisi'
  );
  const [selectedCourierId, setSelectedCourierId] =
    useState<CargoCourierEstimate['id']>('jne-jtr');
  const [cargoCourierNote, setCargoCourierNote] = useState(
    'Packing Karung Double Plastik Aman'
  );
  const [weightPreset, setWeightPreset] = useState<BagWeightPreset>('auto-sku');
  const [customAvgWeightGrams, setCustomAvgWeightGrams] = useState<number>(400);
  const [isCalcHighlighted, setIsCalcHighlighted] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [voucherInput, setVoucherInput] = useState(appliedVoucher);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (appliedVoucher) {
      setVoucherInput(appliedVoucher);
    }
  }, [appliedVoucher]);

  if (!isOpen) return null;

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const skuTotalWeightGrams = items.reduce(
    (acc, item) => acc + (item.product.weightGrams || 500) * item.quantity,
    0
  );
  const skuAvgWeightGrams =
    totalQuantity > 0 ? Math.round(skuTotalWeightGrams / totalQuantity) : 450;

  const effectiveAvgWeightPerBag =
    weightPreset === 'auto-sku'
      ? skuAvgWeightGrams
      : weightPreset === '300'
      ? 300
      : weightPreset === '400'
      ? 400
      : weightPreset === '500'
      ? 500
      : Math.max(100, Number(customAvgWeightGrams) || 400);

  const totalWeightGramsRaw =
    weightPreset === 'auto-sku'
      ? skuTotalWeightGrams
      : totalQuantity * effectiveAvgWeightPerBag;

  const cargoEstimates = calculateCargoEstimates(
    customerCity,
    totalWeightGramsRaw,
    totalQuantity
  );

  const selectedCourier =
    cargoEstimates.couriers.find((c) => c.id === selectedCourierId) ||
    cargoEstimates.couriers[0];

  const phoneValidation = formatBuyerWhatsAppNumber(customerPhone);

  const orderData = buildWhatsAppOrderText({
    items,
    customerName,
    customerPhone,
    customerCity,
    deliveryMethod,
    cargoCourierNote,
    notes,
    voucherCode: voucherInput,
    selectedCargoName:
      deliveryMethod === 'ekspedisi' && selectedCourier
        ? `${selectedCourier.name} (${selectedCourier.etaDays})`
        : '',
    selectedCargoCost:
      deliveryMethod === 'ekspedisi' && selectedCourier
        ? selectedCourier.estimatedCost
        : 0,
    overrideTotalWeightGrams: totalWeightGramsRaw,
    estimatedSackCount: cargoEstimates.estimatedSackCount,
    config: storeConfig,
  });

  const handleCalculateCargoNow = () => {
    setDeliveryMethod('ekspedisi');
    setIsCalcHighlighted(true);
    window.setTimeout(() => setIsCalcHighlighted(false), 1200);
    onShowToast?.(
      `Estimasi Ongkir ${selectedCourier.shortCode} ke ${
        customerCity || 'Tujuan'
      }: ~${formatRupiah(selectedCourier.estimatedCost)} (~${
        cargoEstimates.estimatedSackCount
      } Karung · ${selectedCourier.chargeableKg} kg)`
    );
  };

  const remainingForFreeShipping = Math.max(
    0,
    storeConfig.freeShippingThreshold - orderData.totalPayable
  );

  const directSalesWaUrl = buildDirectWhatsAppUrl(storeConfig);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderData.message);
      setCopiedText(true);
      onShowToast?.(
        'Format rincian pesanan WhatsApp berhasil disalin ke clipboard!'
      );
      window.setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSelectQuickVoucher = (code: string) => {
    const nextCode = voucherInput === code ? '' : code;
    setVoucherInput(nextCode);
    onApplyVoucher?.(nextCode);
    if (nextCode) {
      navigator.clipboard?.writeText(nextCode).catch(() => {});
      onShowToast?.(
        `Kupon ${nextCode} berhasil disalin & diterapkan pada Keranjang!`
      );
    }
  };

  const isOrderFormValid =
    Boolean(customerName.trim()) &&
    phoneValidation.isValid &&
    Boolean(customerCity.trim());

  const handleCheckoutWhatsApp = (bypassValidation = false) => {
    if (!bypassValidation) {
      if (!customerName.trim()) {
        setValidationError(
          'Mohon isi Nama Pemesan / Toko terlebih dahulu agar Admin TGI dapat langsung memproses nota pesanan Anda.'
        );
        return;
      }
      if (!phoneValidation.isValid) {
        setValidationError(
          `Nomor WhatsApp belum valid (${phoneValidation.validationMessage}). Contoh format benar: 081234567890 atau 6281234567890.`
        );
        return;
      }
      if (!customerCity.trim()) {
        setValidationError(
          'Mohon isi Kota / Kabupaten Tujuan pengiriman untuk kalkulasi ongkir kargo.'
        );
        return;
      }
    }

    setValidationError(null);
    setShowOrderPreview(true);

    // Auto-normalize phone display in field
    if (phoneValidation.displayFormatted) {
      setCustomerPhone(phoneValidation.displayFormatted);
    }

    const courierPrefix =
      selectedCourier.id === 'indah-cargo'
        ? 'LP'
        : selectedCourier.id === 'dakota-cargo'
        ? 'DKT-'
        : selectedCourier.id === 'ekspedisi-lokal'
        ? 'KPK-'
        : selectedCourier.id === 'sicepat-gokil'
        ? 'GKL-'
        : 'JTR-';
    const generatedResi =
      deliveryMethod === 'pickup'
        ? 'PICKUP-GUDANG-TGI'
        : `${courierPrefix}${Date.now().toString().slice(-9)}`;

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      referenceCode: orderData.orderReference,
      customerName: customerName.trim() || 'Pelanggan Website TGI',
      customerPhone:
        phoneValidation.displayFormatted || customerPhone.trim() || '-',
      customerCity: customerCity.trim() || '-',
      deliveryMethod,
      cargoCourier:
        deliveryMethod === 'pickup'
          ? 'Pickup Langsung Gudang TGI'
          : `${selectedCourier.name}${
              cargoCourierNote.trim() ? ` (${cargoCourierNote.trim()})` : ''
            }`,
      trackingNumber: generatedResi,
      orderStatus: 'Diproses Gudang',
      totalWeightKg: orderData.totalWeightKg,
      voucherCode: voucherInput.trim().toUpperCase() || undefined,
      discountAmount: orderData.voucherDiscount,
      totalQuantity: orderData.totalQuantity,
      totalPayable: orderData.totalPayable,
      itemsSummary: items
        .map(
          (i) =>
            `${i.product.sku} (${i.selectedColor} · ${
              i.selectedSize || 'Medium'
            }) x${i.quantity}`
        )
        .join(', '),
      createdAt: new Date().toISOString(),
    };

    onRecordOrder?.(newOrder);
    onShowToast?.(
      `Pesanan #${orderData.orderReference} tercatat & stok disinkronkan! Membuka WhatsApp Admin...`
    );
  };

  const getCartItemThumbnail = (item: CartItem): string => {
    const baseImg = item.product.imageUrl || '';
    const isStudioSvg = baseImg.startsWith('data:image/svg+xml');
    const firstColor = item.product.colors?.[0] || 'Black';

    if (isStudioSvg || item.selectedColor !== firstColor) {
      return createColorMatchedBagSvg({
        category: item.product.category,
        sku: item.product.sku,
        colorName: item.selectedColor,
      });
    }
    return (
      baseImg ||
      createBagStudioSvg({
        variant: 'backpack-black',
        sku: item.product.sku,
      })
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/65 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <aside
        aria-label="Keranjang Belanja"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col justify-between overflow-hidden"
      >
        {/* Top Drawer Header */}
        <div className="px-5 sm:px-6 py-4 bg-zinc-950 text-white flex items-center justify-between gap-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide">
              KERANJANG BELANJA
            </h2>
            <span className="font-mono text-xs text-amber-400 font-bold tabular-nums">
              ({orderData.totalQuantity} pcs)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang belanja"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wholesale / Partai Besar Inquiry Banner */}
        <div className="px-5 sm:px-6 py-3 bg-zinc-100 border-b border-zinc-200 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-zinc-700 leading-relaxed italic">
              *Untuk pemesanan partai besar / grosir, silakan langsung chat Admin Sales kami via WhatsApp
            </p>
            <a
              href={directSalesWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Admin Sales</span>
            </a>
          </div>

          {items.length > 0 && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/80">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Truck className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                {remainingForFreeShipping === 0 ? (
                  <span className="font-semibold text-emerald-700">
                    ✓ Memenuhi syarat Subsidi Ongkir Kargo!
                  </span>
                ) : (
                  <span>
                    Tambah{' '}
                    <strong className="font-mono text-zinc-900">
                      {formatRupiah(remainingForFreeShipping)}
                    </strong>{' '}
                    untuk Subsidi Kargo
                  </span>
                )}
              </span>
              <span className="font-mono text-[10px] font-bold text-zinc-500 shrink-0">
                Total: {orderData.totalQuantity} pcs
              </span>
            </div>
          )}
        </div>

        {/* Middle Scrollable Area: Items, Cargo Calculator, Voucher & Customer Form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-display text-xl font-bold text-zinc-900">
                  KERANJANG MASIH KOSONG
                </p>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                  Pilih produk tas import pilihan Anda di katalog untuk mulai memesan eceran maupun grosir.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Mulai Belanja Sekarang
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Daftar Item ({items.length} Varian · ~{orderData.totalWeightKg} kg)
                  </span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                {items.map((item) => {
                  const { unitPrice } = getEffectiveUnitPrice(
                    item,
                    orderData.totalQuantity
                  );
                  const thumbUri = getCartItemThumbnail(item);
                  const fallbackImg = createBagStudioSvg({
                    variant: 'backpack-black',
                    sku: item.product.sku,
                  });
                  const itemWeightGrams =
                    (item.product.weightGrams || 500) * item.quantity;

                  const itemSize = item.selectedSize || 'Medium (Standar)';

                  return (
                    <div
                      key={`${item.product.id}-${item.selectedColor}-${itemSize}`}
                      className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex gap-3 items-start"
                    >
                      <img
                        src={thumbUri}
                        alt={`${item.product.name} - ${item.selectedColor}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImg;
                        }}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg object-contain bg-white border border-zinc-200 p-1 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 flex-wrap font-mono text-[11px] font-bold text-zinc-700">
                            <span>{item.product.sku}</span>
                            <span>·</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-zinc-300 inline-block"
                              style={{
                                backgroundColor: getColorSwatchHex(
                                  item.selectedColor
                                ),
                              }}
                            />
                            <span className="text-zinc-900">
                              {item.selectedColor}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-zinc-200/80 text-zinc-800 text-[10px] font-semibold">
                              {itemSize}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize
                              )
                            }
                            aria-label={`Hapus ${item.product.name}`}
                            className="text-zinc-400 hover:text-red-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
                          {item.product.name}
                        </h4>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="font-mono text-sm font-bold text-zinc-950 tabular-nums">
                              {formatRupiah(unitPrice * item.quantity)}
                            </span>
                            <span className="block text-[11px] text-zinc-500 font-mono tabular-nums">
                              {formatRupiah(unitPrice)} / pcs ·{' '}
                              <span className="text-zinc-500">
                                {(itemWeightGrams / 1000).toFixed(2)} kg
                              </span>
                            </span>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.selectedColor,
                                  -1,
                                  item.selectedSize
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-mono text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.selectedColor,
                                  1,
                                  item.selectedSize
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 text-xs font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Kalkulator Estimasi Berat & Ongkir Kargo Partai Besar */}
              <div className="p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800 space-y-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0">
                      <Calculator className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                        Kalkulator Estimasi Berat & Ongkir Kargo
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Hitung otomatis berat karungan & tarif ekspedisi partai besar
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 font-mono text-[11px] font-bold text-amber-300 tabular-nums">
                      <Scale className="w-3 h-3" />
                      <span>{orderData.totalWeightKg} kg</span>
                    </span>
                    <span className="block text-[10px] font-mono text-zinc-400 mt-0.5">
                      ~{cargoEstimates.estimatedSackCount} Karung ({orderData.totalQuantity} pcs)
                    </span>
                  </div>
                </div>

                {/* 1. Input Otomatis Estimasi Berat Berdasarkan Kuantitas & Rata-rata Berat Tas */}
                <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="bag-weight-preset"
                      className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5"
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. Estimasi Berat Rata-Rata per Tas (SKU):</span>
                    </label>
                    <span className="font-mono text-[10px] text-amber-400 font-bold">
                      {orderData.totalQuantity} pcs × {effectiveAvgWeightPerBag} gr
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className={weightPreset === 'custom' ? 'sm:col-span-7' : 'sm:col-span-12'}>
                      <select
                        id="bag-weight-preset"
                        value={weightPreset}
                        onChange={(e) =>
                          setWeightPreset(e.target.value as BagWeightPreset)
                        }
                        className="w-full px-2.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-semibold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        <option value="auto-sku">
                          Otomatis Sesuai Spesifikasi SKU (~{skuAvgWeightGrams} gram / tas)
                        </option>
                        <option value="300">
                          300 gram / tas (Sling Bag & Shoulder Bag Ringan)
                        </option>
                        <option value="400">
                          400 gram / tas (Handbag & Tote Standar)
                        </option>
                        <option value="500">
                          500 gram / tas (Backpack & Tas Kulit Tebal)
                        </option>
                        <option value="custom">
                          Input Manual Berat Rata-Rata (gram / tas)
                        </option>
                      </select>
                    </div>

                    {weightPreset === 'custom' && (
                      <div className="sm:col-span-5 flex items-center gap-1.5">
                        <input
                          type="number"
                          min={100}
                          max={3000}
                          step={50}
                          value={customAvgWeightGrams}
                          onChange={(e) =>
                            setCustomAvgWeightGrams(Number(e.target.value))
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-zinc-950 border border-amber-400/60 font-mono text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                          placeholder="400"
                        />
                        <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                          gr/tas
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ringkasan Otomatis Kuantitas x Berat */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/90">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                        Total Kuantitas
                      </span>
                      <span className="font-mono text-xs font-extrabold text-white tabular-nums">
                        {orderData.totalQuantity} Pcs
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/90">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                        Est. Berat Aktual
                      </span>
                      <span className="font-mono text-xs font-extrabold text-amber-400 tabular-nums">
                        {orderData.totalWeightKg} Kg
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800/90">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                        Est. Kemasan
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-400 tabular-nums">
                        ~{cargoEstimates.estimatedSackCount} Karung
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Pilihan Dropdown Ekspedisi Kargo Partai Besar & Kota Tujuan */}
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="cargo-courier-dropdown"
                      className="block text-[11px] font-bold text-zinc-200"
                    >
                      2. Pilih Ekspedisi Kargo Partai Besar:
                    </label>
                    <select
                      id="cargo-courier-dropdown"
                      value={selectedCourier.id}
                      onChange={(e) => {
                        setDeliveryMethod('ekspedisi');
                        setSelectedCourierId(
                          e.target.value as CargoCourierEstimate['id']
                        );
                      }}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-bold text-amber-300 focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {cargoEstimates.couriers.map((c) => (
                        <option key={c.id} value={c.id} className="bg-zinc-950 text-white">
                          {c.name} — {formatRupiah(c.ratePerKg)}/kg (Est.{' '}
                          {formatRupiah(c.estimatedCost)} · {c.etaDays})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Kota / Kecamatan Tujuan Pengiriman + Quick City Chips */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-zinc-200">
                      3. Kota / Kecamatan Tujuan Pengiriman Karung:
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        placeholder="Ketik kota tujuan (misal: Surabaya, Bandung, Medan, Makassar)..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-0.5">
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        Kota Populer:
                      </span>
                      {QUICK_CARGO_CITIES.map((city) => {
                        const isCityActive =
                          customerCity.trim().toLowerCase() ===
                          city.toLowerCase();
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => setCustomerCity(city)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                              isCityActive
                                ? 'bg-amber-400 text-zinc-950 font-bold'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                            }`}
                          >
                            {city}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Tombol Hitung Otomatis & Hasil Estimasi Total Ongkir Karung */}
                <button
                  type="button"
                  onClick={handleCalculateCargoNow}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Calculator className="w-4 h-4 stroke-[2.3]" />
                  <span>Hitung Estimasi Ongkir Karung Otomatis</span>
                </button>

                {/* Panel Hasil Estimasi Ongkir Karung */}
                <div
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    isCalcHighlighted
                      ? 'bg-amber-400/20 border-amber-300 ring-2 ring-amber-400/40'
                      : 'bg-zinc-900/95 border-amber-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
                      <Package className="w-3.5 h-3.5" />
                      <span>Hasil Estimasi Ongkir Karung</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">
                      {cargoEstimates.zoneName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block">Ekspedisi Kargo:</span>
                      <strong className="text-white">{selectedCourier.name}</strong>
                      <span className="block text-[10px] font-mono text-zinc-400">
                        Estimasi tiba {selectedCourier.etaDays}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400 block">
                        Tagihan Kargo ({selectedCourier.chargeableKg} kg):
                      </span>
                      <strong className="font-mono text-sm sm:text-base font-extrabold text-amber-400 tabular-nums">
                        ~{formatRupiah(selectedCourier.estimatedCost)}
                      </strong>
                      <span className="block text-[10px] font-mono text-emerald-400">
                        ~{formatRupiah(selectedCourier.costPerSack)} / karung ({selectedCourier.estimatedSackCount} koli)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perbandingan Cepat Semua Tarif Kargo */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-800/90">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Perbandingan Tarif Ekspedisi Lainnya:</span>
                    <span className="font-mono">
                      Min. Kargo {selectedCourier.minChargeKg} kg
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {cargoEstimates.couriers.map((courier) => {
                      const isSelected =
                        deliveryMethod === 'ekspedisi' &&
                        selectedCourier.id === courier.id;
                      return (
                        <button
                          key={courier.id}
                          type="button"
                          onClick={() => {
                            setDeliveryMethod('ekspedisi');
                            setSelectedCourierId(courier.id);
                          }}
                          className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 text-white'
                              : 'bg-zinc-900/90 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-400 text-zinc-950'
                                    : 'border-zinc-600'
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                )}
                              </span>
                              <span className="text-xs font-bold text-white">
                                {courier.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-amber-300 font-mono text-[9px] font-bold">
                                {courier.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5 pl-5">
                              Estimasi tiba {courier.etaDays} ·{' '}
                              {formatRupiah(courier.ratePerKg)}/kg (min.{' '}
                              {courier.minChargeKg} kg)
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-400 tabular-nums block">
                              ~{formatRupiah(courier.estimatedCost)}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ({courier.chargeableKg} kg)
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Coupon / Voucher Promo Selector */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <TicketPercent className="w-4 h-4 text-amber-600" />
                    <span>Kupon Promo Grosir TGI</span>
                  </span>
                  {orderData.voucherDiscount > 0 && (
                    <span className="font-mono text-[11px] font-bold text-emerald-700">
                      Hemat {formatRupiah(orderData.voucherDiscount)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {QUICK_VOUCHERS.map((v) => {
                    const isSelected =
                      voucherInput.trim().toUpperCase() === v.code;
                    return (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => handleSelectQuickVoucher(v.code)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-950 text-amber-400 border-zinc-950 shadow-2xs'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                        }`}
                      >
                        {isSelected ? `✓ ${v.code}` : `${v.code} (${v.label})`}
                      </button>
                    );
                  })}
                </div>

                {voucherInput && (
                  <p
                    className={`text-[11px] font-medium ${
                      orderData.voucherDiscount > 0
                        ? 'text-emerald-700'
                        : 'text-amber-800'
                    }`}
                  >
                    {orderData.voucherLabel}
                  </p>
                )}
              </div>

              {/* Customer Details for WhatsApp Checkout (Order Form + Auto-Format WA) */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Formulir Data Pemesan & Kargo WhatsApp
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      Otomatis merangkum format order profesional ke Admin Sales TGI
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                    Auto-Format WA
                  </span>
                </div>

                {validationError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">
                        {validationError}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <a
                        href={orderData.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleCheckoutWhatsApp(true)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Tetap Lanjut Checkout ke WhatsApp →
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                      Nama Pemesan / Toko *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Contoh: Budi / Toko Berkah Tas"
                      className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none ${
                        validationError && !customerName.trim()
                          ? 'border-amber-500 ring-2 ring-amber-400/30'
                          : 'border-zinc-300 focus:border-zinc-900'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-zinc-700">
                        No. WhatsApp Pembeli *
                      </label>
                      {customerPhone.trim() && (
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            phoneValidation.isValid
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {phoneValidation.isValid ? '✓ Valid' : 'Cek Format'}
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      onBlur={() => {
                        if (phoneValidation.displayFormatted) {
                          setCustomerPhone(phoneValidation.displayFormatted);
                        }
                      }}
                      placeholder="Contoh: 081234567890"
                      className={`w-full px-3 py-2 text-xs font-mono rounded-lg border bg-white focus:outline-none ${
                        customerPhone.trim() && phoneValidation.isValid
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : validationError && !phoneValidation.isValid
                          ? 'border-amber-500 ring-2 ring-amber-400/30'
                          : 'border-zinc-300 focus:border-zinc-900'
                      }`}
                    />
                    {customerPhone.trim() && (
                      <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                        <span
                          className={
                            phoneValidation.isValid
                              ? 'text-emerald-700 font-medium'
                              : 'text-amber-700'
                          }
                        >
                          {phoneValidation.isValid
                            ? `Format WA: ${phoneValidation.displayFormatted}`
                            : phoneValidation.validationMessage}
                        </span>
                        {phoneValidation.displayFormatted &&
                          customerPhone !== phoneValidation.displayFormatted && (
                            <button
                              type="button"
                              onClick={() =>
                                setCustomerPhone(phoneValidation.displayFormatted)
                              }
                              className="font-mono font-bold text-zinc-900 underline cursor-pointer shrink-0"
                            >
                              Rapikan
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Kota / Kabupaten Tujuan *
                  </label>
                  <input
                    type="text"
                    value={customerCity}
                    onChange={(e) => {
                      setCustomerCity(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Contoh: Tanah Abang, Jakarta Pusat / Surabaya"
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none ${
                      validationError && !customerCity.trim()
                        ? 'border-amber-500 ring-2 ring-amber-400/30'
                        : 'border-zinc-300 focus:border-zinc-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Metode Pengiriman
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('ekspedisi')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        deliveryMethod === 'ekspedisi'
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                      }`}
                    >
                      Kargo ({selectedCourier.shortCode})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        deliveryMethod === 'pickup'
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                      }`}
                    >
                      Pickup Gudang TGI
                    </button>
                  </div>
                </div>

                {/* Catatan Ekspedisi Kargo Pilihan */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Catatan Ekspedisi Kargo Pilihan
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {QUICK_CARGO_NOTES.map((preset) => {
                      const active = cargoCourierNote === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCargoCourierNote(preset)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                            active
                              ? 'bg-zinc-900 text-amber-300 border-zinc-900'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={cargoCourierNote}
                    onChange={(e) => setCargoCourierNote(e.target.value)}
                    placeholder="Contoh: Kirim via Indah Cargo / Ekspedisi langganan Tanah Abang"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                    Catatan Tambahan Pesanan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Mohon dicek resleting & jahitan sebelum dikirim"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* WhatsApp Message Preview Box */}
              {showOrderPreview && (
                <div className="p-4 rounded-xl bg-zinc-950 text-zinc-100 space-y-3 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      FORMAT PESAN WHATSAPP SIAP KIRIM
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white cursor-pointer"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap bg-zinc-900 p-3 rounded-lg max-h-44 overflow-y-auto border border-zinc-800">
                    {orderData.message}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Checkout Summary & WhatsApp CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t border-zinc-200 space-y-3">
            {/* Note for Partai Besar / Grosir */}
            <div className="px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-amber-950 italic">
                *Untuk pemesanan partai besar / grosir, silakan langsung chat Admin Sales kami via WhatsApp
              </span>
              <a
                href={directSalesWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline shrink-0"
              >
                Chat Admin →
              </a>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Subtotal Produk ({orderData.totalQuantity} pcs · ~
                    {orderData.totalWeightKg} kg)
                  </span>
                </span>
                <span className="font-mono font-semibold text-zinc-900 tabular-nums">
                  {formatRupiah(orderData.subtotalItems)}
                </span>
              </div>
              {deliveryMethod === 'ekspedisi' && selectedCourier && (
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>
                    Est. Ongkir {selectedCourier.shortCode} ({customerCity || 'Tujuan'})
                  </span>
                  <span className="font-mono font-semibold text-zinc-900 tabular-nums">
                    ~{formatRupiah(selectedCourier.estimatedCost)}
                  </span>
                </div>
              )}
              {orderData.voucherDiscount > 0 && (
                <div className="flex justify-between text-xs text-amber-700 font-semibold">
                  <span>Potongan Kupon ({voucherInput.toUpperCase()})</span>
                  <span className="font-mono tabular-nums">
                    -{formatRupiah(orderData.voucherDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100">
                <span className="font-bold text-zinc-900">
                  Total Estimasi Bayar Produk
                </span>
                <span className="font-mono text-lg sm:text-xl font-bold text-zinc-950 tabular-nums">
                  {formatRupiah(orderData.totalPayable)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isOrderFormValid ? (
                <a
                  href={orderData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCheckoutWhatsApp(true)}
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Checkout Pesanan via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCheckoutWhatsApp(false)}
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Checkout Pesanan via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowOrderPreview((prev) => !prev)}
                className="w-full py-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
              >
                {showOrderPreview
                  ? 'Sembunyikan Rincian Format WhatsApp'
                  : 'Lihat / Salin Format Rincian Pesanan WhatsApp'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

