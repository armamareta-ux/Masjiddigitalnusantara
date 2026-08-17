import React, { useState } from "react";
import {
  Share2,
  Instagram,
  Facebook,
  MessageCircle,
  Send,
  Video,
  Youtube,
  Calendar as CalendarIcon,
  Lightbulb,
  Sparkles,
  Copy,
  Plus,
  Check,
  CalendarPlus,
  Trash2,
  Shuffle,
  Wand2,
} from "lucide-react";
import { SocialCalendarItem, HistoryRecord, DalilItem } from "../types";
import { callGeminiAi, parseSermonResponse, parseJsonArrayRobust } from "../utils/ai";

export interface SocialMediaViewProps {
  viewMode: "caption" | "calendar" | "ideas" | "instagram" | "facebook" | "whatsapp" | "telegram" | "tiktok" | "youtube";
  calendarItems: SocialCalendarItem[];
  onAddCalendarItem: (item: SocialCalendarItem) => void;
  onUpdateCalendarItem: (id: string, patch: Partial<SocialCalendarItem>) => void;
  onDeleteCalendarItem: (id: string) => void;
  onSaveHistory: (record: HistoryRecord) => void;
  onOpenDocEngine: (content: string, title: string) => void;
  prefill?: Record<string, string>;
}

const PLATFORM_MAP: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp Broadcast",
  telegram: "Telegram Channel",
  tiktok: "TikTok",
  youtube: "YouTube",
};

const FORMATS = [
  "Caption Instagram & Carousel 5 Slide",
  "Naskah Video Reels / TikTok (60 Detik)",
  "WhatsApp Broadcast Pengumuman",
  "Quote Singkat & Renungan Tadabbur",
  "Thread Edukasi Fiqih / Hadits",
  "Deskripsi Video YouTube Kajian",
];

const TUJUAN_KONTEN = [
  "Edukasi & Tausiyah",
  "Ajakan Shalat Berjamaah / Kajian",
  "Penggalangan Donasi / Infaq Jumat",
  "Dokumentasi Kegiatan & Syiar",
  "Pengingat Sunnah Hari Jumat",
];

