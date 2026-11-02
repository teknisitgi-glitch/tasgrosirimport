import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Pencil,
  Package,
  Layers,
  Ruler,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Scale,
  Flame,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { Product, StoreConfig, StockStatusLabel } from '../types/product';
import {
  formatRupiah,
  calculateDiscountPercent,
  buildDirectWhatsAppUrl,
  getColorSwatchHex,
  getProductSizeOptions,
} from '../utils/formatters';
import {
  createBagStudioSvg,
  createColorMatchedBagSvg,
} from '../utils/bagStudioSvg';

interface ProductDetailModalProps {
  product: Product | null;
  storeConfig: StoreConfig;
  isAdminMode: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    color: string,
    quantity: number,
    size?: string
  ) => void;
  onAddBatchToCart?: (
    product: Product,
    batchItems: Array<{ color: string; quantity: number }>,
    size?: string
  ) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  storeConfig,
  isAdminMode,
  onClose,
  onAddToCart,
  onAddBatchToCart,
  onEditProduct,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [selectedSize, setSelectedSize] = useState<string>('Medium (Standar)');
  const [colorQuantities, setColorQuantities] = useState<Record<string, number>>({
    Black: 1,
  });
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [colorPreviewUri, setColorPreviewUri] = useState<string | null>(null);
  const [showFullSpecs, setShowFullSpecs] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      const colorsList =
        Array.isArray(product.colors) && product.colors.length > 0
          ? product.colors
          : ['Black'];
      const firstCol = colorsList[0] || 'Black';
      setSelectedColor(firstCol);

      const initialMap: Record<string, number> = {};
      colorsList.forEach((col, index) => {
        initialMap[col] = index === 0 ? 1 : 0;
      });
      setColorQuantities(initialMap);

      const opts = getProductSizeOptions(product);
      setSelectedSize(opts[1]?.code || opts[0]?.code || 'Medium (Standar)');
      setActivePhotoIdx(0);
      setColorPreviewUri(null);
      setShowFullSpecs(false);
    }
  }, [product]);

  if (!product) return null;

  const productColorsList =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : ['Black'];

  const activeBatchItems = productColorsList
    .map((color) => ({
      color,
      quantity: Math.max(0, Number(colorQuantities[color]) || 0),
    }))
    .filter((entry) => entry.quantity > 0);

  const totalBatchQuantity = activeBatchItems.reduce(
    (sum, entry) => sum + entry.quantity,
    0
  );
  const quantity = Math.max(1, totalBatchQuantity);

  const discountPercent = calculateDiscountPercent(
    product.normalPrice,
    product.salePrice
  );

  const fallbackSvgUri = createBagStudioSvg({
    variant:
      product.category === 'Backpack'
        ? 'backpack-black'
        : product.category === 'Handbag'
        ? 'handbag-taupe'
        : product.category === 'Shoulder Bag'
        ? 'shoulder-caramel'
        : 'grosir-bundle',
    sku: product.sku,
  });

  // Build deduplicated Multi-Angle & Multi-Variant Gallery array for Quick View
  const colorVariantPreviews = Array.isArray(product.colors)
    ? product.colors.slice(0, 4).map((col) =>
        createColorMatchedBagSvg({
          category: product.category,
          sku: product.sku,
          colorName: col,
        })
      )
    : [];

  const rawGallery = [
    product.imageUrl,
    ...(Array.isArray(product.galleryImages) ? product.galleryImages : []),
    ...colorVariantPreviews,
  ]
    .map((u) => (u || '').trim())
    .filter(Boolean);

  const galleryList =
    rawGallery.length > 0
      ? Array.from(new Set(rawGallery)).slice(0, 6)
      : [fallbackSvgUri];

  const safePhotoIdx =
    galleryList.length > 0 ? activePhotoIdx % galleryList.length : 0;
  const activePhotoUrl =
    colorPreviewUri || galleryList[safePhotoIdx] || fallbackSvgUri;

  const resolvedStockStatus: StockStatusLabel =
    product.stockStatus ||
    (product.stock <= 0
      ? 'Habis'
      : product.stock <= 25
      ? 'Stok Terbatas'
      : 'Ready Stock');

  const isLowStock =
    resolvedStockStatus === 'Stok Terbatas' ||
    (product.stock > 0 && product.stock <= 15);
  const lowStockCount =
    product.stock > 0 && product.stock <= 15 ? product.stock : 3;

  const targetMoq = Math.max(1, product.wholesaleMinQty || 6);
  const isWholesaleQty = totalBatchQuantity >= targetMoq;
  const activeUnitPrice = isWholesaleQty
    ? product.wholesalePrice
    : product.salePrice;

  const hematNominal =
    product.salePrice > product.wholesalePrice
      ? product.salePrice - product.wholesalePrice
      : Math.max(0, product.normalPrice - product.wholesalePrice);

  const unitWeightGrams = product.weightGrams || 600;
  const totalWeightKg = ((unitWeightGrams * quantity) / 1000).toFixed(2);

  const sizeOptions = getProductSizeOptions(product);

  const batchColorSummaryLabel =
    activeBatchItems.length > 0
      ? activeBatchItems.map((i) => `${i.color} (${i.quantity})`).join(', ')
      : `${selectedColor} (1)`;

  const directWaUrl = buildDirectWhatsAppUrl(storeConfig, {
    product,
    color: batchColorSummaryLabel,
    size: selectedSize,
    quantity,
    unitPrice: activeUnitPrice,
  });

  const handleSelectColorVariant = (color: string, idx: number) => {
    setSelectedColor(color);
    const isBaseStudioSvg = (product.imageUrl || '').startsWith(
      'data:image/svg+xml'
    );
    if (idx === 0 && !isBaseStudioSvg) {
      setColorPreviewUri(null);
      setActivePhotoIdx(0);
      return;
    }
    if (
      !isBaseStudioSvg &&
      idx > 0 &&
      Array.isArray(product.galleryImages) &&
      product.galleryImages[idx - 1]
    ) {
      setColorPreviewUri(null);
      setActivePhotoIdx(idx);
      return;
    }
    setColorPreviewUri(
      createColorMatchedBagSvg({
        category: product.category,
        sku: product.sku,
        colorName: color,
      })
    );
  };

  const handleSetColorQty = (color: string, nextVal: number, idx: number) => {
    const cleanQty = Math.max(0, Math.min(999, Math.floor(Number(nextVal) || 0)));
    setColorQuantities((prev) => ({
      ...prev,
      [color]: cleanQty,
    }));
    if (cleanQty > 0) {
      handleSelectColorVariant(color, idx);
    }
  };

  const handleDistributeMoqEvenly = () => {
    const count = productColorsList.length;
    const basePerColor = Math.floor(targetMoq / count);
    let remainder = targetMoq % count;
    const nextMap: Record<string, number> = {};
    productColorsList.forEach((col) => {
      const extra = remainder > 0 ? 1 : 0;
      if (remainder > 0) remainder -= 1;
      nextMap[col] = basePerColor + extra;
    });
    setColorQuantities(nextMap);
  };

  const handleSetAllColorsQty = (qtyEach: number) => {
    const nextMap: Record<string, number> = {};
    productColorsList.forEach((col) => {
      nextMap[col] = qtyEach;
    });
    setColorQuantities(nextMap);
  };

  const handleAddBatchConfirm = () => {
    const finalBatch =
      activeBatchItems.length > 0
        ? activeBatchItems
        : [{ color: selectedColor, quantity: 1 }];

    if (onAddBatchToCart) {
      onAddBatchToCart(product, finalBatch, selectedSize);
    } else {
      finalBatch.forEach((item) => {
        onAddToCart(product, item.color, item.quantity, selectedSize);
      });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden border border-zinc-200 shadow-2xl grid grid-cols-1 md:grid-cols-12 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Compact Multi-Photo & Multi-Sudut Quick View Gallery */}
        <div className="md:col-span-6 bg-zinc-50/60 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between p-4 sm:p-5">
          {/* Quick View Header Tag on Mobile/Left */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 text-amber-400 font-mono text-[10px] font-extrabold uppercase tracking-wider">
              <Eye className="w-3 h-3" />
              <span>QUICK VIEW · PRATINJAU CEPAT</span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-zinc-500">
              {selectedColor}
            </span>
          </div>

          {/* Main Photo Viewer (1:1 Clean White Studio Frame) */}
          <div className="relative aspect-square w-full rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center overflow-hidden p-3 shadow-2xs">
            <img
              src={activePhotoUrl}
              alt={`${product.name} - ${selectedColor}`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackSvgUri;
              }}
              className="w-full h-full object-contain transition-all duration-200"
            />

            <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
              {(product.isSale || discountPercent > 0) && (
                <div className="bg-zinc-950 text-amber-400 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                  SALE {discountPercent > 0 ? `-${discountPercent}%` : ''}
                </div>
              )}
              {isLowStock && resolvedStockStatus !== 'Habis' && (
                <div className="inline-flex items-center gap-1 bg-red-600 text-white font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                  <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>Sisa {lowStockCount} pcs lagi!</span>
                </div>
              )}
            </div>

            {/* Left / Right Arrows if Multiple Photos Exist */}
            {galleryList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setColorPreviewUri(null);
                    setActivePhotoIdx(
                      (prev) =>
                        (prev - 1 + galleryList.length) % galleryList.length
                    );
                  }}
                  aria-label="Foto sebelumnya"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setColorPreviewUri(null);
                    setActivePhotoIdx(
                      (prev) => (prev + 1) % galleryList.length
                    );
                  }}
                  aria-label="Foto berikutnya"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950/70 hover:bg-zinc-950 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-zinc-950/75 text-white font-mono text-[10px] font-bold">
                  {safePhotoIdx + 1} / {galleryList.length}
                </span>
              </>
            )}
          </div>

          {/* Multi-Photo & Multi-Varian Thumbnail Selector Strip */}
          <div className="pt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span className="font-bold uppercase tracking-wider">
                Galeri Sudut & Varian ({galleryList.length} Pratinjau)
              </span>
              <span>Klik untuk perbesar</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {galleryList.map((imgUrl, idx) => {
                const isSelected = !colorPreviewUri && idx === safePhotoIdx;
                return (
                  <button
                    key={`${imgUrl.slice(0, 28)}-${idx}`}
                    type="button"
                    onClick={() => {
                      setColorPreviewUri(null);
                      setActivePhotoIdx(idx);
                    }}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 bg-white p-1 shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-zinc-950 ring-2 ring-amber-400/60'
                        : 'border-zinc-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Pratinjau ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          fallbackSvgUri;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Compact Quick View Controls (Varian, Stok, Harga Hemat, + Keranjang) */}
        <div className="md:col-span-6 p-4 sm:p-6 flex flex-col justify-between gap-4 max-h-[85vh] overflow-y-auto">
          <div className="space-y-3.5">
            {/* Header: Category, SKU, Stock Check & Close Button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                <span className="uppercase font-bold text-zinc-700">
                  {product.category}
                </span>
                <span>·</span>
                <span className="font-mono font-bold text-zinc-900">
                  {product.sku}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    resolvedStockStatus === 'Habis'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : isLowStock
                      ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isLowStock && resolvedStockStatus !== 'Habis' ? (
                    `🔥 Sisa ${lowStockCount} pcs lagi!`
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {resolvedStockStatus} ({product.stock} pcs)
                      </span>
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Quick View"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Name & Rating */}
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-zinc-950 leading-snug">
                {product.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 mt-1">
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-zinc-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.rating.toFixed(1)}
                </span>
                <span>·</span>
                <span>Terjual {product.soldCount.toLocaleString('id-ID')} pcs</span>
                <span>·</span>
                <span className="font-mono text-zinc-700">
                  Berat: {unitWeightGrams}g/pcs
                </span>
              </div>
            </div>

            {/* Compact Price & Dynamic Savings Box */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-950 tabular-nums">
                  {formatRupiah(activeUnitPrice)}
                </span>
                {product.normalPrice > activeUnitPrice && (
                  <span className="font-mono text-xs text-zinc-400 line-through tabular-nums">
                    {formatRupiah(product.normalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 font-mono text-[10px] font-extrabold">
                    DISKON {discountPercent}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <p className="text-xs text-zinc-600">
                  {isWholesaleQty ? (
                    <span className="font-bold text-emerald-700">
                      ✓ Harga Grosir Aktif (≥{product.wholesaleMinQty} pcs)
                    </span>
                  ) : (
                    <span>
                      Grosir ≥<strong>{product.wholesaleMinQty} pcs</strong>:{' '}
                      <strong className="font-mono text-zinc-950">
                        {formatRupiah(product.wholesalePrice)}/pcs
                      </strong>
                    </span>
                  )}
                </p>

                {hematNominal > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-md tabular-nums">
                    (Hemat {formatRupiah(hematNominal)} dari harga ecer)
                  </span>
                )}
              </div>
            </div>

            {/* Fitur "Quick Add Batch" untuk Varian Multi-Warna */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-zinc-950">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Add Batch · Input Multi-Warna</span>
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Isi jumlah pcs berbeda untuk tiap warna sekaligus dalam 1 klik
                  </p>
                </div>

                {/* Quick Batch Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={handleDistributeMoqEvenly}
                    className="px-2 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-[10px] font-extrabold transition-colors cursor-pointer"
                    title={`Bagi rata ${targetMoq} pcs ke semua warna`}
                  >
                    Bagi Rata {targetMoq} Pcs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllColorsQty(2)}
                    className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
                    title="Set 2 pcs untuk setiap warna"
                  >
                    Seri @2 Pcs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllColorsQty(0)}
                    className="px-2 py-1 rounded-md bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-300 font-mono text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Per-Color Quantity Input List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {productColorsList.map((color, idx) => {
                  const colorQty = colorQuantities[color] || 0;
                  const isFocused = color === selectedColor;
                  const hex = getColorSwatchHex(color);

                  return (
                    <div
                      key={color}
                      onClick={() => handleSelectColorVariant(color, idx)}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        colorQty > 0
                          ? 'bg-white border-zinc-950 ring-1 ring-amber-400/60 shadow-2xs'
                          : isFocused
                          ? 'bg-white border-zinc-400'
                          : 'bg-white/75 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: hex }}
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-zinc-900 truncate">
                            {color}
                          </span>
                          <span className="block font-mono text-[10px] text-zinc-500">
                            {colorQty > 0 ? `${colorQty} pcs dipilih` : '0 pcs'}
                          </span>
                        </div>
                      </div>

                      {/* Direct Quantity Input & Stepper per Color */}
                      <div
                        className="inline-flex items-center rounded-lg border border-zinc-300 bg-zinc-50 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label={`Kurangi ${color}`}
                          onClick={() =>
                            handleSetColorQty(color, colorQty - 1, idx)
                          }
                          className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-200 font-bold text-xs cursor-pointer rounded-l-lg"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          aria-label={`Jumlah warna ${color}`}
                          value={colorQty}
                          onChange={(e) =>
                            handleSetColorQty(
                              color,
                              Number(e.target.value),
                              idx
                            )
                          }
                          className="w-10 h-7 text-center font-mono text-xs font-extrabold text-zinc-950 bg-white border-x border-zinc-300 focus:outline-none tabular-nums"
                        />
                        <button
                          type="button"
                          aria-label={`Tambah ${color}`}
                          onClick={() =>
                            handleSetColorQty(color, colorQty + 1, idx)
                          }
                          className="w-7 h-7 flex items-center justify-center text-zinc-700 hover:bg-zinc-200 font-bold text-xs cursor-pointer rounded-r-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Batch MOQ Progress Feedback */}
              <div
                className={`px-3 py-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
                  isWholesaleQty
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-semibold">
                  {isWholesaleQty ? (
                    <strong>
                      Harga Grosir Aktif! 🚀 ({formatRupiah(product.wholesalePrice)}/pcs)
                    </strong>
                  ) : (
                    <>
                      💡 Kurang{' '}
                      <strong className="font-mono font-extrabold">
                        {Math.max(1, targetMoq - totalBatchQuantity)} pcs
                      </strong>{' '}
                      lagi untuk mengaktifkan Harga Grosir Pabrik!
                    </>
                  )}
                </span>
                <span className="font-mono font-extrabold shrink-0">
                  Total: {totalBatchQuantity} pcs
                </span>
              </div>
            </div>

            {/* Pilihan Variasi Ukuran (Size Grid) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Pilih Variasi Ukuran (Size Grid):{' '}
                  <span className="text-zinc-950">{selectedSize}</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <Ruler className="w-3 h-3 text-amber-500" />
                  <span>Dimensi Gudang</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {sizeOptions.map((sizeOpt) => {
                  const isSelected = selectedSize === sizeOpt.code;
                  return (
                    <button
                      key={sizeOpt.code}
                      type="button"
                      onClick={() => setSelectedSize(sizeOpt.code)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-amber-400/50 shadow-2xs'
                          : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-extrabold ${
                            isSelected ? 'text-amber-400' : 'text-zinc-950'
                          }`}
                        >
                          {sizeOpt.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <span
                        className={`block font-mono text-[10px] mt-0.5 truncate ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-500'
                        }`}
                      >
                        {sizeOpt.dimensionInfo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expandable Full Wholesale & Cargo Specifications Accordion (Keeps Quick View Compact!) */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFullSpecs((prev) => !prev)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
              >
                <span>
                  Spesifikasi Bahan, Ukuran & Estimasi Kargo ({totalWeightKg} kg)
                </span>
                {showFullSpecs ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {showFullSpecs && (
                <div className="p-3.5 bg-white space-y-2.5 border-t border-zinc-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-start gap-2">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Bahan (Material)
                        </span>
                        <span className="font-semibold text-zinc-800 block leading-snug">
                          {product.material || 'Material Import Grade A'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-start gap-2">
                      <Ruler className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Ukuran (PxLxT cm)
                        </span>
                        <span className="font-semibold text-zinc-800 block leading-snug">
                          {product.dimensions || 'Ukuran Standar'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-start gap-2">
                      <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Berat Satuan
                        </span>
                        <span className="font-mono font-bold text-zinc-800 block">
                          {unitWeightGrams} gram / pcs
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-start gap-2">
                      <Scale className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase text-zinc-400">
                          Total Kargo ({quantity} pcs)
                        </span>
                        <span className="font-mono font-bold text-emerald-700 block">
                          {totalWeightKg} kg ({unitWeightGrams * quantity} gr)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Actions: 1-Click Quick Add Batch to Cart & Direct WhatsApp Order */}
          <div className="pt-3 border-t border-zinc-200 space-y-2">
            {/* Summary Pill of Selected Batch Variants */}
            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-200/80">
              <span className="truncate">
                Batch Warna:{' '}
                <strong className="text-zinc-900">
                  {batchColorSummaryLabel}
                </strong>{' '}
                · <strong className="text-zinc-900">{selectedSize}</strong>
              </span>
              <span className="font-mono font-extrabold text-zinc-950 shrink-0">
                {quantity} pcs ({activeBatchItems.length || 1} warna)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={resolvedStockStatus === 'Habis'}
                onClick={handleAddBatchConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-200 disabled:text-zinc-500 text-zinc-950 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                <span>
                  + Keranjang Sekaligus ({quantity} pcs) ·{' '}
                  {formatRupiah(activeUnitPrice * quantity)}
                </span>
              </button>

              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pesan via WA</span>
              </a>
            </div>

            {isAdminMode && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
                className="w-full py-2 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Produk & Galeri Foto di Panel Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
