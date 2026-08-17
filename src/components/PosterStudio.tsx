import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Wand2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Check,
} from "lucide-react";
import { HistoryRecord } from "../types";
import { callGeminiAi } from "../utils/ai";

export interface PosterStudioProps {
  onSave: (record: HistoryRecord) => void;
  prefill?: Record<string, string>;
}

const POSTER_TYPES = [
  "Kajian Rutin Ba'da Maghrib",
  "Khutbah & Shalat Jumat",
  "Tabligh Akbar & Peringatan Hari Besar",
  "Kajian Akhir Pekan / Subuh Berkah",
  "Buka Puasa Bersama & I'tikaf Ramadan",
  "Santunan Yatim & Dhuafa",
  "Penerimaan Zakat, Infaq & Shadaqah",
  "Kelas Tahsin & Tahfizh Al-Qur'an",
  "Kegiatan Remaja Masjid & Kepemudaan",
  "Kerja Bakti & Resik-Resik Masjid",
];

const POSTER_STYLES = [
  "Islami Elegan",
  "Minimalis Modern",
  "Masjid Klasik & Kubah Emas",
  "Modern Bold",
  "Anak Muda / Kreatif",
  "Cutpaper (Kertas Potong Berlapis)",
  "Line Art Sketsa",
  "Editorial Berita",
];

function sanitizeSvg(raw: string): string | null {
  if (!raw) return null;
  const match = String(raw).match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return null;
  let svg = match[0];
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  svg = svg.replace(/<image[^>]*>/gi, "");
  svg = svg.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  svg = svg.replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  if (svg.length > 30000) return null;
  return svg;
}

