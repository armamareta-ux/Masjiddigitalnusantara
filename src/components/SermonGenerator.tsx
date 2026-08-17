import React, { useState, useEffect, useRef } from "react";
import {
  Wand2,
  Minimize2,
  Maximize2,
  Heart,
  RotateCcw,
  ShieldCheck,
  Copy,
  Download,
  Loader2,
  Check,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Plus,
  Printer,
  BookOpen,
  Megaphone,
  Clock,
  User,
  MapPin,
  FileText,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Sliders,
  Share2,
} from "lucide-react";
import { DalilItem, QualityCheckItem, HistoryRecord } from "../types";
import { callGeminiAi, parseSermonResponse, parseJsonArrayRobust } from "../utils/ai";

export interface SermonGeneratorProps {
  pageTitle: string;
  pageSub: string;
  jenisOptions: string[];
  defaultJenis: string;
  historyType: string;
  onSave: (record: HistoryRecord) => void;
  onOpenDocEngine: (content: string, title: string, dalil?: DalilItem[]) => void;
  prefill?: Record<string, string>;
}

interface PresetItem {
  label: string;
  jenis: string;
  tujuan: string;
  temaKategori: string;
  tema: string;
  subtema: string;
  targetJamaah: string;
  gaya: string;
  durasi: string;
  namaPembicara?: string;
  namaAcara?: string;
  tamuVip?: string;
  pakaiPantun?: boolean;
  catatan?: string;
}

