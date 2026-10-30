import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Pencil,
  Package,
  Layers,
  Ruler,
  MessageCircle,
} from 'lucide-react';
import { Product, StoreConfig } from '../types/product';
import {
  formatRupiah,
  calculateDiscountPercent,
  buildDirectWhatsAppUrl,
} from '../utils/formatters';
import { createBagStudioSvg } from '../utils/bagStudioSvg';

interface ProductDetailModalProps {
  product: Product | null;
  storeConfig: StoreConfig;
  isAdminMode: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, quantity: number) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  storeConfig,
  isAdminMode,
  onClose,
  onAddToCart,
  onEditProduct,
}) => {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0] || 'Default'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState(false);

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

  const displayImage =
    !imgError && product.imageUrl ? product.imageUrl : fallbackSvgUri;

  const isWholesaleQty = quantity >= product.wholesaleMinQty;
  const activeUnitPrice = isWholesaleQty
    ? product.wholesalePrice
    : product.salePrice;

  const directWaUrl = buildDirectWhatsAppUrl(storeConfig, {
    product,
    color: selectedColor,
    quantity,
    unitPrice: activeUnitPrice,
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden border border-zinc-200 shadow-2xl grid grid-cols-1 md:grid-cols-12 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Column: Product Studio Photo */}
        <div className="md:col-span-6 bg-zinc-100 relative flex items-center justify-center min-h-[280px] md:min-h-[440px]">
          <img
            src={displayImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
          {(product.isSale || discountPercent > 0) && (
            <div className="absolute top-4 left-4 bg-zinc-950 text-amber-400 font-mono text-xs font-bold px-3 py-1.5 rounded-md">
              SALE {discountPercent > 0 ? `-${discountPercent}%` : ''}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* Header & Close Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="uppercase font-semibold text-zinc-700">
                  {product.category}
                </span>
                <span>·</span>
                <span className="font-mono font-semibold text-zinc-900">
                  SKU: {product.sku}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup detail produk"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Name */}
            <h2 className="font-display text-2xl font-bold text-zinc-950 leading-snug">
              {product.name}
            </h2>

            {/* Rating & Stock Metadata */}
            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-1 font-mono font-semibold text-zinc-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
              </span>
              <span>·</span>
              <span>Terjual {product.soldCount.toLocaleString('id-ID')} pcs</span>
              <span>·</span>
              <span>Stok Gudang: {product.stock} pcs</span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl font-bold text-zinc-950 tabular-nums">
                  {formatRupiah(activeUnitPrice)}
                </span>
                {product.normalPrice > activeUnitPrice && (
                  <span className="font-mono text-sm text-zinc-400 line-through tabular-nums">
                    {formatRupiah(product.normalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600">
                {isWholesaleQty ? (
                  <span className="font-semibold text-emerald-700">
                    ✓ Harga Grosir Aktif (Pembelian ≥{product.wholesaleMinQty} pcs)
                  </span>
                ) : (
                  <span>
                    Beli minimal <strong>{product.wholesaleMinQty} pcs</strong> otomatis jadi{' '}
                    <strong className="font-mono text-zinc-900">
                      {formatRupiah(product.wholesalePrice)}/pcs
                    </strong>
                  </span>
                )}
              </p>
            </div>

            {/* Description & Specs */}
            <p className="text-sm text-zinc-600 leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-600 pt-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate" title={product.material}>
                  {product.material || 'Material Import Grade A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="truncate">{product.dimensions || 'Ukuran Standar'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Berat: {product.weightGrams || 600} gram</span>
              </div>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Pilih Varian Warna: <span className="text-zinc-900">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const active = color === selectedColor;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-zinc-950 text-white border-zinc-950'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Quick Grosir Button */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-600">Jumlah:</span>
                <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuantity(product.wholesaleMinQty)}
                className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 underline cursor-pointer"
              >
                Set Grosir ({product.wholesaleMinQty} pcs)
              </button>
            </div>
          </div>

          {/* Primary Actions: Add to Cart & Direct WhatsApp Order */}
          <div className="pt-4 border-t border-zinc-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, selectedColor, quantity);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                <span>
                  + Keranjang · {formatRupiah(activeUnitPrice * quantity)}
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
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Produk Ini di Panel Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
