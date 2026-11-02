import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MapPin,
  Store,
  PackageCheck,
  MessageSquarePlus,
  X,
  CheckCircle2,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { CustomerReview, Product } from '../types/product';

interface CustomerReviewsSectionProps {
  reviews: CustomerReview[];
  products: Product[];
  isAdminMode?: boolean;
  onAddReview: (review: CustomerReview) => void;
  onDeleteReview?: (reviewId: string) => void;
  onSelectProductBySku?: (sku: string) => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  reviews,
  products,
  isAdminMode = false,
  onAddReview,
  onDeleteReview,
  onSelectProductBySku,
}) => {
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [skuFilter, setSkuFilter] = useState<string>('ALL');
  const [reviewToDelete, setReviewToDelete] = useState<CustomerReview | null>(
    null
  );

  // New Review Form State
  const [reviewerName, setReviewerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('');
  const [orderBatchInfo, setOrderBatchInfo] = useState(
    'Order Grosir · 12 Pcs (1 Lusin)'
  );
  const [selectedSku, setSelectedSku] = useState(
    products[0]?.sku || 'KOLEKSI-TGI'
  );
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const displayedMainReviews = reviews.slice(0, 3);

  const filteredModalReviews =
    skuFilter === 'ALL'
      ? reviews
      : reviews.filter((r) => r.productSku === skuFilter);

  const handleConfirmDelete = () => {
    if (!reviewToDelete) return;
    onDeleteReview?.(reviewToDelete.id);
    setReviewToDelete(null);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      setFormError('Nama Anda dan isi ulasan wajib diisi.');
      return;
    }

    const matchedProd = products.find((p) => p.sku === selectedSku);
    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      reviewerName: reviewerName.trim(),
      storeName: storeName.trim() || 'Reseller Mitra TGI',
      city: city.trim() || 'Indonesia',
      rating: Math.min(5, Math.max(1, rating)),
      orderBatchInfo: orderBatchInfo.trim() || 'Pembelian Grosir TGI',
      productSku: selectedSku,
      productName: matchedProd?.name || `Koleksi Tas Import ${selectedSku}`,
      comment: comment.trim(),
      verifiedWholesale: true,
      createdAt: 'Baru saja',
    };

    onAddReview(newReview);
    setReviewerName('');
    setStoreName('');
    setCity('');
    setComment('');
    setFormError('');
    setIsWriteModalOpen(false);
  };

  return (
    <section
      id="ulasan-pelanggan"
      aria-label="Ulasan & Testimoni Mitra Reseller TGI"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12"
    >
      <div className="rounded-2xl bg-white border border-zinc-200/90 p-5 sm:p-8 shadow-2xs space-y-6">
        {/* Top Header & Trust Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/20 border border-amber-400/50 text-zinc-900 font-mono text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>VERIFIED WHOLESALE SOCIAL PROOF</span>
              </div>
              {isAdminMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Trash2 className="w-3 h-3" />
                  <span>Mode Admin: Manajemen Ulasan Aktif</span>
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight uppercase">
              ULASAN ASLI MITRA RESELLER & PEMBELI PARTAI BESAR
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl">
              Dipercaya oleh ratusan toko tas, butik, dan seller live streaming di seluruh Indonesia dengan jaminan kualitas tangan pertama.
            </p>
          </div>

          {/* Aggregate Rating Box & CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-zinc-950 text-white flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 font-mono text-lg font-extrabold text-amber-400 leading-none">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  1.250+ Transaksi Grosir
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAllModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold border border-zinc-300 transition-colors cursor-pointer"
            >
              Lihat Semua ({reviews.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError('');
                setIsWriteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 stroke-[2.3]" />
              <span>+ Tulis Ulasan</span>
            </button>
          </div>
        </div>

        {/* 3 Featured Reviews Grid */}
        {displayedMainReviews.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 border border-dashed border-zinc-300 p-8 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-800">
              Belum ada ulasan yang ditampilkan.
            </p>
            <p className="text-xs text-zinc-500">
              Klik tombol "+ Tulis Ulasan" untuk menambahkan testimoni pelanggan atau reseller baru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {displayedMainReviews.map((rev) => (
              <article
                key={rev.id}
                className="rounded-xl bg-zinc-50 border border-zinc-200/90 p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-zinc-900 transition-colors"
              >
                <div className="space-y-3">
                  {/* Stars, Verified Pill & Admin Delete Button */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Reseller Terverifikasi</span>
                      </span>
                      {isAdminMode && (
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(rev)}
                          title="Hapus Ulasan Ini"
                          aria-label={`Hapus ulasan dari ${rev.reviewerName}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Ulasan</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Batch Info */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-[11px] font-mono font-bold text-zinc-800">
                    <PackageCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{rev.orderBatchInfo}</span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Reviewer Identity & SKU Tag */}
                <div className="pt-3 border-t border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">
                        {rev.reviewerName}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 truncate">
                        <span className="inline-flex items-center gap-1 truncate">
                          <Store className="w-3 h-3 text-zinc-400 shrink-0" />
                          {rev.storeName}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5 truncate">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          {rev.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => onSelectProductBySku?.(rev.productSku)}
                      className="font-mono font-bold text-amber-800 hover:text-zinc-950 underline cursor-pointer"
                    >
                      SKU: {rev.productSku}
                    </button>
                    <span className="text-zinc-400">{rev.createdAt}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Lihat Semua Ulasan & Testimoni Reseller */}
      {isAllModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAllModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden border border-zinc-200 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div>
                <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  TESTIMONI GROSIR & ECERAN TGI ({reviews.length} ULASAN)
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wide uppercase">
                  ULASAN BINTANG 5 MITRA RESELLER TGI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAllModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Filter Bar inside Modal */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSkuFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      skuFilter === 'ALL'
                        ? 'bg-zinc-950 text-amber-400 border-zinc-950'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-900'
                    }`}
                  >
                    Semua SKU ({reviews.length})
                  </button>
                  {Array.from(new Set(reviews.map((r) => r.productSku))).map(
                    (sku) => (
                      <button
                        key={sku}
                        type="button"
                        onClick={() => setSkuFilter(sku)}
                        className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                          skuFilter === sku
                            ? 'bg-zinc-950 text-amber-400 border-zinc-950'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900'
                        }`}
                      >
                        {sku}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAllModalOpen(false);
                    setIsWriteModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>+ Tambah Ulasan Baru</span>
                </button>
              </div>

              {filteredModalReviews.length === 0 ? (
                <div className="p-8 rounded-xl bg-zinc-50 border border-dashed border-zinc-300 text-center space-y-2">
                  <p className="text-sm font-bold text-zinc-800">
                    Belum ada ulasan yang tersimpan.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Klik tombol "+ Tambah Ulasan Baru" untuk menulis ulasan pertama.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModalReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: rev.rating }).map((_, idx) => (
                              <Star
                                key={idx}
                                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified Buyer</span>
                            </span>
                            {isAdminMode && (
                              <button
                                type="button"
                                onClick={() => setReviewToDelete(rev)}
                                title="Hapus Ulasan Ini"
                                aria-label={`Hapus ulasan dari ${rev.reviewerName}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Ulasan</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <span className="inline-block px-2 py-0.5 rounded bg-white border border-zinc-200 font-mono text-[10px] font-bold text-zinc-700">
                          {rev.orderBatchInfo}
                        </span>

                        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-zinc-200/80 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-zinc-900 block">
                            {rev.reviewerName}
                          </strong>
                          <span className="text-[11px] text-zinc-500">
                            {rev.storeName} · {rev.city}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-800">
                          {rev.productSku}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Ulasan (Admin Mode) */}
      {reviewToDelete && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReviewToDelete(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-zinc-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                    KONFIRMASI MANAJEMEN ULASAN
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-wide uppercase">
                    HAPUS ULASAN PELANGGAN?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus ulasan dari{' '}
                <strong className="text-zinc-950">
                  {reviewToDelete.reviewerName}
                </strong>{' '}
                ({reviewToDelete.storeName})? Perubahan akan langsung disimpan ke penyimpanan.
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-zinc-900">
                    {reviewToDelete.reviewerName} · {reviewToDelete.city}
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    SKU: {reviewToDelete.productSku}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 italic line-clamp-3">
                  "{reviewToDelete.comment}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Ulasan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Tulis Ulasan Pelanggan / Reseller Baru */}
      {isWriteModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-zinc-200 shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
              <div>
                <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  FORM TESTIMONI PELANGGAN & RESELLER
                </span>
                <h3 className="font-display text-xl font-bold tracking-wide uppercase">
                  BAGIKAN PENGALAMAN BELANJA DI TGI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Contoh: Ibu Dewi Sartika"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Nama Toko / Olshop
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Dewi Bag Store"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Kota Asal
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Yogyakarta"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Produk SKU yang Dibeli
                  </label>
                  {products.length > 0 ? (
                    <select
                      value={selectedSku}
                      onChange={(e) => setSelectedSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.sku}>
                          {p.sku} — {p.name.slice(0, 28)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedSku}
                      onChange={(e) => setSelectedSku(e.target.value)}
                      placeholder="Masukkan Kode SKU"
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Keterangan Jumlah Order
                  </label>
                  <input
                    type="text"
                    value={orderBatchInfo}
                    onChange={(e) => setOrderBatchInfo(e.target.value)}
                    placeholder="Order Grosir · 12 Pcs"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Rating Kepuasan
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-300 bg-white focus:border-zinc-950 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0 - Sangat Puas)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0 - Puas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Isi Testimoni / Ulasan Anda *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan kualitas bahan tas, kerapian jahitan, atau kecepatan pengiriman kargo TGI..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 focus:border-zinc-950 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold cursor-pointer"
                >
                  Kirim Ulasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
