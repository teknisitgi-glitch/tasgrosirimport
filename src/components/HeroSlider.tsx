import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Pencil,
  TicketPercent,
  Check,
  Copy,
} from 'lucide-react';
import {
  HeroSlideItem,
  ProductCategory,
  VoucherItem,
} from '../types/product';
import { createHeroLookbookSvg } from '../utils/bagStudioSvg';

interface HeroSliderProps {
  slides: HeroSlideItem[];
  vouchers?: [VoucherItem, VoucherItem, VoucherItem];
  showVoucherBar?: boolean;
  showHeroBanner?: boolean;
  onExploreCategory: (cat: ProductCategory) => void;
  onCopyVoucher?: (code: string, title?: string) => void;
  isAdminMode?: boolean;
  onEditBanner?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  vouchers,
  showVoucherBar = true,
  showHeroBanner = true,
  onExploreCategory,
  onCopyVoucher,
  isAdminMode = false,
  onEditBanner,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const safeSlides = slides.length > 0 ? slides : [];
  const activeIdx =
    safeSlides.length > 0 ? currentIndex % safeSlides.length : 0;

  useEffect(() => {
    if (isPaused || safeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPaused, safeSlides.length]);

  if (safeSlides.length === 0 || (!showVoucherBar && !showHeroBanner)) {
    return null;
  }

  const currentSlide = safeSlides[activeIdx];
  // Default subtle left-side-only contrast (20%) so the right-side lookbook image is bright and dominant
  const rawOpacity = currentSlide.overlayOpacity ?? 20;
  const overlayAlpha = Math.min(0.9, Math.max(0, rawOpacity / 100));
  const fallbackHeroImg = createHeroLookbookSvg(
    (activeIdx % 3) as 0 | 1 | 2
  );

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + safeSlides.length) % safeSlides.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
  };

  const handleActionClick = () => {
    onExploreCategory(currentSlide.targetCategory || 'Semua');
    const catalogEl = document.getElementById('katalog-produk');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyVoucher = (code: string, title?: string) => {
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    onCopyVoucher?.(code, title);
    window.setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2400);
  };

  return (
    <section
      aria-label="Voucher Grosir & Banner Promosi Utama"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3.5 pb-3 space-y-3.5"
    >
      {/* 1. BAR VOUCHER GROSIR GAYA ERIGO (Di ATAS Hero Banner, Tepat di Bawah Navigasi Kategori) */}
      {showVoucherBar && vouchers && vouchers.length > 0 && (
        <div className="relative">
          {isAdminMode && onEditBanner && (
            <div className="flex justify-end mb-1.5">
              <button
                type="button"
                onClick={onEditBanner}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Teks Bar Voucher Grosir</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
            {vouchers.map((voucher, idx) => {
              const isCopied = copiedCode === voucher.code;
              return (
                <div
                  key={voucher.id || idx}
                  onClick={() => handleCopyVoucher(voucher.code, voucher.title)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCopyVoucher(voucher.code, voucher.title);
                    }
                  }}
                  title="Klik untuk menyalin & menerapkan kode voucher"
                  className="group relative overflow-hidden rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 hover:border-amber-400/70 px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-xs transition-all cursor-pointer"
                >
                  {/* Ticket Notch Cutouts Left & Right */}
                  <span className="w-3 h-3 rounded-full bg-zinc-50 border border-zinc-800 absolute -left-1.5 top-1/2 -translate-y-1/2" />
                  <span className="w-3 h-3 rounded-full bg-zinc-50 border border-zinc-800 absolute -right-1.5 top-1/2 -translate-y-1/2" />

                  <div className="flex items-center gap-2.5 min-w-0 pl-1">
                    <div className="w-9 h-9 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 font-black">
                      <TicketPercent className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-display text-sm sm:text-base font-black uppercase tracking-tight text-amber-400 leading-none truncate">
                        {voucher.title}
                      </span>
                      <span className="block text-[11px] text-zinc-300 mt-0.5 truncate">
                        {voucher.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Dashed Divider & Code Pill */}
                  <div className="pl-2.5 border-l border-dashed border-zinc-700 shrink-0 pr-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                        isCopied
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-800 group-hover:bg-amber-400 text-zinc-200 group-hover:text-zinc-950'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <span>{voucher.code || 'KLAIM'}</span>
                          <Copy className="w-3 h-3 opacity-75" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. HERO BANNER FULL-BLEED BERSIH GAYA ERIGO (rounded-2xl) */}
      {showHeroBanner && (
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-md border ${
          isAdminMode
            ? 'border-amber-400 ring-2 ring-amber-400/40'
            : 'border-zinc-200'
        }`}
      >
        {/* Quick Admin Edit Button on Hero Corner */}
        {isAdminMode && onEditBanner && (
          <button
            type="button"
            onClick={onEditBanner}
            className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold uppercase tracking-wider shadow-md transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Banner & Voucher ({activeIdx + 1}/{safeSlides.length})</span>
          </button>
        )}

        {/* Background Banner Photo (Bright & Dominant on Right, Subtle Contrast Only on Left) */}
        <div className="absolute inset-0">
          <img
            src={currentSlide.imageUri || fallbackHeroImg}
            alt={currentSlide.headline}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackHeroImg;
            }}
            className="w-full h-full object-cover object-center transition-all duration-500"
          />
          {/* Left-Side Only Gradient Overlay so Right Side Photo Remains 100% Bright & Clear */}
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              background: `linear-gradient(90deg, rgba(9,9,11,${Math.min(
                0.9,
                overlayAlpha + 0.42
              )}) 0%, rgba(9,9,11,${Math.min(
                0.82,
                overlayAlpha + 0.22
              )}) 44%, rgba(9,9,11,${Math.max(
                0,
                overlayAlpha - 0.15
              )}) 72%, rgba(9,9,11,0) 100%)`,
            }}
          />
        </div>

        {/* Left / Right Floating Navigation Arrows */}
        {safeSlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Slide Sebelumnya"
              className="hidden sm:flex absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-950/65 hover:bg-zinc-950 text-white border border-white/25 items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Slide Berikutnya"
              className="hidden sm:flex absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-950/65 hover:bg-zinc-950 text-white border border-white/25 items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Foreground Content Positioned Left-Center */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center min-h-[370px] sm:min-h-[430px] px-6 sm:px-14 lg:px-16 pt-8 pb-14">
          <div className="lg:col-span-6 space-y-4">
            {/* Small Kicker Label / Season Tag */}
            {currentSlide.seasonTag && (
              <span className="inline-block px-3 py-1 rounded-md bg-zinc-950/75 border border-amber-400/50 text-[11px] font-mono font-extrabold uppercase tracking-widest text-amber-300 backdrop-blur-xs">
                {currentSlide.seasonTag}
              </span>
            )}

            {/* Bold Uppercase Headline (Erigo Campaign Style) */}
            <h1
              className="font-display text-3xl sm:text-5xl lg:text-[3.5rem] font-black uppercase tracking-tight text-white leading-[1.03] drop-shadow-md"
              style={{ textWrap: 'balance' }}
            >
              {currentSlide.headline}
            </h1>

            {/* Concise Subtext */}
            {currentSlide.subheadline && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-100 max-w-lg leading-relaxed drop-shadow-sm font-medium">
                {currentSlide.subheadline}
              </p>
            )}

            {/* Bright Yellow CTA Button ("Belanja Sekarang!" / "Harus Punya!") */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 font-display font-black uppercase tracking-wider text-sm sm:text-base shadow-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{currentSlide.ctaLabel || 'Belanja Sekarang!'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.8]" />
              </button>

              {currentSlide.highlightMetric && (
                <span className="px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-white/20 text-xs font-mono font-bold text-amber-300 backdrop-blur-xs">
                  {currentSlide.highlightMetric}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Centered Bottom Interactive Pagination Dots (Auto-Slide 4.5s + Manual Click) */}
        <div className="absolute bottom-3.5 inset-x-0 z-20 flex items-center justify-center px-4">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-950/75 backdrop-blur-md border border-white/20 shadow-md"
            role="tablist"
            aria-label="Indikator Slide Banner Promo"
          >
            <div className="flex items-center gap-2">
              {safeSlides.map((slide, idx) => {
                const active = idx === activeIdx;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Pilih Slide Promo ${idx + 1}: ${slide.headline}`}
                    title={`Slide ${idx + 1}: ${slide.headline}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      active
                        ? 'w-8 bg-amber-400 shadow-xs ring-2 ring-amber-400/35'
                        : 'w-2.5 bg-white/55 hover:bg-white hover:scale-110'
                    }`}
                  />
                );
              })}
            </div>
            <span className="pl-2 border-l border-white/20 font-mono text-[10px] font-bold text-zinc-200 tabular-nums select-none">
              {activeIdx + 1}/{safeSlides.length}
            </span>
          </div>
        </div>
      </div>
      )}
    </section>
  );
};
