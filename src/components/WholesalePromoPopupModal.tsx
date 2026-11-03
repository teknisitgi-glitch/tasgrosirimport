import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Truck,
  PackageCheck,
  ArrowRight,
  Building2,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import { StoreConfig, WholesalePopupConfig } from '../types/product';
import { DEFAULT_WHOLESALE_POPUP_CONFIG } from '../services/productService';
import { cleanWhatsAppNumber } from '../utils/formatters';

interface WholesalePromoPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
  popupConfig?: WholesalePopupConfig;
  isAdminMode?: boolean;
  onOpenAdminEditor?: () => void;
  onOpenResellerGuide?: () => void;
}

export const WholesalePromoPopupModal: React.FC<
  WholesalePromoPopupModalProps
> = ({
  isOpen,
  onClose,
  storeConfig,
  popupConfig,
  isAdminMode = false,
  onOpenAdminEditor,
  onOpenResellerGuide,
}) => {
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = window.setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  const handleTriggerClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 185);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (!shouldRender) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleTriggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender, handleTriggerClose]);

  if (!shouldRender) return null;

  const activePopup: WholesalePopupConfig = {
    ...DEFAULT_WHOLESALE_POPUP_CONFIG,
    ...(popupConfig || {}),
    termsPoints:
      Array.isArray(popupConfig?.termsPoints) &&
      popupConfig.termsPoints.length > 0
        ? popupConfig.termsPoints
        : DEFAULT_WHOLESALE_POPUP_CONFIG.termsPoints,
  };

  const cleanPhone = cleanWhatsAppNumber(storeConfig.whatsappNumber);
  const resolvedWaText = (
    activePopup.whatsappMessageTemplate ||
    DEFAULT_WHOLESALE_POPUP_CONFIG.whatsappMessageTemplate
  ).replace(
    /\{storeName\}/g,
    storeConfig.storeName || 'Tas Grosir Import (TGI)'
  );

  const whatsappSalesUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    resolvedWaText
  )}`;

  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-950/55 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto cursor-pointer ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={handleTriggerClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-promo-popup-title"
    >
      {/* Compact & Proportional Card Modal (max-w-lg) */}
      <div
        className={`relative w-full max-w-lg rounded-2xl bg-zinc-950/95 text-white border border-white/15 ring-1 ring-amber-400/35 shadow-2xl shadow-zinc-950/70 overflow-hidden my-auto cursor-default ${
          isClosing ? 'animate-modal-out' : 'animate-modal-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400" />

        {/* Top-Right Close "X" Button & Optional Admin Quick Edit */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
          {isAdminMode && onOpenAdminEditor && (
            <button
              type="button"
              onClick={() => {
                handleTriggerClose();
                window.setTimeout(() => onOpenAdminEditor(), 195);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
              title="Edit Teks Pop-Up di Master Panel Admin"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit Pop-Up</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleTriggerClose}
            aria-label="Tutup Pop-Up Promo Grosir"
            title="Tutup (Esc)"
            className="w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 hover:border-zinc-500 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Header Section */}
        <div className="px-5 sm:px-6 pt-5 pb-4 bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-b border-zinc-800/80">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 font-mono text-[10px] font-extrabold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate max-w-[260px] sm:max-w-xs">
              {activePopup.badgeText ||
                DEFAULT_WHOLESALE_POPUP_CONFIG.badgeText}
            </span>
          </div>

          <h2
            id="wholesale-promo-popup-title"
            className="font-display text-lg sm:text-xl font-extrabold text-white leading-snug tracking-tight pr-10"
          >
            {activePopup.title || DEFAULT_WHOLESALE_POPUP_CONFIG.title}
          </h2>

          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
            {activePopup.description ||
              DEFAULT_WHOLESALE_POPUP_CONFIG.description}
          </p>
        </div>

        {/* Card Body: Concise Terms & Highlights */}
        <div className="p-5 sm:p-6 space-y-3.5 bg-zinc-950">
          {/* Syarat & Ketentuan Singkat Box */}
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-1.5">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                {activePopup.termsBadgeText ||
                  DEFAULT_WHOLESALE_POPUP_CONFIG.termsBadgeText}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 font-mono text-[9px] font-bold text-emerald-300 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Import Original</span>
              </span>
            </div>

            {activePopup.termsTagline && (
              <p className="text-[11px] sm:text-xs font-bold text-amber-200/95 leading-snug italic">
                “{activePopup.termsTagline}”
              </p>
            )}

            <ul className="space-y-1.5 text-[11px] sm:text-xs text-zinc-300 pt-0.5">
              {activePopup.termsPoints.map((pointText, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pointText}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compact 3-Pillar Trust Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-zinc-900/75 border border-zinc-800/90 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold text-white truncate">
                  Harga Pabrik
                </span>
                <span className="block text-[9px] text-zinc-400 truncate">
                  Seri & Karungan
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/75 border border-zinc-800/90 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <PackageCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold text-white truncate">
                  Ready Gudang
                </span>
                <span className="block text-[9px] text-zinc-400 truncate">
                  Foto Real-Pic
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900/75 border border-zinc-800/90 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold text-white truncate">
                  Kargo Murah
                </span>
                <span className="block text-[9px] text-zinc-400 truncate">
                  Se-Indonesia
                </span>
              </div>
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <a
              href={whatsappSalesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 hover:shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white/20 shrink-0" />
              <span>
                {activePopup.whatsappButtonText ||
                  DEFAULT_WHOLESALE_POPUP_CONFIG.whatsappButtonText}
              </span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </a>

            <button
              type="button"
              onClick={handleTriggerClose}
              className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/90 font-bold text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0"
            >
              {activePopup.closeButtonText ||
                DEFAULT_WHOLESALE_POPUP_CONFIG.closeButtonText}
            </button>
          </div>

          {/* Footer Helper Links */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-[10px] text-zinc-400">
            {onOpenResellerGuide ? (
              <button
                type="button"
                onClick={() => {
                  handleTriggerClose();
                  window.setTimeout(() => onOpenResellerGuide(), 195);
                }}
                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Panduan Reseller & Syarat Grosir →</span>
              </button>
            ) : (
              <span>Gudang Resmi Tas Grosir Import (TGI)</span>
            )}
            <span className="text-zinc-500">
              Klik di luar kotak atau Esc untuk menutup
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