const PRESETS: PresetItem[] = [
  {
    label: "🕌 Khutbah: Menjaga Integritas & Lisan Digital",
    jenis: "Khutbah Jumat",
    tujuan: "Mengingatkan & Membangun Kesadaran",
    temaKategori: "Kehidupan Modern",
    tema: "Etika Bermedia Sosial & Gadget",
    subtema: "Menghindari ghibah, hoaks, dan fitnah di era digital",
    targetJamaah: "Jamaah Umum Masjid",
    gaya: "Tadabbur & Reflektif",
    durasi: "15 menit (Khutbah Jumat)",
    catatan: "Sertakan rukun khutbah lengkap Khutbah I dan Khutbah II dengan lafadz Arab mukaddimah dan doa penutup.",
  },
  {
    label: "🌿 Khutbah: Merajut Ukhuwah & Sabar Menghadapi Ujian",
    jenis: "Khutbah Jumat",
    tujuan: "Memotivasi & Menguatkan Iman",
    temaKategori: "Akhlak",
    tema: "Sabar dalam Ujian",
    subtema: "Membangun ketahanan mental dan ketakwaan di masa sulit",
    targetJamaah: "Jamaah Umum Masjid",
    gaya: "Inspiratif & Menggugah Semangat",
    durasi: "15 menit (Khutbah Jumat)",
    catatan: "Kutip QS. Al-Baqarah: 153 dan hadits tentang keutamaan sabar.",
  },
  {
    label: "✨ Khutbah Idul Fitri: Menjaga Kesucian Fitrah",
    jenis: "Khutbah Idul Fitri",
    tujuan: "Mengingatkan & Membangun Kesadaran",
    temaKategori: "Ibadah",
    tema: "Puasa & Pengendalian Diri",
    subtema: "Melanjutkan spirit taqwa Ramadan dan memaafkan sesama",
    targetJamaah: "Keluarga & Jamaah Umum",
    gaya: "Menyentuh Hati & Renungan",
    durasi: "20 menit (Kajian Ba'da Maghrib)",
    catatan: "Awali dengan takbir 9 kali pada khutbah pertama dan 7 kali pada khutbah kedua.",
  },
  {
    label: "📢 Sambutan Ketua DKM: Laporan & Syukur Renovasi Masjid",
    jenis: "Sambutan Ketua DKM",
    tujuan: "Menggerakkan Jamaah untuk Kepedulian Sosial",
    temaKategori: "Sosial",
    tema: "Gotong Royong Memakmurkan Masjid",
    subtema: "Pertanggungjawaban amanah pembangunan dan apresiasi donatur",
    targetJamaah: "Jamaah Umum Masjid",
    gaya: "Praktis & Solutif",
    durasi: "7 menit (Kultum Standar)",
    namaPembicara: "H. Ahmad Fauzi (Ketua DKM)",
    namaAcara: "Syukuran Peresmian Renovasi & Silaturahmi Akbar",
    tamuVip: "Bapak Camat, Lurah, Para Alim Ulama, Tokoh Masyarakat, dan Seluruh Donatur Jamaah",
    pakaiPantun: true,
    catatan: "Sampaikan rasa terima kasih mendalam atas infaq/sedekah jamaah dan ajak memakmurkan shalat berjamaah.",
  },
  {
    label: "🎤 Sambutan Panitia: Peringatan Maulid Nabi SAW",
    jenis: "Sambutan Panitia Acara",
    tujuan: "Memotivasi & Menguatkan Iman",
    temaKategori: "Akhlak",
    tema: "Keteladanan Rasulullah SAW",
    subtema: "Meneladani akhlak mulia Nabi dalam kehidupan bertetangga",
    targetJamaah: "Keluarga & Pemuda",
    gaya: "Inspiratif & Menggugah Semangat",
    durasi: "7 menit (Kultum Standar)",
    namaPembicara: "Ketua Panitia PHBI",
    namaAcara: "Peringatan Maulid Nabi Muhammad SAW 1448 H",
    tamuVip: "Penceramah Tamu, Pengurus DKM, RT/RW, dan Jamaah Sekalian",
    pakaiPantun: true,
    catatan: "Sampaikan laporan singkat persiapan acara dan permohonan maaf atas segala kekurangan panitia.",
  },
  {
    label: "🌙 Sambutan: Tarhib Menyambut Bulan Suci Ramadan",
    jenis: "Sambutan Tarhib Ramadan",
    tujuan: "Mengajak Beramal Shalih",
    temaKategori: "Ibadah",
    tema: "Puasa & Pengendalian Diri",
    subtema: "Persiapan fisik, mental, dan ruhiyah menyambut tamu agung Ramadan",
    targetJamaah: "Jamaah Umum Masjid",
    gaya: "Inspiratif & Menggugah Semangat",
    durasi: "10 menit",
    namaPembicara: "Ketua DKM / Panitia Ramadan",
    namaAcara: "Tarhib Ramadan & Pengajian Akbar",
    tamuVip: "Para Kiai, Asatidz, Pengurus Musholla sekitar, dan Jamaah",
    pakaiPantun: true,
    catatan: "Uraikan rangkaian program Ramadan: Takjil gratis, Shalat Tarawih, Tadarus, Santunan, dan I'tikaf 10 hari terakhir.",
  },
  {
    label: "❤️ Sambutan: Santunan Yatim & Dhuafa",
    jenis: "Sambutan Pembukaan PHBI",
    tujuan: "Menggerakkan Jamaah untuk Kepedulian Sosial",
    temaKategori: "Sosial",
    tema: "Kepedulian Fakir Miskin & Yatim",
    subtema: "Menebar kasih sayang dan keberkahan harta",
    targetJamaah: "Jamaah Umum & Anak Yatim",
    gaya: "Menyentuh Hati & Renungan",
    durasi: "5 menit (Kultum Singkat)",
    namaPembicara: "Koordinator Sie Sosial DKM",
    namaAcara: "Penyaluran Santunan Yatim & Muharram Ceria",
    tamuVip: "Anak-anak Yatim Binaan, Para Muzakki, dan Pengurus DKM",
    pakaiPantun: true,
    catatan: "Kutip keutamaan menyayangi anak yatim bersama Rasulullah SAW di surga seperti dua jari.",
  },
  {
    label: "💡 Kultum 7 Menit: 3 Kunci Keberkahan Rezeki",
    jenis: "Kultum Ba'da Dzuhur",
    tujuan: "Menasihati & Memperbaiki Akhlak",
    temaKategori: "Kehidupan Modern",
    tema: "Karier, Rezeki & Integritas",
    subtema: "Rezeki berkah melalui istighfar, silaturahmi, dan sedekah",
    targetJamaah: "Pekerja & Profesional",
    gaya: "Praktis & Solutif",
    durasi: "7 menit (Kultum Standar)",
    catatan: "Fokus pada 3 poin praktis yang mudah diingat dan langsung diamalkan saat kembali beraktivitas.",
  },
];

const TUJUAN = [
  "Mengingatkan & Membangun Kesadaran",
  "Mengajak Beramal Shalih",
  "Menasihati & Memperbaiki Akhlak",
  "Memotivasi & Menguatkan Iman",
  "Menjelaskan Hukum & Masalah Fiqih",
  "Menjawab Persoalan Kehidupan Jamaah",
  "Menggerakkan Jamaah untuk Kepedulian Sosial",
];

