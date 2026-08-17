import React, { useState } from "react";
import {
  FileText,
  Mail,
  ClipboardList,
  Calculator,
  ListOrdered,
  PenLine,
  Stamp as StampIcon,
  ClipboardCheck,
  Users,
  Award,
  Plus,
  Trash2,
  Copy,
  Download,
  Printer,
  Sparkles,
  Check,
} from "lucide-react";
import { HistoryRecord, MosqueBranding } from "../types";
import { callGeminiAi, parseJsonArrayRobust } from "../utils/ai";

export interface AdminModulesProps {
  moduleKey: string;
  onSave: (record: HistoryRecord) => void;
  onOpenDocEngine: (content: string, title: string) => void;
  branding: MosqueBranding;
  prefill?: Record<string, string>;
}

// ----------------------------------------------------
// 1. RAB Generator with Dynamic Auto-Calculations
// ----------------------------------------------------
interface RabItem {
  id: string;
  item: string;
  volume: number;
  satuan: string;
  harga: number;
}

export function RabModule({
  onSave,
  onOpenDocEngine,
  branding,
}: {
  onSave: (r: HistoryRecord) => void;
  onOpenDocEngine: (c: string, t: string) => void;
  branding: MosqueBranding;
}) {
  const [namaKegiatan, setNamaKegiatan] = useState("Peringatan Maulid Nabi & Santunan Anak Yatim");
  const [sumberDana, setSumberDana] = useState("Kas Masjid, Donasi Jamaah & Sponsorship");
  const [items, setItems] = useState<RabItem[]>([
    { id: "1", item: "Honorarium Penceramah / Narasumber", volume: 1, satuan: "Orang", harga: 2000000 },
    { id: "2", item: "Paket Santunan Anak Yatim", volume: 50, satuan: "Paket", harga: 250000 },
    { id: "3", item: "Konsumsi Nasi Box Jamaah", volume: 300, satuan: "Porsi", harga: 25000 },
    { id: "4", item: "Sewa Tenda & Sound System Luar", volume: 1, satuan: "Paket", harga: 1500000 },
    { id: "5", item: "Spanduk & Publikasi Backdrop", volume: 2, satuan: "Buah", harga: 175000 },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), item: "", volume: 1, satuan: "Pcs", harga: 0 },
    ]);
  };

  const updateItem = (id: string, patch: Partial<RabItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const totalBiaya = items.reduce((sum, it) => sum + (Number(it.volume) || 0) * (Number(it.harga) || 0), 0);

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const prompt = `Sarankan 5-7 pos pengeluaran RAB yang logis dan relevan untuk kegiatan masjid: "${namaKegiatan}".
HANYA sarankan nama item dan satuannya saja. JANGAN isi harga (harga = 0).

Keluarkan HANYA array JSON:
[{"item":"nama kebutuhan","satuan":"Porsi/Buah/Paket"}]`;

      const raw = await callGeminiAi({
        system: "Anda adalah penyusun anggaran kegiatan masjid profesional.",
        prompt,
        jsonMode: true,
      });

      const parsed = await parseJsonArrayRobust<{ item: string; satuan: string }>(raw);
      if (parsed) {
        setItems((prev) => [
          ...prev,
          ...parsed.map((p, i) => ({
            id: Date.now() + "_" + i,
            item: p.item,
            volume: 1,
            satuan: p.satuan || "Unit",
            harga: 0,
          })),
        ]);
      }
    } catch {
      alert("Gagal menyarankan item anggaran.");
    } finally {
      setAiLoading(false);
    }
  };

  const generateMarkdownTable = () => {
    let md = `# RENCANA ANGGARAN BIAYA (RAB)\n`;
    md += `**Kegiatan:** ${namaKegiatan}\n`;
    md += `**Masjid:** ${branding.namaMasjid || "Masjid"}\n`;
    md += `**Sumber Dana:** ${sumberDana}\n\n`;
    md += `| No | Pos Kebutuhan | Volume | Satuan | Harga Satuan | Subtotal |\n`;
    md += `|---|---|---|---|---|---|\n`;

    items.forEach((it, i) => {
      const subtotal = (Number(it.volume) || 0) * (Number(it.harga) || 0);
      md += `| ${i + 1} | ${it.item || "-"} | ${it.volume} | ${it.satuan} | Rp ${(it.harga || 0).toLocaleString("id-ID")} | Rp ${subtotal.toLocaleString("id-ID")} |\n`;
    });

    md += `\n**TOTAL ESTIMASI ANGGARAN: Rp ${totalBiaya.toLocaleString("id-ID")}**\n`;
    return md;
  };

  const handleSave = () => {
    onSave({
      id: "rab_" + Date.now(),
      title: `RAB: ${namaKegiatan}`,
      type: "Administrasi — RAB",
      date: new Date().toISOString(),
      status: "Siap pakai",
      content: generateMarkdownTable(),
    });
    setSaved(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold font-serif text-emerald-950">Kalkulator Rencana Anggaran Biaya (RAB)</h2>
        <p className="text-xs text-slate-600">
          Susun anggaran kegiatan secara transparan, hitung subtotal otomatis, dan ekspor ke Word/PDF.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kegiatan</label>
            <input
              type="text"
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sumber Dana / Rencana Donasi</label>
            <input
              type="text"
              value={sumberDana}
              onChange={(e) => setSumberDana(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAiSuggest}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {aiLoading ? "Mencari Saran..." : "Sarankan Item RAB dengan AI"}
          </button>
        </div>

        {/* Table Editor */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3">Nama Pos Kebutuhan</th>
                <th className="py-2.5 px-3 w-20">Volume</th>
                <th className="py-2.5 px-3 w-24">Satuan</th>
                <th className="py-2.5 px-3 w-36">Harga Satuan (Rp)</th>
                <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                <th className="py-2.5 px-3 w-12 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => {
                const subtotal = (Number(it.volume) || 0) * (Number(it.harga) || 0);
                return (
                  <tr key={it.id} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={it.item}
                        onChange={(e) => updateItem(it.id, { item: e.target.value })}
                        placeholder="Nama kebutuhan"
                        className="w-full text-xs bg-transparent border-0 border-b border-transparent focus:border-emerald-600 focus:bg-white p-1"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={it.volume}
                        onChange={(e) => updateItem(it.id, { volume: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 font-mono text-center"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={it.satuan}
                        onChange={(e) => updateItem(it.id, { satuan: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 text-center"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={it.harga}
                        onChange={(e) => updateItem(it.id, { harga: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 font-mono text-right"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => removeItem(it.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={addItem}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Baris
          </button>

          <div className="text-right">
            <span className="text-xs text-slate-500 mr-2 font-medium">Total Estimasi RAB:</span>
            <span className="font-mono text-xl font-bold text-emerald-900">
              Rp {totalBiaya.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
          <button
            onClick={() => onOpenDocEngine(generateMarkdownTable(), `RAB: ${namaKegiatan}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-amber-300 rounded-xl text-xs font-bold hover:bg-emerald-900 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Buka di Document Engine (Word/PDF)
          </button>
          <button
            disabled={saved}
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-sm disabled:opacity-60"
          >
            {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {saved ? "Tersimpan di Riwayat" : "Simpan Dokumen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. Generic AI Document Generator (Proposal, Surat, TOR, LPJ, Undangan, Notulen, Berita Acara, Sertifikat)
// ----------------------------------------------------
export function GenericAdminModule({
  moduleTitle,
  moduleDesc,
  fields,
  systemPrompt,
  docType,
  onSave,
  onOpenDocEngine,
  branding,
  prefill,
}: {
  moduleTitle: string;
  moduleDesc: string;
  fields: Array<{ key: string; label: string; type: "text" | "textarea" | "select"; options?: string[]; placeholder?: string; required?: boolean }>;
  systemPrompt: string;
  docType: string;
  onSave: (r: HistoryRecord) => void;
  onOpenDocEngine: (c: string, t: string) => void;
  branding: MosqueBranding;
  prefill?: Record<string, string>;
}) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = { ...prefill };
    fields.forEach((f) => {
      if (!initial[f.key]) initial[f.key] = f.type === "select" && f.options ? f.options[0] : "";
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const details = Object.entries(formData)
        .filter(([, v]) => v)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n");

      const prompt = `Susun dokumen resmi masjid berikut:
Nama Masjid: ${branding.namaMasjid || "Masjid"}
Alamat: ${branding.alamat || ""}
Ketua DKM: ${branding.namaKetuaDkm || ""}

Detail input pengurus:
${details}`;

      const text = await callGeminiAi({
        system: systemPrompt,
        prompt,
      });

      setResult(text);
    } catch {
      alert("Gagal menyusun dokumen. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave({
      id: "admin_" + Date.now(),
      title: `${moduleTitle}: ${formData[fields[0]?.key] || "Dokumen"}`,
      type: moduleTitle,
      date: new Date().toISOString(),
      status: "Siap pakai",
      content: result,
    });
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-serif text-emerald-950">{moduleTitle}</h2>
        <p className="text-sm text-slate-600">{moduleDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (Left) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={formData[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              ) : f.type === "select" ? (
                <select
                  value={formData[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800"
                >
                  {(f.options || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[f.key] || ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {loading ? "Menyusun Dokumen..." : `Generate ${moduleTitle}`}
          </button>
        </div>

        {/* Output Preview (Right) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Hasil Dokumen Siap Cetak
            </span>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDocEngine(result, `${moduleTitle}: ${formData[fields[0]?.key] || "Dokumen"}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-amber-300 rounded-lg text-xs font-bold hover:bg-emerald-900"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Word
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
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-900"
            />
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Isi data di sebelah kiri dan klik &quot;Generate&quot; untuk membuat draf dokumen resmi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Master Router for All Admin Modules
// ----------------------------------------------------
export function AdminModules({
  moduleKey,
  onSave,
  onOpenDocEngine,
  branding,
  prefill,
}: AdminModulesProps) {
  if (moduleKey === "admin-rab") {
    return <RabModule onSave={onSave} onOpenDocEngine={onOpenDocEngine} branding={branding} />;
  }

  if (moduleKey === "admin-proposal") {
    return (
      <GenericAdminModule
        moduleTitle="Proposal Kegiatan Masjid"
        moduleDesc="Susun proposal kegiatan, kajian akbar, santunan, renovasi, atau sponsorship secara komprehensif."
        fields={[
          { key: "namaKegiatan", label: "Nama Kegiatan", type: "text", placeholder: "Contoh: Tabligh Akbar & Santunan Muharram", required: true },
          { key: "latarBelakang", label: "Latar Belakang & Urgensi", type: "textarea", placeholder: "Mengapa kegiatan ini penting dilaksanakan...", required: true },
          { key: "tujuan", label: "Tujuan Kegiatan", type: "textarea", placeholder: "Mempererat ukhuwah, menyantuni 100 anak yatim..." },
          { key: "sasaran", label: "Target / Sasaran Peserta", type: "text", placeholder: "500 Jamaah umum & 100 Anak Yatim" },
          { key: "waktuTempat", label: "Waktu & Tempat Pelaksanaan", type: "text", placeholder: "Ahad, 15 September 2026 di Masjid Utama" },
          { key: "estimasiBiaya", label: "Estimasi Total Biaya", type: "text", placeholder: "Rp 25.000.000" },
          { key: "jenisOutput", label: "Format Output", type: "select", options: ["Proposal Lengkap", "Proposal Ringkas (1 Halaman)", "Proposal Sponsorship"] },
        ]}
        systemPrompt="Anda menyusun Proposal Kegiatan Masjid profesional dengan format terstruktur: Latar Belakang, Dasar Pemikiran, Tujuan & Manfaat, Bentuk Kegiatan, Waktu & Tempat, Susunan Panitia, Rencana Anggaran, Sponsorship Package, dan Penutup."
        docType="proposal"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  if (moduleKey === "admin-surat") {
    return (
      <GenericAdminModule
        moduleTitle="Surat Resmi DKM Masjid"
        moduleDesc="Buat surat permohonan peminjaman tempat, surat rekomendasi, surat tugas, atau pemberitahuan."
        fields={[
          { key: "jenisSurat", label: "Jenis Surat", type: "select", options: ["Surat Pemberitahuan", "Surat Permohonan Izin / Tempat", "Surat Tugas", "Surat Rekomendasi", "Surat Ucapan Terima Kasih", "Surat Pengantar"] },
          { key: "nomorSurat", label: "Nomor Surat (Opsional)", type: "text", placeholder: "Kosongkan jika ingin [NEEDS INPUT]" },
          { key: "perihal", label: "Perihal Surat", type: "text", placeholder: "Pemberitahuan Kegiatan Tabligh Akbar", required: true },
          { key: "kepada", label: "Tujuan Surat (Kepada Yth.)", type: "text", placeholder: "Bapak Lurah / Kapolsek / Warga RT 05", required: true },
          { key: "isiPoin", label: "Poin-poin Isi Surat", type: "textarea", placeholder: "Sampaikan maksud dan waktu kegiatan...", required: true },
          { key: "penandatangan", label: "Penandatangan", type: "text", placeholder: "Ketua DKM & Sekretaris" },
        ]}
        systemPrompt="Anda menyusun Surat Resmi Masjid sesuai standar administrasi organisasi Islam. Struktur: Kop Surat placeholder, Nomor, Lampiran, Perihal, Salam Pembuka, Isi Pokok, Salam Penutup, Tempat & Tanggal, Kolom Tanda Tangan."
        docType="surat"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  if (moduleKey === "admin-undangan") {
    return (
      <GenericAdminModule
        moduleTitle="Surat Undangan DKM"
        moduleDesc="Buat surat undangan resmi pengajian, rapat pengurus, atau santunan."
        fields={[
          { key: "acara", label: "Nama Acara / Kegiatan", type: "text", placeholder: "Rapat Pleno Persiapan Idul Adha", required: true },
          { key: "kepada", label: "Ditujukan Kepada", type: "text", placeholder: "Seluruh Pengurus DKM & Tokoh Masyarakat", required: true },
          { key: "hariTanggal", label: "Hari / Tanggal", type: "text", placeholder: "Sabtu Malam Ahad, 22 Agustus 2026", required: true },
          { key: "waktu", label: "Waktu", type: "text", placeholder: "Ba'da Isya (19.30 WIB) s/d Selesai" },
          { key: "tempat", label: "Tempat Acara", type: "text", placeholder: "Ruang Rapat Utama Masjid" },
          { key: "agenda", label: "Agenda Pembahasan", type: "textarea", placeholder: "1. Pembentukan Panitia Qurban\n2. Sosialisasi SOP Penyembelihan" },
        ]}
        systemPrompt="Anda menyusun Surat Undangan Kegiatan Masjid yang sopan, jelas, dan resmi."
        docType="surat"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  if (moduleKey === "admin-sertifikat") {
    return (
      <GenericAdminModule
        moduleTitle="Sertifikat Kegiatan Masjid"
        moduleDesc="Buat naskah piagam penghargaan untuk peserta pesantren kilat, panitia qurban, atau narasumber."
        fields={[
          { key: "jenisSertifikat", label: "Sebagai / Kategori", type: "select", options: ["Peserta", "Panitia Pelaksana", "Narasumber / Pemateri", "Juara / Prestasi", "Donatur Utama"] },
          { key: "namaPenerima", label: "Nama Penerima", type: "text", placeholder: "Muhammad Rizky Pratama", required: true },
          { key: "namaKegiatan", label: "Nama Kegiatan / Acara", type: "text", placeholder: "Pesantren Kilat Ramadan 1448 H", required: true },
          { key: "predikat", label: "Predikat / Keterangan (Opsional)", type: "text", placeholder: "Sebagai Peserta Terbaik Kategori Tahfizh Juz 30" },
          { key: "tanggal", label: "Tanggal Penetapan", type: "text", placeholder: "25 Ramadhan 1448 H / 12 September 2026" },
        ]}
        systemPrompt="Anda menyusun teks Piagam Penghargaan / Sertifikat Masjid yang formal, indah bahasanya, dan khidmat."
        docType="sertifikat"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  if (moduleKey === "admin-lpj") {
    return (
      <GenericAdminModule
        moduleTitle="LPJ (Laporan Pertanggungjawaban)"
        moduleDesc="Susun laporan pertanggungjawaban kegiatan, kepanitiaan, atau kepengurusan."
        fields={[
          { key: "namaKegiatan", label: "Nama Kegiatan", type: "text", placeholder: "Kepanitiaan Ibadah Qurban 1447 H", required: true },
          { key: "pelaksanaan", label: "Ringkasan Pelaksanaan", type: "textarea", placeholder: "Kegiatan berjalan lancar dengan pemotongan 12 sapi dan 25 kambing...", required: true },
          { key: "pesertaPenerima", label: "Peserta / Penerima Manfaat", type: "text", placeholder: "Didistribusikan ke 650 KK warga sekitar" },
          { key: "penggunaanDana", label: "Penggunaan Anggaran", type: "textarea", placeholder: "Pemasukan Rp 45.000.000, Pengeluaran Rp 42.500.000, Saldo Rp 2.500.000" },
          { key: "kendalaSolusi", label: "Kendala & Rekomendasi", type: "textarea", placeholder: "Perlu tambahan tempat pencacahan daging untuk tahun depan." },
        ]}
        systemPrompt="Anda menyusun Laporan Pertanggungjawaban (LPJ) resmi masjid: Identitas Kegiatan, Laporan Pelaksanaan, Hasil & Distribusi, Laporan Keuangan, Evaluasi & Rekomendasi, Penutup."
        docType="lpj"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  if (moduleKey === "admin-tor") {
    return (
      <GenericAdminModule
        moduleTitle="TOR (Term of Reference)"
        moduleDesc="Kerangka acuan kerja program takmir masjid."
        fields={[
          { key: "namaProgram", label: "Nama Program / Proyek", type: "text", placeholder: "Program Inkubasi Wirausaha Masjid", required: true },
          { key: "latarBelakang", label: "Latar Belakang & Urgensi", type: "textarea", placeholder: "Pemberdayaan ekonomi umat berbasis jamaah masjid...", required: true },
          { key: "tujuanOutput", label: "Tujuan & Output yang Diharapkan", type: "textarea", placeholder: "Melatih 30 UMKM binaan masjid dan memberikan modal bergulir" },
          { key: "metodePelaksanaan", label: "Metode & Tahapan Pelaksanaan", type: "textarea", placeholder: "Pelatihan 4 pekan, pendampingan usaha 3 bulan..." },
          { key: "anggaran", label: "Kebutuhan Anggaran", type: "text", placeholder: "Rp 50.000.000" },
        ]}
        systemPrompt="Anda menyusun Kerangka Acuan Kerja (TOR / Term of Reference) program masjid yang terstruktur, metodis, dan jelas indikator keberhasilannya."
        docType="tor"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  if (moduleKey === "admin-notulen") {
    return (
      <GenericAdminModule
        moduleTitle="Notulen Rapat DKM"
        moduleDesc="Catat hasil rapat musyawarah pengurus masjid dan tindak lanjutnya."
        fields={[
          { key: "namaRapat", label: "Nama / Agenda Rapat", type: "text", placeholder: "Rapat Evaluasi Shalat Tarawih & I'tikaf", required: true },
          { key: "waktuTempat", label: "Waktu & Tempat", type: "text", placeholder: "Senin Malam, 10 Agustus 2026 di Serambi Masjid" },
          { key: "pesertaRapat", label: "Peserta Rapat", type: "text", placeholder: "Ketua DKM, Bendahara, Sie Ibadah, Sie Kebersihan, Remaja Masjid" },
          { key: "poinPembahasan", label: "Poin-poin Pembahasan", type: "textarea", placeholder: "1. Evaluasi kapasitas parkir\n2. Jadwal imam & muadzin\n3. Pengadaan genset darurat", required: true },
          { key: "keputusanTindakLanjut", label: "Keputusan & PIC Tindak Lanjut", type: "textarea", placeholder: "Pengadaan genset disetujui, PIC: Pak Bambang, tenggat 1 pekan." },
        ]}
        systemPrompt="Anda menyusun Notulen Rapat resmi pengurus masjid: Identitas Rapat, Daftar Hadir ringkas, Pembahasan Per Agenda, Hasil Keputusan Musyawarah, dan Matriks Action Item (Aksi - PIC - Deadline)."
        docType="materi"
        onSave={onSave}
        onOpenDocEngine={onOpenDocEngine}
        branding={branding}
        prefill={prefill}
      />
    );
  }

  // Fallback: Berita Acara
  return (
    <GenericAdminModule
      moduleTitle="Berita Acara Masjid"
      moduleDesc="Buat berita acara serah terima donasi, pemilihan ketua DKM, atau inventaris masjid."
      fields={[
        { key: "namaPeristiwa", label: "Nama Kegiatan / Peristiwa", type: "text", placeholder: "Serah Terima Hibah Karpet Masjid & Sound System", required: true },
        { key: "waktuTempat", label: "Hari / Tanggal / Tempat", type: "text", placeholder: "Jumat, 21 Agustus 2026 di Kantor Sekretariat DKM", required: true },
        { key: "pihak1", label: "Pihak Pertama (Penyerah / Pembuat Pernyataan)", type: "text", placeholder: "H. Abdullah (Donatur / Wakif)" },
        { key: "pihak2", label: "Pihak Kedua (Penerima)", type: "text", placeholder: "Ketua DKM Masjid Al-Hikmah" },
        { key: "uraianKronologis", label: "Uraian Kejadian / Rincian Barang", type: "textarea", placeholder: "Telah diserahterimakan 10 gulung karpet premium turki dan 2 unit speaker wireless dalam kondisi baik...", required: true },
      ]}
      systemPrompt="Anda menyusun Dokumen Berita Acara resmi berkekuatan hukum organisasi masjid: Identitas Para Pihak, Uraian Kejadian Faktual, Bukti Serah Terima, dan Kolom Tanda Tangan Saksi-Saksi."
      docType="materi"
      onSave={onSave}
      onOpenDocEngine={onOpenDocEngine}
      branding={branding}
      prefill={prefill}
    />
  );
}
