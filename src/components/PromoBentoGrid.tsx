import React, { useState } from 'react';
import {
  ArrowUpRight,
  X,
  Pencil,
  CheckCircle2,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { BentoCardItem, ProductCategory, StoreConfig } from '../types/product';
import { createBentoCardCoverSvg } from '../utils/bagStudioSvg';

interface PromoBentoGridProps {
  cards: [BentoCardItem, BentoCardItem, BentoCardItem];
  storeConfig: StoreConfig;
  onSelectCategory: (cat: ProductCategory) => void;
  isAdminMode?: boolean;
  onEditBento?: () => void;
}

export const PromoBentoGrid: React.FC<PromoBentoGridProps> = ({
  cards,
  storeConfig,
  onSelectCategory,
  isAdminMode = false,
  onEditBento,
}) => {
  const [selectedCard, setSelectedCard] = useState<BentoCardItem | null>(null);

  const getBulletPoints = (card: BentoCardItem): string[] => {
    if (Array.isArray(card.bulletPoints) && card.bulletPoints.length > 0) {
      return card.bulletPoints.filter(Boolean);
    }
    if (card.description && card.description.includes('•')) {
      return card.description
        .split('•')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      'Harga Grosir Tangan Pertama Langsung Gudang',
      'Jaminan Retur 100% Tanpa Biaya Tambahan',
      'Bebas Campur SKU Mulai 6 Pcs Otomatis Grosir',
    ];
  };

  return (
    <section
      aria-label="Keunggulan & Koleksi Unggulan TGI"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-3 space-y-2.5"
    >
      {isAdminMode && onEditBento && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEditBento}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-400 text-xs font-extrabold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit 3 Kartu Bento & Foto Latar</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, idx) => {
          // KARTU 1 (KIRI): LATAR KUNING CERAH KHAS ERIGO DENGAN POIN KEUNGGULAN
          if (idx === 0) {
            const bullets = getBulletPoints(card);
            return (
              <div
                key={card.id || idx}
                onClick={() => setSelectedCard(card)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedCard(card);
                }}
                className={`group relative rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 p-6 sm:p-7 border transition-all cursor-pointer flex flex-col justify-between min-h-[250px] shadow-sm overflow-hidden ${
                  isAdminMode
                    ? 'border-zinc-950 ring-2 ring-zinc-950/30'
                    : 'border-amber-500/40'
                }`}
              >
                {/* Subtle Decorative Geometric Watermark */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-zinc-950/5 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 text-amber-400 font-mono text-[10px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>{card.badgeText || 'KEUNGGULAN TGI'}</span>
                  </span>

                  <span className="w-8 h-8 rounded-full bg-zinc-950/10 group-hover:bg-zinc-950 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </div>

                <div className="relative z-10 space-y-3 my-auto pt-3">
                  <h2 className="font-display text-2xl sm:text-[1.7rem] font-black uppercase tracking-tight text-zinc-950 leading-[1.05]">
                    {card.title || 'KENAPA HARUS BELI DI WEBSITE TGI?'}
                  </h2>

                  <ul className="space-y-1.5">
                    {bullets.map((point, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-2 text-xs sm:text-sm font-bold text-zinc-900 leading-snug"
                      >
                        <CheckCircle2 className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-3 flex items-center justify-between border-t border-zinc-950/15 text-[11px] font-mono font-extrabold uppercase tracking-wider text-zinc-900">
                  <span>GARANSI RESMI IMPORTIR TGI</span>
                  <span className="underline">KLIK DETAIL</span>
                </div>
              </div>
            );
          }

          // KARTU 2 (TENGAH) & KARTU 3 (KANAN): LATAR FOTO TAS FULL-COVER DENGAN JUDUL BESAR
          const defaultCover =
            idx === 1
              ? createBentoCardCoverSvg('new-arrival-backpack')
              : createBentoCardCoverSvg('pickup-gudang');
          const bgImage = card.imageUri?.trim() || defaultCover;

          return (
            <div
              key={card.id || idx}
              onClick={() => setSelectedCard(card)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedCard(card);
              }}
              className={`group relative rounded-2xl bg-zinc-950 text-white p-6 sm:p-7 border transition-all cursor-pointer flex flex-col justify-between min-h-[250px] shadow-sm overflow-hidden ${
                isAdminMode
                  ? 'border-amber-400 ring-2 ring-amber-400/40'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Full-Cover Background Bag Photo */}
              <img
                src={bgImage}
                alt={card.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = defaultCover;
                }}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Clean Editorial Gradient Overlay for Sharp Text Contrast */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(9,9,11,0.86) 0%, rgba(9,9,11,0.58) 58%, rgba(9,9,11,0.18) 100%)',
                }}
              />

              {/* Top Row: Badge & Arrow */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400 text-zinc-950 font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  {idx === 2 && <MapPin className="w-3 h-3 stroke-[2.5]" />}
                  <span>
                    {card.badgeText ||
                      (idx === 1 ? 'KOLEKSI BARU' : 'LOKASI GUDANG')}
                  </span>
                </span>

                <span className="w-8 h-8 rounded-full bg-white/15 group-hover:bg-amber-400 text-white group-hover:text-zinc-950 flex items-center justify-center backdrop-blur-xs transition-colors">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>

              {/* Bottom Row: Large Uppercase Headline & Concise Subtext */}
              <div className="relative z-10 space-y-2 pt-8 max-w-[85%]">
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-[1.03] drop-shadow-xs">
                  {card.title ||
                    (idx === 1
                      ? 'NEW ARRIVAL BACKPACK'
                      : 'PICKUP DI GUDANG TGI')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed line-clamp-2 font-medium">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Modal for Bento Card Clicks */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-zinc-200 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl font-black uppercase text-zinc-950">
                {selectedCard.modalTitle || selectedCard.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCard(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-600 leading-relaxed">
              <p>{selectedCard.modalContent || selectedCard.description}</p>

              {selectedCard.iconType === 'warehouse' && (
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <p className="text-xs font-mono uppercase text-zinc-500">
                    Alamat Gudang Utama
                  </p>
                  <p className="font-semibold text-zinc-900">
                    {storeConfig.warehouseAddress}
                  </p>
                </div>
              )}

              {(selectedCard.iconType === 'truck' ||
                selectedCard.iconType === 'shield') && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory(
                        selectedCard.iconType === 'shield'
                          ? 'Backpack'
                          : 'Promo Grosir'
                      );
                      setSelectedCard(null);
                      document
                        .getElementById('katalog-produk')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-display font-black uppercase tracking-wider text-sm transition-colors cursor-pointer"
                  >
                    {selectedCard.iconType === 'shield'
                      ? 'Lihat Koleksi Backpack Sekarang'
                      : 'Lihat Produk Promo Grosir Sekarang'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
