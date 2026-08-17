import {
  MosqueBranding,
  MosqueEvent,
  CashTransaction,
  HistoryRecord,
  IdeaItem,
  EvaluationRecord,
  SocialCalendarItem,
} from "../types";

export const DEFAULT_BRANDING: MosqueBranding = {
  logo: "",
  namaMasjid: "Masjid Digital Nusantara",
  alamat: "Jl. Dakwah Ukhuwah No. 1, Jakarta",
  kota: "Jakarta",
  provinsi: "DKI Jakarta",
  telepon: "0812-3456-7890",
  email: "dkm@masjiddigital.id",
  kontak: "0812-3456-7890",
  website: "www.masjiddigital.id",
  medsos: "@masjiddigital.id",
  tagline: "Pusat Ibadah, Pembinaan Umat, dan Syiar Berkemajuan",
  rekeningBank: "Bank Syariah Indonesia (BSI) 7788-9900-11",
  rekeningInfaq: "BSI 7788-9900-11 a.n. Kas Masjid",
  rekeningYatim: "BSI 7788-9900-22 a.n. Santunan Yatim & Dhuafa",
  namaKetuaDkm: "H. Abdullah Shiddiq, M.A.",
  namaSekretaris: "Ust. Fadhil Rahman, S.Pd.I.",
  namaBendahara: "H. Ahmad Fauzi, S.E.",
};

export const DEFAULT_EVENTS: MosqueEvent[] = [
  {
    id: "ev-1",
    namaKegiatan: "Kajian Akbar Bulanan & Tabligh",
    kategori: "Kajian",
    tanggal: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    waktu: "19:45 WIB",
    lokasi: "Ruang Utama Masjid",
    pic: "Ust. DR. H. Syafiq Al-Bantani",
    status: "Dikonfirmasi",
    catatan: "Kajian tafsir tematik dan sesi tanya jawab interaktif.",
  },
  {
    id: "ev-2",
    namaKegiatan: "Bakti Sosial & Santunan Yatim",
    kategori: "Sosial",
    tanggal: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    waktu: "08:30 WIB",
    lokasi: "Serambi & Halaman Masjid",
    pic: "Divisi Sosial DKM",
    status: "Direncanakan",
    catatan: "Target 100 paket sembako dan santunan pendidikan.",
  },
  {
    id: "ev-3",
    namaKegiatan: "Tahsin Al-Qur'an Dewasa & Remaja",
    kategori: "Pendidikan",
    tanggal: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    waktu: "06:00 WIB",
    lokasi: "Selasar Barat",
    pic: "Ustadz Mukhlis Al-Hafidz",
    status: "Berjalan",
    catatan: "Rutin setiap Ahad pagi ba'da Subuh.",
  },
];

export const DEFAULT_TRANSACTIONS: CashTransaction[] = [
  {
    id: "tx-1",
    tanggal: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    kategori: "Pemasukan",
    jenis: "Infaq Jumat",
    deskripsi: "Kotak amal shalat Jumat berjamaah",
    nominal: 4250000,
    pj: "H. Ahmad Fauzi",
  },
  {
    id: "tx-2",
    tanggal: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    kategori: "Pemasukan",
    jenis: "Donasi QRIS",
    deskripsi: "Transfer donasi QRIS masjid",
    nominal: 1850000,
    pj: "Sekretariat",
  },
  {
    id: "tx-3",
    tanggal: new Date(Date.now() - 86400000 * 4).toISOString().slice(0, 10),
    kategori: "Pengeluaran",
    jenis: "Operasional & Listrik",
    deskripsi: "Pembayaran tagihan listrik PLN dan air PDAM",
    nominal: 1350000,
    pj: "Bagian Sarpras",
  },
  {
    id: "tx-4",
    tanggal: new Date(Date.now() - 86400000 * 5).toISOString().slice(0, 10),
    kategori: "Pengeluaran",
    jenis: "Honor & Mukafaah",
    deskripsi: "Mukafaah Imam, Muadzin & Marbot Masjid",
    nominal: 3000000,
    pj: "Bendahara",
  },
];

