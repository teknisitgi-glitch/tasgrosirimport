import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Truck,
} from 'lucide-react';
import { CartItem, StoreConfig } from '../types/product';
import {
  formatRupiah,
  getEffectiveUnitPrice,
  buildWhatsAppOrderText,
} from '../utils/formatters';
import { createBagStudioSvg } from '../utils/bagStudioSvg';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  storeConfig: StoreConfig;
  onUpdateQuantity: (productId: string, color: string, delta: number) => void;
  onRemoveItem: (productId: string, color: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  storeConfig,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'ekspedisi' | 'pickup'>(
    'ekspedisi'
  );
  const [notes, setNotes] = useState('');
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const orderData = buildWhatsAppOrderText({
    items,
    customerName,
    customerCity,
    deliveryMethod,
    notes,
    config: storeConfig,
  });

  const remainingForFreeShipping = Math.max(
    0,
    storeConfig.freeShippingThreshold - orderData.totalPayable
  );

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderData.message);
      setCopiedText(true);
      window.setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <aside
        aria-label="Keranjang Belanja"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl border-l border-zinc-200 flex flex-col justify-between overflow-hidden"
      >
        {/* Top Drawer Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between gap-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-xl font-bold tracking-wide">
              KERANJANG BELANJA
            </h2>
            <span className="font-mono text-xs text-zinc-400 tabular-nums">
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

        {/* Free Shipping / Wholesale Tier Progress Bar */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-zinc-100 border-b border-zinc-200 text-xs text-zinc-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-zinc-900 shrink-0" />
              {remainingForFreeShipping === 0 ? (
                <span className="font-semibold text-emerald-700">
                  ✓ Pesanan memenuhi syarat Subsidi Ongkir / Kargo Grosir!
                </span>
              ) : (
                <span>
                  Tambah{' '}
                  <strong className="font-mono text-zinc-950 tabular-nums">
                    {formatRupiah(remainingForFreeShipping)}
                  </strong>{' '}
                  lagi untuk Subsidi Ongkir
                </span>
              )}
            </div>
            {orderData.totalQuantity >= 6 && (
              <span className="font-mono font-bold text-amber-700 shrink-0">
                GROSIR AKTIF
              </span>
            )}
          </div>
        )}

        {/* Middle Scrollable Area: Items & Customer Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                    Daftar Item ({items.length} SKU)
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
                  const { unitPrice, isWholesaleApplied } = getEffectiveUnitPrice(
                    item,
                    orderData.totalQuantity
                  );
                  const fallbackImg = createBagStudioSvg({
                    variant: 'backpack-black',
                    sku: item.product.sku,
                  });

                  return (
                    <div
                      key={`${item.product.id}-${item.selectedColor}`}
                      className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex gap-3.5 items-start"
                    >
                      <img
                        src={item.product.imageUrl || fallbackImg}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImg;
                        }}
                        className="w-18 h-18 rounded-lg object-cover bg-zinc-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-zinc-600">
                            {item.product.sku} · {item.selectedColor}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(item.product.id, item.selectedColor)
                            }
                            aria-label={`Hapus ${item.product.name}`}
                            className="text-zinc-400 hover:text-red-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">
                          {item.product.name}
                        </h4>

                        <div className="flex items-center justify-between pt-1.5">
                          <div>
                            <span className="font-mono text-sm font-bold text-zinc-950 tabular-nums">
                              {formatRupiah(unitPrice * item.quantity)}
                            </span>
                            <span className="block text-[11px] text-zinc-500 font-mono tabular-nums">
                              {formatRupiah(unitPrice)} / pcs
                              {isWholesaleApplied && (
                                <strong className="text-emerald-700 ml-1">
                                  (Grosir)
                                </strong>
                              )}
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
                                  -1
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
                                  1
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

              {/* Customer Details for WhatsApp Checkout */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Data Pengiriman WhatsApp (Opsional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Nama Pemesan / Toko
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Budi / Toko Berkah"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Kota / Kecamatan
                    </label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="Contoh: Tanah Abang, Jakarta"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
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
                      Kirim Ekspedisi / Kargo
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

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Catatan Pesanan
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Packing karung rapi, kirim via J&T Cargo"
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
          <div className="p-6 bg-white border-t border-zinc-200 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Total Harga Normal ({orderData.totalQuantity} pcs)</span>
                <span className="font-mono line-through tabular-nums">
                  {formatRupiah(orderData.subtotalNormal)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                <span>Total Hemat Diskon & Grosir</span>
                <span className="font-mono tabular-nums">
                  -{formatRupiah(orderData.totalSavings)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100">
                <span className="font-bold text-zinc-900">Total Belanja</span>
                <span className="font-mono text-xl font-bold text-zinc-950 tabular-nums">
                  {formatRupiah(orderData.totalPayable)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={orderData.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowOrderPreview(true)}
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pesan via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => setShowOrderPreview((prev) => !prev)}
                className="w-full py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer"
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
