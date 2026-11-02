import React, { useState } from 'react';
import {
  Radio,
  ExternalLink,
  Calendar,
  Sparkles,
  ShoppingBag,
  Settings,
  CheckCircle2,
  Flame,
  Users,
  X,
  ArrowUpRight,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { LiveShoppingConfig } from '../types/product';
import { createLiveStudioPosterSvg } from '../utils/bagStudioSvg';

interface LiveShoppingSectionProps {
  liveConfig: LiveShoppingConfig;
  isAdminMode?: boolean;
  onEditLiveConfig?: () => void;
  onQuickTogglePlatform?: (platform: 'tiktok' | 'shopee') => void;
}

export const LiveShoppingSection: React.FC<LiveShoppingSectionProps> = ({
  liveConfig,
  isAdminMode = false,
  onEditLiveConfig,
  onQuickTogglePlatform,
}) => {
  const isAnyLiveActive = liveConfig.isTikTokLive || liveConfig.isShopeeLive;
  const posterImage = liveConfig.posterImageUri || createLiveStudioPosterSvg(0);

  return (
    <section
      id="tgi-live-studio"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4"
    >
      <div className="relative overflow-hidden rounded-none border border-zinc-800 bg-zinc-950 text-white shadow-xl">
        {/* Subtle decorative background accents */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-rose-600/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden="true"
        />

        {/* Admin Mode Quick Controls Bar */}
        {isAdminMode && (
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
              <span>Kontrol Cepat TGI Live Shopping Studio:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onQuickTogglePlatform && (
                <>
                  <button
                    type="button"
                    onClick={() => onQuickTogglePlatform('tiktok')}
                    className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      liveConfig.isTikTokLive
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        liveConfig.isTikTokLive ? 'bg-white animate-ping' : 'bg-zinc-500'
                      }`}
                    />
                    TikTok Live: {liveConfig.isTikTokLive ? 'ON AIR' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickTogglePlatform('shopee')}
                    className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      liveConfig.isShopeeLive
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        liveConfig.isShopeeLive ? 'bg-white animate-ping' : 'bg-zinc-500'
                      }`}
                    />
                    Shopee Live: {liveConfig.isShopeeLive ? 'ON AIR' : 'OFF'}
                  </button>
                </>
              )}
              {onEditLiveConfig && (
                <button
                  type="button"
                  onClick={onEditLiveConfig}
                  className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Atur Link & Jadwal Live
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 lg:p-8 items-center">
          {/* Left Column: Live Status, Promo Info & Direct App Link CTAs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Status Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isAnyLiveActive ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-[11px] font-black tracking-widest uppercase shadow-lg shadow-rose-600/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  ON AIR • SEDANG LIVE SEKARANG
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-bold tracking-widest uppercase">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  TGI LIVE SHOPPING STUDIO
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-amber-400 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spill Detail Bahan, Jahitan & Real-Pic Gudang</span>
              </div>
            </div>

            {/* Main Headline & Schedule */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                SIARAN LANGSUNG GUDANG IMPORT TGI JAKARTA
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                {liveConfig.promoTitle ||
                  'Spill Real-Pic Gudang & Klaim Voucher Grosir Eksklusif di Live!'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                Ingin cek tekstur kulit sintetis grade A, kapasitas ruang dalam tas, hingga berat asli sebelum order partai besar? Gabung ke sesi{' '}
                <span className="text-white font-semibold">Live Spill Gudang TGI</span> dan minta host kami review kode SKU pilihan Anda secara langsung.
              </p>
            </div>

            {/* Schedule & Official Account Info Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Jadwal Siaran Harian
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {liveConfig.dailySchedule || 'Setiap Hari • 10:00 & 19:00 WIB'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Akun TikTok Resmi
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {liveConfig.tiktokUsername || '@tasgrosirimport.id'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5">
                <ShoppingBag className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                    Toko Shopee Live
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {liveConfig.shopeeStoreName || 'Tas Grosir Import Official'}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Direct App Link CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <a
                href={liveConfig.tiktokLiveUrl || 'https://www.tiktok.com/@tiktok/live'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <span>🔴 GABUNG LIVE TIKTOK SEKARANG</span>
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <a
                href={liveConfig.shopeeLiveUrl || 'https://live.shopee.co.id'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-orange-500/60 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>TONTON DI SHOPEE LIVE</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </a>
            </div>

            {/* Trust Footnote */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-zinc-400 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Bisa Request Spill Kode SKU di Kolom Chat
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Harga Grosir Seri & Partai Berlaku Selama Sesi Live
              </span>
            </div>
          </div>

          {/* Right Column: Studio Live Visual Banner */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden border border-zinc-800 bg-zinc-900">
              {/* Studio Header Overlay */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/90 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAnyLiveActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200">
                    Studio Siaran Langsung TGI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reseller Online • Gudang TGI</span>
                </div>
              </div>

              {/* Poster Visual with Overlay Info */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-950">
                <img
                  src={posterImage}
                  alt="TGI Live Shopping Studio Preview"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />

                {/* Top Left Live Status Pill on Poster */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-rose-600/95 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {liveConfig.isTikTokLive
                      ? 'TIKTOK LIVE ON AIR'
                      : liveConfig.isShopeeLive
                      ? 'SHOPEE LIVE ON AIR'
                      : 'STUDIO READY'}
                  </span>
                  <span className="px-2 py-1 bg-black/75 backdrop-blur-xs text-amber-300 text-[10px] font-bold border border-white/10">
                    100% Real-Pic Gudang
                  </span>
                </div>

                {/* Bottom Overlay: Quick Chat / Request Spill Action */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 bg-zinc-950/85 backdrop-blur-xs border border-zinc-800 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Interaksi Langsung Bersama Host Gudang
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      Ketik kode SKU di chat live untuk cek detail dalam tas
                    </div>
                  </div>
                  <a
                    href={liveConfig.tiktokLiveUrl || 'https://www.tiktok.com/@tiktok/live'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Buka Live</span>
                  </a>
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

export const FloatingLiveWidget: React.FC<FloatingLiveWidgetProps> = ({ liveConfig }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const isAnyLive = liveConfig.isTikTokLive || liveConfig.isShopeeLive;
  if (!isAnyLive || isDismissed) {
    return null;
  }

  const activeUrl = liveConfig.isTikTokLive
    ? liveConfig.tiktokLiveUrl
    : liveConfig.shopeeLiveUrl;

  const activePlatformLabel = liveConfig.isTikTokLive ? 'TikTok Live' : 'Shopee Live';

  return (
    <div className="fixed bottom-5 left-4 z-40 max-w-xs">
      <div className="relative flex items-center gap-3 bg-zinc-950 text-white border border-rose-500/60 shadow-2xl px-3.5 py-2.5">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Tutup notifikasi live"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center border border-zinc-700 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="relative flex items-center justify-center w-9 h-9 bg-rose-600 shrink-0">
          <Radio className="w-4 h-4 text-white animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
        </div>

        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
              SEDANG LIVE • {activePlatformLabel}
            </span>
          </div>
          <div className="text-xs font-bold text-white truncate max-w-[180px]">
            Spill Gudang TGI Sedang Berlangsung!
          </div>
          <a
            href={activeUrl || 'https://www.tiktok.com/@tiktok/live'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 mt-0.5"
          >
            <span>Gabung Sekarang</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