export const DEFAULT_IDEAS: IdeaItem[] = [
  {
    id: "idea-1",
    createdAt: new Date().toISOString().slice(0, 10),
    category: "Dakwah & Kajian",
    rawInput: "Podcast kajian singkat untuk anak muda di reels dan spotify",
    problem: "Jamaah usia muda jarang hadir pada kajian umum ba'da Isya.",
    opportunity: "Membuat seri kajian 3-5 menit pembahasan fikih sehari-hari dan self-healing islami.",
    ideaText: "Program 'Tanya Ustadz Live & Micro-Podcast Ramadan'",
    target: "Remaja & Pemuda Sekitar Masjid (15-30 tahun)",
    potentialImpact: "Meningkatkan partisipasi pemuda masjid dan memperluas jangkauan dakwah digital.",
    status: "Planned",
    priority: {
      impact: "Tinggi",
      urgency: "Sedang",
      feasibility: "Tinggi",
      cost: "Rendah",
      humanResources: "Remaja Masjid",
    },
    developmentText: "Siapkan ring-light, mikrofon clip-on, dan jadwal ustadz muda tiap Sabtu malam.",
  },
];

export const DEFAULT_HISTORY: HistoryRecord[] = [
  {
    id: "hist-1",
    title: "Khutbah Jumat: Merawat Persaudaraan dan Kepedulian Umat",
    type: "Khutbah Jumat",
    date: new Date().toISOString().slice(0, 10),
    status: "Siap pakai",
    content: `# Khutbah Jumat: Merawat Persaudaraan dan Kepedulian Umat

## Khutbah Pertama
الحمد لله رب العالمين، والصلاة والسلام على أشرف الأنبياء والمرسلين...

Ma'asyiral muslimin rahimakumullah,
Marilah kita senantiasa meningkatkan ketaqwaan kepada Allah Subhanahu wa Ta'ala dengan sebenar-benarnya taqwa...`,
  },
];

export const DEFAULT_EVALUATIONS: EvaluationRecord[] = [
  {
    id: "eval-1",
    createdAt: new Date().toISOString().slice(0, 10),
    namaKegiatan: "Peringatan Isra Mi'raj 1447 H",
    tanggal: new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10),
    targetPeserta: "250",
    pesertaAktual: "310",
    anggaran: "Rp 8.500.000",
    biayaAktual: "Rp 7.900.000",
    attendanceRate: "124%",
    budgetUtil: "93%",
    tujuan: "Meningkatkan kesadaran shalat berjamaah tepat waktu dan silaturahmi jamaah.",
    hasil: "Jamaah sangat antusias, serambi masjid terisi penuh hingga teras luar.",
    kendala: "Sound system di bagian sayap kiri sempat ada distorsi kecil pada 10 menit awal.",
    berjalanBaik: "Konsumsi mencukupi dan panitia remaja masjid sangat cekatan menyambut tamu.",
    pencapaianTujuan: "Sangat Tercapai (100%)",
    responJamaah: "Sangat Positif & Puas",
    catatanPanitia: "Perlu penambahan kipas angin kabut untuk acara berkapasitas besar berikutnya.",
    analysis: "Kegiatan berjalan sukses melebihi target kehadiran dengan efisiensi anggaran 7%.",
    aar: "Apa yang berjalan baik: Antusiasme dan koordinasi tim. Yang perlu diperbaiki: Cek sound system 2 jam sebelum acara.",
  },
];