export function SocialMediaView({
  viewMode,
  calendarItems,
  onAddCalendarItem,
  onUpdateCalendarItem,
  onDeleteCalendarItem,
  onSaveHistory,
  onOpenDocEngine,
  prefill,
}: SocialMediaViewProps) {
  // Generator State
  const initialPlatform = PLATFORM_MAP[viewMode] || "Instagram";
  const [platform, setPlatform] = useState(initialPlatform);
  const [format, setFormat] = useState(FORMATS[0]);
  const [topik, setTopik] = useState(prefill?.topik || "Keutamaan Bersedekah di Hari Jumat & Membaca Surat Al-Kahfi");
  const [tujuan, setTujuan] = useState(TUJUAN_KONTEN[0]);
  const [targetAudiens, setTargetAudiens] = useState("Remaja & Pemuda Muslim");
  const [cta, setCta] = useState("Komentar 'Aamiin' & Share ke kerabat tercinta");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calendar State
  const [calDate, setCalDate] = useState(new Date().toISOString().slice(0, 10));
  const [calPlatform, setCalPlatform] = useState("Instagram");
  const [calContent, setCalContent] = useState("");
  const [calCampaign, setCalCampaign] = useState("");

  const handleGenerateContent = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const prompt = `Anda adalah Content Strategist Media Sosial Masjid profesional.
Buat konten media sosial yang menarik, tidak clickbait murahan, bernilai dakwah tinggi, dan disesuaikan dengan platform.

- Platform: ${platform}
- Format Konten: ${format}
- Topik / Materi: ${topik}
- Tujuan: ${tujuan}
- Target Audiens: ${targetAudiens}
- Call to Action (CTA): ${cta}

ATURAN:
1. Buat Hook yang memikat di 3 detik / 2 baris pertama.
2. Cantumkan ayat/hadits shahih yang relevan jika ada (lengkap nama surat/hadits).
3. Jika format Carousel: berikan pembagian slide demi slide (Slide 1 Cover s/d Slide 5 CTA).
4. Jika format Reels/Video: sertakan instruksi visual (Scene, Angle, Teks di Layar, Audio Voiceover).
5. Berikan 5-8 hashtag dakwah yang relevan di akhir.`;

      const text = await callGeminiAi({
        system: "Anda adalah manajer media sosial masjid yang kreatif dan amanah.",
        prompt,
      });

      setResult(text);
    } catch {
      alert("Gagal menyusun konten media sosial.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSaveHistory({
      id: "soc_" + Date.now(),
      title: `${platform}: ${topik}`,
      type: "Media Sosial",
      date: new Date().toISOString(),
      status: "Siap pakai",
      content: result,
    });
    setSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCalendar = () => {
    onAddCalendarItem({
      id: "cal_" + Date.now(),
      tanggal: new Date().toISOString().slice(0, 10),
      platform,
      konten: topik,
      status: "Planned",
      campaign: tujuan,
      cta,
    });
    alert("Berhasil ditambahkan ke Content Calendar!");
  };

  // If view is calendar
  if (viewMode === "calendar") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-emerald-950">Content Calendar Media Sosial</h1>
          <p className="text-sm text-slate-600">
            Jadwalkan postingan syiar dakwah, pengumuman Jumat berkah, dan kajian rutin masjid.
          </p>
        </div>

        {/* Add schedule card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold font-serif text-sm text-slate-900 flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-emerald-700" /> Tambah Jadwal Publikasi Baru
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Rilis</label>
              <input
                type="date"
                value={calDate}
                onChange={(e) => setCalDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={calPlatform}
                onChange={(e) => setCalPlatform(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
              >
                {Object.values(PLATFORM_MAP).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Topik Postingan</label>
              <input
                type="text"
                placeholder="Contoh: Quote Jumat Berkah & Pengumuman Khotib"
                value={calContent}
                onChange={(e) => setCalContent(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!calContent) return;
                onAddCalendarItem({
                  id: "cal_" + Date.now(),
                  tanggal: calDate,
                  platform: calPlatform,
                  konten: calContent,
                  status: "Draft",
                  campaign: calCampaign,
                });
                setCalContent("");
              }}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Masukkan ke Kalender
            </button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Daftar Jadwal Tayang ({calendarItems.length})
            </span>
          </div>

          {calendarItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              Belum ada jadwal postingan. Tambahkan jadwal postingan di atas.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {calendarItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {item.tanggal}
                    </span>
                    <span className="font-bold text-emerald-950 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full">
                      {item.platform}
                    </span>
                    <span className="font-medium text-slate-800">{item.konten}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        onUpdateCalendarItem(item.id, {
                          status: e.target.value as SocialCalendarItem["status"],
                        })
                      }
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Planned">Planned</option>
                      <option value="Ready">Ready</option>
                      <option value="Published">Published</option>
                    </select>

                    <button
                      onClick={() => onDeleteCalendarItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
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

  // Default: Social Content Studio Generator
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-emerald-950">
          Generator Konten Media Sosial Dakwah
        </h1>
        <p className="text-sm text-slate-600">
          Buat caption Instagram, slide carousel edukatif, naskah video pendek Reels/TikTok, atau pesan broadcast WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
            >
              {Object.values(PLATFORM_MAP).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Format Konten</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Topik / Nasihat Dakwah</label>
            <textarea
              rows={3}
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Apa pesan yang ingin disampaikan..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Konten</label>
              <select
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              >
                {TUJUAN_KONTEN.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Audiens</label>
              <input
                type="text"
                value={targetAudiens}
                onChange={(e) => setTargetAudiens(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action (CTA)</label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
            />
          </div>

          <button
            onClick={handleGenerateContent}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {loading ? "Menyusun Konten Kreatif..." : "Generate Konten Media Sosial"}
          </button>
        </div>

        {/* Output Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Hasil Konten Dakwah
            </span>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin!" : "Salin"}
                </button>
                <button
                  onClick={handleAddToCalendar}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" /> Jadwalkan
                </button>
                <button
                  disabled={saved}
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 disabled:opacity-50"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {saved ? "Tersimpan" : "Simpan"}
                </button>
              </div>
            )}
          </div>

          {result ? (
            <textarea
              rows={16}
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full text-xs font-sans p-3.5 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-900 whitespace-pre-wrap"
            />
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Share2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">
                Pilih format dan masukkan topik dakwah untuk membuat postingan media sosial siap pakai.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
