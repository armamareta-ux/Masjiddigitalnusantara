export interface DalilItem {
  text: string;
  reference: string;
  status: "VERIFIED" | "NEEDS CONTEXT" | "NEEDS VERIFICATION" | "NOT RECOMMENDED";
  note?: string;
}

export interface QualityCheckItem {
  criterion: string;
  status: string;
  note: string;
}

export interface HistoryRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  status: "Siap pakai" | "Perlu verifikasi" | "Draf";
  content: string;
  dalil?: DalilItem[];
  metadata?: Record<string, unknown>;
}

export interface SocialCalendarItem {
  id: string;
  tanggal: string;
  platform: string;
  konten: string;
  status: "Draft" | "Planned" | "Ready" | "Published" | "Archived";
  campaign?: string;
  cta?: string;
}

export interface IdeaItem {
  id: string;
  createdAt: string;
  category: string;
  rawInput: string;
  problem: string;
  opportunity: string;
  ideaText: string;
  target: string;
  potentialImpact: string;
  status: "Idea" | "Considering" | "Planned" | "Running" | "Completed" | "Postponed" | "Rejected";
  priority: {
    impact: string;
    urgency: string;
    feasibility: string;
    cost: string;
    humanResources: string;
  };
  developmentText?: string;
}

export interface CommunityProfile {
  id: string;
  createdAt: string;
  segmen: string;
  kelompokUsia?: string;
  jumlahPerkiraan?: string;
  minat?: string;
  kebutuhan?: string;
  masalahUtama?: string;
  tingkatPartisipasi?: string;
  programDiminati?: string;
  waktuTersedia?: string;
}

export interface EvaluationRecord {
  id: string;
  createdAt: string;
  namaKegiatan: string;
  tanggal?: string;
  durasi?: string;
  targetPeserta?: string;
  pesertaAktual?: string;
  anggaran?: string;
  biayaAktual?: string;
  attendanceRate?: string;
  budgetUtil?: string;
  tujuan?: string;
  hasil?: string;
  kendala?: string;
  berjalanBaik?: string;
  rekomendasiAi?: string;
  pencapaianTujuan: string;
  responJamaah: string;
  catatanPanitia?: string;
  eventId?: string;
  analysis: string;
  aar?: string;
}

export interface MosqueEvent {
  id: string;
  tanggal: string;
  waktu?: string;
  namaKegiatan: string;
  kategori: string;
  pic?: string;
  lokasi?: string;
  status: "Direncanakan" | "Dikonfirmasi" | "Berjalan" | "Selesai" | "Dibatalkan";
  catatan?: string;
}

export type EvaluationItem = EvaluationRecord;

export interface CashTransaction {
  id: string;
  tanggal: string;
  kategori: "Pemasukan" | "Pengeluaran";
  jenis: string; // Infaq Jumat, Kotak Amal, Donasi, Listrik, Honor, dll
  deskripsi: string;
  keterangan?: string;
  nominal: number;
  pj?: string;
  bukti?: string;
}

export interface MosqueBranding {
  logo: string;
  namaMasjid: string;
  alamat: string;
  kota?: string;
  provinsi?: string;
  telepon?: string;
  email?: string;
  kontak: string;
  website: string;
  medsos: string;
  tagline: string;
  rekeningBank?: string;
  rekeningInfaq?: string;
  rekeningYatim?: string;
  namaKetuaDkm?: string;
  namaSekretaris?: string;
  namaBendahara?: string;
}

export interface DocSettings {
  paperSize: "A4" | "A5" | "Letter" | "Legal" | "Custom";
  orientation: "Portrait" | "Landscape";
  margin: "Normal" | "Narrow" | "Wide" | "Custom";
  customMargin: { top: number; right: number; bottom: number; left: number };
  colorTheme: string;
  customColor?: string;
  style: string;
  pageNumberPos: "bottom center" | "bottom right" | "bottom left";
  printMode: boolean;
  showCover: boolean;
}

export interface PrayerTimeData {
  subuh: string;
  syuruq: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  imsak: string;
  dhuha: string;
}
