import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Pencil,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';
import {
  Product,
  ProductImageAspectRatio,
  ProductImageObjectFit,
} from '../types/product';
import { formatRupiah, calculateDiscountPercent } from '../utils/formatters';
import { createBagStudioSvg } from '../utils/bagStudioSvg';

interface ProductCardProps {
  product: Product;
  isAdminMode: boolean;
  imageAspectRatio?: ProductImageAspectRatio;
  imageObjectFit?: ProductImageObjectFit;
  onAddToCart: (product: Product, color?: string) => void;
  onQuickView: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdminMode,
  imageAspectRatio = '4:3',
  imageObjectFit = 'cover',
  onAddToCart,
  onQuickView,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const displayImage =
    !imgError && product.imageUrl ? product.imageUrl : fallbackSvgUri;

  const aspectClass =
    imageAspectRatio === '1:1'
      ? 'aspect-square'
      : imageAspectRatio === '3:4'
      ? 'aspect-3/4'
      : 'aspect-4/3';

  const fitClass =
    imageObjectFit === 'contain' ? 'object-contain p-2' : 'object-cover';

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, product.colors?.[0] || 'Default');
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  };

  return (
    <article
      onClick={() => onQuickView(product)}
      className={`group relative rounded-2xl bg-white border transition-all duration-150 flex flex-col overflow-hidden cursor-pointer ${
        isAdminMode
          ? 'border-amber-400 ring-1 ring-amber-400/50'
          : 'border-zinc-200 hover:border-zinc-900 hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      {/* Top Admin Toolbar when Admin Mode is ON */}
      {isAdminMode && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-950 text-white px-3 py-2 flex items-center justify-between gap-2 border-b border-zinc-800"
        >
          <span className="font-mono text-[11px] font-semibold text-amber-400 truncate">
            ADMIN · {product.sku}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEditProduct(product)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                title="Hapus Produk"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 bg-red-950 px-1.5 py-0.5 rounded-md border border-red-500">
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product.id)}
                  className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  Ya, Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-1.5 py-0.5 text-zinc-300 hover:text-white text-[11px] cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Image Container (Dynamic Aspect Ratio & Object Fit) */}
      <div
        className={`relative ${aspectClass} w-full bg-zinc-100 overflow-hidden flex items-center justify-center`}
      >
        <img
          src={displayImage}
          alt={`${product.name} (${product.sku})`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full ${fitClass} group-hover:scale-[1.03] transition-transform duration-200`}
        />

        {/* Single Subtle SALE Tag on Image Corner */}
        {(product.isSale || discountPercent > 0) && (
          <div className="absolute top-3 left-3 bg-zinc-950 text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded-md tracking-wider shadow-xs">
            SALE {discountPercent > 0 ? `-${discountPercent}%` : ''}
          </div>
        )}

        {/* Quick View Hover Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label={`Lihat detail ${product.name}`}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute bottom-3 right-3 w-9 h-9 rounded-lg bg-white/95 text-zinc-900 shadow-sm flex items-center justify-center hover:bg-amber-400 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Unboxed Metadata: Category · SKU · Rating */}
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5 truncate">
              <span className="uppercase tracking-wider font-semibold text-zinc-600">
                {product.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-medium text-zinc-700">
                {product.sku}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 font-mono text-zinc-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-950">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Action Footer */}
        <div className="pt-2 border-t border-zinc-100 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {/* Sale Price & Normal Strikethrough Price */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-lg font-bold text-zinc-950 tabular-nums">
                  {formatRupiah(product.salePrice)}
                </span>
                {product.normalPrice > product.salePrice && (
                  <span className="font-mono text-xs text-zinc-400 line-through tabular-nums">
                    {formatRupiah(product.normalPrice)}
                  </span>
                )}
              </div>

              {/* Wholesale Price Tier Hint */}
              <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
                Grosir ≥{product.wholesaleMinQty} pcs:{' '}
                <span className="font-semibold text-zinc-800">
                  {formatRupiah(product.wholesalePrice)}
                </span>
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddClick}
            className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-950 hover:bg-amber-400 text-white hover:text-zinc-950'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Masuk Keranjang</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
