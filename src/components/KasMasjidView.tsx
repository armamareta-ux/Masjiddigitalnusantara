import React, { useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { CashTransaction, MosqueBranding } from "../types";
import { callGeminiAi } from "../utils/ai";

export interface KasMasjidViewProps {
  transactions: CashTransaction[];
  onAddTransaction: (t: CashTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  branding: MosqueBranding;
  onOpenDocEngine: (content: string, title: string) => void;
}

const KATEGORI_PEMASUKAN = [
  "Infaq Kotak Amal Jumat",
  "Infaq Kotak Amal Harian",
  "Donasi Transfer Bank",
  "Infaq Renovasi / Pembangunan",
  "Zakat Fitrah & Mal",
  "Wakaf Produktif",
  "Infaq Parkir & Kegiatan",
  "Lain-lain",
];

const KATEGORI_PENGELUARAN = [
  "Listrik, Air & Wi-Fi",
  "Honor Imam, Muadzin & Marbot",
  "Kebersihan & Peralatan Masjid",
  "Konsumsi & Buka Puasa / Jumat Berkah",
  "Santunan Yatim & Dhuafa",
  "Kajian & Pembicara",
  "Perbaikan / Renovasi Fasilitas",
  "Administrasi & Surat Menyurat",
  "Lain-lain",
];

export function KasMasjidView({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  branding,
  onOpenDocEngine,
}: KasMasjidViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<"Pemasukan" | "Pengeluaran">("Pemasukan");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [jenis, setJenis] = useState(KATEGORI_PEMASUKAN[0]);
  const [deskripsi, setDeskripsi] = useState("");
  const [nominal, setNominal] = useState<number | "">("");
  const [pj, setPj] = useState("");

  const [filterType, setFilterType] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const totalPemasukan = transactions
    .filter((t) => t.kategori === "Pemasukan")
    .reduce((sum, t) => sum + t.nominal, 0);

  const totalPengeluaran = transactions
    .filter((t) => t.kategori === "Pengeluaran")
    .reduce((sum, t) => sum + t.nominal, 0);

  const saldoKas = totalPemasukan - totalPengeluaran;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || Number(nominal) <= 0) return;

    onAddTransaction({
      id: "tx_" + Date.now(),
      tanggal,
      kategori: type,
      jenis,
      deskripsi: deskripsi || jenis,
      nominal: Number(nominal),
      pj,
    });

    setNominal("");
    setDeskripsi("");
    setPj("");
    setShowAddModal(false);
  };

  const handleGenerateAiReport = async () => {
    setReportLoading(true);
    try {
      const summaryList = transactions.slice(0, 50).map(
        (t) => `- ${t.tanggal} | ${t.kategori} | ${t.jenis} | Rp ${t.nominal.toLocaleString("id-ID")} | Ket: ${t.deskripsi}`
      );

      const prompt = `Anda adalah akuntan dan sekretaris DKM Masjid profesional. Buat Laporan Keuangan & Evaluasi Kas Masjid berdasarkan data transaksi berikut:
Nama Masjid: ${branding.namaMasjid || "Masjid"}
Total Pemasukan: Rp ${totalPemasukan.toLocaleString("id-ID")}
Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}
Saldo Kas Akhir: Rp ${saldoKas.toLocaleString("id-ID")}

Data 50 transaksi terakhir:
${summaryList.join("\n")}

Format output dokumen Markdown formal dengan bagian:
1. Ringkasan Eksekutif Keuangan
2. Tabel Rekapitulasi Sumber Pemasukan
3. Tabel Rincian Pos Pengeluaran Terbesar
4. Analisis Kesehatan Kas & Rekomendasi Alokasi Dana (Dana Darurat, Santunan Sosial, Pembangunan)
5. Lembar Pengesahan (Ketua DKM & Bendahara)`;

      const reportText = await callGeminiAi({
        system: "Anda menyusun laporan pertanggungjawaban keuangan masjid yang transparan, akuntabel, dan rapi.",
        prompt,
      });

      onOpenDocEngine(reportText, `Laporan Keuangan Kas ${branding.namaMasjid || "Masjid"}`);
    } catch (err) {
      alert("Gagal membuat laporan keuangan AI. Silakan periksa koneksi.");
    } finally {
      setReportLoading(false);
    }
  };

  const filtered = transactions.filter((t) => {
    if (filterType !== "Semua" && t.kategori !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.jenis.toLowerCase().includes(q) ||
        t.deskripsi.toLowerCase().includes(q) ||
        (t.pj && t.pj.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#C19D60]">Kas &amp; Keuangan Masjid</h1>
          <p className="text-sm text-[#A3ABA3]">
            Pencatatan kas pemasukan, pengeluaran, infaq Jumat, dan pembuatan laporan keuangan otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAiReport}
            disabled={reportLoading || transactions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#141A14] border border-[#C19D60]/40 text-[#C19D60] rounded-xl text-xs font-bold hover:bg-[#C19D60]/15 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#C19D60]" />
            {reportLoading ? "Menyusun Laporan..." : "Buat Laporan Keuangan AI"}
          </button>
          <button
            onClick={() => {
              setType("Pemasukan");
              setJenis(KATEGORI_PEMASUKAN[0]);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#D4AF6E] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0D110D] p-5 rounded-2xl border border-[#C19D60]/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#A3ABA3] uppercase tracking-wider">Saldo Kas Saat Ini</p>
            <p className="text-2xl font-bold font-mono text-[#E6E8E6] mt-1">
              Rp {saldoKas.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-[#C19D60] mt-0.5 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Kas Siap Digunakan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#C19D60]/10 border border-[#C19D60]/25 text-[#C19D60] flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D110D] p-5 rounded-2xl border border-[#C19D60]/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#A3ABA3] uppercase tracking-wider">Total Pemasukan</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              + Rp {totalPemasukan.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-[#A3ABA3] mt-0.5 font-mono">
              {transactions.filter((t) => t.kategori === "Pemasukan").length} transaksi
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0D110D] p-5 rounded-2xl border border-[#C19D60]/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#A3ABA3] uppercase tracking-wider">Total Pengeluaran</p>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
              - Rp {totalPengeluaran.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-[#A3ABA3] mt-0.5 font-mono">
              {transactions.filter((t) => t.kategori === "Pengeluaran").length} transaksi
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0D110D] p-4 rounded-2xl border border-[#C19D60]/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#A3ABA3] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari transaksi / keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C19D60] text-[#E6E8E6] font-medium"
          >
            <option value="Semua" className="bg-[#0A0D0A] text-[#E6E8E6]">Semua Arus Kas</option>
            <option value="Pemasukan" className="bg-[#0A0D0A] text-[#E6E8E6]">Pemasukan Saja</option>
            <option value="Pengeluaran" className="bg-[#0A0D0A] text-[#E6E8E6]">Pengeluaran Saja</option>
          </select>
        </div>

        <p className="text-xs text-[#A3ABA3] font-mono">
          Menampilkan {filtered.length} dari {transactions.length} transaksi
        </p>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#A3ABA3] space-y-2">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-[#A3ABA3]/60" />
            <p className="text-sm font-semibold text-[#E6E8E6]">Belum ada data transaksi kas</p>
            <p className="text-xs text-[#A3ABA3] max-w-sm mx-auto">
              Klik tombol &quot;Catat Transaksi&quot; di atas untuk mencatat infaq Jumat, donasi, atau pengeluaran operasional masjid.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0D0A] text-[#A3ABA3] font-bold border-b border-[#C19D60]/20">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Pos / Jenis</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Penanggung Jawab</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C19D60]/10">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#141A14] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#A3ABA3]">{t.tanggal}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.kategori === "Pemasukan"
                            ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-950/60 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {t.kategori === "Pemasukan" ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {t.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#E6E8E6]">{t.jenis}</td>
                    <td className="py-3 px-4 text-[#A3ABA3] max-w-xs truncate">{t.deskripsi}</td>
                    <td className="py-3 px-4 text-[#A3ABA3] font-mono">{t.pj || "-"}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        t.kategori === "Pemasukan" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {t.kategori === "Pemasukan" ? "+" : "-"} Rp {t.nominal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm("Hapus transaksi ini dari buku kas?")) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="p-1.5 text-[#A3ABA3] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Catat Transaksi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0D110D] border border-[#C19D60]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-[#E6E8E6]">
            <div className="flex items-center justify-between border-b border-[#C19D60]/20 pb-3">
              <h3 className="font-bold font-serif text-lg text-[#C19D60]">Catat Transaksi Kas</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#A3ABA3] hover:text-[#E6E8E6]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType("Pemasukan");
                    setJenis(KATEGORI_PEMASUKAN[0]);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === "Pemasukan"
                      ? "bg-[#C19D60] text-[#0A0D0A] shadow"
                      : "text-[#A3ABA3] hover:text-[#E6E8E6]"
                  }`}
                >
                  Pemasukan (Infaq/Zakat)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("Pengeluaran");
                    setJenis(KATEGORI_PENGELUARAN[0]);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === "Pengeluaran"
                      ? "bg-rose-600 text-white shadow"
                      : "text-[#A3ABA3] hover:text-[#E6E8E6]"
                  }`}
                >
                  Pengeluaran (Operasional)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3ABA3] mb-1">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl p-2.5 font-mono text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3ABA3] mb-1">Pos / Kategori</label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                >
                  {(type === "Pemasukan" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN).map((k) => (
                    <option key={k} value={k} className="bg-[#0A0D0A] text-[#E6E8E6]">
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3ABA3] mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl p-2.5 font-mono font-bold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3ABA3] mb-1">Keterangan / Rincian</label>
                <input
                  type="text"
                  placeholder="Contoh: Infaq Kotak Amal Shalat Jumat tgl 15"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3ABA3] mb-1">Petugas / Penanggung Jawab (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nama bendahara atau pencatat"
                  value={pj}
                  onChange={(e) => setPj(e.target.value)}
                  className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#C19D60]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#141A14] border border-[#C19D60]/30 text-[#A3ABA3] hover:text-[#E6E8E6] rounded-xl text-xs font-bold hover:bg-[#C19D60]/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#D4AF6E]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
