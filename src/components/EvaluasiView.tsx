import React, { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Trash2,
  Printer,
} from "lucide-react";
import { EvaluationItem, HistoryRecord } from "../types";
import { callGeminiAi } from "../utils/ai";

export interface EvaluasiViewProps {
  evaluations: EvaluationItem[];
  onAddEvaluation: (item: EvaluationItem) => void;
  onUpdateEvaluation: (id: string, patch: Partial<EvaluationItem>) => void;
  onDeleteEvaluation: (id: string) => void;
  onOpenDocEngine: (content: string, title: string) => void;
  onSaveHistory: (record: HistoryRecord) => void;
  prefill?: Record<string, string>;
}

export function EvaluasiView({
  evaluations,
  onAddEvaluation,
  onDeleteEvaluation,
  onOpenDocEngine,
  onSaveHistory,
  prefill,
}: EvaluasiViewProps) {
  const [namaKegiatan, setNamaKegiatan] = useState(prefill?.namaKegiatan || "");
  const [tanggal, setTanggal] = useState(prefill?.tanggal || new Date().toISOString().slice(0, 10));
  const [berjalanBaik, setBerjalanBaik] = useState("");
  const [hambatan, setHambatan] = useState("");
  const [solusi, setSolusi] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleSynthesizeAi = async () => {
    if (!namaKegiatan) return;
    setAiLoading(true);
    try {
      const prompt = `Anda adalah konsultan manajemen organisasi dan evaluasi program masjid.
Buat laporan After Action Review (AAR) & Rekomendasi Sistematis berdasarkan catatan evaluasi berikut:

Nama Kegiatan: ${namaKegiatan}
Tanggal: ${tanggal}
Yang Berjalan Baik: ${berjalanBaik || "Pelaksanaan secara umum lancar"}
Kendala / Hambatan: ${hambatan || "Kurang koordinasi logistik dan tempat wudhu antre"}
Rekomendasi Awal: ${solusi || "Tambah relawan dan perbaiki signage"}

Susun output Markdown:
## 1. Ringkasan Eksekutif & Capaian Positif
## 2. Analisis Akar Masalah (Root-Cause Analysis)
## 3. Matriks Pembelajaran (What to Keep, What to Change, What to Stop)
## 4. Standar Operasional Prosedur (SOP) Rekomendasi Masa Depan
## 5. Tindak Lanjut & Action Plan untuk Panitia`;

      const text = await callGeminiAi({
        system: "Anda adalah analis mutu dan evaluasi program masjid.",
        prompt,
      });

      const newItem: EvaluationItem = {
        id: "eval_" + Date.now(),
        createdAt: new Date().toISOString().slice(0, 10),
        namaKegiatan,
        tanggal,
        berjalanBaik,
        kendala: hambatan,
        pencapaianTujuan: "Tercapai",
        responJamaah: "Positif",
        catatanPanitia: solusi,
        analysis: text,
        rekomendasiAi: text,
      };

      onAddEvaluation(newItem);
      onSaveHistory({
        id: "hist_" + Date.now(),
        title: `Laporan Evaluasi: ${namaKegiatan}`,
        type: "Evaluasi & AAR",
        date: new Date().toISOString().slice(0, 10),
        status: "Siap pakai",
        content: `# LAPORAN EVALUASI & AFTER ACTION REVIEW\n**Kegiatan**: ${namaKegiatan}\n**Tanggal**: ${tanggal}\n\n${text}`,
      });

      setNamaKegiatan("");
      setBerjalanBaik("");
      setHambatan("");
      setSolusi("");
    } catch {
      alert("Gagal melakukan sintesis evaluasi AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">
          Evaluasi Program &amp; After Action Review (AAR)
        </h1>
        <p className="text-sm text-[#A3ABA3]">
          Tingkatkan kualitas kegiatan masjid dari waktu ke waktu melalui refleksi terstruktur, analisis akar masalah, dan rekomendasi SOP.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm font-serif text-[#E6E8E6] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#C19D60]" /> Formulir Evaluasi Kegiatan Selesai
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Nama Kegiatan</label>
            <input
              type="text"
              placeholder="Contoh: Tabligh Akbar Menyambut Muharram"
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-semibold text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Tanggal Pelaksanaan</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-mono text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#C19D60] mb-1">
              Apa yang Berjalan Sangat Baik?
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Jamaah antusias melebihi target, sound system jernih..."
              value={berjalanBaik}
              onChange={(e) => setBerjalanBaik(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-rose-400 mb-1">
              Kendala / Masalah yang Muncul
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Parkir motor meluber ke jalan raya, konsumsi kurang 20 box..."
              value={hambatan}
              onChange={(e) => setHambatan(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1">
              Ide Solusi &amp; Catatan Panitia
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Koordinasi karang taruna untuk kantong parkir darurat..."
              value={solusi}
              onChange={(e) => setSolusi(e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSynthesizeAi}
            disabled={aiLoading || !namaKegiatan.trim()}
            className="px-5 py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#0A0D0A]" />
            {aiLoading ? "Menganalisis & Menyusun Laporan..." : "Sintesis Laporan Evaluasi AI"}
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
        <span className="font-mono text-xs font-bold text-[#A3ABA3] uppercase">
          Riwayat Evaluasi Program ({evaluations.length})
        </span>

        {evaluations.length === 0 ? (
          <p className="text-xs text-[#A3ABA3] py-8 text-center">
            Belum ada catatan evaluasi. Isi formulir di atas untuk mendokumentasikan evaluasi kegiatan.
          </p>
        ) : (
          <div className="divide-y divide-[#C19D60]/10">
            {evaluations.map((ev) => (
              <div key={ev.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C19D60] bg-[#C19D60]/15 border border-[#C19D60]/30 px-2 py-0.5 rounded">
                      {ev.tanggal}
                    </span>
                    <h4 className="font-bold text-sm text-[#E6E8E6] font-serif">{ev.namaKegiatan}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {ev.rekomendasiAi && (
                      <button
                        onClick={() =>
                          onOpenDocEngine(
                            `# LAPORAN EVALUASI & AAR: ${ev.namaKegiatan}\nTanggal: ${ev.tanggal}\n\n${ev.rekomendasiAi}`,
                            `Evaluasi: ${ev.namaKegiatan}`
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak Laporan
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteEvaluation(ev.id)}
                      className="p-1.5 text-[#A3ABA3] hover:text-rose-400 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {ev.rekomendasiAi && (
                  <div className="p-3 bg-[#0A0D0A] border border-[#C19D60]/15 rounded-xl text-xs text-[#E6E8E6] max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                    {ev.rekomendasiAi}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
