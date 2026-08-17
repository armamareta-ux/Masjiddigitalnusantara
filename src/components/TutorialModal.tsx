import React, { useState } from "react";
import {
  X,
  BookOpen,
  Tv,
  Megaphone,
  Coins,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Share2,
  Printer,
  ShieldCheck,
  Compass,
  Play,
  Download,
  Settings,
  ChevronRight,
  Lightbulb,
  Award,
} from "lucide-react";

interface TutorialModalProps {
  onClose: () => void;
  onNavigateTo?: (viewKey: string) => void;
  onOpenTv?: () => void;
}

export function TutorialModal({ onClose, onNavigateTo, onOpenTv }: TutorialModalProps) {
  const [activeTab, setActiveTab] = useState<
    | "alur-cepat"
    | "khutbah-pidato"
    | "tv-signage"
    | "kas-admin"
    | "rab-sertifikat-lpj"
    | "poster-sosmed"
    | "perencanaan-kiblat"
    | "ramadan-evaluasi"
    | "faq"
  >("alur-cepat");

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0D110D] border border-[#C19D60]/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#E6E8E6]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#080B08] border-b border-[#C19D60]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C19D60]/10 border border-[#C19D60]/40 flex items-center justify-center text-[#C19D60]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#C19D60]">
                Panduan &amp; Tutorial Lengkap Penggunaan Aplikasi
              </h2>
              <p className="text-xs text-[#A3ABA3]">
                Petunjuk praktis memaksimalkan seluruh fitur Sistem Informasi &amp; Dakwah Masjid Digital
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#A3ABA3] hover:text-[#E6E8E6] hover:bg-[#141A14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#0A0D0A] border-b border-[#C19D60]/15 flex gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: "alur-cepat", label: "⚡ Alur Cepat Takmir", icon: Sparkles },
            { id: "khutbah-pidato", label: "🕌 Khutbah & Sambutan AI", icon: Megaphone },
            { id: "tv-signage", label: "📺 TV Signage Masjid", icon: Tv },
            { id: "kas-admin", label: "📄 Kas & Surat DKM", icon: FileText },
            { id: "rab-sertifikat-lpj", label: "📊 RAB, LPJ & Piagam", icon: Award },
            { id: "poster-sosmed", label: "🎨 Poster & Sosmed", icon: Share2 },
            { id: "perencanaan-kiblat", label: "🧭 Arah Kiblat & Kalender", icon: Compass },
            { id: "ramadan-evaluasi", label: "🌙 Ramadan, Ide & AAR", icon: Lightbulb },
            { id: "faq", label: "❓ Tanya Jawab (FAQ)", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#C19D60] text-[#0A0D0A] font-bold shadow-sm"
                    : "text-[#A3ABA3] hover:text-[#E6E8E6] hover:bg-[#141A14]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* TAB 1: ALUR CEPAT */}
          {activeTab === "alur-cepat" && (
            <div className="space-y-6">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-3">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 4 Langkah Awal Memulai Aplikasi
                </h3>
                <p className="text-xs text-[#A3ABA3] leading-relaxed">
                  Aplikasi ini dirancang khusus untuk Pengurus DKM, Takmir, Khatib, dan Panitia PHBI Masjid agar
                  seluruh tata kelola dakwah, administrasi surat-menyurat, publikasi, dan display informasi jamaah
                  berjalan otomatis, rapi, dan profesional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0A0D0A] border border-[#C19D60]/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#C19D60]">
                    <span className="w-6 h-6 rounded-full bg-[#C19D60] text-[#0A0D0A] flex items-center justify-center text-xs font-mono">
                      1
                    </span>
                    Atur Identitas &amp; Kota Masjid
                  </div>
                  <p className="text-xs text-[#A3ABA3]">
                    Buka menu <strong>Pengaturan &amp; Identitas</strong>. Masukkan Nama Masjid, Kota/Kabupaten (untuk hisab
                    waktu shalat Kemenag RI yang akurat), Alamat lengkap, serta nama Ketua DKM &amp; Sekretaris untuk
                    kop surat otomatis.
                  </p>
                  {onNavigateTo && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo("pengaturan");
                      }}
                      className="text-[11px] text-[#C19D60] hover:underline flex items-center gap-1 font-semibold pt-1"
                    >
                      Buka Pengaturan Masjid <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="bg-[#0A0D0A] border border-[#C19D60]/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#C19D60]">
                    <span className="w-6 h-6 rounded-full bg-[#C19D60] text-[#0A0D0A] flex items-center justify-center text-xs font-mono">
                      2
                    </span>
                    Generate Naskah Khutbah / Sambutan
                  </div>
                  <p className="text-xs text-[#A3ABA3]">
                    Pilih menu <strong>Khutbah Jumat</strong> atau <strong>Pidato &amp; Sambutan</strong>. Gunakan tombol preset 1-klik,
                    atau tentukan tema, durasi, dan target jamaah. Naskah langsung tersusun lengkap dengan teks Arab &amp; verifikasi dalil.
                  </p>
                  {onNavigateTo && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo("khutbah-jumat");
                      }}
                      className="text-[11px] text-[#C19D60] hover:underline flex items-center gap-1 font-semibold pt-1"
                    >
                      Coba Generator Khutbah <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="bg-[#0A0D0A] border border-[#C19D60]/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#C19D60]">
                    <span className="w-6 h-6 rounded-full bg-[#C19D60] text-[#0A0D0A] flex items-center justify-center text-xs font-mono">
                      3
                    </span>
                    Nyalakan TV Display Digital Masjid
                  </div>
                  <p className="text-xs text-[#A3ABA3]">
                    Klik tombol <strong>TV Signage</strong> di pojok kanan atas. Tampilkan di Smart TV / monitor masjid
                    melalui browser layar penuh (F11) untuk menampilkan jadwal sholat, countdown adzan/iqamah, dan pengumuman.
                  </p>
                  {onOpenTv && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTv();
                      }}
                      className="text-[11px] text-[#C19D60] hover:underline flex items-center gap-1 font-semibold pt-1"
                    >
                      Buka Preview TV Signage <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="bg-[#0A0D0A] border border-[#C19D60]/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 font-bold text-sm text-[#C19D60]">
                    <span className="w-6 h-6 rounded-full bg-[#C19D60] text-[#0A0D0A] flex items-center justify-center text-xs font-mono">
                      4
                    </span>
                    Kelola Kas &amp; Cetak Surat Resmi
                  </div>
                  <p className="text-xs text-[#A3ABA3]">
                    Catat infaq, sedekah, dan pengeluaran di menu <strong>Kas Masjid</strong>. Buat proposal, surat undangan,
                    SK Panitia, dan notulen di menu <strong>Administrasi DKM</strong> dengan format kop surat resmi siap cetak/PDF.
                  </p>
                  {onNavigateTo && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo("kas-masjid");
                      }}
                      className="text-[11px] text-[#C19D60] hover:underline flex items-center gap-1 font-semibold pt-1"
                    >
                      Buka Pembukuan Kas <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KHUTBAH & SAMBUTAN */}
          {activeTab === "khutbah-pidato" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Megaphone className="w-4 h-4" /> Cara Menyusun Naskah Khutbah &amp; Sambutan
                </h3>
                <p className="text-xs text-[#A3ABA3] leading-relaxed">
                  Modul ini memanfaatkan kecerdasan buatan terverifikasi untuk menghasilkan naskah dakwah yang memenuhi
                  rukun syar'i (untuk Khutbah Jumat) dan etika protokoler resmi (untuk Pidato Sambutan DKM/PHBI).
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#E6E8E6] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Fitur Unggulan Naskah Dakwah
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
                    <strong className="text-xs text-[#C19D60] block font-serif">1. Preset 1-Klik Instan</strong>
                    <p className="text-xs text-[#A3ABA3]">
                      Tersedia berbagai pilihan preset siap pakai seperti Khutbah Jumat Etika Gadget, Khutbah Idul Fitri,
                      Sambutan Ketua DKM Renovasi Masjid, Tarhib Ramadan, dan Santunan Yatim.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
                    <strong className="text-xs text-[#C19D60] block font-serif">2. Mode Mimbar / Teleprompter</strong>
                    <p className="text-xs text-[#A3ABA3]">
                      Klik tombol <em>"Mode Mimbar / Teleprompter"</em> untuk membuka layar baca minim distraksi dengan
                      fitur <strong>Auto-Scroll</strong> (1x-3x) dan tombol pembesar huruf (Zoom In/Out) saat berkhutbah.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
                    <strong className="text-xs text-[#C19D60] block font-serif">3. AI Refine &amp; Quality Check</strong>
                    <p className="text-xs text-[#A3ABA3]">
                      Bisa menyempurnakan naskah dengan tombol <em>"Tingkatkan Alur"</em>, <em>"Lebih Singkat (30%)"</em>,
                      <em>"Lebih Menyentuh Hati"</em>, atau <em>"Sisipkan Pantun Islami"</em>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
                    <strong className="text-xs text-[#C19D60] block font-serif">4. Verifikasi Takhrij Dalil</strong>
                    <p className="text-xs text-[#A3ABA3]">
                      Setiap ayat dan hadits dicek rujukan surat, nomor ayat, dan perawi haditsnya untuk memastikan
                      otentisitas dan keabsahan syariat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TV SIGNAGE */}
          {activeTab === "tv-signage" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Tv className="w-4 h-4" /> Panduan Penggunaan TV Signage Masjid
                </h3>
                <p className="text-xs text-[#A3ABA3]">
                  Ubah Smart TV atau monitor di dinding masjid menjadi display digital jadwal shalat, countdown iqamah,
                  dan papan informasi jamaah otomatis tanpa perlu perangkat mahal tambahan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs font-bold text-[#C19D60] block">
                    Cara Menghubungkan ke Smart TV / Monitor Masjid:
                  </strong>
                  <ol className="list-decimal list-inside text-xs text-[#A3ABA3] space-y-1.5 leading-relaxed">
                    <li>Buka browser (Google Chrome / Edge) di Android TV Box, Smart TV, atau mini PC masjid.</li>
                    <li>Buka URL aplikasi ini, lalu klik tombol <strong>"Mode Layar TV Masjid"</strong> atau <strong>"TV Signage"</strong>.</li>
                    <li>Tekan tombol <strong>F11</strong> di keyboard atau ikon Fullscreen di pojok atas untuk mode layar penuh.</li>
                    <li>Waktu sholat, kalender Hijriyah, countdown waktu adzan, serta hadits berjalan akan berputar otomatis.</li>
                    <li>Anda dapat menyalakan audio notifikasi/alarm adzan melalui ikon audio di pojok kanan atas.</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-xs space-y-1">
                    <span className="text-[#C19D60] font-bold block">✨ Sinkronisasi 21 Kota Indonesia</span>
                    <p className="text-[#A3ABA3]">
                      Perhitungan hisab astronomis terintegrasi sesuai standar Kementerian Agama RI (Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, Isya).
                    </p>
                  </div>
                  <div className="p-3 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-xs space-y-1">
                    <span className="text-[#C19D60] font-bold block">⏳ Countdown Shalat &amp; Iqamah</span>
                    <p className="text-[#A3ABA3]">
                      Memberikan petunjuk waktu akurat kepada muadzin dan imam saat jeda antara adzan dan iqamah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KAS & DOKUMEN DKM */}
          {activeTab === "kas-admin" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Pengelolaan Kas &amp; Pembuatan Surat Resmi DKM
                </h3>
                <p className="text-xs text-[#A3ABA3]">
                  Menjaga transparansi keuangan kas masjid kepada jamaah dan mempermudah administrasi surat-menyurat
                  dengan kop surat berstandar resmi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-serif font-bold block flex items-center gap-1.5">
                    <Coins className="w-4 h-4" /> Modul Kas &amp; Keuangan Masjid
                  </strong>
                  <ul className="list-disc list-inside text-xs text-[#A3ABA3] space-y-1.5 leading-relaxed">
                    <li>Pencatatan pos Pemasukan (Infaq Jumat, Zakat Maal, Zakat Fitrah, Donasi Pembangunan).</li>
                    <li>Pencatatan Pengeluaran (Operasional, Honor Khotib/Marbot, Listrik/Air, Pemeliharaan).</li>
                    <li>Ringkasan saldo total real-time dan kalkulasi otomatis.</li>
                    <li>Ekspor laporan kas siap cetak untuk ditempel di papan pengumuman masjid.</li>
                  </ul>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-serif font-bold block flex items-center gap-1.5">
                    <Printer className="w-4 h-4" /> Modul Administrasi Surat &amp; Proposal
                  </strong>
                  <ul className="list-disc list-inside text-xs text-[#A3ABA3] space-y-1.5 leading-relaxed">
                    <li>Template otomatis Proposal Kegiatan, Surat Undangan Pengajian, SK Kepanitiaan, dan Notulen.</li>
                    <li>Generator Kop Surat DKM lengkap dengan nomor surat, lampiran, stempel, dan tanda tangan pengurus.</li>
                    <li>Kemampuan ekspor langsung ke format Cetak Printer, file Dokumen, atau PDF.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RAB, LPJ & SERTIFIKAT */}
          {activeTab === "rab-sertifikat-lpj" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Award className="w-4 h-4" /> RAB Dinamis, LPJ Kegiatan, Sertifikat &amp; Berita Acara
                </h3>
                <p className="text-xs text-[#A3ABA3]">
                  Kelola akuntabilitas kepanitiaan masjid dari awal penyusunan anggaran hingga pelaporan akhir dan apresiasi peserta.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-serif font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kalkulator RAB Otomatis
                  </strong>
                  <p className="text-xs text-[#A3ABA3] leading-relaxed">
                    Tersedia tabel kalkulator interaktif: input volume, satuan, dan harga satuan dengan subtotal &amp; grand total terhitung instan.
                    Tersedia tombol <strong>"Sarankan Item RAB dengan AI"</strong> untuk mengestimasi pos kebutuhan acara secara realistis.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-serif font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> LPJ &amp; Berita Acara
                  </strong>
                  <p className="text-xs text-[#A3ABA3] leading-relaxed">
                    Generate Laporan Pertanggungjawaban (LPJ) kegiatan qurban / PHBI, Berita Acara serah terima wakaf/karpet,
                    dan Kerangka Acuan Kerja (TOR) program pemberdayaan jamaah.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-serif font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sertifikat &amp; Piagam Penghargaan
                  </strong>
                  <p className="text-xs text-[#A3ABA3] leading-relaxed">
                    Buat piagam penghargaan santri tahfizh, panitia pelaksana qurban/ramadan, dan pemateri kajian dengan tata bahasa khidmat dan layout resmi.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-serif font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Notulen Rapat &amp; Action Plan
                  </strong>
                  <p className="text-xs text-[#A3ABA3] leading-relaxed">
                    Catat musyawarah takmir secara rapi dengan matriks penugasan (PIC, tenggat waktu, dan hasil mufakat) siap bagikan ke grup DKM.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POSTER & SOSIAL MEDIA */}
          {activeTab === "poster-sosmed" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Publikasi Syiar, Poster Vektor &amp; Medsos
                </h3>
                <p className="text-xs text-[#A3ABA3]">
                  Tingkatkan antusiasme kehadiran jamaah dengan materi publikasi visual Islami modern yang siap dibagikan ke WhatsApp Group, Instagram, dan TikTok.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs font-bold text-[#C19D60] block">Fitur Desain &amp; Publikasi:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-[#0D110D] border border-[#C19D60]/15 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-[#E6E8E6] block">🖼️ Poster Studio AI</span>
                      <p className="text-[#A3ABA3] text-[11px]">
                        Render poster kajian dengan ornamen kaligrafi &amp; geometri Islam dalam rasio Story (9:16), Feed (1:1), atau Banner (16:9).
                      </p>
                    </div>
                    <div className="p-3 bg-[#0D110D] border border-[#C19D60]/15 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-[#E6E8E6] block">📱 Caption &amp; Video Script</span>
                      <p className="text-[#A3ABA3] text-[11px]">
                        Generate copywriting WhatsApp blast yang santun, caption Instagram bernas, dan hook naskah video pendek Reels/TikTok.
                      </p>
                    </div>
                    <div className="p-3 bg-[#0D110D] border border-[#C19D60]/15 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-[#E6E8E6] block">📅 Content Calendar</span>
                      <p className="text-[#A3ABA3] text-[11px]">
                        Jadwal publikasi mingguan dan bulanan agar media sosial masjid selalu aktif menebarkan ilmu dan pengingat amal kebaikan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERENCANAAN & ARAH KIBLAT */}
          {activeTab === "perencanaan-kiblat" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Arah Kiblat, Kalender Agenda &amp; Arsip Naskah
                </h3>
                <p className="text-xs text-[#A3ABA3]">
                  Fitur navigasi arah sholat presisi, sinkronisasi kalender kegiatan masjid, serta pencarian arsip riwayat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-bold block flex items-center gap-1.5">
                    🧭 Kompas &amp; Derajat Kiblat
                  </strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Menghitung sudut presisi arah kiblat (misal 295.14° dari Utara Sejati) untuk kota yang dipilih maupun titik GPS masjid.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-bold block flex items-center gap-1.5">
                    📅 Kalender Agenda Masjid
                  </strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Manajemen status agenda (Direncanakan, Dikonfirmasi, Selesai), pembuat poster 1-klik dari agenda, dan AI penjadwalan otomatis.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-bold block flex items-center gap-1.5">
                    🗃️ Riwayat &amp; Arsip Cerdas
                  </strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Pencarian naskah khutbah, proposal, dan notulen lama dengan filter tipe dokumen dan tombol salin / cetak instan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RAMADAN, IDE & EVALUASI */}
          {activeTab === "ramadan-evaluasi" && (
            <div className="space-y-5">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Bank Ide Program, Ramadan 30 Hari &amp; Evaluasi AAR
                </h3>
                <p className="text-xs text-[#A3ABA3]">
                  Perencanaan inovasi dakwah, manajemen kegiatan Ramadan, serta evaluasi After Action Review untuk peningkatan takmir berkelanjutan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-bold block">💡 Bank Ide Program:</strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Generator ide dakwah kreatif (Pemuda &amp; Remaja, Pemberdayaan Dhuafa, Digitalisasi) lengkap dengan matriks estimasi dampak vs biaya.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-bold block">🌙 Program Ramadan:</strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Susun jadwal 30 hari imam tarawih, pembagian takjil buka puasa, tadarus khataman, i'tikaf 10 malam akhir, dan zakat fitrah.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-2">
                  <strong className="text-xs text-[#C19D60] font-bold block">📈 Evaluasi &amp; AAR:</strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Catat realisasi vs target, kendala lapangan, akar masalah, dan gunakan AI Analisis untuk rekomendasi perbaikan acara berikutnya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FAQ */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              <div className="bg-[#141A14] border border-[#C19D60]/20 rounded-2xl p-5 space-y-2">
                <h3 className="text-base font-bold font-serif text-[#C19D60] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Pertanyaan yang Sering Diajukan (FAQ)
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1.5">
                  <strong className="text-xs text-[#C19D60] block font-serif">
                    Q: Apakah data kas, arsip naskah, dan kegiatan masjid tersimpan aman?
                  </strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Ya, semua data tersimpan secara aman di penyimpanan peramban (Local Storage). Anda juga dapat
                    mengunduh cadangan seluruh data ke dalam file JSON di menu <strong>Pengaturan &amp; Identitas</strong> agar
                    dapat dipulihkan kapan saja di komputer lain.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1.5">
                  <strong className="text-xs text-[#C19D60] block font-serif">
                    Q: Apakah jadwal shalat di TV Signage akurat dengan waktu resmi Kemenag?
                  </strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Ya, aplikasi menggunakan rumus hisab astronomis standar Kementerian Agama RI berdasarkan lintang,
                    bujur, dan ketinggian untuk 21 kota besar di Indonesia dengan penyesuaian waktu ihtiyat otomatis.
                  </p>
                </div>

                <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1.5">
                  <strong className="text-xs text-[#C19D60] block font-serif">
                    Q: Bisakah naskah khutbah atau surat diubah sendiri setelah dibuat oleh AI?
                  </strong>
                  <p className="text-xs text-[#A3ABA3]">
                    Tentu saja! Naskah langsung terbuka di editor teks. Anda bebas mengetik, menambah, menghapus, atau
                    menyisipkan catatan lokal masjid sebelum mencetak atau menyimpannya.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#080B08] border-t border-[#C19D60]/20 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-[#A3ABA3]">
            <Lightbulb className="w-4 h-4 text-[#C19D60]" />
            <span>Butuh bantuan lebih lanjut? Buka tab Panduan kapan saja melalui menu atas.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#D4AF6E] transition-all shadow-md"
          >
            Mengerti &amp; Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
