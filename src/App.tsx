import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Compass,
  Coins,
  BookOpen,
  Sparkles,
  MessageSquareQuote,
  Megaphone,
  Image as ImageIcon,
  Share2,
  CalendarDays,
  FileText,
  Mail,
  Calculator,
  ClipboardList,
  Award,
  Layers,
  Moon,
  TrendingUp,
  Clock,
  Settings,
  Tv,
  Menu,
  X,
  Printer,
  Search,
  HelpCircle,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";

// Types
import {
  MosqueBranding,
  MosqueEvent,
  CashTransaction,
  HistoryRecord,
  IdeaItem,
  EvaluationItem,
  SocialCalendarItem,
  DalilItem,
} from "./types";

// Storage
import {
  loadBranding,
  saveBranding,
  loadEvents,
  saveEvents,
  loadTransactions,
  saveTransactions,
  loadHistory,
  saveHistory,
  loadIdeas,
  saveIdeas,
  loadEvaluations,
  saveEvaluations,
  loadSocialCalendar,
  saveSocialCalendar,
} from "./utils/storage";

// Components
import { DashboardView } from "./components/DashboardView";
import { JadwalSholatView } from "./components/JadwalSholatView";
import { KasMasjidView } from "./components/KasMasjidView";
import { TvSignageModal } from "./components/TvSignageModal";
import { DocumentEngineModal } from "./components/DocumentEngineModal";
import { SermonGenerator } from "./components/SermonGenerator";
import { PosterStudio } from "./components/PosterStudio";
import { SocialMediaView } from "./components/SocialMediaView";
import { AdminModules } from "./components/AdminModules";
import { BankIdeView } from "./components/BankIdeView";
import { KalenderView } from "./components/KalenderView";
import { EvaluasiView } from "./components/EvaluasiView";
import { RiwayatView } from "./components/RiwayatView";
import { BrandingSettingsView } from "./components/BrandingSettingsView";
import { TutorialModal } from "./components/TutorialModal";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";