const TEMA: Record<string, string[]> = {
  Akidah: ["Tauhid & Keikhlasan", "Iman kepada Allah", "Tawakal & Ridha", "Hari Akhir & Kematian", "Takdir & Husnuzan"],
  Ibadah: [
    "Keutamaan Shalat Berjamaah",
    "Kunci Khusyuk Shalat",
    "Zakat & Pembersih Harta",
    "Puasa & Pengendalian Diri",
    "Dzikir & Doa Mustajab",
    "Istiqamah dalam Ibadah",
  ],
  Akhlak: [
    "Sabar dalam Ujian",
    "Syukur atas Nikmat",
    "Amanah & Kejujuran",
    "Rendah Hati (Tawadhu)",
    "Menjaga Lisan di Era Digital",
    "Memaafkan & Berdamai",
    "Birrul Walidain (Berbakti Orang Tua)",
  ],
  Keluarga: [
    "Membangun Rumah Tangga Sakinah",
    "Pendidikan Anak Islami",
    "Hak Suami & Istri",
    "Keteladanan Orang Tua",
    "Menghadapi Konflik Rumah Tangga",
  ],
  Sosial: [
    "Ukhuwah Islamiyah",
    "Hak Tetangga",
    "Kepedulian Fakir Miskin & Yatim",
    "Sedekah Menolak Bala",
    "Gotong Royong Memakmurkan Masjid",
  ],
  "Kehidupan Modern": [
    "Etika Bermedia Sosial & Gadget",
    "Kesehatan Mental dalam Islam",
    "Menghadapi Quarter-Life Crisis & FOMO",
    "Karier, Rezeki & Integritas",
    "Pendidikan & Masa Depan Generasi Muda",
  ],
  "Remaja & Pemuda": [
    "Pergaulan Sehat & Menjaga Diri",
    "Cita-cita Mulia Pemuda Muslim",
    "Menghadapi Galau & Krisis Identitas",
    "Meneladani Pemuda Ashabul Kahfi",
  ],
};

const TARGET_JAMAAH = [
  "Jamaah Umum Masjid",
  "Orang Tua & Lansia",
  "Pemuda & Remaja Masjid",
  "Keluarga Muda",
  "Pekerja & Profesional",
  "Ibu-ibu Pengajian",
  "Mahasiswa & Pelajar",
];

const GAYA_PENYAMPAIAN = [
  "Tadabbur & Reflektif",
  "Inspiratif & Menggugah Semangat",
  "Menyentuh Hati & Renungan",
  "Edukatif & Sistematis",
  "Praktis & Solutif",
  "Naratif (Kisah Nabi & Sahabat)",
  "Sederhana & Mudah Dipahami",
];

const DURASI = [
  "5 menit (Kultum Singkat)",
  "7 menit (Kultum Standar)",
  "10 menit",
  "15 menit (Khutbah Jumat)",
  "20 menit (Kajian Ba'da Maghrib)",
  "30 menit (Ceramah Lengkap)",
  "45 menit",
];

const BAHASA = [
  "Bahasa Indonesia",
  "Arab + Indonesia",
  "Bahasa Jawa (Krama Inggil)",
  "Bahasa Sunda (Lemes)",
  "Bahasa Melayu",
  "Bahasa Minangkabau",
  "Bahasa Inggris",
];

const SERMON_SYSTEM = `Anda adalah Arsitek Konten Dakwah, Khutbah Islami, dan Ahli Orasi/Pidato Sambutan DKM Masjid profesional. Anda menyusun naskah yang berbobot, beradab, menyentuh, memiliki rujukan shahih, dan siap dibacakan langsung.

ATURAN STRUKTUR:
1. Naskah Khutbah Jumat:
   - WAJIB penuhi Rukun Khutbah:
     * Khutbah Pertama: Hamdalah Arab lengkap, Shalawat Nabi Arab lengkap, Wasiat Takwa Arab/Indo ("Ittaqullah..."), Pembacaan minimal 1 ayat Al-Qur'an lengkap teks Arab & terjemah, Isi khutbah berbobot & aplikatif, Penutup Khutbah Pertama ("Barakallahu li walakum...").
     * Khutbah Kedua: Hamdalah & Shalawat Arab, Wasiat Takwa, Pembacaan doa ampunan bagi kaum muslimin/muslimat mukminin/mukminat ("Allahummaghfir lil muslimina wal muslimat..."), dan Penutup Khutbah Kedua ("Ibada Allah...").
2. Naskah Pidato & Sambutan:
   - Mukaddimah resmi (Salam, Hamdalah, Shalawat, Penghormatan tamu undangan/VIP secara runut dan sopan).
   - Ungkapan syukur dan pengantar momen acara.
   - Poin inti sambutan (Laporan panitia/DKM, pesan motivasi, ajakan, apresiasi donatur/relawan).
   - Pantun pembuka atau penutup jika diminta.
   - Penutup santun, permohonan maaf, doa restu, dan salam.
3. Naskah Ceramah / Kajian / Kultum:
   - Mukaddimah pembuka.
   - Poin bahasan terstruktur (1-3 poin kunci).
   - Dalil Al-Qur'an & Hadits shahih dengan teks Arab berharakat dan artinya.
   - Aplikasi nyata dalam keseharian.
   - Kesimpulan dan doa penutup.

FORMAT OUTPUT WAJIB:
Tulis naskah lengkap dalam format Markdown.
Setelah naskah selesai, tulis baris pemisah PERSIS: ===DALIL===
Lalu tulis array JSON dari semua dalil yang dikutip:
[{"text":"kutipan dalil atau artinya","reference":"QS. Al-Baqarah: 153 atau HR. Bukhari no. ...","status":"VERIFIED"|"NEEDS CONTEXT"|"NEEDS VERIFICATION"|"NOT RECOMMENDED","note":"catatan ringkas"}]
Jika tidak ada dalil eksplisit, tulis [].`;

