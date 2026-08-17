import React, { useState } from "react";
import {
  CalendarDays,
  Moon,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { MosqueEvent } from "../types";
import { callGeminiAi, parseJsonArrayRobust } from "../utils/ai";

export interface KalenderViewProps {
  viewMode: "kalender-kegiatan" | "program-ramadan";
  events: MosqueEvent[];
  onAddEvent: (ev: MosqueEvent) => void;
  onUpdateEvent: (id: string, patch: Partial<MosqueEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onEvaluateEvent: (ev: MosqueEvent) => void;
  onMakePoster: (ev: MosqueEvent) => void;
  prefill?: Record<string, string>;
}

const EVENT_CATEGORIES = [
  "Kajian Rutin & Tabligh Akbar",
  "Khutbah & Shalat Jumat",
  "Kegiatan Sosial & Santunan",
  "Program Ramadan & Ibadah Khusus",
  "Pendidikan & Tahfizh",
  "Kerja Bakti & Pemeliharaan",
  "Rapat & Musyawarah DKM",
];

const EVENT_STATUSES: MosqueEvent["status"][] = [
  "Direncanakan",
  "Dikonfirmasi",
  "Berjalan",
  "Selesai",
  "Dibatalkan",
];

export function KalenderView({
  viewMode,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onEvaluateEvent,
  onMakePoster,
  prefill,
}: KalenderViewProps) {
  // Manual Add Form
  const [tanggal, setTanggal] = useState(prefill?.tanggal || new Date().toISOString().slice(0, 10));
  const [waktu, setWaktu] = useState(prefill?.waktu || "19.30 WIB (Ba'da Isya)");
  const [namaKegiatan, setNamaKegiatan] = useState(prefill?.namaKegiatan || "");
  const [kategori, setKategori] = useState(EVENT_CATEGORIES[0]);
  const [pic, setPic] = useState(prefill?.pic || "");
  const [lokasi, setLokasi] = useState("Masjid Utama");
  const [catatan, setCatatan] = useState("");

  // AI Auto Planner State
  const [durasiPlan, setDurasiPlan] = useState("1 Bulan");
  const [fokusTema, setFokusTema] = useState("Penguatan Ukhuwah & Semarak Generasi Muda");
  const [aiLoading, setAiLoading] = useState(false);

  // Ramadan Planner State
  const [ramadanKapasitas, setRamadanKapasitas] = useState("300 Jamaah");
  const [ramadanTarget, setRamadanTarget] = useState("Keluarga & Anak Muda");
  const [ramadanLoading, setRamadanLoading] = useState(false);
  const [ramadanOverview, setRamadanOverview] = useState("");

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKegiatan.trim()) return;

    onAddEvent({
      id: "ev_" + Date.now(),
      tanggal,
      waktu,
      namaKegiatan,
      kategori,
      pic,
      lokasi,
      status: "Direncanakan",
      catatan,
    });

    setNamaKegiatan("");
    setPic("");
    setCatatan("");
  };

  const handleGenerateAiPlan = async () => {
    setAiLoading(true);
    try {
      const prompt = `Anda adalah sekretaris DKM Masjid profesional.
Susun agenda kalender kegiatan masjid realistis untuk periode: ${durasiPlan}
Fokus Tema: ${fokusTema}

Buat 6-8 kegiatan bervariasi (Kajian, Kerja Bakti, Santunan, dll).
Keluarkan HANYA array JSON valid:
[{"tanggal":"2026-08-22","waktu":"19.30 WIB","namaKegiatan":"...","kategori":"...","pic":"...","lokasi":"...","catatan":"..."}]`;

      const raw = await callGeminiAi({
        system: "Anda menyusun jadwal kegiatan masjid rapi dan terukur.",
        prompt,
        jsonMode: true,
      });

      const parsed = await parseJsonArrayRobust<MosqueEvent>(raw);
      if (parsed && parsed.length) {
        parsed.forEach((ev, i) => {
          onAddEvent({
            ...ev,
            id: "ev_" + Date.now() + "_" + i,
            status: "Direncanakan",
          });
        });
        alert(`Berhasil menambahkan ${parsed.length} agenda kegiatan ke kalender!`);
      }
    } catch {
      alert("Gagal menyusun kalender kegiatan AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateRamadanPlan = async () => {
    setRamadanLoading(true);
    try {
      const prompt = `Anda adalah konsultan perencana kegiatan Ramadan Masjid.
Susun Program Ramadan Komprehensif (30 Hari) dengan kapasitas masjid: ${ramadanKapasitas}, target jamaah: ${ramadanTarget}.

Tuliskan konsep program Markdown:
## 1. Rencana Buka Puasa Bersama & Takjil Gratis
## 2. Jadwal Shalat Tarawih & Kultum 7 Menit
## 3. Tadarus & Khataman Al-Qur'an
## 4. Program I'tikaf 10 Malam Terakhir & Sahur Bersama
## 5. Panitia Penerimaan & Penyaluran Zakat Fitrah / Fidyah
## 6. Persiapan Shalat Idul Fitri & Pawai Takbir

Lalu masukkan 10 jadwal kegiatan penting Ramadan ke dalam format array JSON setelah pemisah ===JADWAL===:
[{"tanggal":"Hari ke-1 Ramadan","waktu":"18.00 WIB","namaKegiatan":"Buka Puasa Akbar Perdana & Tarawih","kategori":"Program Ramadan & Ibadah Khusus","pic":"Sie Ibadah","lokasi":"Masjid Utama","catatan":"Disediakan 300 porsi takjil"}]`;

      const raw = await callGeminiAi({
        system: "Anda menyusun program Ramadan masjid yang semarak dan teratur.",
        prompt,
      });

      const parts = raw.split("===JADWAL===");
      setRamadanOverview(parts[0].trim());

      if (parts[1]) {
        const parsed = await parseJsonArrayRobust<MosqueEvent>(parts[1]);
        if (parsed) {
          parsed.forEach((ev, i) => {
            onAddEvent({
              ...ev,
              id: "ramadan_" + Date.now() + "_" + i,
              status: "Direncanakan",
            });
          });
        }
      }
    } catch {
      alert("Gagal menyusun program Ramadan.");
    } finally {
      setRamadanLoading(false);
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  if (viewMode === "program-ramadan") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#E6E8E6] flex items-center gap-2">
            <Moon className="w-6 h-6 text-[#C19D60]" /> Program &amp; Planner Ramadan 1448 H
          </h1>
          <p className="text-sm text-[#A3ABA3]">
            Perencanaan semarak ibadah bulan suci: jadwal buka bersama, imam tarawih, tadarus, i&apos;tikaf 10 malam terakhir, dan pengelolaan zakat fitrah.
          </p>
        </div>

        {/* Ramadan Config Card */}
        <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Kapasitas &amp; Jamaah Aktif</label>
              <input
                type="text"
                value={ramadanKapasitas}
                onChange={(e) => setRamadanKapasitas(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Sasaran Utama Program</label>
              <input
                type="text"
                value={ramadanTarget}
                onChange={(e) => setRamadanTarget(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateRamadanPlan}
            disabled={ramadanLoading}
            className="w-full py-3 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#0A0D0A]" />
            {ramadanLoading ? "Menyusun Program Ramadan..." : "Generate Program Ramadan 30 Hari Lengkap"}
          </button>
        </div>

        {/* Overview Display */}
        {ramadanOverview && (
          <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-6 shadow-sm space-y-3">
            <h3 className="font-bold font-serif text-lg text-[#E6E8E6] border-b border-[#C19D60]/15 pb-2">
              Buku Panduan &amp; Panduan Kegiatan Ramadan
            </h3>
            <textarea
              rows={14}
              value={ramadanOverview}
              onChange={(e) => setRamadanOverview(e.target.value)}
              className="w-full text-xs font-serif leading-relaxed p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>
        )}
      </div>
    );
  }

  // Default: General Mosque Calendar
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">Kalender Kegiatan &amp; Agenda Masjid</h1>
        <p className="text-sm text-[#A3ABA3]">
          Jadwal kajian, shalat Jumat, gotong royong, santunan anak yatim, dan evaluasi kegiatan masjid.
        </p>
      </div>

      {/* Quick Add / AI Generator Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Manual Form */}
        <form
          onSubmit={handleManualAdd}
          className="lg:col-span-7 bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-3.5"
        >
          <h3 className="font-bold text-sm font-serif text-[#E6E8E6] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#C19D60]" /> Tambah Agenda Kegiatan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 font-mono text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Waktu</label>
              <input
                type="text"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Nama Kegiatan</label>
            <input
              type="text"
              placeholder="Contoh: Tabligh Akbar & Santunan Anak Yatim"
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 font-semibold text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0D110D]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Penanggung Jawab (PIC)</label>
              <input
                type="text"
                placeholder="Nama panitia / takmir"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Simpan ke Kalender
          </button>
        </form>

        {/* Right: AI Auto-Planner */}
        <div className="lg:col-span-5 bg-[#0D110D] border border-[#C19D60]/20 rounded-2xl p-5 text-[#E6E8E6] shadow-sm space-y-3.5">
          <h3 className="font-bold text-sm font-serif text-[#C19D60] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C19D60]" /> AI Kalender Otomatis
          </h3>
          <p className="text-xs text-[#A3ABA3]">
            Biarkan AI menyusun rencana agenda kegiatan masjid seimbang (ibadah, sosial, kajian remaja) dalam sekejap.
          </p>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Durasi Rencana</label>
            <select
              value={durasiPlan}
              onChange={(e) => setDurasiPlan(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 text-[#E6E8E6] font-medium focus:outline-none focus:border-[#C19D60]"
            >
              <option value="1 Bulan" className="bg-[#0D110D]">1 Bulan ke Depan</option>
              <option value="3 Bulan (1 Triwulan)" className="bg-[#0D110D]">3 Bulan (1 Triwulan)</option>
              <option value="Periode Ramadan Penuh" className="bg-[#0D110D]">Periode Ramadan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Fokus / Tema Khusus</label>
            <input
              type="text"
              value={fokusTema}
              onChange={(e) => setFokusTema(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <button
            onClick={handleGenerateAiPlan}
            disabled={aiLoading}
            className="w-full py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiLoading ? "Merancang Jadwal..." : "Generate Rencana Kegiatan AI"}
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#C19D60]/15 pb-2">
          <span className="font-mono text-xs font-bold text-[#A3ABA3] uppercase tracking-wider">
            Daftar Agenda Terjadwal ({sortedEvents.length})
          </span>
        </div>

        {sortedEvents.length === 0 ? (
          <p className="text-xs text-[#A3ABA3] py-10 text-center">
            Belum ada kegiatan yang dijadwalkan. Tambahkan manual atau gunakan AI Planner di atas.
          </p>
        ) : (
          <div className="divide-y divide-[#C19D60]/10">
            {sortedEvents.map((ev) => (
              <div
                key={ev.id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#0A0D0A]/60 p-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#C19D60] bg-[#C19D60]/15 border border-[#C19D60]/30 px-2 py-0.5 rounded">
                      {ev.tanggal}
                    </span>
                    <span className="text-[#A3ABA3] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C19D60]" /> {ev.waktu || "-"}
                    </span>
                    <span className="text-[11px] font-semibold text-[#E6E8E6] bg-[#0A0D0A] border border-[#C19D60]/20 px-2 py-0.5 rounded-full">
                      {ev.kategori}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#E6E8E6] font-serif">{ev.namaKegiatan}</h4>

                  <div className="flex items-center gap-3 text-xs text-[#A3ABA3]">
                    {ev.pic && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#C19D60]" /> PIC: {ev.pic}
                      </span>
                    )}
                    {ev.lokasi && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C19D60]" /> {ev.lokasi}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <select
                    value={ev.status}
                    onChange={(e) =>
                      onUpdateEvent(ev.id, {
                        status: e.target.value as MosqueEvent["status"],
                      })
                    }
                    className="text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-lg px-2 py-1 font-semibold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                  >
                    {EVENT_STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-[#0D110D]">
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => onMakePoster(ev)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#0A0D0A] text-[#E6E8E6] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-lg text-xs font-medium transition-colors"
                    title="Buat Poster untuk kegiatan ini"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#C19D60]" /> Poster
                  </button>

                  <button
                    onClick={() => onEvaluateEvent(ev)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#0A0D0A] text-[#E6E8E6] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-lg text-xs font-medium transition-colors"
                    title="Lakukan evaluasi & After Action Review"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#C19D60]" /> Evaluasi
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("Hapus agenda ini dari kalender?")) {
                        onDeleteEvent(ev.id);
                      }
                    }}
                    className="p-1.5 text-[#A3ABA3] hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