interface NavGroup {
  label: string;
  items: {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { key: "dashboard", label: "Dashboard Takmir", icon: LayoutDashboard },
      { key: "jadwal-sholat", label: "Jadwal Shalat & Kiblat", icon: Compass },
      { key: "kas-masjid", label: "Kas Masjid & Laporan", icon: Coins },
    ],
  },
  {
    label: "Naskah & Dakwah AI",
    items: [
      { key: "khutbah-jumat", label: "Khutbah Jumat", icon: BookOpen, badge: "Rukun" },
      { key: "ceramah-kajian", label: "Ceramah & Kajian", icon: Sparkles },
      { key: "kultum-tausiyah", label: "Kultum 7 Menit", icon: MessageSquareQuote },
      { key: "pidato-sambutan", label: "Pidato & Sambutan", icon: Megaphone },
    ],
  },
  {
    label: "Publikasi & Desain",
    items: [
      { key: "poster", label: "Poster Studio AI", icon: ImageIcon, badge: "Vektor" },
      { key: "sosmed-caption", label: "Konten Medsos & Video", icon: Share2 },
      { key: "sosmed-calendar", label: "Content Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Administrasi DKM",
    items: [
      { key: "admin-proposal", label: "Proposal Kegiatan", icon: FileText },
      { key: "admin-surat", label: "Surat Resmi DKM", icon: Mail },
      { key: "admin-rab", label: "Kalkulator RAB", icon: Calculator },
      { key: "admin-notulen", label: "Notulen & Berita Acara", icon: ClipboardList },
      { key: "admin-undangan", label: "Surat Undangan", icon: Mail },
      { key: "admin-sertifikat", label: "Sertifikat & LPJ", icon: Award },
    ],
  },
  {
    label: "Perencanaan & Syiar",
    items: [
      { key: "bank-ide", label: "Bank Ide Program", icon: Layers, badge: "Prioritas" },
      { key: "kalender-kegiatan", label: "Kalender Agenda", icon: CalendarDays },
      { key: "program-ramadan", label: "Program Ramadan", icon: Moon, badge: "30 Hari" },
      { key: "evaluasi", label: "Evaluasi & AAR", icon: TrendingUp },
    ],
  },
  {
    label: "Sistem & Arsip",
    items: [
      { key: "riwayat", label: "Riwayat & Arsip", icon: Clock },
      { key: "pengaturan", label: "Identitas & Backup", icon: Settings },
    ],
  },
];

export default function App() {
  const { user, profile, logout } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tvModalOpen, setTvModalOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [prefill, setPrefill] = useState<Record<string, string>>({});


  // Document Engine Modal State
  const [docEngine, setDocEngine] = useState<{
    open: boolean;
    content: string;
    title: string;
    dalil?: DalilItem[];
  }>({
    open: false,
    content: "",
    title: "",
  });

  // App Persistent State
  const [branding, setBranding] = useState<MosqueBranding>(loadBranding);
  const [events, setEvents] = useState<MosqueEvent[]>(loadEvents);
  const [transactions, setTransactions] = useState<CashTransaction[]>(loadTransactions);
  const [history, setHistory] = useState<HistoryRecord[]>(loadHistory);
  const [ideas, setIdeas] = useState<IdeaItem[]>(loadIdeas);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(loadEvaluations);
  const [socialCalendar, setSocialCalendar] = useState<SocialCalendarItem[]>(loadSocialCalendar);

  // Sync to local storage
  const handleSaveBranding = (b: MosqueBranding) => {
    setBranding(b);
    saveBranding(b);
  };

  const handleAddEvent = (ev: MosqueEvent) => {
    const updated = [...events, ev];
    setEvents(updated);
    saveEvents(updated);
  };

  const handleUpdateEvent = (id: string, patch: Partial<MosqueEvent>) => {
    const updated = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    setEvents(updated);
    saveEvents(updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  const handleAddTransaction = (tx: CashTransaction) => {
    const updated = [...transactions, tx];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleAddHistory = (record: HistoryRecord) => {
    const updated = [record, ...history];
    setHistory(updated);
    saveHistory(updated);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const handleAddIdea = (idea: IdeaItem) => {
    const updated = [idea, ...ideas];
    setIdeas(updated);
    saveIdeas(updated);
  };

  const handleUpdateIdea = (id: string, patch: Partial<IdeaItem>) => {
    const updated = ideas.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setIdeas(updated);
    saveIdeas(updated);
  };

  const handleDeleteIdea = (id: string) => {
    const updated = ideas.filter((i) => i.id !== id);
    setIdeas(updated);
    saveIdeas(updated);
  };

  const handleAddEvaluation = (item: EvaluationItem) => {
    const updated = [item, ...evaluations];
    setEvaluations(updated);
    saveEvaluations(updated);
  };

  const handleUpdateEvaluation = (id: string, patch: Partial<EvaluationItem>) => {
    const updated = evaluations.map((e) => (e.id === id ? { ...e, ...patch } : e));
    setEvaluations(updated);
    saveEvaluations(updated);
  };

  const handleDeleteEvaluation = (id: string) => {
    const updated = evaluations.filter((e) => e.id !== id);
    setEvaluations(updated);
    saveEvaluations(updated);
  };

  const handleAddSocialCalendar = (item: SocialCalendarItem) => {
    const updated = [...socialCalendar, item];
    setSocialCalendar(updated);
    saveSocialCalendar(updated);
  };

  const handleUpdateSocialCalendar = (id: string, patch: Partial<SocialCalendarItem>) => {
    const updated = socialCalendar.map((s) => (s.id === id ? { ...s, ...patch } : s));
    setSocialCalendar(updated);
    saveSocialCalendar(updated);
  };

  const handleDeleteSocialCalendar = (id: string) => {
    const updated = socialCalendar.filter((s) => s.id !== id);
    setSocialCalendar(updated);
    saveSocialCalendar(updated);
  };

  const reloadAllData = () => {
    setBranding(loadBranding());
    setEvents(loadEvents());
    setTransactions(loadTransactions());
    setHistory(loadHistory());
    setIdeas(loadIdeas());
    setEvaluations(loadEvaluations());
    setSocialCalendar(loadSocialCalendar());
  };

  const navigateTo = (viewKey: string, newPrefill?: Record<string, string>) => {
    setActiveView(viewKey);
    if (newPrefill) setPrefill(newPrefill);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDocEngine = (content: string, title: string, dalil?: DalilItem[]) => {
    setDocEngine({
      open: true,
      content,
      title,
      dalil,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0D0A] text-[#E6E8E6] flex flex-col font-sans selection:bg-[#C19D60]/30 selection:text-[#E6E8E6]">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#0D110D] text-[#E6E8E6] px-4 py-3 flex items-center justify-between sticky top-0 z-30 border-b border-[#C19D60]/20 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-[#141A14] border border-[#C19D60]/30 text-[#C19D60] hover:bg-[#C19D60]/10"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-bold text-sm text-[#C19D60] truncate max-w-[190px]">
              {branding.namaMasjid || "Masjid Digital"}
            </h1>
            <p className="text-[10px] text-[#A3ABA3] font-mono tracking-wide">Sistem Takmir Terpadu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141A14] hover:bg-[#C19D60]/20 text-[#C19D60] border border-[#C19D60]/40 rounded-xl text-xs font-semibold shadow-xs transition-all"
              title="Profil Pengurus"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[70px] truncate">{profile?.displayName || "Pengurus"}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#141A14] hover:bg-[#C19D60]/20 text-[#C19D60] border border-[#C19D60]/40 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk
            </button>
          )}

          <button
            onClick={() => setTutorialOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141A14] hover:bg-[#C19D60]/20 text-[#C19D60] border border-[#C19D60]/30 rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Buka Panduan & Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Panduan
          </button>

          <button
            onClick={() => setTvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C19D60] hover:bg-[#D4AF6E] text-[#0A0D0A] rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Tv className="w-3.5 h-3.5" /> TV
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-0 h-screen w-72 bg-[#0D110D] text-[#E6E8E6] flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-[#C19D60]/20 shadow-2xl lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Mosque Brand Top Header */}
          <div className="p-5 border-b border-[#C19D60]/20 flex items-center justify-between bg-[#080B08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C19D60] bg-[#C19D60]/10 flex items-center justify-center text-[#C19D60] font-serif text-lg font-bold shadow-sm">
                <span>🕌</span>
              </div>
              <div className="overflow-hidden">
                <h2 className="font-serif font-bold text-sm text-[#C19D60] truncate">
                  {branding.namaMasjid || "Masjid Digital"}
                </h2>
                <p className="text-[10px] text-[#A3ABA3] font-mono tracking-wider uppercase">
                  {branding.kota || "Takmir & DKM"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-[#C19D60]/70 hover:text-[#C19D60] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#1F271F]">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#C19D60]/70 block mb-1.5">
                  {group.label}
                </span>

                {group.items.map((item) => {
                  const isActive = activeView === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigateTo(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#C19D60]/15 text-[#C19D60] border border-[#C19D60]/30 font-bold shadow-xs"
                          : "text-[#E6E8E6]/75 hover:bg-[#C19D60]/10 hover:text-[#C19D60]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? "text-[#C19D60]" : "text-[#C19D60]/60"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? "bg-[#C19D60]/25 text-[#E5C388] border border-[#C19D60]/40"
                              : "bg-[#141A14] text-[#C19D60]/80 border border-[#C19D60]/15"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar TV Signage & Tutorial Quick Launch Footer */}
          <div className="p-4 border-t border-[#C19D60]/20 bg-[#080B08] space-y-2">
            <button
              onClick={() => setTvModalOpen(true)}
              className="w-full py-2.5 bg-[#C19D60] hover:bg-[#D4AF6E] text-[#0A0D0A] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Tv className="w-4 h-4" /> Mode Layar TV Masjid
            </button>
            <button
              onClick={() => setTutorialOpen(true)}
              className="w-full py-2 bg-[#141A14] hover:bg-[#C19D60]/15 text-[#C19D60] border border-[#C19D60]/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Panduan &amp; Tutorial
            </button>
            <p className="text-[10px] text-center text-[#A3ABA3] font-mono pt-0.5">
              Auto-Kemenag &amp; Digital Signage
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
          {/* Top Bar for Desktop */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#0D110D] border-b border-[#C19D60]/20 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#A3ABA3]">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-[#C19D60]/30">•</span>
              <span className="text-xs font-semibold text-[#C19D60] bg-[#C19D60]/10 border border-[#C19D60]/20 px-2.5 py-0.5 rounded-full">
                Sistem DKM Digital Aktif
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 bg-[#141A14] border border-[#C19D60]/30 rounded-xl px-3 py-1.5 shadow-xs">
                  <div className="w-6 h-6 rounded-full bg-[#C19D60]/20 border border-[#C19D60]/50 flex items-center justify-center text-[#C19D60] text-xs font-bold font-serif">
                    {profile?.displayName?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="text-xs font-bold text-[#E6E8E6] block max-w-[130px] truncate">
                      {profile?.displayName || user.email}
                    </span>
                    <span className="text-[10px] text-[#C19D60] font-mono">
                      {profile?.role || "Takmir"}
                    </span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="ml-2 text-[10px] text-rose-400/80 hover:text-rose-400 hover:underline font-mono"
                    title="Keluar Akun"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAuthModalMode("login");
                      setAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141A14] hover:bg-[#C19D60]/15 text-[#C19D60] border border-[#C19D60]/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Masuk Akun
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode("register");
                      setAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C19D60]/20 hover:bg-[#C19D60]/30 text-[#E5C388] border border-[#C19D60]/40 rounded-xl text-xs font-semibold transition-all shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Daftar Takmir
                  </button>
                </div>
              )}

              <button
                onClick={() => setTutorialOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141A14] hover:bg-[#C19D60]/15 text-[#C19D60] border border-[#C19D60]/30 rounded-xl text-xs font-semibold transition-all shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Panduan &amp; Tutorial
              </button>

              <button
                onClick={() => setTvModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#D4AF6E] shadow-sm transition-all"
              >
                <Tv className="w-3.5 h-3.5" /> Buka TV Signage
              </button>
            </div>
          </header>

          {/* Dynamic Active View Rendering */}
          <div className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
            {activeView === "dashboard" && (
              <DashboardView
                branding={branding}
                events={events}
                transactions={transactions}
                records={history}
                ideas={ideas}
                onNavigate={navigateTo}
                onOpenTvMode={() => setTvModalOpen(true)}
              />
            )}

            {activeView === "jadwal-sholat" && (
              <JadwalSholatView branding={branding} onOpenTvMode={() => setTvModalOpen(true)} />
            )}

            {activeView === "kas-masjid" && (
              <KasMasjidView
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                branding={branding}
                onOpenDocEngine={openDocEngine}
              />
            )}

            {/* Sermon & Dakwah Generators */}
            {activeView === "khutbah-jumat" && (
              <SermonGenerator
                pageTitle="Generator Khutbah Jumat"
                pageSub="Naskah khutbah lengkap dengan rukun khutbah, mukaddimah Arab, kutipan ayat Al-Qur'an &amp; Hadits shahih, serta doa penutup."
                jenisOptions={["Khutbah Jumat", "Khutbah Idul Fitri", "Khutbah Idul Adha", "Khutbah Gerhana (Khasuf/Kusuf)", "Khutbah Istisqa'"]}
                defaultJenis="Khutbah Jumat"
                historyType="Khutbah Jumat"
                onSave={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                prefill={prefill}
              />
            )}

            {activeView === "ceramah-kajian" && (
              <SermonGenerator
                pageTitle="Generator Ceramah &amp; Kajian Tematik"
                pageSub="Susun materi kajian mendalam, tabligh akbar, dan pengajian tematik yang sistematis dan menyentuh hati jamaah."
                jenisOptions={["Ceramah Tematik", "Kajian Ba'da Maghrib", "Tabligh Akbar", "Pengajian Rutin Ibu-ibu", "Kajian Pemuda & Remaja"]}
                defaultJenis="Ceramah Tematik"
                historyType="Ceramah & Kajian"
                onSave={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                prefill={prefill}
              />
            )}

            {activeView === "kultum-tausiyah" && (
              <SermonGenerator
                pageTitle="Generator Kultum 7 Menit &amp; Tausiyah Singkat"
                pageSub="Kultum padat, mengena, dan fokus pada satu pesan utama (Subuh, Ba'da Dzuhur, atau Menjelang Buka Puasa)."
                jenisOptions={["Kultum Subuh", "Kultum Tarawih", "Kultum Ba'da Dzuhur", "Tausiyah Singkat", "Renungan Malam"]}
                defaultJenis="Kultum Subuh"
                historyType="Kultum"
                onSave={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                prefill={prefill}
              />
            )}

            {activeView === "pidato-sambutan" && (
              <SermonGenerator
                pageTitle="Generator Sambutan &amp; Pidato DKM"
                pageSub="Pidato Ketua DKM, pembukaan acara peringatan hari besar Islam, santunan anak yatim, atau peletakan batu pertama renovasi."
                jenisOptions={["Sambutan Ketua DKM", "Sambutan Panitia Acara", "Sambutan Pembukaan PHBI", "Sambutan Tarhib Ramadan", "Sambutan Peletakan Batu Pertama"]}
                defaultJenis="Sambutan Ketua DKM"
                historyType="Pidato & Sambutan"
                onSave={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                prefill={prefill}
              />
            )}

            {/* Poster & Social Media */}
            {activeView === "poster" && (
              <PosterStudio onSave={handleAddHistory} prefill={prefill} />
            )}

            {activeView === "sosmed-caption" && (
              <SocialMediaView
                viewMode="caption"
                calendarItems={socialCalendar}
                onAddCalendarItem={handleAddSocialCalendar}
                onUpdateCalendarItem={handleUpdateSocialCalendar}
                onDeleteCalendarItem={handleDeleteSocialCalendar}
                onSaveHistory={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                prefill={prefill}
              />
            )}

            {activeView === "sosmed-calendar" && (
              <SocialMediaView
                viewMode="calendar"
                calendarItems={socialCalendar}
                onAddCalendarItem={handleAddSocialCalendar}
                onUpdateCalendarItem={handleUpdateSocialCalendar}
                onDeleteCalendarItem={handleDeleteSocialCalendar}
                onSaveHistory={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                prefill={prefill}
              />
            )}

            {/* Admin Modules */}
            {activeView.startsWith("admin-") && (
              <AdminModules
                moduleKey={activeView}
                onSave={handleAddHistory}
                onOpenDocEngine={openDocEngine}
                branding={branding}
                prefill={prefill}
              />
            )}

            {/* Planning & Ideas */}
            {activeView === "bank-ide" && (
              <BankIdeView
                ideas={ideas}
                onAddIdea={handleAddIdea}
                onUpdateIdea={handleUpdateIdea}
                onDeleteIdea={handleDeleteIdea}
                onForwardToModule={(target, summary, meta) =>
                  navigateTo(target, {
                    topik: meta?.title || summary,
                    ringkasan: summary,
                  })
                }
                prefill={{ rawInput: prefill?.topik }}
              />
            )}

            {activeView === "kalender-kegiatan" && (
              <KalenderView
                viewMode="kalender-kegiatan"
                events={events}
                onAddEvent={handleAddEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onEvaluateEvent={(ev) =>
                  navigateTo("evaluasi", {
                    namaKegiatan: ev.namaKegiatan,
                    tanggal: ev.tanggal,
                  })
                }
                onMakePoster={(ev) =>
                  navigateTo("poster", {
                    judul: ev.namaKegiatan,
                    pembicara: ev.pic || "Ustadz Pembicara",
                    hariTanggal: ev.tanggal,
                    waktu: ev.waktu,
                    lokasi: ev.lokasi,
                  })
                }
                prefill={prefill}
              />
            )}

            {activeView === "program-ramadan" && (
              <KalenderView
                viewMode="program-ramadan"
                events={events}
                onAddEvent={handleAddEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onEvaluateEvent={(ev) =>
                  navigateTo("evaluasi", {
                    namaKegiatan: ev.namaKegiatan,
                    tanggal: ev.tanggal,
                  })
                }
                onMakePoster={(ev) =>
                  navigateTo("poster", {
                    judul: ev.namaKegiatan,
                    hariTanggal: ev.tanggal,
                  })
                }
                prefill={prefill}
              />
            )}

            {activeView === "evaluasi" && (
              <EvaluasiView
                evaluations={evaluations}
                onAddEvaluation={handleAddEvaluation}
                onUpdateEvaluation={handleUpdateEvaluation}
                onDeleteEvaluation={handleDeleteEvaluation}
                onOpenDocEngine={openDocEngine}
                onSaveHistory={handleAddHistory}
                prefill={prefill}
              />
            )}

            {/* History & Settings */}
            {activeView === "riwayat" && (
              <RiwayatView
                records={history}
                onDeleteRecord={handleDeleteHistory}
                onClearAll={handleClearHistory}
                onOpenDocEngine={openDocEngine}
              />
            )}

            {activeView === "pengaturan" && (
              <BrandingSettingsView
                branding={branding}
                onSaveBranding={handleSaveBranding}
                onReloadAllData={reloadAllData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Fullscreen TV Signage Modal */}
      {tvModalOpen && (
        <TvSignageModal
          isOpen={tvModalOpen}
          onClose={() => setTvModalOpen(false)}
          branding={branding}
          events={events}
          transactions={transactions}
        />
      )}

      {/* Tutorial & Panduan Modal */}
      {tutorialOpen && (
        <TutorialModal
          onClose={() => setTutorialOpen(false)}
          onNavigateTo={(viewKey) => navigateTo(viewKey)}
          onOpenTv={() => setTvModalOpen(true)}
        />
      )}

      {/* Document Engine (Word / Print) Modal */}
      {docEngine.open && (
        <DocumentEngineModal
          isOpen={docEngine.open}
          onClose={() => setDocEngine((prev) => ({ ...prev, open: false }))}
          title={docEngine.title}
          content={docEngine.content}
          branding={branding}
          dalil={docEngine.dalil}
        />
      )}

      {/* Login & Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}
