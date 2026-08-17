import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
  Tv,
  Calendar,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  AlertCircle,
  Navigation,
} from "lucide-react";
import { PrayerTimeData, MosqueBranding } from "../types";
import {
  calculatePrayerTimes,
  calculateQiblaDirection,
  getNextPrayer,
  getHijriDate,
  INDONESIAN_CITIES,
  CityLocation,
} from "../utils/prayerTimes";

export interface JadwalSholatViewProps {
  branding: MosqueBranding;
  onOpenTvMode?: () => void;
  onOpenTvSignage?: () => void;
  currentPrayerTimes?: PrayerTimeData;
  selectedCity?: CityLocation;
  onSelectCity?: (city: CityLocation) => void;
}

export function JadwalSholatView({
  branding,
  onOpenTvMode,
  onOpenTvSignage,
  currentPrayerTimes: propPrayerTimes,
  selectedCity: propCity,
  onSelectCity: propOnSelectCity,
}: JadwalSholatViewProps) {
  const [time, setTime] = useState(new Date());
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [internalCity, setInternalCity] = useState<CityLocation>(
    INDONESIAN_CITIES[0]
  );

  const activeCity = propCity || internalCity;
  const handleCityChange = propOnSelectCity || setInternalCity;
  const handleOpenTv = onOpenTvMode || onOpenTvSignage || (() => {});

  const [qiblaDegree, setQiblaDegree] = useState(() =>
    calculateQiblaDirection(activeCity.lat, activeCity.lng)
  );

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setQiblaDegree(calculateQiblaDirection(activeCity.lat, activeCity.lng));
  }, [activeCity]);

  const calculatedTimes = calculatePrayerTimes(
    time,
    activeCity.lat,
    activeCity.lng,
    activeCity.timezone
  );

  const currentPrayerTimes = propPrayerTimes || calculatedTimes;
  const nextPrayer = getNextPrayer(currentPrayerTimes, time);
  const hijriDate = getHijriDate(time);

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung geolokasi.");
      return;
    }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const customCity: CityLocation = {
          name: "Lokasi GPS Masjid",
          province: "Koordinat Presisi",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timezone: Math.round(-new Date().getTimezoneOffset() / 60),
        };
        handleCityChange(customCity);
        setIsGpsLoading(false);
      },
      (err) => {
        setIsGpsLoading(false);
        alert(`Gagal mengambil lokasi GPS: ${err.message}`);
      }
    );
  };

  const prayerCards = [
    {
      name: "Imsak",
      time: currentPrayerTimes.imsak,
      icon: Moon,
      desc: "Batas akhir sahur puasa",
    },
    {
      name: "Subuh",
      time: currentPrayerTimes.subuh,
      icon: Sunrise,
      desc: "2 Rakaat Berjamaah",
      active: nextPrayer.name.includes("Subuh"),
    },
    {
      name: "Syuruq",
      time: currentPrayerTimes.syuruq,
      icon: Sun,
      desc: "Matahari Terbit",
    },
    {
      name: "Dhuha",
      time: currentPrayerTimes.dhuha,
      icon: Sun,
      desc: "Mulai Waktu Shalat Dhuha",
    },
    {
      name: "Dzuhur",
      time: currentPrayerTimes.dzuhur,
      icon: Sun,
      desc: "4 Rakaat Berjamaah",
      active: nextPrayer.name.includes("Dzuhur"),
    },
    {
      name: "Ashar",
      time: currentPrayerTimes.ashar,
      icon: Sun,
      desc: "4 Rakaat Berjamaah",
      active: nextPrayer.name.includes("Ashar"),
    },
    {
      name: "Maghrib",
      time: currentPrayerTimes.maghrib,
      icon: Sunset,
      desc: "3 Rakaat Berjamaah",
      active: nextPrayer.name.includes("Maghrib"),
    },
    {
      name: "Isya",
      time: currentPrayerTimes.isya,
      icon: Moon,
      desc: "4 Rakaat Berjamaah",
      active: nextPrayer.name.includes("Isya"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#C19D60]">Jadwal Sholat &amp; Digital Display</h1>
          <p className="text-sm text-[#A3ABA3]">
            Jadwal waktu shalat standar Kementerian Agama RI dengan hitungan hisab presisi, arah kiblat, dan display TV masjid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenTv}
            className="flex items-center gap-2 px-4 py-2 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#D4AF6E] transition-colors shadow-sm"
          >
            <Tv className="w-4 h-4" /> Mode TV Display Masjid
          </button>
        </div>
      </div>

      {/* Hero Live Clock & Next Prayer Banner */}
      <div className="bg-[#0D110D] border border-[#C19D60]/30 rounded-2xl p-6 sm:p-8 text-[#E6E8E6] shadow-xl relative overflow-hidden">
        {/* Background glow & Islamic pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C19D60]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C19D60 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C19D60]/15 border border-[#C19D60]/30 text-[#C19D60] text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{hijriDate}</span>
            </div>

            <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[#E6E8E6]">
              {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            <p className="text-[#A3ABA3] text-sm font-medium">
              {time.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Next Prayer Badge */}
          <div className="bg-[#0A0D0A] border border-[#C19D60]/40 rounded-2xl p-5 text-center min-w-[240px] shadow-lg backdrop-blur-sm">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C19D60]">
              Menuju Waktu Sholat
            </span>
            <h3 className="text-3xl font-bold font-serif text-[#E6E8E6] mt-1 mb-1">{nextPrayer.name}</h3>
            <p className="font-mono text-sm text-[#A3ABA3] font-semibold mb-2">{nextPrayer.time} WIB</p>
            <div className="font-mono text-xl font-extrabold text-[#0A0D0A] bg-[#C19D60] py-1.5 px-3 rounded-xl shadow-xs">
              - {nextPrayer.countdown}
            </div>
          </div>
        </div>
      </div>

      {/* City Switcher & Qibla Compass Strip */}
      <div className="bg-[#0D110D] p-5 rounded-2xl border border-[#C19D60]/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <MapPin className="w-5 h-5 text-[#C19D60] shrink-0" />
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-[#A3ABA3] uppercase tracking-wider mb-1">
              Pilih Kota / Wilayah
            </label>
            <select
              value={activeCity.name}
              onChange={(e) => {
                const found = INDONESIAN_CITIES.find((c) => c.name === e.target.value);
                if (found) handleCityChange(found);
              }}
              className="w-full text-xs font-semibold bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl p-2.5 text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {INDONESIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-[#0A0D0A] text-[#E6E8E6]">
                  {c.name} ({c.province})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUseGps}
            disabled={isGpsLoading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#141A14] border border-[#C19D60]/30 text-[#C19D60] rounded-xl text-xs font-semibold hover:bg-[#C19D60]/15 transition-colors mt-auto disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5 text-[#C19D60]" />
            {isGpsLoading ? "Mendeteksi..." : "Gunakan GPS Saya"}
          </button>
        </div>

        {/* Qibla Direction Indicator */}
        <div className="flex items-center gap-4 bg-[#0A0D0A] border border-[#C19D60]/30 rounded-xl px-4 py-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-full bg-[#C19D60]/10 border border-[#C19D60] flex items-center justify-center text-[#C19D60] shrink-0 shadow-inner">
            <Compass
              className="w-6 h-6 transition-transform duration-500"
              style={{ transform: `rotate(${qiblaDegree}deg)` }}
            />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#C19D60]">Arah Kiblat (Ka&apos;bah)</p>
            <p className="text-xs font-mono font-extrabold text-[#E6E8E6]">
              {qiblaDegree.toFixed(1)}° dari Utara Sejati
            </p>
          </div>
        </div>
      </div>

      {/* Prayer Times Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {prayerCards.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm relative overflow-hidden ${
                p.active
                  ? "bg-[#C19D60]/15 border-[#C19D60] shadow-md ring-1 ring-[#C19D60]"
                  : "bg-[#0D110D] border-[#C19D60]/20 text-[#E6E8E6]"
              }`}
            >
              {p.active && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#C19D60] text-[#0A0D0A] text-[9px] font-mono font-bold tracking-wider uppercase">
                  Berikutnya
                </span>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${p.active ? "text-[#C19D60]" : "text-[#A3ABA3]"}`}>
                  {p.name}
                </span>
                <Icon className={`w-5 h-5 ${p.active ? "text-[#C19D60]" : "text-[#A3ABA3]/60"}`} />
              </div>

              <div>
                <span className="font-mono text-3xl font-bold tracking-tight text-[#E6E8E6]">{p.time}</span>
                <p className="text-[11px] text-[#A3ABA3] mt-1">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-[#0D110D] p-5 rounded-2xl border border-[#C19D60]/20 text-xs text-[#A3ABA3] space-y-2">
        <p className="font-bold text-[#C19D60] flex items-center gap-1.5 text-sm">
          <AlertCircle className="w-4 h-4 text-[#C19D60]" />
          Ketentuan &amp; Standar Hisab Waktu Shalat
        </p>
        <p className="leading-relaxed">
          Jadwal waktu shalat dihitung secara astronomis berdasarkan koordinat lintang &amp; bujur lokasi masjid mengacu pada ketetapan Kementerian Agama Republik Indonesia (Kemenag RI): Subuh (sudut matahari 20°), Isya (sudut matahari 18°), dan penambahan waktu ikhtiyath +2 menit untuk menjaga kehati-hatian masuknya waktu shalat.
        </p>
      </div>
    </div>
  );
}