export function PosterStudio({ onSave, prefill }: PosterStudioProps) {
  const [form, setForm] = useState({
    jenis: POSTER_TYPES[0],
    judul: "Kajian Rutin: Merawat Hati di Tengah Kesibukan Dunia",
    tema: "Kajian Tematik Kitab Tazkiyatun Nufus",
    pembicara: "Ustadz H. Ahmad Fauzi, Lc., M.A.",
    hariTanggal: "Ahad, 23 Agustus 2026",
    waktu: "Ba'da Shalat Maghrib s/d Isya",
    lokasi: "Masjid Utama Lt. 1",
    kontak: "0812-3456-7890 (Akhi Ridwan)",
    cta: "Terbuka Untuk Umum (Ikhwan & Akhwat) - Gratis & Disediakan Konsumsi",
    gaya: POSTER_STYLES[0],
    ...prefill,
  });

  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [illustrationSvg, setIllustrationSvg] = useState<string | null>(null);
  const [illustrationLoading, setIllustrationLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const setF = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleGenerateAiCopy = async () => {
    setCopyLoading(true);
    try {
      const prompt = `Buatkan 1 headline poster kegiatan masjid yang sangat menarik & menggugah (maksimal 7 kata) dan 1 subheadline ringkas (maksimal 12 kata).
Jenis Kegiatan: ${form.jenis}
Judul/Tema: ${form.judul} - ${form.tema}
Pembicara: ${form.pembicara}

Format keluaran:
Headline: [teks headline]
Subheadline: [teks subheadline]`;

      const raw = await callGeminiAi({
        system: "Anda adalah desainer & copywriter poster dakwah masjid.",
        prompt,
      });

      const h = raw.match(/Headline:\s*(.+)/i);
      const s = raw.match(/Subheadline:\s*(.+)/i);
      if (h) setHeadline(h[1].trim());
      if (s) setSubheadline(s[1].trim());
    } catch {
      // ignore
    } finally {
      setCopyLoading(false);
    }
  };

  const handleGenerateSvgIllustration = async () => {
    setIllustrationLoading(true);
    try {
      const prompt = `Buat SATU ilustrasi SVG vektor dekoratif untuk poster masjid.
Subjek: ${form.jenis} - ${form.judul} (${form.tema})
Gaya visual: ${form.gaya}

ATURAN KETAT:
1. Keluarkan HANYA satu tag <svg viewBox="0 0 400 400" ...>...</svg> tanpa markdown, tanpa penjelasan.
2. Gunakan elemen: path, circle, rect, polygon, g, defs, linearGradient.
3. Palet warna: Nuansa hijau zamrud tua (#0D110D), aksen emas (#C19D60, #D4B074), dan abu-abu mewah (#E6E8E6).
4. Buat ornamen geometris Islami / kubah / lentera / bintang 8 sudut yang simetris dan elegan. JANGAN buat teks/tulisan di dalam SVG.`;

      const raw = await callGeminiAi({
        system: "Anda menghasilkan vektor SVG bersih dan valid untuk poster masjid.",
        prompt,
      });

      const sanitized = sanitizeSvg(raw);
      if (sanitized) {
        setIllustrationSvg(sanitized);
      }
    } catch {
      alert("Gagal membuat ilustrasi AI. Silakan coba lagi.");
    } finally {
      setIllustrationLoading(false);
    }
  };

  const handleSave = () => {
    const textContent = `# POSTER: ${form.judul}
**Jenis:** ${form.jenis}
**Tema:** ${form.tema}
**Pembicara:** ${form.pembicara}
**Waktu:** ${form.hariTanggal} | ${form.waktu}
**Lokasi:** ${form.lokasi}
**Kontak:** ${form.kontak}
**Catatan:** ${form.cta}

${headline ? `**Headline AI:** ${headline}\n**Subheadline AI:** ${subheadline}` : ""}`;

    onSave({
      id: "poster_" + Date.now(),
      title: `Poster: ${form.judul}`,
      type: "Poster Studio",
      date: new Date().toISOString(),
      status: "Siap pakai",
      content: textContent,
    });
    setSaved(true);
  };

  const handleCopyText = () => {
    const text = `🕌 *${form.jenis.toUpperCase()}* 🕌
*${headline || form.judul}*
${subheadline || form.tema}

🎙️ *Bersama:* ${form.pembicara}
🗓️ *Hari/Tgl:* ${form.hariTanggal}
⏰ *Waktu:* ${form.waktu}
📍 *Tempat:* ${form.lokasi}

📢 *Info/Catatan:*
${form.cta}

📞 *Narahubung:* ${form.kontak}
_Mari ajak keluarga, sanak saudara, dan sahabat untuk menuntut ilmu bersama di rumah Allah._`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">Poster &amp; Visual Studio</h1>
        <p className="text-sm text-[#A3ABA3]">
          Rancang materi publikasi visual kajian, khutbah, dan kegiatan masjid lengkap dengan ilustrasi AI vektor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (Left) */}
        <div className="lg:col-span-5 bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Jenis Kegiatan</label>
            <select
              value={form.jenis}
              onChange={(e) => setF("jenis", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-semibold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {POSTER_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[#0D110D]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Judul Utama Poster</label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => setF("judul", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-bold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Subjudul / Tema</label>
            <input
              type="text"
              value={form.tema}
              onChange={(e) => setF("tema", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Narasumber / Penceramah</label>
            <input
              type="text"
              value={form.pembicara}
              onChange={(e) => setF("pembicara", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-semibold text-[#C19D60] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Hari &amp; Tanggal</label>
              <input
                type="text"
                value={form.hariTanggal}
                onChange={(e) => setF("hariTanggal", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Waktu</label>
              <input
                type="text"
                value={form.waktu}
                onChange={(e) => setF("waktu", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Lokasi Masjid</label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setF("lokasi", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Narahubung / Contact Person</label>
            <input
              type="text"
              value={form.kontak}
              onChange={(e) => setF("kontak", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Catatan / Ajakan (CTA)</label>
            <input
              type="text"
              value={form.cta}
              onChange={(e) => setF("cta", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Gaya Desain Visual</label>
            <select
              value={form.gaya}
              onChange={(e) => setF("gaya", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] font-medium focus:outline-none focus:border-[#C19D60]"
            >
              {POSTER_STYLES.map((s) => (
                <option key={s} value={s} className="bg-[#0D110D]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* AI Helper Buttons */}
          <div className="pt-2 border-t border-[#C19D60]/15 space-y-2">
            <button
              onClick={handleGenerateAiCopy}
              disabled={copyLoading}
              className="w-full py-2 bg-[#0A0D0A] text-[#E6E8E6] border border-[#C19D60]/20 rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C19D60]" />
              {copyLoading ? "Merangkai Kata..." : "Buat Headline Menarik dengan AI"}
            </button>
            <button
              onClick={handleGenerateSvgIllustration}
              disabled={illustrationLoading}
              className="w-full py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Wand2 className="w-4 h-4 text-[#0A0D0A]" />
              {illustrationLoading ? "Menggambar Vektor AI..." : "Buat Ilustrasi Vektor AI"}
            </button>
          </div>
        </div>

        {/* Live Poster Canvas Preview (Right) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col items-center">
          {/* Visual Poster Card */}
          <div
            id="poster-canvas"
            className="w-full max-w-md bg-gradient-to-b from-[#0D110D] via-[#0A0D0A] to-[#0D110D] text-[#E6E8E6] rounded-3xl p-8 shadow-2xl relative overflow-hidden border-2 border-[#C19D60]/40 text-center flex flex-col justify-between min-h-[580px]"
          >
            {/* Background SVG illustration */}
            {illustrationSvg && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center p-6 z-0"
                dangerouslySetInnerHTML={{ __html: illustrationSvg }}
              />
            )}

            {/* Inner Border Frame */}
            <div className="absolute inset-3 border border-[#C19D60]/30 rounded-2xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 space-y-1">
              <span className="inline-block px-3 py-1 bg-[#C19D60]/20 border border-[#C19D60]/40 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest text-[#C19D60]">
                {form.jenis}
              </span>
              <p className="text-xs text-[#C19D60]/90 italic mt-1">{headline || "Hadirilah &amp; Syiarkanlah"}</p>
            </div>

            {/* Middle Title & Speaker */}
            <div className="relative z-10 my-6 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#E6E8E6] tracking-wide leading-tight drop-shadow-md">
                {form.judul}
              </h2>
              {form.tema && <p className="text-xs text-[#C19D60] font-medium">{subheadline || form.tema}</p>}

              {/* Speaker Box */}
              <div className="mt-4 pt-4 border-t border-[#C19D60]/30 inline-block px-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C19D60] block mb-0.5">
                  Bersama Pemateri:
                </span>
                <p className="text-base font-bold font-serif text-[#E6E8E6]">{form.pembicara}</p>
              </div>
            </div>

            {/* Details Box */}
            <div className="relative z-10 bg-[#0A0D0A]/90 border border-[#C19D60]/30 rounded-2xl p-4 text-xs space-y-2 backdrop-blur-sm shadow-inner text-left">
              <div className="flex items-center gap-2.5 text-[#E6E8E6]">
                <Calendar className="w-4 h-4 text-[#C19D60] shrink-0" />
                <span>{form.hariTanggal}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#E6E8E6]">
                <Clock className="w-4 h-4 text-[#C19D60] shrink-0" />
                <span>{form.waktu}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#E6E8E6]">
                <MapPin className="w-4 h-4 text-[#C19D60] shrink-0" />
                <span>{form.lokasi}</span>
              </div>
            </div>

            {/* Footer / CTA */}
            <div className="relative z-10 mt-4 space-y-1.5">
              <p className="text-[11px] font-bold text-[#C19D60]">{form.cta}</p>
              <p className="text-[10px] text-[#A3ABA3] font-mono">Info: {form.kontak}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full max-w-md justify-center">
            <button
              onClick={handleCopyText}
              className="flex-1 py-2.5 bg-[#0A0D0A] border border-[#C19D60]/20 text-[#E6E8E6] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C19D60]" />}
              {copied ? "Teks Tersalin!" : "Salin Format WA"}
            </button>
            <button
              disabled={saved}
              onClick={handleSave}
              className="flex-1 py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60 transition-colors"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {saved ? "Tersimpan di Riwayat" : "Simpan Poster"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
