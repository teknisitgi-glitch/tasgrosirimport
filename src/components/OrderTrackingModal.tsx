import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Truck,
  PackageCheck,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Clock,
  MapPin,
  Box,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Pencil,
  Save,
} from 'lucide-react';
import {
  OrderRecord,
  OrderShipmentStatus,
  StoreConfig,
} from '../types/product';
import { formatRupiah, cleanWhatsAppNumber } from '../utils/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  storeConfig: StoreConfig;
  isAdminMode: boolean;
  onUpdateOrder?: (updatedOrder: OrderRecord) => void;
  onShowToast?: (msg: string) => void;
}

const SHIPMENT_STAGES: {
  id: OrderShipmentStatus;
  label: string;
  desc: string;
}[] = [
  {
    id: 'Diproses Gudang',
    label: 'Order Diterima',
    desc: 'Nota pesanan diverifikasi Admin Gudang TGI',
  },
  {
    id: 'Packing Karung QC',
    label: 'Lolos QC & Packing',
    desc: 'Lolos QC 3 tahap & segel karung kargo tebal',
  },
  {
    id: 'Dikirim Kargo',
    label: 'Dikirim Ekspedisi Kargo',
    desc: 'Resi kargo aktif & paket dalam perjalanan menuju kota tujuan',
  },
  {
    id: 'Selesai Diterima',
    label: 'Tiba di Tujuan',
    desc: 'Paket partai besar telah diterima oleh reseller / toko',
  },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  storeConfig,
  isAdminMode,
  onUpdateOrder,
  onShowToast,
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders[0]?.id || ''
  );
  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  // Admin inline resi editor state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editResiNumber, setEditResiNumber] = useState<string>('');
  const [editCourierName, setEditCourierName] = useState<string>('');
  const [editStatus, setEditStatus] =
    useState<OrderShipmentStatus>('Dikirim Kargo');

  const filteredOrders = useMemo(() => {
    const q = searchInput.trim().toLowerCase().replace(/^#/, '');
    if (!q) return orders;
    return orders.filter((ord) => {
      const ref = (ord.referenceCode || '').toLowerCase();
      const phone = (ord.customerPhone || '').toLowerCase();
      const name = (ord.customerName || '').toLowerCase();
      const resi = (ord.trackingNumber || '').toLowerCase();
      const city = (ord.customerCity || '').toLowerCase();
      return (
        ref.includes(q) ||
        phone.includes(q) ||
        name.includes(q) ||
        resi.includes(q) ||
        city.includes(q)
      );
    });
  }, [orders, searchInput]);

  if (!isOpen) return null;

  const activeOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) ||
    filteredOrders[0] ||
    null;

  const currentStageIndex = activeOrder
    ? Math.max(
        0,
        SHIPMENT_STAGES.findIndex(
          (s) => s.id === (activeOrder.orderStatus || 'Diproses Gudang')
        )
      )
    : 0;

  const handleCopyTracking = async (resi: string) => {
    try {
      await navigator.clipboard.writeText(resi);
      setCopiedResi(resi);
      onShowToast?.(`Nomor resi kargo ${resi} berhasil disalin!`);
      window.setTimeout(() => setCopiedResi(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleStartEditOrder = (ord: OrderRecord) => {
    setEditingOrderId(ord.id);
    setEditResiNumber(ord.trackingNumber || '');
    setEditCourierName(ord.cargoCourier || 'JNE Trucking (JTR)');
    setEditStatus(ord.orderStatus || 'Dikirim Kargo');
  };

  const handleSaveOrderEdit = (ord: OrderRecord) => {
    if (!onUpdateOrder) return;
    const updated: OrderRecord = {
      ...ord,
      trackingNumber: editResiNumber.trim() || ord.trackingNumber,
      cargoCourier: editCourierName.trim() || ord.cargoCourier,
      orderStatus: editStatus,
    };
    onUpdateOrder(updated);
    setEditingOrderId(null);
    onShowToast?.(
      `Status & Nomor Resi pesanan #${ord.referenceCode} berhasil diperbarui!`
    );
  };

  const cleanWa = cleanWhatsAppNumber(storeConfig.whatsappNumber);

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden border border-zinc-200 shadow-2xl my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-zinc-950 text-white flex items-center justify-between gap-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                TGI CARGO TRACKING CENTER · JNE JTR / INDAH CARGO / SICEPAT GOKIL
              </span>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide">
                CEK RESI KARGO & STATUS PESANAN GROSIR
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal cek resi"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Input Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                htmlFor="order-tracking-search"
                className="text-xs font-bold uppercase tracking-wider text-zinc-800"
              >
                Lacak Nomor Pesanan / Nomor WhatsApp / Resi Kargo:
              </label>
              <span className="text-[11px] font-mono text-zinc-500">
                Tersedia {orders.length} data transaksi terdaftar
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="order-tracking-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ketik No. Order (misal: TGI-882410), No. WA (081234567890), atau No. Resi (JTR-8802941852)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs sm:text-sm font-medium text-zinc-900 focus:border-zinc-950 focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Sample Order Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] font-mono font-bold text-zinc-500">
                Pilih Cepat Pesanan:
              </span>
              {orders.slice(0, 5).map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setSearchInput('');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-950 text-amber-400 border-zinc-950 shadow-2xs'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                    }`}
                  >
                    #{ord.referenceCode} · {ord.cargoCourier?.split(' ')[0] || 'Kargo'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Order Tracking Result */}
          {!activeOrder ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
              <Box className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-display text-lg font-bold text-zinc-900">
                DATA PESANAN TIDAK DITEMUKAN
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Tidak ditemukan pesanan dengan kata kunci "{searchInput}". Pastikan Nomor Referensi Order atau Nomor WhatsApp sesuai, atau klik salah satu nomor pesanan di atas.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-xs">
              {/* Order Banner Header */}
              <div className="p-4 sm:p-5 bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-amber-400">
                      #{activeOrder.referenceCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold uppercase ${
                        activeOrder.orderStatus === 'Selesai Diterima'
                          ? 'bg-emerald-500 text-zinc-950'
                          : activeOrder.orderStatus === 'Dikirim Kargo'
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {activeOrder.orderStatus || 'Diproses Gudang'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">
                    {activeOrder.customerName}{' '}
                    {activeOrder.customerPhone &&
                      activeOrder.customerPhone !== '-' && (
                        <span className="font-mono font-normal text-zinc-400">
                          ({activeOrder.customerPhone})
                        </span>
                      )}
                  </p>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Tujuan: {activeOrder.customerCity}</span>
                  </p>
                </div>

                {/* Cargo Resi Box */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:items-end justify-between gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Ekspedisi:{' '}
                    <strong className="text-white">
                      {activeOrder.cargoCourier || 'JNE Trucking (JTR)'}
                    </strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-black text-amber-400 tracking-wider">
                      RESI: {activeOrder.trackingNumber || 'MENUNGGU-INPUT'}
                    </span>
                    {activeOrder.trackingNumber && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyTracking(activeOrder.trackingNumber!)
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-white cursor-pointer"
                      >
                        {copiedResi === activeOrder.trackingNumber ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Resi</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Mode Inline Resi & Status Editor */}
              {isAdminMode && (
                <div className="px-4 sm:px-5 py-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {editingOrderId === activeOrder.id ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-0.5">
                          Ekspedisi Kargo
                        </label>
                        <input
                          type="text"
                          value={editCourierName}
                          onChange={(e) => setEditCourierName(e.target.value)}
                          placeholder="JNE Trucking (JTR) / Indah Cargo"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-0.5">
                          Nomor Resi Kargo
                        </label>
                        <input
                          type="text"
                          value={editResiNumber}
                          onChange={(e) => setEditResiNumber(e.target.value)}
                          placeholder="JTR-8802941852"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-0.5">
                          Status Pengiriman
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as OrderShipmentStatus)
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-bold"
                        >
                          {SHIPMENT_STAGES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.id}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveOrderEdit(activeOrder)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-950 text-amber-400 font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Resi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingOrderId(null)}
                          className="py-1.5 px-2.5 rounded-lg border border-zinc-300 bg-white text-zinc-700 text-xs font-semibold cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-amber-950">
                        🔧 Mode Admin Aktif: Anda dapat mengupdate Nomor Resi Kargo & Status Pengiriman pesanan ini.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEditOrder(activeOrder)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-amber-400 font-bold text-xs cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Update Resi / Status</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Visual 4-Step Cargo Shipment Progress Timeline */}
              <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/60">
                <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  Tahapan Pengiriman Partai Besar & Kargo:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {SHIPMENT_STAGES.map((stage, idx) => {
                    const isPassed = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div
                        key={stage.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs ring-2 ring-amber-400/50'
                            : isPassed
                            ? 'bg-emerald-50/90 text-emerald-950 border-emerald-200'
                            : 'bg-white text-zinc-400 border-zinc-200 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-amber-400 text-zinc-950'
                                : isPassed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            Tahap {idx + 1}
                          </span>
                          {isPassed && (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isCurrent
                                  ? 'text-amber-400'
                                  : 'text-emerald-600'
                              }`}
                            />
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-white'
                              : isPassed
                              ? 'text-zinc-900'
                              : 'text-zinc-500'
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p
                          className={`text-[11px] mt-0.5 leading-snug ${
                            isCurrent
                              ? 'text-zinc-300'
                              : isPassed
                              ? 'text-zinc-600'
                              : 'text-zinc-400'
                          }`}
                        >
                          {stage.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Item Summary & Metrics */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Rincian Barang & Variasi Ukuran/Warna:
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-900 bg-zinc-50 p-3 rounded-xl border border-zinc-200 leading-relaxed font-mono">
                    {activeOrder.itemsSummary}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 pt-1">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-zinc-800">
                      <PackageCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>Total: {activeOrder.totalQuantity} pcs</span>
                    </span>
                    {activeOrder.totalWeightKg && (
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-zinc-800">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Berat Kargo: ~{activeOrder.totalWeightKg} kg</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Tanggal Order:{' '}
                        {new Date(activeOrder.createdAt).toLocaleDateString(
                          'id-ID',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="md:col-span-4 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-500 font-semibold">
                      Total Nilai Order:
                    </span>
                    <span className="font-mono text-base sm:text-lg font-extrabold text-zinc-950 tabular-nums">
                      {formatRupiah(activeOrder.totalPayable)}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                      `Halo Admin TGI, saya ingin konfirmasi / tanya status pengiriman untuk Nomor Pesanan #${
                        activeOrder.referenceCode
                      } (Resi: ${
                        activeOrder.trackingNumber || '-'
                      }) atas nama ${activeOrder.customerName}. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Tanya Admin via WA</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Complete Order & Resi History Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                Riwayat Transaksi & Resi Kargo Terakhir ({filteredOrders.length})
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tersimpan Otomatis</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {filteredOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 border-zinc-950 ring-1 ring-zinc-950'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-zinc-950">
                          #{ord.referenceCode}
                        </span>
                        <span className="text-xs font-bold text-zinc-800">
                          {ord.customerName}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          ({ord.customerCity})
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate">
                        {ord.cargoCourier || 'Ekspedisi Kargo'} · Resi:{' '}
                        <strong className="text-zinc-900">
                          {ord.trackingNumber || '-'}
                        </strong>{' '}
                        · {ord.totalQuantity} pcs
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          ord.orderStatus === 'Selesai Diterima'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'Dikirim Kargo'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {ord.orderStatus || 'Diproses Gudang'}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-zinc-950 tabular-nums">
                        {formatRupiah(ord.totalPayable)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
