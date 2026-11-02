import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  Truck,
  PackageCheck,
  QrCode,
  Layers,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  FileText,
  ArrowRight,
  HelpCircle,
  Pencil,
  Megaphone,
} from 'lucide-react';
import { StoreConfig, ResellerGuideConfig } from '../types/product';
import { DEFAULT_RESELLER_GUIDE_CONFIG } from '../services/productService';
import { cleanWhatsAppNumber } from '../utils/formatters';

interface ResellerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
  guideConfig?: ResellerGuideConfig;
  isAdminMode?: boolean;
  onEditGuide?: () => void;
  onStartShopping?: () => void;
}

type GuideTab = 'semua' | 'grosir' | 'dropship' | 'kargo';

export const ResellerGuideModal: React.FC<ResellerGuideModalProps> = ({
  isOpen,
  onClose,
  storeConfig,
  guideConfig,
  isAdminMode = false,
  onEditGuide,
  onStartShopping,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('semua');

  if (!isOpen) return null;

  const guide: ResellerGuideConfig = guideConfig || DEFAULT_RESELLER_GUIDE_CONFIG;
  const moqPoints =
    Array.isArray(guide.moqPoints) && guide.moqPoints.length > 0
      ? guide.moqPoints
      : DEFAULT_RESELLER_GUIDE_CONFIG.moqPoints;
  const dropshipSteps =
    Array.isArray(guide.dropshipSteps) && guide.dropshipSteps.length > 0
      ? guide.dropshipSteps
      : DEFAULT_RESELLER_GUIDE_CONFIG.dropshipSteps;
  const cargoTable =
    Array.isArray(guide.cargoTable) && guide.cargoTable.length > 0
      ? guide.cargoTable
      : DEFAULT_RESELLER_GUIDE_CONFIG.cargoTable;

  const waNumber = cleanWhatsAppNumber(storeConfig.whatsappNumber);
  const waDropshipUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Admin ${storeConfig.storeName}, saya ingin mendaftar sebagai Mitra Reseller / Dropshipper (Resi Otomatis Marketplace) dan meminta katalog foto polos terbaru. Mohon panduannya. Terima kasih!`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reseller-guide-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200 shadow-2xl my-4"
      >
        {/* Top Modal Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 bg-zinc-950 text-white flex items-start sm:items-center justify-between gap-4 border-b border-zinc-800 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>OFFICIAL B2B WHOLESALE & DROPSHIP CENTER</span>
              </div>
              {isAdminMode && onEditGuide && (
                <button
                  type="button"
                  onClick={onEditGuide}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Isi Panduan & Tabel Kargo</span>
                </button>
              )}
            </div>
            <h2
              id="reseller-guide-title"
              className="font-display text-lg sm:text-2xl font-bold tracking-wide text-white"
            >
              {guide.headerTitle || DEFAULT_RESELLER_GUIDE_CONFIG.headerTitle}
            </h2>
            <p className="text-xs text-zinc-400">
              {guide.headerSubtitle || DEFAULT_RESELLER_GUIDE_CONFIG.headerSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan reseller"
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Filter Tabs */}
        <div className="px-5 sm:px-7 py-2.5 bg-zinc-100 border-b border-zinc-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'semua', label: 'Semua Panduan Lengkap', icon: BookOpen },
            { id: 'grosir', label: '1. Syarat Grosir (MOQ 6 Pcs)', icon: Layers },
            {
              id: 'dropship',
              label: '2. Sistem Dropship & Resi Otomatis',
              icon: QrCode,
            },
            {
              id: 'kargo',
              label: '3. Estimasi Durasi Kargo Indonesia',
              icon: Truck,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as GuideTab)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-amber-400 shadow-2xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-zinc-800">
          {/* Custom Admin Rich-Text / Announcement Note */}
          {guide.customAnnouncement && guide.customAnnouncement.trim() !== '' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300/90 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 mt-0.5">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
                  CATATAN & INFORMASI RESMI GUDANG PUSAT TGI
                </span>
                <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-line">
                  {guide.customAnnouncement}
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: SYARAT GROSIR & MOQ 6 PCS */}
          {(activeTab === 'semua' || activeTab === 'grosir') && (
            <section className="space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-zinc-200 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-mono font-black text-sm shrink-0">
                  01
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-zinc-950 uppercase tracking-wide">
                    {guide.moqSectionTitle ||
                      DEFAULT_RESELLER_GUIDE_CONFIG.moqSectionTitle}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {guide.moqSectionSubtitle ||
                      DEFAULT_RESELLER_GUIDE_CONFIG.moqSectionSubtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {moqPoints.map((pt, idx) => (
                  <div
                    key={`moq-${idx}`}
                    className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-zinc-950">
                      {idx === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : idx === 1 ? (
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>{pt.title}</span>
                    </span>
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                      {pt.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: SISTEM DROPSHIP & DUKUNGAN RESI OTOMATIS MARKETPLACE */}
          {(activeTab === 'semua' || activeTab === 'dropship') && (
            <section className="space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-zinc-200 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-amber-400 flex items-center justify-center font-mono font-black text-sm shrink-0">
                  02
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-zinc-950 uppercase tracking-wide">
                    {guide.dropshipSectionTitle ||
                      DEFAULT_RESELLER_GUIDE_CONFIG.dropshipSectionTitle}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {guide.dropshipSectionSubtitle ||
                      DEFAULT_RESELLER_GUIDE_CONFIG.dropshipSectionSubtitle}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400">
                      Alur Kerja Resi Otomatis / Cashless Marketplace (4 Langkah Mudah)
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                    WHITE-LABEL · TANPA NAMA TGI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {dropshipSteps.map((st, idx) => (
                    <div
                      key={`step-${idx}`}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5"
                    >
                      <span className="font-mono text-[10px] font-bold text-amber-400 uppercase">
                        {st.stepLabel || `Langkah ${idx + 1}`}
                      </span>
                      <p className="text-xs font-bold text-white">{st.title}</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">
                        {st.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {guide.dropshipCutoffNote ||
                        DEFAULT_RESELLER_GUIDE_CONFIG.dropshipCutoffNote}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      {guide.dropshipPackingNote ||
                        DEFAULT_RESELLER_GUIDE_CONFIG.dropshipPackingNote}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                    <PackageCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {guide.dropshipCouriersNote ||
                        DEFAULT_RESELLER_GUIDE_CONFIG.dropshipCouriersNote}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: ESTIMASI DURASI PENGIRIMAN KARGO PARTAI BESAR KE SELURUH INDONESIA */}
          {(activeTab === 'semua' || activeTab === 'kargo') && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-2.5 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-sm shrink-0">
                    03
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-zinc-950 uppercase tracking-wide">
                      {guide.cargoSectionTitle ||
                        DEFAULT_RESELLER_GUIDE_CONFIG.cargoSectionTitle}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {guide.cargoSectionSubtitle ||
                        DEFAULT_RESELLER_GUIDE_CONFIG.cargoSectionSubtitle}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-bold">
                  {guide.cargoSackBadge ||
                    DEFAULT_RESELLER_GUIDE_CONFIG.cargoSackBadge}
                </span>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-950 text-white font-mono text-[11px] uppercase">
                      <th className="py-3 px-3.5 border-b border-zinc-800">
                        Zona Wilayah & Kota Utama
                      </th>
                      <th className="py-3 px-3 border-b border-zinc-800">
                        Ekspedisi Lokal (Kapuk / Tanah Abang)
                      </th>
                      <th className="py-3 px-3 border-b border-zinc-800">
                        JNE JTR / Dakota / SiCepat Gokil
                      </th>
                      <th className="py-3 px-3 border-b border-zinc-800">
                        Indah Logistik Cargo
                      </th>
                      <th className="py-3 px-3.5 border-b border-zinc-800 text-right">
                        Kisaran Tarif Kargo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {cargoTable.map((row, idx) => (
                      <tr
                        key={row.id || `${row.region}-${idx}`}
                        className="hover:bg-zinc-50 transition-colors"
                      >
                        <td className="py-3 px-3.5 align-top">
                          <p className="font-bold text-zinc-950 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{row.region}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            {row.cities}
                          </p>
                        </td>
                        <td className="py-3 px-3 align-top font-mono font-semibold text-emerald-700">
                          {row.ekspedisiLokal}
                        </td>
                        <td className="py-3 px-3 align-top font-mono font-semibold text-zinc-900">
                          {row.jtrDakota}
                        </td>
                        <td className="py-3 px-3 align-top font-mono text-zinc-700">
                          {row.indahCargo}
                        </td>
                        <td className="py-3 px-3.5 align-top text-right font-mono font-bold text-zinc-950 whitespace-nowrap">
                          {row.estRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {guide.cargoTipsNote ||
                      DEFAULT_RESELLER_GUIDE_CONFIG.cargoTipsNote}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Bottom Sticky Footer CTA */}
        <div className="px-5 sm:px-7 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-600">
            <span className="font-bold text-zinc-950 block">
              Butuh bantuan registrasi Reseller / kirim PDF Resi Otomatis?
            </span>
            <span>
              Tim Admin Gudang TGI siap melayani konsultasi grosir & kargo setiap hari.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={waDropshipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Daftar Reseller / Dropship via WA</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartShopping?.();
              }}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-400 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mulai Belanja Grosir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
