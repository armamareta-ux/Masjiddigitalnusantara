import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Building2,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth, UserProfileData } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

const ROLES: UserProfileData["role"][] = [
  "Ketua DKM",
  "Sekretaris",
  "Bendahara",
  "Takmir",
  "Khatib / Da'i",
  "Admin",
];

export function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mosqueName, setMosqueName] = useState("");
  const [role, setRole] = useState<UserProfileData["role"]>("Takmir");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
        setSuccessMsg("Berhasil masuk! Selamat bertugas.");
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        if (!displayName.trim()) {
          throw new Error("Mohon masukkan nama lengkap / nama panggilan.");
        }
        await register(
          email.trim(),
          password,
          displayName.trim(),
          role,
          mosqueName.trim() || "Masjid Digital"
        );
        setSuccessMsg("Pendaftaran berhasil! Akun pengurus telah aktif.");
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      let message = "Terjadi kesalahan saat autentikasi.";
      if (err instanceof Error) {
        const msg = err.message;
        if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
          message = "Email atau password yang Anda masukkan salah.";
        } else if (msg.includes("auth/email-already-in-use")) {
          message = "Email ini sudah terdaftar. Silakan pilih tab 'Masuk / Login'.";
        } else if (msg.includes("auth/weak-password")) {
          message = "Password terlalu pendek. Minimal 6 karakter.";
        } else if (msg.includes("auth/invalid-email")) {
          message = "Format alamat email tidak valid.";
        } else {
          message = msg;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0D110D] border border-[#C19D60]/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-[#E6E8E6] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#080B08] border-b border-[#C19D60]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C19D60]/10 border border-[#C19D60]/40 flex items-center justify-center text-[#C19D60]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#C19D60]">
                {mode === "login" ? "Masuk Akun Pengurus" : "Daftar Akun Takmir / DKM"}
              </h2>
              <p className="text-xs text-[#A3ABA3]">
                {mode === "login"
                  ? "Akses data kepengurusan dan naskah dakwah"
                  : "Buat profil pengurus masjid baru"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A3ABA3] hover:text-[#E6E8E6] hover:bg-[#141A14] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-2 bg-[#0A0D0A] border-b border-[#C19D60]/15 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-[#C19D60] text-[#0A0D0A] shadow-xs"
                : "text-[#A3ABA3] hover:text-[#E6E8E6] hover:bg-[#141A14]"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-[#C19D60] text-[#0A0D0A] shadow-xs"
                : "text-[#A3ABA3] hover:text-[#E6E8E6] hover:bg-[#141A14]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Daftar Akun Baru
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#C19D60] mb-1">
                  Nama Lengkap / Gelar
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A3ABA3] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ust. Ahmad Fauzi, S.Pd.I"
                    className="w-full bg-[#141A14] border border-[#C19D60]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#E6E8E6] focus:border-[#C19D60] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#C19D60] mb-1">
                    Amanah / Jabatan
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserProfileData["role"])}
                    className="w-full bg-[#141A14] border border-[#C19D60]/20 rounded-xl py-2.5 px-3 text-xs text-[#E6E8E6] focus:border-[#C19D60] focus:outline-hidden"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-[#0D110D] text-[#E6E8E6]">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C19D60] mb-1">
                    Nama Masjid
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-[#A3ABA3] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={mosqueName}
                      onChange={(e) => setMosqueName(e.target.value)}
                      placeholder="Masjid Raya Al-Ikhlas"
                      className="w-full bg-[#141A14] border border-[#C19D60]/20 rounded-xl py-2.5 pl-8 pr-3 text-xs text-[#E6E8E6] focus:border-[#C19D60] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#C19D60] mb-1">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A3ABA3] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pengurus@masjid.id"
                className="w-full bg-[#141A14] border border-[#C19D60]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#E6E8E6] focus:border-[#C19D60] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C19D60] mb-1">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A3ABA3] absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#141A14] border border-[#C19D60]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs text-[#E6E8E6] focus:border-[#C19D60] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#C19D60] hover:bg-[#D4AF6E] disabled:opacity-50 text-[#0A0D0A] font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Memproses...
              </span>
            ) : mode === "login" ? (
              <span className="flex items-center gap-2">
                <LogIn className="w-3.5 h-3.5" /> Masuk ke Akun
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5" /> Selesaikan Pendaftaran
              </span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="p-4 bg-[#080B08] border-t border-[#C19D60]/15 text-center text-[11px] text-[#A3ABA3]">
          {mode === "login" ? (
            <p>
              Belum memiliki akun pengurus?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-[#C19D60] font-bold hover:underline"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun pengurus?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-[#C19D60] font-bold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