export const DEFAULT_SOCIAL_CALENDAR: SocialCalendarItem[] = [
  {
    id: "soc-1",
    tanggal: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    platform: "Instagram & WhatsApp",
    konten: "Pengingat Puasa Sunnah Senin-Kamis & Hadits Keutamaan Amalan Pagi.",
    status: "Ready",
    campaign: "Syiar Harian",
    cta: "Mari sebarkan kebaikan ke grup keluarga & tetangga!",
  },
];

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`Error reading localStorage for key "${key}":`, err);
  }
  return defaultValue;
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage for key "${key}":`, err);
  }
}

// Storage helpers
export const loadBranding = (fallback: MosqueBranding = DEFAULT_BRANDING): MosqueBranding =>
  getStorage<MosqueBranding>("masjid-branding", fallback);
export const saveBranding = (data: MosqueBranding) =>
  setStorage("masjid-branding", data);

export const loadEvents = (fallback: MosqueEvent[] = DEFAULT_EVENTS): MosqueEvent[] =>
  getStorage<MosqueEvent[]>("masjid-event-calendar", fallback);
export const saveEvents = (data: MosqueEvent[]) =>
  setStorage("masjid-event-calendar", data);

export const loadTransactions = (fallback: CashTransaction[] = DEFAULT_TRANSACTIONS): CashTransaction[] =>
  getStorage<CashTransaction[]>("masjid-cash-transactions", fallback);
export const saveTransactions = (data: CashTransaction[]) =>
  setStorage("masjid-cash-transactions", data);

export const loadHistory = (fallback: HistoryRecord[] = DEFAULT_HISTORY): HistoryRecord[] =>
  getStorage<HistoryRecord[]>("masjid-history", fallback);
export const saveHistory = (data: HistoryRecord[]) =>
  setStorage("masjid-history", data);

export const loadIdeas = (fallback: IdeaItem[] = DEFAULT_IDEAS): IdeaItem[] =>
  getStorage<IdeaItem[]>("masjid-ideabank", fallback);
export const saveIdeas = (data: IdeaItem[]) =>
  setStorage("masjid-ideabank", data);

export const loadEvaluations = (fallback: EvaluationRecord[] = DEFAULT_EVALUATIONS): EvaluationRecord[] =>
  getStorage<EvaluationRecord[]>("masjid-evaluasi", fallback);
export const saveEvaluations = (data: EvaluationRecord[]) =>
  setStorage("masjid-evaluasi", data);

export const loadSocialCalendar = (fallback: SocialCalendarItem[] = DEFAULT_SOCIAL_CALENDAR): SocialCalendarItem[] =>
  getStorage<SocialCalendarItem[]>("masjid-calendar", fallback);
export const saveSocialCalendar = (data: SocialCalendarItem[]) =>
  setStorage("masjid-calendar", data);

export function exportAllBackupJson(): string {
  const keys = [
    "masjid-history",
    "masjid-calendar",
    "masjid-ideabank",
    "masjid-community",
    "masjid-evaluasi",
    "masjid-event-calendar",
    "masjid-branding",
    "masjid-doc-settings",
    "masjid-cash-transactions",
  ];
  const data: Record<string, unknown> = {};
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      data[k] = raw ? JSON.parse(raw) : null;
    } catch {
      data[k] = null;
    }
  }
  return JSON.stringify(
    {
      app: "Sistem Informasi & Dakwah Masjid Digital",
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2
  );
}

export const exportAllDataJson = exportAllBackupJson;

export function importAllBackupJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    const data = (parsed.data || parsed) as Record<string, unknown>;
    for (const [k, v] of Object.entries(data)) {
      if (v !== null && v !== undefined) {
        localStorage.setItem(k, JSON.stringify(v));
      }
    }
    return true;
  } catch (err) {
    console.error("Failed to import backup JSON:", err);
    return false;
  }
}

export const importAllDataJson = importAllBackupJson;

export function resetAllDataToDefault(): void {
  const keys = [
    "masjid-history",
    "masjid-calendar",
    "masjid-ideabank",
    "masjid-community",
    "masjid-evaluasi",
    "masjid-event-calendar",
    "masjid-branding",
    "masjid-doc-settings",
    "masjid-cash-transactions",
  ];
  for (const k of keys) {
    localStorage.removeItem(k);
  }
}
