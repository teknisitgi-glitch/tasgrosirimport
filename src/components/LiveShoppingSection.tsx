import React, { useState } from 'react';
import {
  Radio,
  CalendarClock,
  ExternalLink,
  Sparkles,
  Pencil,
  ShoppingBag,
  Volume2,
  ChevronUp,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { LiveShoppingConfig } from '../types/product';
import { createLiveStudioPosterSvg } from '../utils/bagStudioSvg';

interface LiveShoppingSectionProps {
  liveConfig: LiveShoppingConfig;
  isAdminMode: boolean;
  onEditLiveConfig: () => void;
  onQuickTogglePlatform?: (platform: 'tiktok' | 'shopee') => void;
}

function normalizeLiveUrl(url: string, fallback: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('@')) {
    return `https://www.tiktok.com/${trimmed}/live`;
  }
  return `https://${trimmed}`;
}

export const LiveShoppingSection: React.FC<LiveShoppingSectionProps> = ({
  liveConfig,
  isAdminMode,
  onEditLiveConfig,
  onQuickTogglePlatform,
}) => {
  const isAnyLive = Boolean(
    liveConfig.isTikTokLive || liveConfig.isShopeeLive
  );

  const tiktokUrl = normalizeLiveUrl(
    liveConfig.tiktokLiveUrl,
    'https://www.tiktok.com/@tasgrosirimport.official/live'
  );
  const shopeeUrl = normalizeLiveUrl(
    liveConfig.shopeeLiveUrl,
    'https://shopee.co.id/tasgrosirimport'
  );

  const posterSrc =
    liveConfig.posterImageUri?.trim() || createLiveStudioPosterSvg(0);

  return (
    <section
      id="tgi-live-studio"
      aria-label="TGI Live Shopping Studio"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
    >
      <div
        className={`relative rounded-2xl overflow-hidden border transition-all duration-300 ${
          isAnyLive
            ? 'bg-zinc-950 text-white border-red-500/50 shadow-xl'
            : 'bg-zinc-900 text-white border-zinc-800 shadow-md'
        }`}
      >
        {/* Subtle Studio Lighting Ambient Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-90"
          style={{
            background: isAnyLive
              ? 'radial-gradient(circle at 12% 20%, rgba(6,182,212,0.16) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(244,63,94,0.18) 0%, transparent 50%), radial-gradient(circle at 50% 10%, rgba(249,115,22,0.12) 0%, transparent 45%)'
              : 'radial-gradient(circle at 15% 50%, rgba(250,204,21,0.08) 0%, transparent 50%)',
          }}
        />

        {/* Top Studio Bar */}
        <div className="relative z-10 px-5 sm:px-8 py-3.5 bg-zinc-950/80 border-b border-zinc-800/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2">
              <Radio
                className={`w-4 h-4 ${
                  isAnyLive ? 'text-red-500 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="font-display text-sm sm:text-base font-bold tracking-wider uppercase text-white">
                TGI LIVE SHOPPING STUDIO
              </span>
            </div>

            <span className="hidden sm:inline text-zinc-700">|</span>

            {isAnyLive ? (
              /* Blinking Red Badge + Animated Sound Wave Equalizer */
              <div className="inline-flex items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white font-mono text-[11px] font-extrabold tracking-wider uppercase shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span>🔴 SEDANG LIVE SEKARANG</span>
                </span>

                {/* Sound Wave / Audio Equalizer Bars */}
                <div
                  aria-label="Animasi gelombang suara live"
                  className="inline-flex items-end gap-0.5 h-4 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                >
                  <Volume2 className="w-3 h-3 text-cyan-400 mr-1 self-center" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2 [animation-duration:650ms]" />
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3.5 [animation-duration:480ms]" />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2.5 [animation-duration:780ms]" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3 [animation-duration:540ms]" />
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-1.5 [animation-duration:690ms]" />
                </div>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider border border-zinc-700">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>JADWAL LIVE BERIKUTNYA</span>
              </span>
            )}
          </div>

          {/* Admin Quick Controls right on the Studio Bar */}
          {isAdminMode && (
            <div className="flex flex-wrap items-center gap-2">
              {onQuickTogglePlatform && (
                <>
                  <button
                    type="button"
                    onClick={() => onQuickTogglePlatform('tiktok')}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                      liveConfig.isTikTokLive
                        ? 'bg-rose-600 text-white border-cyan-400'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    TikTok Live: {liveConfig.isTikTokLive ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickTogglePlatform('shopee')}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                      liveConfig.isShopeeLive
                        ? 'bg-orange-600 text-white border-orange-300'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    Shopee Live: {liveConfig.isShopeeLive ? 'ON' : 'OFF'}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onEditLiveConfig}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Atur Live Streaming</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="relative z-10 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left 7 Columns: Live Status, Promo Headline, Schedule & Action Buttons */}
          <div className="lg:col-span-7 space-y-5">
            {isAnyLive ? (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">
                      INTERAKSI LANGSUNG DARI GUDANG TGI
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-300">
                      Bisa Request Spill Detail Bahan & Jahitan
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                    {liveConfig.promoTitle ||
                      'Spill Gudang Tas Import Terbaru - Diskon Khusus Live!'}
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                    Host kami sedang siaran langsung dari gudang utama! Klaim voucher potongan grosir ekstra, flash sale dadakan, dan lihat langsung kualitas tas import sebelum checkout.
                  </p>
                </div>

                {/* Primary Live CTA Buttons (TikTok Black-Cyan-Pink & Shopee Orange) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Tombol Besar Gabung TikTok Live (Warna Hitam - Cyan - Pink) */}
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative rounded-xl p-[2px] transition-transform active:scale-[0.99] ${
                      liveConfig.isTikTokLive
                        ? 'bg-gradient-to-r from-cyan-400 via-zinc-900 to-rose-500 shadow-lg shadow-rose-500/15 hover:-translate-y-0.5'
                        : 'bg-zinc-800 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="h-full w-full rounded-[10px] bg-zinc-950 hover:bg-zinc-900/95 px-4 py-3.5 flex items-center justify-between gap-3 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-inner">
                          <span className="font-display text-base font-extrabold bg-gradient-to-br from-cyan-400 to-rose-500 bg-clip-text text-transparent">
                            TT
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
                              Gabung TikTok Live
                            </span>
                            {liveConfig.isTikTokLive && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          <span className="block text-xs font-mono text-cyan-300 truncate">
                            {liveConfig.tiktokUsername ||
                              '@tasgrosirimport.official'}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  </a>

                  {/* Tombol Besar Tonton Shopee Live (Warna Oranye Shopee) */}
                  <a
                    href={shopeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all active:scale-[0.99] ${
                      liveConfig.isShopeeLive
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white border border-orange-300/40 shadow-lg shadow-orange-600/20 hover:-translate-y-0.5'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          liveConfig.isShopeeLive
                            ? 'bg-white/15 border border-white/30 text-white'
                            : 'bg-orange-950/60 border border-orange-700/50 text-orange-400'
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-base sm:text-lg font-bold tracking-wide">
                            Tonton Shopee Live
                          </span>
                          {liveConfig.isShopeeLive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-orange-600 animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                        <span
                          className={`block text-xs font-mono truncate ${
                            liveConfig.isShopeeLive
                              ? 'text-orange-100'
                              : 'text-zinc-400'
                          }`}
                        >
                          {liveConfig.shopeeStoreName ||
                            'Tas Grosir Import Official'}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                </div>
              </>
            ) : (
              /* STATE WHEN LIVE IS OFF: JADWAL LIVE BERIKUTNYA & FOLLOW BUTTONS */
              <>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SIARAN LIVE SEDANG OFFLINE · JANGAN SAMPAI KETINGGALAN</span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                    {liveConfig.promoTitle ||
                      'Spill Gudang Tas Import Terbaru - Diskon Khusus Live!'}
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                    Saat ini sesi Live Streaming sedang istirahat. Ikuti (Follow) akun resmi TikTok & Shopee kami sekarang agar mendapat notifikasi otomatis saat kami mulai spill koleksi tas import terbaru!
                  </p>
                </div>

                {/* Highlighted Next Live Schedule Box */}
                <div className="p-4 rounded-xl bg-zinc-950/90 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                      <CalendarClock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        JADWAL LIVE HARIAN RESMI:
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300">
                        {liveConfig.dailySchedule ||
                          'Senin - Sabtu | Sesi 1: 10.00 WIB, Sesi 2: 19.00 WIB'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follow TikTok & Follow Shopee Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl px-4 py-3 bg-zinc-950 hover:bg-zinc-900 text-white border border-cyan-400/40 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserPlus className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-white">
                          Follow Akun TikTok Kami
                        </span>
                        <span className="block text-[11px] font-mono text-cyan-300 truncate">
                          {liveConfig.tiktokUsername ||
                            '@tasgrosirimport.official'}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-rose-400 shrink-0" />
                  </a>

                  <a
                    href={shopeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white border border-orange-400/40 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserPlus className="w-4 h-4 text-white shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-xs sm:text-sm font-bold text-white">
                          Follow Toko Shopee Kami
                        </span>
                        <span className="block text-[11px] font-mono text-orange-100 truncate">
                          {liveConfig.shopeeStoreName ||
                            'Tas Grosir Import Official'}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white shrink-0" />
                  </a>
                </div>
              </>
            )}

            {/* Schedule Strip When Live is ON */}
            {isAnyLive && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                <CalendarClock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Jadwal Rutin:</span>
                <strong className="text-zinc-200">
                  {liveConfig.dailySchedule ||
                    'Senin - Sabtu | Sesi 1: 10.00 WIB, Sesi 2: 19.00 WIB'}
                </strong>
              </div>
            )}
          </div>

          {/* Right 5 Columns: Live Studio Thumbnail / Poster Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-16/10 shadow-lg group">
              <img
                src={posterSrc}
                alt="Poster TGI Live Shopping Studio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-zinc-950/35 pointer-events-none" />

              {/* Top-left overlay status badge on poster */}
              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                {isAnyLive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>ON AIR · GUDANG TGI</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-zinc-700">
                    <span>STUDIO POSTER</span>
                  </span>
                )}
              </div>

              {/* Bottom overlay info on poster */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  {liveConfig.isTikTokLive && (
                    <span className="px-2 py-0.5 rounded bg-zinc-950/90 text-cyan-300 border border-cyan-500/40 font-bold">
                      TikTok LIVE
                    </span>
                  )}
                  {liveConfig.isShopeeLive && (
                    <span className="px-2 py-0.5 rounded bg-orange-600/95 text-white font-bold">
                      Shopee LIVE
                    </span>
                  )}
                  {!isAnyLive && (
                    <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-300">
                      Siaran Berikutnya Sesuai Jadwal
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FloatingLiveWidgetProps {
  liveConfig: LiveShoppingConfig;
}

export const FloatingLiveWidget: React.FC<FloatingLiveWidgetProps> = ({
  liveConfig,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isAnyLive = Boolean(
    liveConfig.isTikTokLive || liveConfig.isShopeeLive
  );

  if (!isAnyLive) return null;

  const tiktokUrl = normalizeLiveUrl(
    liveConfig.tiktokLiveUrl,
    'https://www.tiktok.com/@tasgrosirimport.official/live'
  );
  const shopeeUrl = normalizeLiveUrl(
    liveConfig.shopeeLiveUrl,
    'https://shopee.co.id/tasgrosirimport'
  );

  return (
    <div className="fixed bottom-5 left-4 sm:left-5 z-40 flex flex-col items-start gap-2">
      {/* Expanded Mini Live Drawer when clicked */}
      {isExpanded && (
        <div className="w-72 sm:w-80 rounded-2xl bg-zinc-950 text-white border border-red-500/50 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-85" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-red-400">
                🔴 TGI SEDANG LIVE!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <p className="text-xs font-bold text-white leading-snug line-clamp-2">
            {liveConfig.promoTitle ||
              'Spill Gudang Tas Import Terbaru - Diskon Khusus Live!'}
          </p>

          <div className="space-y-2">
            {liveConfig.isTikTokLive && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-400/50 text-white text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Gabung TikTok Live</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
              </a>
            )}

            {liveConfig.isShopeeLive && (
              <a
                href={shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Tonton Shopee Live</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Sleek Floating Pill with Blinking Red LIVE Indicator & Quick Direct Links */}
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/95 backdrop-blur-md text-white border border-red-500/60 shadow-xl">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer"
          title="Klik untuk detail Live Streaming"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span>🔴 LIVE</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>

        {liveConfig.isTikTokLive && (
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold inline-flex items-center gap-1 transition-colors"
            title="Buka TikTok Live di tab baru"
          >
            <span>TikTok</span>
            <ExternalLink className="w-3 h-3 text-rose-400" />
          </a>
        )}

        {liveConfig.isShopeeLive && (
          <a
            href={shopeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
            title="Buka Shopee Live di tab baru"
          >
            <span>Shopee</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