export function SermonGenerator({
  pageTitle,
  pageSub,
  jenisOptions,
  defaultJenis,
  historyType,
  onSave,
  onOpenDocEngine,
  prefill,
}: SermonGeneratorProps) {
  const isPidatoMode = historyType.toLowerCase().includes("pidato") || pageTitle.toLowerCase().includes("pidato") || pageTitle.toLowerCase().includes("sambutan");

  const [form, setForm] = useState({
    jenis: defaultJenis || jenisOptions[0] || "",
    tujuan: isPidatoMode ? TUJUAN[6] : TUJUAN[0],
    temaKategori: isPidatoMode ? "Sosial" : "Akhlak",
    tema: isPidatoMode ? "Gotong Royong Memakmurkan Masjid" : "Sabar dalam Ujian",
    subtema: "",
    targetJamaah: TARGET_JAMAAH[0],
    gaya: isPidatoMode ? GAYA_PENYAMPAIAN[1] : GAYA_PENYAMPAIAN[0],
    durasi: isPidatoMode ? DURASI[1] : DURASI[3],
    bahasa: BAHASA[0],
    namaPembicara: "Ketua DKM Masjid",
    namaAcara: "Peringatan Hari Besar Islam & Silaturahmi Jamaah",
    tamuVip: "Bapak Camat, Lurah, Para Alim Ulama, Sesepuh, dan Seluruh Jamaah",
    pakaiPantun: isPidatoMode,
    catatan: "",
    ...prefill,
  });

  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [naskah, setNaskah] = useState("");
  const [dalil, setDalil] = useState<DalilItem[]>([]);
  const [toolLoading, setToolLoading] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [quality, setQuality] = useState<QualityCheckItem[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Teleprompter / Reader Mode
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(2);
  const teleprompterRef = useRef<HTMLDivElement>(null);

  const setF = (k: string, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }));

  const applyPreset = (p: PresetItem) => {
    setForm((prev) => ({
      ...prev,
      jenis: p.jenis,
      tujuan: p.tujuan,
      temaKategori: p.temaKategori,
      tema: p.tema,
      subtema: p.subtema,
      targetJamaah: p.targetJamaah,
      gaya: p.gaya,
      durasi: p.durasi,
      namaPembicara: p.namaPembicara || prev.namaPembicara,
      namaAcara: p.namaAcara || prev.namaAcara,
      tamuVip: p.tamuVip || prev.tamuVip,
      pakaiPantun: p.pakaiPantun ?? prev.pakaiPantun,
      catatan: p.catatan || prev.catatan,
    }));
  };

  const handleGenerate = async () => {
    setStep("loading");
    setSaved(false);
    try {
      const isSpeech = form.jenis.toLowerCase().includes("sambutan") || form.jenis.toLowerCase().includes("pidato");

      const prompt = `Buatkan naskah ${form.jenis} lengkap, berbobot, terstruktur dan siap dibacakan:
- Kategori / Jenis: ${form.jenis}
- Tujuan: ${form.tujuan}
- Kategori Tema: ${form.temaKategori}
- Tema Pokok: ${form.tema} ${form.subtema ? `(Fokus: ${form.subtema})` : ""}
- Sasaran Jamaah: ${form.targetJamaah}
- Gaya Penyampaian: ${form.gaya}
- Target Durasi Pembacaan: ${form.durasi}
- Bahasa: ${form.bahasa}
${isSpeech ? `- Nama Pembicara / Jabatan: ${form.namaPembicara}\n- Nama Acara: ${form.namaAcara}\n- Tamu Undangan / VIP yang dihormati: ${form.tamuVip}\n- Sertakan Pantun Islami: ${form.pakaiPantun ? "YA (Buat pantun pembuka dan pantun penutup yang berima indah)" : "Tidak"}` : ""}
${form.catatan ? `- Catatan Khusus: ${form.catatan}` : ""}`;

      const raw = await callGeminiAi({
        system: SERMON_SYSTEM,
        prompt,
      });

      const { naskah: n, dalil: d } = parseSermonResponse(raw);
      setNaskah(n);
      setDalil(d as DalilItem[]);
      setQuality(null);
      setStep("result");
    } catch (err: unknown) {
      alert(`Gagal membuat naskah: ${err instanceof Error ? err.message : "Terjadi kesalahan koneksi AI"}`);
      setStep("form");
    }
  };

  const handleApplyTool = async (instruction: string, toolKey: string) => {
    setToolLoading(toolKey);
    try {
      const prompt = `${instruction}

Naskah Saat Ini:
${naskah}

Daftar Dalil Terlampir:
${JSON.stringify(dalil)}

Keluarkan naskah revisi lengkap diikuti tanda pemisah persis ===DALIL=== dan array JSON dalil terbaru.`;

      const raw = await callGeminiAi({
        system: SERMON_SYSTEM,
        prompt,
      });

      const { naskah: n, dalil: d } = parseSermonResponse(raw);
      if (n) setNaskah(n);
      if (d && d.length) setDalil(d as DalilItem[]);
    } catch {
      alert("Gagal memproses perbaikan naskah.");
    } finally {
      setToolLoading(null);
    }
  };

  const handleVerifyAllDalil = async () => {
    setVerifyLoading(true);
    try {
      const prompt = `Periksa secara kritis semua kutipan dalil Al-Qur'an dan Hadits dalam naskah berikut. Periksa teks Arab, nomor ayat/surat, nama perawi hadits, derajat keshahihan, dan ketepatan konteksnya.

Naskah:
${naskah}

Dalil saat ini:
${JSON.stringify(dalil)}

Keluarkan HANYA array JSON valid:
[{"text":"...","reference":"...","status":"VERIFIED"|"NEEDS CONTEXT"|"NEEDS VERIFICATION"|"NOT RECOMMENDED","note":"catatan hasil verifikasi"}]`;

      const raw = await callGeminiAi({
        system: "Anda adalah pakar takhrij hadits dan verifikasi dalil Al-Qur'an.",
        prompt,
        jsonMode: true,
      });

      const parsed = await parseJsonArrayRobust<DalilItem>(raw);
      if (parsed) setDalil(parsed);
    } catch {
      alert("Gagal memverifikasi dalil.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRunQualityCheck = async () => {
    setQualityLoading(true);
    try {
      const prompt = `Lakukan evaluasi mutu (Quality Check) terhadap naskah ini berdasarkan 6 kriteria:
1. Akurasi Dalil & Kesesuaian Syariat
2. Keteraturan Sistematika & Rukun
3. Relevansi Masalah Nyata Jamaah
4. Kepraktisan Solusi & Nasihat
5. Keindahan Bahasa & Emosi Tadabbur
6. Ketepatan Waktu / Estimasi Durasi

Naskah:
${naskah}

Keluarkan HANYA array JSON:
[{"criterion":"...","status":"Sangat Baik"|"Baik"|"Perlu Perbaikan","note":"catatan evaluasi objektif"}]`;

      const raw = await callGeminiAi({
        system: "Anda adalah dewan penjamin mutu naskah dakwah & orasi masjid.",
        prompt,
        jsonMode: true,
      });

      const parsed = await parseJsonArrayRobust<QualityCheckItem>(raw);
      if (parsed) setQuality(parsed);
    } catch {
      alert("Gagal menjalankan Quality Check.");
    } finally {
      setQualityLoading(false);
    }
  };

  const handleSave = () => {
    const hasUnverified = dalil.some((d) => d.status === "NEEDS VERIFICATION" || d.status === "NOT RECOMMENDED");
    onSave({
      id: "sermon_" + Date.now(),
      title: `${form.jenis}: ${form.tema}`,
      type: historyType,
      date: new Date().toISOString(),
      status: hasUnverified ? "Perlu verifikasi" : "Siap pakai",
      content: naskah,
      dalil,
    });
    setSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(naskah);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([naskah], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.jenis.replace(/\s+/g, "_")}_${form.tema.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Teleprompter auto-scroll loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (teleprompterOpen && isAutoScrolling) {
      timer = setInterval(() => {
        if (teleprompterRef.current) {
          teleprompterRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    }
    return () => clearInterval(timer);
  }, [teleprompterOpen, isAutoScrolling, scrollSpeed]);

  const wordCount = naskah.split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.max(1, Math.round(wordCount / 125));

  // 1. Loading Step
  if (step === "loading") {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#0D110D] border border-[#C19D60]/30 flex items-center justify-center text-[#C19D60] shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#C19D60]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-serif text-[#E6E8E6]">Menyusun Naskah {form.jenis}...</h3>
          <p className="text-xs text-[#A3ABA3] max-w-sm">
            {isPidatoMode
              ? "Menyusun penghormatan tamu, merangkai kalimat sambutan yang elegan, dan menyisipkan pantun islami..."
              : "Menyelaraskan rukun khutbah, mengutip dalil Al-Qur'an & Hadits shahih, dan merangkai nasihat yang menyentuh..."}
          </p>
        </div>
      </div>
    );
  }

  // 2. Result Step
  if (step === "result") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => setStep("form")}
              className="inline-flex items-center gap-1.5 text-xs text-[#A3ABA3] hover:text-[#C19D60] font-semibold mb-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali Ubah Parameter
            </button>
            <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">
              {form.jenis}: {form.tema}
            </h1>
            <p className="text-xs text-[#A3ABA3] mt-0.5">
              Estimasi Pembacaan: ~{estimatedMinutes} Menit ({wordCount} kata) • {form.durasi}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTeleprompterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D110D] border border-[#C19D60]/30 text-[#C19D60] rounded-xl text-xs font-bold hover:bg-[#C19D60]/15 shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5" /> Mode Mimbar / Teleprompter
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D110D] border border-[#C19D60]/20 text-[#E6E8E6] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C19D60]" />}
              {copied ? "Tersalin!" : "Salin Naskah"}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D110D] border border-[#C19D60]/20 text-[#E6E8E6] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#C19D60]" /> Unduh TXT
            </button>

            <button
              onClick={() => onOpenDocEngine(naskah, `${form.jenis} - ${form.tema}`, dalil)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / Kop Surat DKM
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#C19D60]/15 pb-2">
                <span className="font-mono text-xs font-bold text-[#A3ABA3] uppercase">
                  Editor Naskah ({wordCount} kata)
                </span>
                <span className="text-[11px] text-[#C19D60] bg-[#C19D60]/15 border border-[#C19D60]/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {form.durasi} • {form.bahasa}
                </span>
              </div>
              <textarea
                value={naskah}
                onChange={(e) => setNaskah(e.target.value)}
                rows={18}
                className="w-full text-xs font-serif leading-relaxed p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl focus:outline-none focus:border-[#C19D60] text-[#E6E8E6]"
              />
            </div>

            {/* Quality check results */}
            {quality && (
              <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-sm font-serif text-[#E6E8E6] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C19D60]" /> Hasil AI Quality Check
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quality.map((q, idx) => (
                    <div key={idx} className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15 text-xs">
                      <div className="flex items-center justify-between font-semibold text-[#E6E8E6] mb-1">
                        <span>{q.criterion}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            q.status.includes("Sangat") || q.status === "Baik"
                              ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-900/60 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A3ABA3]">{q.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Tools & Dalil */}
          <div className="space-y-4">
            {/* AI Refine Tools */}
            <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-3">
              <span className="font-mono text-xs font-bold text-[#A3ABA3] uppercase tracking-wider block">
                Penyempurnaan AI Naskah
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={Boolean(toolLoading)}
                  onClick={() =>
                    handleApplyTool(
                      "Perbaiki naskah ini agar alurnya lebih kuat, dalil lebih tajam, serta pembukaan dan penutup lebih berkesan.",
                      "improve"
                    )
                  }
                  className="p-2 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-xs font-semibold text-[#E6E8E6] hover:bg-[#C19D60]/20 flex items-center gap-1.5 justify-center transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#C19D60]" /> {toolLoading === "improve" ? "Memproses..." : "Tingkatkan Alur"}
                </button>
                <button
                  disabled={Boolean(toolLoading)}
                  onClick={() =>
                    handleApplyTool("Persingkat naskah ini sekitar 30% tanpa menghilangkan rukun dan pesan inti.", "shorten")
                  }
                  className="p-2 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-xs font-semibold text-[#E6E8E6] hover:bg-[#C19D60]/20 flex items-center gap-1.5 justify-center transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-[#C19D60]" /> Lebih Singkat
                </button>
                <button
                  disabled={Boolean(toolLoading)}
                  onClick={() =>
                    handleApplyTool(
                      "Perluas naskah dengan contoh konkret dalam kehidupan masyarakat dan penjelasan hikmah mendalam.",
                      "expand"
                    )
                  }
                  className="p-2 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-xs font-semibold text-[#E6E8E6] hover:bg-[#C19D60]/20 flex items-center gap-1.5 justify-center transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#C19D60]" /> Lebih Lengkap
                </button>
                <button
                  disabled={Boolean(toolLoading)}
                  onClick={() =>
                    handleApplyTool(
                      "Buat naskah lebih menyentuh hati, tadabbur mendalam, dan menghadirkan renungan kematian/akhirat yang menggetarkan.",
                      "heart"
                    )
                  }
                  className="p-2 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-xs font-semibold text-[#E6E8E6] hover:bg-[#C19D60]/20 flex items-center gap-1.5 justify-center transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Lebih Menyentuh
                </button>
              </div>

              <div className="pt-2 border-t border-[#C19D60]/15 flex flex-col gap-2">
                <button
                  disabled={Boolean(toolLoading)}
                  onClick={() =>
                    handleApplyTool(
                      "Tambahkan 2 bait pantun Islami yang berima indah dan relevan di bagian pembuka dan penutup naskah.",
                      "pantun"
                    )
                  }
                  className="w-full py-2 bg-[#0A0D0A] border border-[#C19D60]/20 text-[#E6E8E6] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C19D60]" />
                  {toolLoading === "pantun" ? "Merangkai Pantun..." : "Sisipkan Pantun Islami"}
                </button>

                <button
                  disabled={qualityLoading}
                  onClick={handleRunQualityCheck}
                  className="w-full py-2 bg-[#0A0D0A] border border-[#C19D60]/20 text-[#E6E8E6] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C19D60]" />
                  {qualityLoading ? "Memeriksa Mutu..." : "Jalankan AI Quality Check"}
                </button>
              </div>
            </div>

            {/* Dalil Verification Box */}
            <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#A3ABA3] uppercase tracking-wider">
                  Verifikasi Dalil ({dalil.length})
                </span>
                <button
                  disabled={verifyLoading || dalil.length === 0}
                  onClick={handleVerifyAllDalil}
                  className="text-[11px] font-bold text-[#C19D60] hover:text-[#d4b074] flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {verifyLoading ? "Memeriksa..." : "Uji Keshahihan"}
                </button>
              </div>

              {dalil.length === 0 ? (
                <p className="text-xs text-[#A3ABA3]">Tidak ada dalil spesifik terdeteksi.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dalil.map((d, i) => (
                    <div key={i} className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/15 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                        <span className="text-[#E6E8E6]">{d.reference}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] ${
                            d.status === "VERIFIED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-600/30"
                              : "bg-amber-950 text-amber-300 border border-amber-600/30"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="text-[#A3ABA3] italic text-[11px]">{d.text}</p>
                      {d.note && <p className="text-[10px] text-[#C19D60]">{d.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save & Reset */}
            <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 shadow-sm space-y-2">
              <button
                disabled={saved}
                onClick={handleSave}
                className="w-full py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60 transition-colors"
              >
                {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {saved ? "Tersimpan di Riwayat" : "Simpan ke Riwayat DKM"}
              </button>
              <button
                onClick={() => setStep("form")}
                className="w-full py-2 bg-[#0A0D0A] border border-[#C19D60]/20 text-[#E6E8E6] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Buat Naskah Baru
              </button>
            </div>
          </div>
        </div>

        {/* Teleprompter / Podium Modal */}
        {teleprompterOpen && (
          <div className="fixed inset-0 z-50 bg-[#0A0D0A] text-[#E6E8E6] flex flex-col">
            {/* Header Controls */}
            <div className="p-4 border-b border-[#C19D60]/20 bg-[#0D110D] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-sm text-[#C19D60]">
                  Mode Mimbar: {form.jenis}
                </span>
                <span className="text-xs font-mono text-[#A3ABA3]">
                  ~{estimatedMinutes} Menit • {wordCount} kata
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-1">
                  <button
                    onClick={() => setFontSize((f) => Math.max(14, f - 2))}
                    className="p-1.5 text-[#A3ABA3] hover:text-[#E6E8E6]"
                    title="Perkecil Font"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono px-2 text-[#C19D60]">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize((f) => Math.min(36, f + 2))}
                    className="p-1.5 text-[#A3ABA3] hover:text-[#E6E8E6]"
                    title="Perbesar Font"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-1">
                  <button
                    onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                      isAutoScrolling ? "bg-emerald-600 text-white" : "bg-[#C19D60] text-[#0A0D0A]"
                    }`}
                  >
                    {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isAutoScrolling ? "Pause Auto-scroll" : "Start Auto-scroll"}
                  </button>
                  {isAutoScrolling && (
                    <select
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(Number(e.target.value))}
                      className="bg-[#0D110D] text-xs text-[#E6E8E6] border-none rounded px-2 py-1"
                    >
                      <option value={1}>Lambat (1x)</option>
                      <option value={2}>Normal (2x)</option>
                      <option value={3}>Cepat (3x)</option>
                    </select>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsAutoScrolling(false);
                    setTeleprompterOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl text-xs font-bold text-[#E6E8E6] hover:bg-[#C19D60]/20"
                >
                  Tutup Mimbar
                </button>
              </div>
            </div>

            {/* Reading Area */}
            <div
              ref={teleprompterRef}
              className="flex-1 overflow-y-auto p-8 sm:p-16 max-w-4xl mx-auto w-full leading-loose font-serif select-none"
              style={{ fontSize: `${fontSize}px` }}
            >
              <div className="whitespace-pre-wrap text-[#E6E8E6]">{naskah}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Form Step
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6] flex items-center gap-2">
          {isPidatoMode ? <Megaphone className="w-6 h-6 text-[#C19D60]" /> : <BookOpen className="w-6 h-6 text-[#C19D60]" />}
          {pageTitle}
        </h1>
        <p className="text-sm text-[#A3ABA3]">{pageSub}</p>
      </div>

      {/* Quick Inspiration Presets */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 shadow-sm space-y-2.5">
        <span className="text-xs font-bold font-serif text-[#C19D60] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Contoh &amp; Preset Siap Pakai (1-Klik Isi Form):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-[11px] font-medium px-3 py-1.5 bg-[#0A0D0A] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 text-[#E6E8E6] hover:text-[#C19D60] rounded-xl transition-all text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Parameters Form */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-6 shadow-sm space-y-5">
        {/* Jenis & Tujuan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Jenis Naskah</label>
            <select
              value={form.jenis}
              onChange={(e) => setF("jenis", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-semibold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {jenisOptions.map((j) => (
                <option key={j} value={j} className="bg-[#0D110D]">
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Tujuan Khutbah / Sambutan</label>
            <select
              value={form.tujuan}
              onChange={(e) => setF("tujuan", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {TUJUAN.map((t) => (
                <option key={t} value={t} className="bg-[#0D110D]">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special fields for Pidato & Sambutan */}
        {isPidatoMode && (
          <div className="p-4 bg-[#0A0D0A] rounded-2xl border border-[#C19D60]/25 space-y-3.5">
            <span className="font-mono text-xs font-bold text-[#C19D60] uppercase tracking-wider block">
              Parameter Khusus Orasi &amp; Sambutan
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Nama Pembicara / Jabatan</label>
                <input
                  type="text"
                  value={form.namaPembicara}
                  onChange={(e) => setF("namaPembicara", e.target.value)}
                  placeholder="Contoh: H. Ahmad Fauzi - Ketua DKM Masjid Al-Ikhlas"
                  className="w-full text-xs bg-[#0D110D] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Nama Acara / Momen</label>
                <input
                  type="text"
                  value={form.namaAcara}
                  onChange={(e) => setF("namaAcara", e.target.value)}
                  placeholder="Contoh: Peringatan Maulid Nabi Muhammad SAW 1448 H"
                  className="w-full text-xs bg-[#0D110D] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">
                Tamu Undangan / VIP yang Dihormati (Mukaddimah)
              </label>
              <input
                type="text"
                value={form.tamuVip}
                onChange={(e) => setF("tamuVip", e.target.value)}
                placeholder="Contoh: Bapak Camat, Kepala Desa, Para Alim Ulama, Sesepuh, serta Seluruh Jamaah"
                className="w-full text-xs bg-[#0D110D] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pakaiPantun"
                checked={form.pakaiPantun}
                onChange={(e) => setF("pakaiPantun", e.target.checked)}
                className="w-4 h-4 rounded text-[#C19D60] focus:ring-[#C19D60] bg-[#0D110D] border-[#C19D60]/30"
              />
              <label htmlFor="pakaiPantun" className="text-xs font-semibold text-[#E6E8E6] cursor-pointer">
                Sertakan Pantun Pembuka &amp; Penutup Islami yang Menarik
              </label>
            </div>
          </div>
        )}

        {/* Tema & Subtema */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Kategori Tema</label>
            <select
              value={form.temaKategori}
              onChange={(e) => {
                const cat = e.target.value;
                setF("temaKategori", cat);
                setF("tema", TEMA[cat]?.[0] || "");
              }}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {Object.keys(TEMA).map((k) => (
                <option key={k} value={k} className="bg-[#0D110D]">
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Tema Pokok</label>
            <select
              value={form.tema}
              onChange={(e) => setF("tema", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-semibold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {(TEMA[form.temaKategori] || []).map((t) => (
                <option key={t} value={t} className="bg-[#0D110D]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Fokus Khusus / Subtema</label>
            <input
              type="text"
              placeholder="Contoh: Menjaga lisan di medsos"
              value={form.subtema}
              onChange={(e) => setF("subtema", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
        </div>

        {/* Audiens, Gaya & Durasi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Target Jamaah</label>
            <select
              value={form.targetJamaah}
              onChange={(e) => setF("targetJamaah", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {TARGET_JAMAAH.map((a) => (
                <option key={a} value={a} className="bg-[#0D110D]">
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Gaya Bahasa &amp; Nada</label>
            <select
              value={form.gaya}
              onChange={(e) => setF("gaya", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {GAYA_PENYAMPAIAN.map((g) => (
                <option key={g} value={g} className="bg-[#0D110D]">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Target Durasi</label>
            <select
              value={form.durasi}
              onChange={(e) => setF("durasi", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {DURASI.map((d) => (
                <option key={d} value={d} className="bg-[#0D110D]">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bahasa & Catatan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Bahasa Naskah</label>
            <select
              value={form.bahasa}
              onChange={(e) => setF("bahasa", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {BAHASA.map((b) => (
                <option key={b} value={b} className="bg-[#0D110D]">
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#E6E8E6] mb-1.5">Catatan Khusus Tambahan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Singgung program santunan anak yatim masjid di akhir naskah"
              value={form.catatan}
              onChange={(e) => setF("catatan", e.target.value)}
              className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-sm font-bold hover:bg-[#d4b074] transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Wand2 className="w-4 h-4 text-[#0A0D0A]" /> Susun &amp; Generate Naskah {form.jenis} AI
        </button>
      </div>
    </div>
  );
}
