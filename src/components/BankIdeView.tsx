import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  X,
  FileText,
  Image as ImageIcon,
  Share2,
  CalendarDays,
  Megaphone,
} from "lucide-react";
import { IdeaItem } from "../types";
import { callGeminiAi } from "../utils/ai";

export interface BankIdeViewProps {
  ideas: IdeaItem[];
  onAddIdea: (idea: IdeaItem) => void;
  onUpdateIdea: (id: string, patch: Partial<IdeaItem>) => void;
  onDeleteIdea: (id: string) => void;
  onForwardToModule: (target: string, summary: string, meta: { title: string }) => void;
  prefill?: { rawInput?: string };
}

const IDEA_CATEGORIES = [
  "Dakwah & Kajian",
  "Pemberdayaan Ekonomi Umat",
  "Remaja & Generasi Muda",
  "Pendidikan & Tahfizh Anak",
  "Keluarga & Lansia",
  "Sosial & Santunan",
  "Teknologi & Digital Masjid",
  "Sarana & Pemeliharaan Fisik",
];

const IDEA_STATUSES = [
  "Idea",
  "Considering",
  "Planned",
  "Running",
  "Completed",
  "Postponed",
];

export function BankIdeView({
  ideas,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onForwardToModule,
  prefill,
}: BankIdeViewProps) {
  const [rawInput, setRawInput] = useState(prefill?.rawInput || "");
  const [category, setCategory] = useState(IDEA_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [activeModalIdea, setActiveModalIdea] = useState<IdeaItem | null>(null);
  const [devLoading, setDevLoading] = useState(false);

  const handleProcessIdea = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    try {
      const prompt = `Anda adalah konsultan pengembangan program masjid.
Ubah gagasan mentah pengurus masjid berikut menjadi 5 poin terstruktur:
Kategori: ${category}
Gagasan Mentah: ${rawInput}

Keluarkan HANYA format baris berikut persis:
Problem: [masalah mendasar yang dipecahkan]
Opportunity: [peluang atau potensi jamaah]
Idea: [nama/judul ide konkret program]
Target: [siapa sasaran program]
Potential Impact: [manfaat nyata bagi jamaah dan masjid]`;

      const text = await callGeminiAi({
        system: "Anda merapikan ide kegiatan masjid secara ringkas dan tajam.",
        prompt,
      });

      const parseField = (label: string) => {
        const regex = new RegExp(`^${label}:\\s*(.*)$`, "im");
        const match = text.match(regex);
        return match ? match[1].trim() : "";
      };

      const newIdea: IdeaItem = {
        id: "idea_" + Date.now(),
        createdAt: new Date().toISOString(),
        category,
        rawInput,
        problem: parseField("Problem"),
        opportunity: parseField("Opportunity"),
        ideaText: parseField("Idea") || rawInput,
        target: parseField("Target"),
        potentialImpact: parseField("Potential Impact"),
        status: "Idea",
        priority: {
          impact: "4",
          urgency: "3",
          feasibility: "4",
          cost: "2",
          humanResources: "3",
        },
      };

      onAddIdea(newIdea);
      setRawInput("");
    } catch {
      alert("Gagal memproses ide. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (p: IdeaItem["priority"]) => {
    const impact = Number(p.impact) || 3;
    const urgency = Number(p.urgency) || 3;
    const feasibility = Number(p.feasibility) || 3;
    const hr = Number(p.humanResources) || 3;
    const cost = Number(p.cost) || 3;
    const score = (impact * 1.5 + urgency + feasibility + hr + (6 - cost)) / 4.5;
    return Math.round(score * 10) / 10;
  };

  const handleDevelopIdea = async (idea: IdeaItem) => {
    setDevLoading(true);
    try {
      const prompt = `Kembangkan konsep program kerja lengkap untuk ide masjid berikut:
Judul Ide: ${idea.ideaText}
Kategori: ${idea.category}
Masalah: ${idea.problem}
Peluang: ${idea.opportunity}
Sasaran: ${idea.target}

Buat dokumen konsep matang dalam format Markdown dengan bagian:
## 1. Latar Belakang & Urgensi
## 2. Tujuan & Indikator Keberhasilan
## 3. Bentuk Aktivitas & Format Kegiatan
## 4. Kebutuhan SDM & Relawan Panitia
## 5. Estimasi Kebutuhan Anggaran Biaya
## 6. Jadwal & Timeline Pelaksanaan
## 7. Mitigasi Risiko & Hambatan`;

      const text = await callGeminiAi({
        system: "Anda adalah perencana program takmir masjid profesional.",
        prompt,
      });

      onUpdateIdea(idea.id, { developmentText: text });
      setActiveModalIdea((prev) => (prev ? { ...prev, developmentText: text } : null));
    } catch {
      alert("Gagal mengembangkan konsep ide.");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">Bank Ide &amp; Program Kerja</h1>
        <p className="text-sm text-[#A3ABA3]">
          Tampung gagasan spontan pengurus, olah menjadi program terstruktur dengan AI, dan prioritaskan untuk dieksekusi.
        </p>
      </div>

      {/* Input New Idea Box */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm font-serif text-[#E6E8E6] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C19D60]" /> Tulis Gagasan / Ide Baru
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Contoh: Buat program kelas coding & robotik gratis untuk anak-anak jamaah di serambi masjid setiap Ahad pagi..."
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-3 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Kategori Bidang</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-medium text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              >
                {IDEA_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0D110D]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleProcessIdea}
              disabled={loading || !rawInput.trim()}
              className="w-full py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#0A0D0A]" />
              {loading ? "Menganalisis Ide..." : "Strukturkan Ide dengan AI"}
            </button>
          </div>
        </div>
      </div>

      {/* Idea Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => {
          const score = calculateScore(idea.priority);
          return (
            <div
              key={idea.id}
              onClick={() => setActiveModalIdea(idea)}
              className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm hover:border-[#C19D60] transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#C19D60]/15 text-[#C19D60] border border-[#C19D60]/30">
                    {idea.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                      score >= 4
                        ? "bg-[#C19D60] text-[#0A0D0A]"
                        : score >= 3
                        ? "bg-[#C19D60]/30 text-[#C19D60]"
                        : "bg-[#0A0D0A] text-[#A3ABA3] border border-[#C19D60]/20"
                    }`}
                  >
                    Skor: {score}
                  </span>
                </div>

                <h3 className="font-bold font-serif text-sm text-[#E6E8E6] leading-snug line-clamp-2">
                  {idea.ideaText}
                </h3>

                {idea.problem && (
                  <p className="text-xs text-[#A3ABA3] line-clamp-2">
                    <span className="font-semibold text-[#E6E8E6]">Masalah:</span> {idea.problem}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[#C19D60]/15 text-[#A3ABA3]">
                <span className="font-semibold text-[#C19D60]">{idea.status}</span>
                <span className="flex items-center gap-1 text-[#A3ABA3] hover:text-[#C19D60] font-medium transition-colors">
                  Detail &amp; Kembangkan <ChevronRight className="w-3 h-3 text-[#C19D60]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail & Development Modal */}
      {activeModalIdea && (
        <div className="fixed inset-0 z-50 bg-[#0A0D0A]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D110D] border border-[#C19D60]/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#C19D60]/15 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#C19D60] bg-[#C19D60]/15 border border-[#C19D60]/30 px-2 py-0.5 rounded-full">
                  {activeModalIdea.category}
                </span>
                <h2 className="text-lg font-bold font-serif text-[#E6E8E6] mt-1">
                  {activeModalIdea.ideaText}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalIdea(null)}
                className="p-1 rounded-lg text-[#A3ABA3] hover:text-[#E6E8E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15">
                <span className="font-bold text-[#C19D60] block mb-0.5">Masalah yang Dipecahkan</span>
                <p className="text-[#A3ABA3]">{activeModalIdea.problem || "-"}</p>
              </div>
              <div className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15">
                <span className="font-bold text-[#C19D60] block mb-0.5">Peluang &amp; Potensi</span>
                <p className="text-[#A3ABA3]">{activeModalIdea.opportunity || "-"}</p>
              </div>
              <div className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15">
                <span className="font-bold text-[#C19D60] block mb-0.5">Target Jamaah</span>
                <p className="text-[#A3ABA3]">{activeModalIdea.target || "-"}</p>
              </div>
              <div className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15">
                <span className="font-bold text-[#C19D60] block mb-0.5">Estimasi Dampak</span>
                <p className="text-[#A3ABA3]">{activeModalIdea.potentialImpact || "-"}</p>
              </div>
            </div>

            {/* Status & Priority Tuning */}
            <div className="p-4 bg-[#0A0D0A] rounded-2xl border border-[#C19D60]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C19D60] uppercase tracking-wide">
                  Matriks Prioritas &amp; Status
                </span>
                <select
                  value={activeModalIdea.status}
                  onChange={(e) => {
                    const next = e.target.value as IdeaItem["status"];
                    onUpdateIdea(activeModalIdea.id, { status: next });
                    setActiveModalIdea((prev) => (prev ? { ...prev, status: next } : null));
                  }}
                  className="text-xs bg-[#0D110D] border border-[#C19D60]/20 rounded-lg px-2.5 py-1 font-semibold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                >
                  {IDEA_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-[#0D110D]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  ["impact", "Dampak"],
                  ["urgency", "Urgensi"],
                  ["feasibility", "Kemudahan"],
                  ["cost", "Biaya"],
                  ["humanResources", "Kesiapan SDM"],
                ].map(([k, label]) => (
                  <div key={k}>
                    <label className="block text-[10px] text-[#A3ABA3] font-semibold mb-1">{label}</label>
                    <select
                      value={activeModalIdea.priority[k as keyof IdeaItem["priority"]]}
                      onChange={(e) => {
                        const newPriority = {
                          ...activeModalIdea.priority,
                          [k]: e.target.value,
                        };
                        onUpdateIdea(activeModalIdea.id, { priority: newPriority });
                        setActiveModalIdea((prev) => (prev ? { ...prev, priority: newPriority } : null));
                      }}
                      className="w-full text-xs bg-[#0D110D] border border-[#C19D60]/20 rounded-lg p-1 font-mono text-center text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                    >
                      {["1", "2", "3", "4", "5"].map((v) => (
                        <option key={v} value={v} className="bg-[#0D110D]">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Concept Expansion Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E6E8E6] uppercase font-mono">
                  Konsep Program Kerja Terperinci
                </span>
                <button
                  disabled={devLoading}
                  onClick={() => handleDevelopIdea(activeModalIdea)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C19D60] text-[#0A0D0A] rounded-lg text-xs font-bold hover:bg-[#d4b074] transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {devLoading ? "Menyusun Konsep..." : "Kembangkan Konsep dengan AI"}
                </button>
              </div>

              {activeModalIdea.developmentText && (
                <textarea
                  rows={8}
                  value={activeModalIdea.developmentText}
                  onChange={(e) => {
                    const text = e.target.value;
                    onUpdateIdea(activeModalIdea.id, { developmentText: text });
                    setActiveModalIdea((prev) => (prev ? { ...prev, developmentText: text } : null));
                  }}
                  className="w-full text-xs font-mono p-3 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl leading-relaxed text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                />
              )}
            </div>

            {/* Forward to other modules */}
            <div className="pt-3 border-t border-[#C19D60]/15 space-y-2">
              <span className="block text-[11px] font-bold uppercase text-[#A3ABA3]">
                Teruskan Ide Ini Ke Modul Lain:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onForwardToModule("admin-proposal", activeModalIdea.ideaText, {
                      title: activeModalIdea.ideaText,
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0D0A] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-lg text-xs font-semibold text-[#E6E8E6] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C19D60]" /> Buat Proposal
                </button>
                <button
                  onClick={() => {
                    onForwardToModule("poster", activeModalIdea.ideaText, {
                      title: activeModalIdea.ideaText,
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0D0A] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-lg text-xs font-semibold text-[#E6E8E6] transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#C19D60]" /> Buat Poster
                </button>
                <button
                  onClick={() => {
                    onForwardToModule("sosmed-caption", activeModalIdea.ideaText, {
                      title: activeModalIdea.ideaText,
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0D0A] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-lg text-xs font-semibold text-[#E6E8E6] transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#C19D60]" /> Buat Konten Medsos
                </button>
                <button
                  onClick={() => {
                    onForwardToModule("kalender-kegiatan", activeModalIdea.ideaText, {
                      title: activeModalIdea.ideaText,
                    });
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0D0A] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-lg text-xs font-semibold text-[#E6E8E6] transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[#C19D60]" /> Jadwalkan di Kalender
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[#C19D60]/15">
              <button
                onClick={() => {
                  if (window.confirm("Hapus ide ini dari bank ide?")) {
                    onDeleteIdea(activeModalIdea.id);
                    setActiveModalIdea(null);
                  }
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                Hapus Ide
              </button>
              <button
                onClick={() => setActiveModalIdea(null)}
                className="px-4 py-2 bg-[#0A0D0A] text-[#E6E8E6] border border-[#C19D60]/20 rounded-xl text-xs font-bold hover:bg-[#C19D60]/20 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
