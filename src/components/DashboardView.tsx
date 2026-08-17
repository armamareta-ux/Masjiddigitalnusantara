import React from "react";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  Tv,
  Image as ImageIcon,
  Sparkles,
  FileText,
  TrendingUp,
  Layers,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  Wallet,
  Coins,
} from "lucide-react";
import { MosqueBranding, MosqueEvent, CashTransaction, HistoryRecord, IdeaItem } from "../types";
import { calculatePrayerTimes, getNextPrayer, getHijriDateString } from "../utils/prayerTimes";

export interface DashboardViewProps {
  branding: MosqueBranding;
  events: MosqueEvent[];
  transactions: CashTransaction[];
  records: HistoryRecord[];
  ideas: IdeaItem[];
  onNavigate: (viewKey: string, prefill?: Record<string, string>) => void;
  onOpenTvMode: () => void;
}

export function DashboardView({
  branding,
  events,
  transactions,
  records,
  ideas,
  onNavigate,
  onOpenTvMode,
}: DashboardViewProps) {
  const hijriStr = getHijriDateString(new Date());
  const prayerTimes = calculatePrayerTimes(new Date(), -6.2088, 106.8456, 7);
  const nextPrayer = getNextPrayer(prayerTimes);

  // Financial calculations
  const totalMasuk = transactions
    .filter((t) => t.jenis === "Pemasukan")
    .reduce((sum, t) => sum + Number(t.nominal || 0), 0);
  const totalKeluar = transactions
    .filter((t) => t.jenis === "Pengeluaran")
    .reduce((sum, t) => sum + Number(t.nominal || 0), 0);
  const saldoKas = totalMasuk - totalKeluar;

  const upcomingEvents = events
    .filter((e) => e.status !== "Selesai" && e.status !== "Dibatalkan")
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(0, 4);

  const recentTransactions = [...transactions].slice(-4).reverse();

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0D110D] text-[#E6E8E6] p-6 sm:p-8 shadow-xl border border-[#C19D60]/30">
        {/* Subtle geometric pattern decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-96 h-96 text-[#C19D60]">
            <polygon points="100,10 190,100 100,190 10,100" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="100,30 170,100 100,170 30,100" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#C19D60]/15 text-[#C19D60] border border-[#C19D60]/30 rounded-full text-[11px] font-mono font-bold tracking-wide">
                {hijriStr}
              </span>
              <span className="px-3 py-1 bg-[#141A14] text-[#A3ABA3] border border-[#C19D60]/20 rounded-full text-[11px] font-semibold">
                Sistem DKM Digital 2026
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#C19D60] tracking-wide">
              {branding.namaMasjid || "Masjid Digital Nusantara"}
            </h1>
            <p className="text-xs sm:text-sm text-[#A3ABA3] leading-relaxed">
              Pusat otomasi dakwah, khutbah Jumat, pembukuan kas masjid, kalender kegiatan, dan digital signage masjid ramah jamaah.
            </p>
          </div>

          {/* Quick TV & Prayer Status Card */}
          <div className="bg-[#0A0D0A] border border-[#C19D60]/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md text-center shrink-0 w-full md:w-auto min-w-[240px] space-y-3 shadow-md">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A3ABA3]">
                Waktu Shalat Berikutnya:
              </span>
              <div className="text-xl font-bold font-serif text-[#C19D60]">
                {nextPrayer.name} • {nextPrayer.time}
              </div>
              <p className="text-[10px] text-[#A3ABA3] font-mono">
                Hitung Mundur: {nextPrayer.countdown}
              </p>
            </div>

            <button
              onClick={onOpenTvMode}
              className="w-full py-2 bg-[#C19D60] hover:bg-[#D4AF6E] text-[#0A0D0A] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Tv className="w-4 h-4" /> Buka Layar TV Digital
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Kas */}
        <div
          onClick={() => onNavigate("kas-masjid")}
          className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#C19D60]/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#A3ABA3] text-xs">
            <span className="font-semibold text-[#E6E8E6]/80">Saldo Kas Aktif</span>
            <div className="p-2 rounded-xl bg-[#C19D60]/10 text-[#C19D60] border border-[#C19D60]/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#E6E8E6] truncate">
            Rp {saldoKas.toLocaleString("id-ID")}
          </div>
          <span className="text-[10px] text-[#A3ABA3] block truncate">
            Infaq Masuk: Rp {totalMasuk.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Naskah Tersimpan */}
        <div
          onClick={() => onNavigate("riwayat")}
          className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#C19D60]/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#A3ABA3] text-xs">
            <span className="font-semibold text-[#E6E8E6]/80">Arsip Naskah &amp; Dokumen</span>
            <div className="p-2 rounded-xl bg-[#C19D60]/10 text-[#C19D60] border border-[#C19D60]/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#E6E8E6]">
            {records.length} Dokumen
          </div>
          <span className="text-[10px] text-[#A3ABA3] block">Khutbah, Proposal &amp; Surat</span>
        </div>

        {/* Agenda Terjadwal */}
        <div
          onClick={() => onNavigate("kalender-kegiatan")}
          className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#C19D60]/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#A3ABA3] text-xs">
            <span className="font-semibold text-[#E6E8E6]/80">Agenda Kegiatan</span>
            <div className="p-2 rounded-xl bg-[#C19D60]/10 text-[#C19D60] border border-[#C19D60]/20 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#E6E8E6]">
            {events.length} Agenda
          </div>
          <span className="text-[10px] text-[#A3ABA3] block">Kajian &amp; Syiar Masjid</span>
        </div>

        {/* Bank Ide */}
        <div
          onClick={() => onNavigate("bank-ide")}
          className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-[#C19D60]/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-[#A3ABA3] text-xs">
            <span className="font-semibold text-[#E6E8E6]/80">Bank Ide Program</span>
            <div className="p-2 rounded-xl bg-[#C19D60]/10 text-[#C19D60] border border-[#C19D60]/20 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#E6E8E6]">
            {ideas.length} Gagasan
          </div>
          <span className="text-[10px] text-[#A3ABA3] block">Rencana Kerja Takmir</span>
        </div>
      </div>

      {/* Quick Access Feature Grid */}
      <div className="space-y-3">
        <span className="font-mono text-xs font-bold text-[#C19D60]/80 uppercase tracking-wider">
          Pusat Akses Cepat Fitur Masjid
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate("khutbah-jumat")}
            className="p-4 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl hover:border-[#C19D60]/60 hover:bg-[#C19D60]/10 transition-all text-left space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C19D60]/15 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#E6E8E6] font-serif">Khutbah Jumat</h4>
              <p className="text-[10px] text-[#A3ABA3]">Rukun &amp; Dalil Shahih</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("ceramah-kajian")}
            className="p-4 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl hover:border-[#C19D60]/60 hover:bg-[#C19D60]/10 transition-all text-left space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C19D60]/15 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#E6E8E6] font-serif">Ceramah &amp; Kajian</h4>
              <p className="text-[10px] text-[#A3ABA3]">Kultum &amp; Tausiyah</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("poster")}
            className="p-4 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl hover:border-[#C19D60]/60 hover:bg-[#C19D60]/10 transition-all text-left space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C19D60]/15 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#E6E8E6] font-serif">Poster Studio</h4>
              <p className="text-[10px] text-[#A3ABA3]">Vektor AI &amp; WA Copy</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("admin-proposal")}
            className="p-4 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl hover:border-[#C19D60]/60 hover:bg-[#C19D60]/10 transition-all text-left space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C19D60]/15 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#E6E8E6] font-serif">Proposal &amp; Surat</h4>
              <p className="text-[10px] text-[#A3ABA3]">Dokumen Resmi DKM</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("admin-rab")}
            className="p-4 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl hover:border-[#C19D60]/60 hover:bg-[#C19D60]/10 transition-all text-left space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C19D60]/15 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#E6E8E6] font-serif">Kalkulator RAB</h4>
              <p className="text-[10px] text-[#A3ABA3]">Anggaran Kegiatan</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("jadwal-sholat")}
            className="p-4 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl hover:border-[#C19D60]/60 hover:bg-[#C19D60]/10 transition-all text-left space-y-2 group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C19D60]/15 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#E6E8E6] font-serif">Jadwal &amp; Kiblat</h4>
              <p className="text-[10px] text-[#A3ABA3]">Kemenag &amp; Kompas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Events & Recent Cashbook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#C19D60]/20 pb-3">
            <span className="font-bold text-sm font-serif text-[#C19D60] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#C19D60]" /> Agenda Kegiatan Terdekat
            </span>
            <button
              onClick={() => onNavigate("kalender-kegiatan")}
              className="text-xs text-[#C19D60] hover:text-[#E5C388] font-semibold flex items-center gap-1"
            >
              Lihat Kalender <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-[#A3ABA3] py-6 text-center">Belum ada agenda kegiatan terdaftar.</p>
          ) : (
            <div className="space-y-2.5">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15 flex items-center justify-between text-xs hover:border-[#C19D60]/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-[#E6E8E6] font-serif">{ev.namaKegiatan}</h5>
                    <p className="text-[11px] text-[#A3ABA3]">
                      {ev.tanggal} • {ev.waktu} {ev.pic ? `• PIC: ${ev.pic}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#E5C388] bg-[#C19D60]/20 border border-[#C19D60]/30 px-2.5 py-0.5 rounded-full">
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Cash Flow */}
        <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#C19D60]/20 pb-3">
            <span className="font-bold text-sm font-serif text-[#C19D60] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#C19D60]" /> Mutasi Kas Terbaru
            </span>
            <button
              onClick={() => onNavigate("kas-masjid")}
              className="text-xs text-[#C19D60] hover:text-[#E5C388] font-semibold flex items-center gap-1"
            >
              Buku Kas Lengkap <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-[#A3ABA3] py-6 text-center">Belum ada transaksi kas dicatat.</p>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-[#E6E8E6]">{tx.deskripsi || tx.keterangan || tx.jenis}</h5>
                    <p className="text-[11px] text-[#A3ABA3]">
                      {tx.tanggal} • <span className="font-medium text-[#C19D60]">{tx.jenis}</span>
                    </p>
                  </div>
                  <div
                    className={`font-mono font-bold text-right ${
                      tx.jenis === "Pemasukan" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.jenis === "Pemasukan" ? "+" : "-"} Rp {Number(tx.nominal || 0).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
