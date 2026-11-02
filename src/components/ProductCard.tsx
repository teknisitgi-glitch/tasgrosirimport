import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Pencil,
  Trash2,
  Eye,
  Check,
  X,
  Heart,
  Scale,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  ProductImageAspectRatio,
  ProductImageObjectFit,
  StockStatusLabel,
} from '../types/product';
import {
  formatRupiah,
  calculateDiscountPercent,
  getColorSwatchHex,
} from '../utils/formatters';
import {
  createBagStudioSvg,
  createColorMatchedBagSvg,
} from '../utils/bagStudioSvg';

interface ProductCardProps {
  product: Product;
  isAdminMode: boolean;
  imageAspectRatio?: ProductImageAspectRatio;
  imageObjectFit?: ProductImageObjectFit;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onAddToCart: (product: Product, color?: string) => void;
  onQuickView: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onQuickUpdateProduct?: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const CARD_EDITABLE_CATEGORIES: Exclude<ProductCategory, 'Semua'>[] = [
  'Backpack',
  'Handbag',
  'Shoulder Bag',
  'Promo Grosir',
];

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdminMode,
  imageAspectRatio = '1:1',
  imageObjectFit = 'contain',
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onEditProduct,
  onQuickUpdateProduct,
  onDeleteProduct,
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);

  // Inline Quick Edit state for Admin Mode
  const [inlineSku, setInlineSku] = useState(product.sku);
  const [inlineName, setInlineName] = useState(product.name);
  const [inlineCategory, setInlineCategory] = useState<
    Exclude<ProductCategory, 'Semua'>
  >(product.category);
  const [inlineSalePrice, setInlineSalePrice] = useState(product.salePrice);
  const [inlineWholesalePrice, setInlineWholesalePrice] = useState(
    product.wholesalePrice
  );
  const [inlineStock, setInlineStock] = useState(product.stock);
  const [inlineWeightGrams, setInlineWeightGrams] = useState(
    product.weightGrams || 400
  );
  const [inlineImageUrl, setInlineImageUrl] = useState(product.imageUrl);

  const openInlineEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInlineSku(product.sku);
    setInlineName(product.name);
    setInlineCategory(product.category);
    setInlineSalePrice(product.salePrice);
    setInlineWholesalePrice(product.wholesalePrice);
    setInlineStock(product.stock);
    setInlineWeightGrams(product.weightGrams || 400);
    setInlineImageUrl(product.imageUrl);
    setIsInlineEditing(true);
  };

  const handleSaveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onQuickUpdateProduct) {
      onEditProduct(product);
      setIsInlineEditing(false);
      return;
    }
    const cleanSale = Math.max(1000, Number(inlineSalePrice) || product.salePrice);
    const cleanWholesale = Math.min(
      cleanSale,
      Math.max(1000, Number(inlineWholesalePrice) || product.wholesalePrice)
    );
    const cleanStock = Math.max(0, Number(inlineStock) || 0);
    const cleanWeight = Math.max(50, Number(inlineWeightGrams) || 400);
    const updated: Product = {
      ...product,
      sku: inlineSku.trim().toUpperCase() || product.sku,
      name: inlineName.trim() || product.name,
      category: inlineCategory,
      normalPrice: Math.max(product.normalPrice, cleanSale),
      salePrice: cleanSale,
      wholesalePrice: cleanWholesale,
      stock: cleanStock,
      stockStatus:
        cleanStock <= 0
          ? 'Habis'
          : cleanStock <= 25
          ? 'Stok Terbatas'
          : 'Ready Stock',
      weightGrams: cleanWeight,
      imageUrl: inlineImageUrl.trim() || product.imageUrl,
      updatedAt: new Date().toISOString(),
    };
    onQuickUpdateProduct(updated);
    setImgError(false);
    setIsInlineEditing(false);
  };

  const colorList =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors.filter(Boolean)
      : [];

  const [activeColor, setActiveColor] = useState<string>(
    colorList[0] || 'Black'
  );
  const [hasUserClickedColor, setHasUserClickedColor] = useState(false);

  const discountPercent = calculateDiscountPercent(
    product.normalPrice,
    product.salePrice
  );

  // Automatic Studio Fallback if user-entered URL fails to load
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

  const activeColorIndex = colorList.indexOf(activeColor);

  // Resolve dynamic image when a color dot is clicked
  const getDynamicColorImage = (): string => {
    const baseImg =
      !imgError && product.imageUrl ? product.imageUrl : fallbackSvgUri;

    if (!hasUserClickedColor && activeColorIndex <= 0) {
      return baseImg;
    }

    const isBaseStudioSvg = baseImg.startsWith('data:image/svg+xml');
    if (activeColorIndex === 0 && !isBaseStudioSvg) {
      return baseImg;
    }

    if (
      !isBaseStudioSvg &&
      activeColorIndex > 0 &&
      Array.isArray(product.galleryImages) &&
      product.galleryImages[activeColorIndex - 1]
    ) {
      return product.galleryImages[activeColorIndex - 1];
    }

    return createColorMatchedBagSvg({
      category: product.category,
      sku: product.sku,
      colorName: activeColor,
    });
  };

  const displayImage = getDynamicColorImage();

  const aspectClass =
    imageAspectRatio === '1:1'
      ? 'aspect-square'
      : imageAspectRatio === '3:4'
      ? 'aspect-3/4'
      : 'aspect-4/3';

  const isContain = imageObjectFit === 'contain';
  const fitClass = isContain
    ? 'object-contain p-4 sm:p-5'
    : 'object-cover';

  // Determine Stock Status Label
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

  const isBestSeller = Boolean(
    product.isPromoGrosir ||
      (typeof product.soldCount === 'number' && product.soldCount >= 750) ||
      product.rating >= 4.9
  );

  const formattedSoldCount =
    typeof product.soldCount === 'number' && product.soldCount > 0
      ? product.soldCount >= 1000
        ? `${(product.soldCount / 1000).toFixed(1).replace('.0', '')}rb+ terjual`
        : `${product.soldCount}+ terjual`
      : null;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const chosenColor = colorList.includes(activeColor)
      ? activeColor
      : colorList[0] || 'Default';
    onAddToCart(product, chosenColor);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist?.(product);
  };

  return (
    <article
      onClick={() => {
        if (!isInlineEditing) {
          onQuickView(product);
        }
      }}
      className="group relative bg-white border border-zinc-200/80 hover:border-zinc-950 transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Inline Quick Edit Overlay (When Admin clicks Edit Cepat on Card) */}
      {isAdminMode && isInlineEditing && (
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSaveInlineEdit}
          className="p-3.5 bg-zinc-950 text-white space-y-2.5 border-b border-amber-400/50 z-30"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>EDIT CEPAT KARTU PRODUK</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsInlineEditing(false);
                  onEditProduct(product);
                }}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-200 cursor-pointer"
              >
                Modal Lengkap
              </button>
              <button
                type="button"
                onClick={() => setIsInlineEditing(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Tutup edit cepat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                Kode SKU
              </label>
              <input
                type="text"
                value={inlineSku}
                onChange={(e) => setInlineSku(e.target.value.toUpperCase())}
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded bg-zinc-900 border border-zinc-700 text-amber-400 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                Kategori
              </label>
              <select
                value={inlineCategory}
                onChange={(e) =>
                  setInlineCategory(
                    e.target.value as Exclude<ProductCategory, 'Semua'>
                  )
                }
                className="w-full px-2 py-1 text-xs font-semibold rounded bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
              >
                {CARD_EDITABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
              Nama Model Produk
            </label>
            <input
              type="text"
              value={inlineName}
              onChange={(e) => setInlineName(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                Harga Eceran (Rp)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={inlineSalePrice}
                onChange={(e) => setInlineSalePrice(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-emerald-400 mb-0.5">
                Harga Grosir (Rp)
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={inlineWholesalePrice}
                onChange={(e) =>
                  setInlineWholesalePrice(Number(e.target.value))
                }
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded bg-zinc-900 border border-emerald-700 text-emerald-300 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
                Stok (Pcs)
              </label>
              <input
                type="number"
                min={0}
                value={inlineStock}
                onChange={(e) => setInlineStock(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded bg-zinc-900 border border-zinc-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-amber-300 mb-0.5">
                Berat / Tas (gram)
              </label>
              <input
                type="number"
                min={50}
                step={10}
                value={inlineWeightGrams}
                onChange={(e) => setInlineWeightGrams(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded bg-zinc-900 border border-amber-500/70 text-amber-300 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-zinc-400 mb-0.5">
              URL Gambar Real-Pic
            </label>
            <input
              type="text"
              value={inlineImageUrl}
              onChange={(e) => setInlineImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-2 py-1 text-[11px] rounded bg-zinc-900 border border-zinc-700 text-zinc-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsInlineEditing(false)}
              className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-[11px] font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[11px] font-extrabold cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>Simpan Cepat</span>
            </button>
          </div>
        </form>
      )}

      {/* Product Image Container (Zalora Clean Editorial Frame) */}
      <div
        className={`relative ${aspectClass} w-full ${
          isContain ? 'bg-zinc-50/70 border-b border-zinc-100' : 'bg-zinc-100'
        } overflow-hidden flex items-center justify-center`}
      >
        <img
          src={displayImage}
          alt={`${product.name} (${product.sku}) - ${activeColor}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full ${fitClass} group-hover:scale-105 transition-transform duration-300 ease-out`}
        />

        {/* Top-Left: Elegant Discount Badge & Editorial Status Tag */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
          {(product.isSale || discountPercent > 0) && (
            <span className="bg-rose-600 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 tracking-wider uppercase shadow-2xs">
              {discountPercent > 0 ? `-${discountPercent}%` : 'SALE'}
            </span>
          )}

          {isBestSeller && (
            <span className="bg-zinc-950 text-white font-sans text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5">
              Best Seller
            </span>
          )}

          {isLowStock && resolvedStockStatus !== 'Habis' && (
            <span className="bg-amber-400 text-zinc-950 font-mono text-[10px] font-extrabold px-2 py-0.5 tracking-tight">
              Sisa {lowStockCount} pcs
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Heart Icon + Optional Admin Quick Actions */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-20 flex items-center gap-1.5"
        >
          {isAdminMode && (
            <>
              {!confirmDelete ? (
                <>
                  <button
                    type="button"
                    onClick={openInlineEditor}
                    title={`Edit Cepat ${product.sku} (Harga, Berat, Stok, URL)`}
                    aria-label={`Edit Cepat ${product.name}`}
                    className="px-2 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 border border-amber-500 shadow-xs inline-flex items-center gap-1 text-[10px] font-extrabold transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    title={`Hapus ${product.sku}`}
                    aria-label={`Hapus ${product.name}`}
                    className="w-8 h-8 rounded-full bg-white/95 hover:bg-rose-600 text-zinc-600 hover:text-white border border-zinc-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="inline-flex items-center gap-1 bg-zinc-950 text-white px-2.5 py-1 rounded-full border border-rose-500 shadow-md">
                  <span className="text-[10px] font-bold text-rose-300">
                    Hapus?
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product.id)}
                    className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Batal hapus"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Wishlist Heart Button (Always visible in top-right corner) */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={
              isWishlisted
                ? `Hapus ${product.name} dari Wishlist`
                : `Simpan ${product.name} ke Wishlist`
            }
            title={isWishlisted ? 'Tersimpan di Wishlist' : 'Tambah ke Wishlist'}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer shadow-2xs ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600 scale-105'
                : 'bg-white/95 hover:bg-white border-zinc-200/90 text-zinc-700 hover:text-rose-600'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isWishlisted ? 'fill-rose-600 text-rose-600 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Smooth Hover Reveal Action Bar: Quick View + Add to Cart (Zalora Style) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-200 ease-out absolute inset-x-3 bottom-3 z-20 flex items-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label={`Quick View ${product.name}`}
            className="flex-1 py-2.5 px-3 bg-white/95 hover:bg-zinc-100 text-zinc-950 border border-zinc-300 shadow-md backdrop-blur-xs text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Quick View</span>
          </button>

          <button
            type="button"
            onClick={handleAddClick}
            disabled={resolvedStockStatus === 'Habis'}
            aria-label={`Tambah ${product.name} ke Keranjang`}
            className={`flex-1 py-2.5 px-3 shadow-md text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              resolvedStockStatus === 'Habis'
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 hover:bg-zinc-800 text-white'
            }`}
          >
            {resolvedStockStatus === 'Habis' ? (
              <span>Habis</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tersimpan</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info Body (Zalora Clean Editorial Hierarchy) */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
        <div className="space-y-1.5">
          {/* Brand / Category · SKU & Rating */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold uppercase tracking-widest text-zinc-900">
                {product.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-zinc-500">{product.sku}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0 font-mono text-zinc-700 text-[11px]">
              <Star className="w-3 h-3 fill-zinc-950 text-zinc-950" />
              <span className="font-bold tabular-nums">
                {product.rating.toFixed(1)}
              </span>
              {formattedSoldCount && (
                <span className="text-[10px] font-sans text-zinc-400 hidden sm:inline">
                  · {formattedSoldCount}
                </span>
              )}
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-medium text-zinc-800 leading-snug line-clamp-2 group-hover:text-zinc-950 transition-colors">
            {product.name}
          </h3>

          {/* Interactive Color Swatches & Stock Text */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-1 flex items-center justify-between gap-2"
          >
            {colorList.length > 0 ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex items-center gap-1">
                  {colorList.slice(0, 5).map((color, idx) => {
                    const hex = getColorSwatchHex(color);
                    const isSelected = activeColor === color;
                    return (
                      <button
                        key={`${color}-${idx}`}
                        type="button"
                        onClick={() => {
                          setActiveColor(color);
                          setHasUserClickedColor(true);
                        }}
                        title={`Pilih warna: ${color}`}
                        aria-label={`Pilih warna ${color}`}
                        className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-1 ring-zinc-950 ring-offset-1 scale-110 border-zinc-900'
                            : 'border-zinc-300 hover:scale-110 opacity-85 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] text-zinc-500 truncate max-w-[95px]">
                  {activeColor}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-zinc-400">Multi-Warna</span>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                title="Estimasi berat per tas untuk kalkulator ongkir kargo"
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]"
              >
                <Scale className="w-2.5 h-2.5 text-zinc-500" />
                <span>{product.weightGrams || 400}g</span>
              </span>
              <span
                className={`text-[11px] font-medium ${
                  resolvedStockStatus === 'Habis'
                    ? 'text-rose-600 font-semibold'
                    : isLowStock
                    ? 'text-amber-700 font-semibold'
                    : 'text-emerald-700'
                }`}
              >
                {resolvedStockStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Block with Strong Price Emphasis & Mobile Add Button */}
        <div className="pt-2.5 border-t border-zinc-100 space-y-2">
          <div>
            {/* Sale Price (Strong Emphasis) & Strikethrough Normal Price */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className={`font-mono text-base font-extrabold tabular-nums ${
                  discountPercent > 0 ? 'text-rose-600' : 'text-zinc-950'
                }`}
              >
                {formatRupiah(product.salePrice)}
              </span>
              {product.normalPrice > product.salePrice && (
                <span className="font-mono text-xs text-zinc-400 line-through tabular-nums">
                  {formatRupiah(product.normalPrice)}
                </span>
              )}
            </div>

            {/* Wholesale Tier Price & Savings */}
            <div className="flex items-center justify-between gap-1 mt-1 text-xs">
              <p className="text-zinc-600 tabular-nums">
                Grosir ≥{product.wholesaleMinQty} pcs:{' '}
                <span className="font-mono font-bold text-zinc-950">
                  {formatRupiah(product.wholesalePrice)}
                </span>
              </p>

              {(() => {
                const hematNominal =
                  product.salePrice > product.wholesalePrice
                    ? product.salePrice - product.wholesalePrice
                    : Math.max(0, product.normalPrice - product.wholesalePrice);
                if (hematNominal <= 0) return null;
                return (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 tabular-nums">
                    Hemat {formatRupiah(hematNominal)}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Mobile / Touch Quick Add Button (Always accessible on touch screens) */}
          <button
            type="button"
            onClick={handleAddClick}
            disabled={resolvedStockStatus === 'Habis'}
            className={`lg:hidden w-full py-2 px-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              resolvedStockStatus === 'Habis'
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 hover:bg-zinc-800 text-white'
            }`}
          >
            {resolvedStockStatus === 'Habis' ? (
              <span>Stok Habis</span>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Masuk Keranjang</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
