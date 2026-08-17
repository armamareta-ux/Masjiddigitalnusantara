import React, { useState } from "react";
import {
  Building2,
  Save,
  Download,
  Upload,
  RotateCcw,
  Check,
  CreditCard,
  UserCheck,
  Shield,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { MosqueBranding } from "../types";
import { exportAllDataJson, importAllDataJson, resetAllDataToDefault } from "../utils/storage";
import { useAuth, UserProfileData } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";

export interface BrandingSettingsViewProps {
  branding: MosqueBranding;
  onSaveBranding: (b: MosqueBranding) => void;
  onReloadAllData: () => void;
}

export function BrandingSettingsView({
  branding,
  onSaveBranding,
  onReloadAllData,
}: BrandingSettingsViewProps) {
  const { user, profile, logout, updateUserRoleAndMosque } = useAuth();
  const [form, setForm] = useState<MosqueBranding>(branding);
  const [saved, setSaved] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<UserProfileData["role"]>(profile?.role || "Takmir");
  const [profileSaved, setProfileSaved] = useState(false);


  const setF = (k: keyof MosqueBranding, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBranding(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const json = exportAllDataJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_masjid_digital_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const ok = importAllDataJson(content);
        if (ok) {
          alert("Data cadangan berhasil dipulihkan!");
          onReloadAllData();
        } else {
          alert("Format file cadangan tidak valid.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke data contoh awal?")) {
      resetAllDataToDefault();
      onReloadAllData();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">Identitas Masjid &amp; Pengaturan</h1>
        <p className="text-sm text-[#A3ABA3]">
          Data identitas ini akan otomatis digunakan pada Kop Surat Resmi, Proposal, Lembar Kas, dan Dokumen Ekspor Word/PDF.
        </p>
      </div>

      {/* Akun Pengurus & Autentikasi Takmir */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/30 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#C19D60]/15 pb-3 flex-wrap gap-2">
          <h3 className="font-bold font-serif text-sm text-[#E6E8E6] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C19D60]" /> Akun Pengurus &amp; Takmir Masjid
          </h3>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Terautentikasi (Firebase)
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold ml-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode("login");
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C19D60] text-[#0A0D0A] font-bold rounded-xl text-xs hover:bg-[#D4AF6E] transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" /> Masuk Akun
              </button>
              <button
                onClick={() => {
                  setAuthModalMode("register");
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141A14] text-[#E5C388] border border-[#C19D60]/40 font-semibold rounded-xl text-xs hover:bg-[#C19D60]/20 transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" /> Daftar Akun Baru
              </button>
            </div>
          )}
        </div>

        {user ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
              <span className="text-[10px] text-[#A3ABA3] uppercase font-mono block">Nama Pengurus</span>
              <strong className="text-xs text-[#E6E8E6] block font-serif">
                {profile?.displayName || "Pengurus Masjid"}
              </strong>
            </div>

            <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
              <span className="text-[10px] text-[#A3ABA3] uppercase font-mono block">Email Terdaftar</span>
              <strong className="text-xs text-[#E6E8E6] block font-mono">
                {user.email}
              </strong>
            </div>

            <div className="p-3.5 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl space-y-1">
              <span className="text-[10px] text-[#A3ABA3] uppercase font-mono block">Jabatan / Amanah</span>
              <strong className="text-xs text-[#C19D60] block font-semibold">
                {profile?.role || "Takmir"}
              </strong>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/15 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1 max-w-xl">
              <p className="text-xs font-semibold text-[#E6E8E6]">
                Masuk dengan email &amp; kata sandi untuk mengamankan data kepengurusan
              </p>
              <p className="text-[11px] text-[#A3ABA3]">
                Autentikasi cloud memungkinkan Anda menyelaraskan profil takmir, peran persuratan, dan hak akses penyusunan naskah dakwah.
              </p>
            </div>
            <button
              onClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-[#141A14] text-[#C19D60] border border-[#C19D60]/40 rounded-xl text-xs font-bold hover:bg-[#C19D60]/15 transition-all"
            >
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-6 shadow-sm space-y-6">
        {/* Identitas Fisik Masjid */}
        <div className="space-y-4">
          <h3 className="font-bold font-serif text-sm text-[#E6E8E6] border-b border-[#C19D60]/15 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C19D60]" /> Profil Masjid &amp; Alamat
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Nama Lengkap Masjid</label>
              <input
                type="text"
                value={form.namaMasjid}
                onChange={(e) => setF("namaMasjid", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 font-bold text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={form.alamat}
                onChange={(e) => setF("alamat", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={form.kota || ""}
                onChange={(e) => setF("kota", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Provinsi</label>
              <input
                type="text"
                value={form.provinsi || ""}
                onChange={(e) => setF("provinsi", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">No. Telepon / WhatsApp Sekretariat</label>
              <input
                type="text"
                value={form.telepon || form.kontak || ""}
                onChange={(e) => {
                  setF("telepon", e.target.value);
                  setF("kontak", e.target.value);
                }}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Email Resmi DKM</label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setF("email", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>
        </div>

        {/* Susunan Pengurus Inti */}
        <div className="space-y-4">
          <h3 className="font-bold font-serif text-sm text-[#E6E8E6] border-b border-[#C19D60]/15 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#C19D60]" /> Penandatangan &amp; Pengurus Inti DKM
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Ketua DKM</label>
              <input
                type="text"
                value={form.namaKetuaDkm || ""}
                onChange={(e) => setF("namaKetuaDkm", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] font-semibold focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Sekretaris DKM</label>
              <input
                type="text"
                value={form.namaSekretaris || ""}
                onChange={(e) => setF("namaSekretaris", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] font-semibold focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Bendahara DKM</label>
              <input
                type="text"
                value={form.namaBendahara || ""}
                onChange={(e) => setF("namaBendahara", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] font-semibold focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>
        </div>

        {/* Rekening Infaq & Donasi */}
        <div className="space-y-4">
          <h3 className="font-bold font-serif text-sm text-[#E6E8E6] border-b border-[#C19D60]/15 pb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#C19D60]" /> Rekening Bank &amp; Donasi Masjid
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Rekening Kas / Infaq Operasional</label>
              <input
                type="text"
                placeholder="Contoh: BSI 7123456789 a.n. DKM Masjid Digital"
                value={form.rekeningInfaq || form.rekeningBank || ""}
                onChange={(e) => {
                  setF("rekeningInfaq", e.target.value);
                  setF("rekeningBank", e.target.value);
                }}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E6E8E6] mb-1">Rekening Santunan Yatim &amp; Zakat</label>
              <input
                type="text"
                placeholder="Contoh: BSI 7788990022 a.n. Santunan Yatim & Dhuafa"
                value={form.rekeningYatim || ""}
                onChange={(e) => setF("rekeningYatim", e.target.value)}
                className="w-full text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-[#C19D60]/15">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] flex items-center gap-2 shadow-sm transition-colors"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Identitas Tersimpan!" : "Simpan Perubahan Identitas"}
          </button>
        </div>
      </form>

      {/* Backup & Restore Section */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-6 shadow-sm space-y-4">
        <h3 className="font-bold font-serif text-sm text-[#E6E8E6] border-b border-[#C19D60]/15 pb-2">
          Pusat Cadangan &amp; Pemulihan Data (Backup / Restore)
        </h3>
        <p className="text-xs text-[#A3ABA3]">
          Unduh seluruh riwayat naskah, pembukuan kas masjid, kalender kegiatan, dan gagasan ke file JSON untuk disimpan di komputer takmir.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0D0A] text-[#E6E8E6] border border-[#C19D60]/20 rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 transition-colors"
          >
            <Download className="w-4 h-4 text-[#C19D60]" /> Unduh Cadangan Lengkap (.json)
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0D0A] text-[#E6E8E6] border border-[#C19D60]/20 rounded-xl text-xs font-semibold hover:bg-[#C19D60]/20 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-[#C19D60]" /> Pulihkan Data dari File
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-900/60 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" /> Reset ke Data Contoh
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}
