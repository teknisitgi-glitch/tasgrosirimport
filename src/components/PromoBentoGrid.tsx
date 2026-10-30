import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  Warehouse,
  ArrowUpRight,
  X,
  Pencil,
} from 'lucide-react';
import { BentoCardItem, ProductCategory, StoreConfig } from '../types/product';

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

  const renderCardIcon = (iconType: BentoCardItem['iconType'], index: number) => {
    const isMiddle = index === 1;
    const boxClass = isMiddle
      ? 'w-11 h-11 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center shrink-0'
      : 'w-11 h-11 rounded-xl bg-amber-400/20 text-zinc-950 flex items-center justify-center shrink-0';

    return (
      <div className={boxClass}>
        {iconType === 'truck' && <Truck className="w-5 h-5 stroke-[2.2]" />}
        {iconType === 'shield' && (
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        )}
        {iconType === 'warehouse' && (
          <Warehouse className="w-5 h-5 stroke-[2.2]" />
        )}
      </div>
    );
  };

  return (
    <section
      aria-label="Keunggulan Layanan Grosir TGI"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2.5"
    >
      {isAdminMode && onEditBento && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onEditBento}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit 3 Kartu Info Keunggulan</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, idx) => (
          <div
            key={card.id || idx}
            onClick={() => setSelectedCard(card)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setSelectedCard(card);
            }}
            className={`group relative rounded-2xl bg-white p-6 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
              isAdminMode
                ? 'border-amber-400/70 hover:border-amber-500'
                : 'border-zinc-200 hover:border-zinc-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {renderCardIcon(card.iconType, idx)}
              <span className="text-xs font-mono font-semibold text-zinc-500 group-hover:text-zinc-950 inline-flex items-center gap-1 transition-colors">
                <span>{card.badgeText || 'Info Detail'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-950 tracking-tight">
                {card.title}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
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
              <h3 className="font-display text-2xl font-bold text-zinc-950">
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

              {selectedCard.iconType === 'truck' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCategory('Promo Grosir');
                      setSelectedCard(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm transition-colors cursor-pointer"
                  >
                    Lihat Produk Promo Grosir Sekarang
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
