import React, { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, Volume2, VolumeX, Moon, Clock, Calendar, MapPin, Sparkles } from "lucide-react";
import { MosqueBranding, PrayerTimeData, MosqueEvent, CashTransaction } from "../types";
import { getNextPrayer, getHijriDate, INDONESIAN_CITIES, calculatePrayerTimes } from "../utils/prayerTimes";

export interface TvSignageModalProps {
  onClose: () => void;
  branding: MosqueBranding;
  isOpen?: boolean;
  events?: MosqueEvent[];
  transactions?: CashTransaction[];
  prayerTimes?: PrayerTimeData;
  cityName?: string;
}

const ISLAMIC_QUOTES = [
  "“Sesungguhnya shalat itu adalah fardhu yang ditentukan waktunya atas orang-orang yang beriman.” (QS. An-Nisa: 103)",
  "“Sebaik-baik tempat di muka bumi adalah masjid-masjidnya.” (HR. Muslim)",
  "“Barangsiapa membangun masjid karena Allah, maka Allah bangunkan baginya rumah di surga.” (HR. Bukhari)",
  "“Jagalah lisan, luruskan dan rapatkan shaf shalat berjamaah.”",
  "“Sedekah itu tidak akan mengurangi harta, dan tidaklah Allah menambah bagi seorang hamba yang pemaaf kecuali kemuliaan.” (HR. Muslim)",
  "“Mohon menonaktifkan atau menyenyapkan nada dering HP di dalam masjid.”",
];

export function TvSignageModal({
  onClose,
  branding,
  prayerTimes: propPrayerTimes,
  cityName: propCityName,
}: TvSignageModalProps) {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
    }, 15000);
    return () => clearInterval(quoteTimer);
  }, []);

  const defaultCity = INDONESIAN_CITIES[0];
  const cityName = propCityName || branding.kota || defaultCity.name;
  const prayerTimes =
    propPrayerTimes ||
    calculatePrayerTimes(
      time,
      defaultCity.lat,
      defaultCity.lng,
      defaultCity.timezone
    );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const nextPrayer = getNextPrayer(prayerTimes, time);
  const hijriStr = getHijriDate(time);

  const prayerList = [
    { name: "Imsak", time: prayerTimes.imsak },
    { name: "Subuh", time: prayerTimes.subuh, active: nextPrayer.name === "Subuh" },
    { name: "Terbit", time: prayerTimes.syuruq },
    { name: "Dzuhur", time: prayerTimes.dzuhur, active: nextPrayer.name === "Dzuhur" },
    { name: "Ashar", time: prayerTimes.ashar, active: nextPrayer.name === "Ashar" },
    { name: "Maghrib", time: prayerTimes.maghrib, active: nextPrayer.name === "Maghrib" },
    { name: "Isya", time: prayerTimes.isya, active: nextPrayer.name === "Isya" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D0A] text-[#E6E8E6] flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[#0A0D0A] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C19D60]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C19D60]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#C19D60]/20 bg-[#0D110D]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {branding.logo ? (
            <img src={branding.logo} alt="Logo" className="w-16 h-16 object-contain rounded-xl shadow-lg border border-[#C19D60]/30" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#0A0D0A] border border-[#C19D60]/40 flex items-center justify-center font-serif text-2xl font-bold text-[#C19D60] shadow-md">
              🕌
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#C19D60] tracking-wide drop-shadow-md">
              {branding.namaMasjid || "MASJID DIGITAL NUSANTARA"}
            </h1>
            <p className="text-xs text-[#A3ABA3] flex items-center gap-2 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#C19D60]" />
              <span>{branding.alamat || `Kota ${cityName}`}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-[#141A14] hover:bg-[#C19D60]/20 text-[#C19D60] border border-[#C19D60]/30 transition-colors"
            title="Toggle Suara Notifikasi"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#141A14] hover:bg-[#C19D60]/20 text-[#C19D60] border border-[#C19D60]/30 transition-colors"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-300 transition-colors"
            title="Tutup Mode TV"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Center Area: Clock & Next Prayer Countdown */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-around px-8 py-6 gap-8">
        {/* Digital Clock & Calendar */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C19D60]/15 border border-[#C19D60]/30 text-[#C19D60] text-xs font-semibold mb-3">
            <Calendar className="w-3.5 h-3.5 text-[#C19D60]" />
            <span>{hijriStr}</span>
          </div>

          <div className="font-mono text-6xl md:text-8xl font-bold tracking-tight text-[#E6E8E6] drop-shadow-[0_4px_16px_rgba(193,157,96,0.2)]">
            {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>

          <p className="text-base md:text-lg text-[#A3ABA3] mt-2 font-medium">
            {time.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Next Prayer Countdown Card */}
        <div className="bg-[#0D110D] border-2 border-[#C19D60]/40 rounded-3xl p-6 md:p-8 text-center shadow-2xl backdrop-blur-md max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 text-[#C19D60] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-[#C19D60]" />
            <span>Menuju Waktu Sholat</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#E6E8E6] mb-2">
            {nextPrayer.name}
          </h2>
          <div className="inline-block px-4 py-1.5 bg-[#C19D60]/15 border border-[#C19D60]/30 rounded-full text-[#C19D60] font-mono text-lg font-bold mb-3">
            {nextPrayer.time} WIB
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-[#C19D60] drop-shadow">
            - {nextPrayer.countdown}
          </div>
        </div>
      </main>

      {/* Prayer Times Grid Bar */}
      <section className="relative z-10 px-8 py-4 bg-[#0D110D]/90 border-t border-[#C19D60]/20 backdrop-blur-md">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {prayerList.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all ${
                p.active
                  ? "bg-[#C19D60]/20 border-[#C19D60] text-[#E6E8E6] shadow-lg shadow-[#C19D60]/10 scale-105"
                  : "bg-[#0A0D0A] border-[#C19D60]/15 text-[#A3ABA3] hover:border-[#C19D60]/40"
              }`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${p.active ? "text-[#C19D60] font-bold" : "text-[#A3ABA3]"}`}>
                {p.name}
              </span>
              <span className="font-mono text-xl md:text-2xl font-bold tracking-tight text-[#E6E8E6]">
                {p.time}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Running Text Ticker at Bottom */}
      <footer className="relative z-10 bg-[#070907] border-t border-[#C19D60]/20 py-2.5 px-6 flex items-center gap-4 overflow-hidden text-xs text-[#C19D60]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C19D60] text-[#0A0D0A] font-bold font-mono text-[10px] uppercase tracking-wider shrink-0 shadow">
          <span>PENGUMUMAN</span>
        </div>
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <p className="animate-marquee font-medium text-[#E6E8E6] text-sm tracking-wide">
            {branding.tagline ? `${branding.tagline} • ` : ""}
            {ISLAMIC_QUOTES[quoteIndex]} • Infaq Rekening {branding.rekeningBank || branding.rekeningInfaq || "BSI: Hubungi Pengurus DKM"}
          </p>
        </div>
      </footer>
    </div>
  );
}
