import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pencil } from 'lucide-react';
import { HeroSlideItem, ProductCategory } from '../types/product';
import { createHeroLookbookSvg } from '../utils/bagStudioSvg';

interface HeroSliderProps {
  slides: HeroSlideItem[];
  onExploreCategory: (cat: ProductCategory) => void;
  isAdminMode?: boolean;
  onEditBanner?: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  onExploreCategory,
  isAdminMode = false,
  onEditBanner,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeSlides = slides.length > 0 ? slides : [];
  const activeIdx =
    safeSlides.length > 0 ? currentIndex % safeSlides.length : 0;

  useEffect(() => {
    if (isPaused || safeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  const currentSlide = safeSlides[activeIdx];
  const overlayAlpha = Math.min(
    0.9,
    Math.max(0, (currentSlide.overlayOpacity ?? 50) / 100)
  );
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

  return (
    <section
      aria-label="Banner Promosi Utama"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4"
    >
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative overflow-hidden rounded-2xl bg-zinc-950 text-white shadow-sm border ${
          isAdminMode ? 'border-amber-400 ring-1 ring-amber-400/50' : 'border-zinc-800'
        }`}
      >
        {/* Quick Admin Edit Button on Hero Corner */}
        {isAdminMode && onEditBanner && (
          <button
            type="button"
            onClick={onEditBanner}
            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Slide Banner ({activeIdx + 1}/{safeSlides.length})</span>
          </button>
        )}

        {/* Background Banner Photo */}
        <div className="absolute inset-0">
          <img
            src={currentSlide.imageUri || fallbackHeroImg}
            alt={currentSlide.headline}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackHeroImg;
            }}
            className="w-full h-full object-cover object-center transition-opacity duration-300"
          />
          {/* Adjustable Dark Overlay Controlled by Slider (0% - 90%) */}
          <div
            className="absolute inset-0 transition-opacity duration-200"
            style={{
              background: `linear-gradient(90deg, rgba(9,9,11,${Math.min(
                0.92,
                overlayAlpha + 0.15
              )}) 0%, rgba(9,9,11,${overlayAlpha}) 55%, rgba(9,9,11,${Math.max(
                0,
                overlayAlpha - 0.25
              )}) 100%)`,
            }}
          />
        </div>

        {/* Foreground Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px] sm:min-h-[430px] p-6 sm:p-10 lg:p-14 gap-8">
          <div className="lg:col-span-7 space-y-5">
            {/* Small Label / Badge */}
            {currentSlide.seasonTag && (
              <p className="text-xs font-mono font-semibold tracking-wider text-amber-400 drop-shadow-xs">
                {currentSlide.seasonTag}
              </p>
            )}

            {/* Bold Modern Headline */}
            <h1
              className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-white leading-[1.08] drop-shadow-sm"
              style={{ textWrap: 'balance' }}
            >
              {currentSlide.headline}
            </h1>

            {/* Subtitle / Description */}
            {currentSlide.subheadline && (
              <p className="text-sm sm:text-base text-zinc-100 max-w-xl leading-relaxed drop-shadow-xs">
                {currentSlide.subheadline}
              </p>
            )}

            {/* Primary CTA Button (Erigo-Inspired Vibrant Yellow) & Proof Text */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-zinc-950 font-bold text-sm sm:text-base shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{currentSlide.ctaLabel || 'Belanja Sekarang!'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {currentSlide.highlightMetric && (
                <span className="text-xs sm:text-sm font-medium text-zinc-200 drop-shadow-xs">
                  {currentSlide.highlightMetric}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Slider Navigation Bar */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 lg:px-14 pb-6 pt-2">
          {/* Slide Indicators */}
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Pilih Slide Banner"
          >
            {safeSlides.map((slide, idx) => {
              const active = idx === activeIdx;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Slide ${idx + 1}: ${slide.headline}`}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    active
                      ? 'w-8 bg-amber-400'
                      : 'w-2 bg-zinc-500/80 hover:bg-zinc-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Prev / Next Arrows */}
          {safeSlides.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide Sebelumnya"
                className="w-9 h-9 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide Berikutnya"
                className="w-9 h-9 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
