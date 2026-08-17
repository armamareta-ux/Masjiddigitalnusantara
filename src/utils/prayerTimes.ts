import { PrayerTimeData } from "../types";

export interface CityLocation {
  name: string;
  province: string;
  lat: number;
  lng: number;
  timezone: number; // UTC offset, e.g. 7 for WIB, 8 for WITA, 9 for WIT
}

export const INDONESIAN_CITIES: CityLocation[] = [
  { name: "Jakarta", province: "DKI Jakarta", lat: -6.2088, lng: 106.8456, timezone: 7 },
  { name: "Surabaya", province: "Jawa Timur", lat: -7.2575, lng: 112.7521, timezone: 7 },
  { name: "Bandung", province: "Jawa Barat", lat: -6.9175, lng: 107.6191, timezone: 7 },
  { name: "Medan", province: "Sumatera Utara", lat: 3.5952, lng: 98.6722, timezone: 7 },
  { name: "Semarang", province: "Jawa Tengah", lat: -6.9667, lng: 110.4167, timezone: 7 },
  { name: "Makassar", province: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327, timezone: 8 },
  { name: "Palembang", province: "Sumatera Selatan", lat: -2.9761, lng: 104.7754, timezone: 7 },
  { name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.7956, lng: 110.3695, timezone: 7 },
  { name: "Banjarmasin", province: "Kalimantan Selatan", lat: -3.3167, lng: 114.5901, timezone: 8 },
  { name: "Denpasar", province: "Bali", lat: -8.6705, lng: 115.2126, timezone: 8 },
  { name: "Padang", province: "Sumatera Barat", lat: -0.9471, lng: 100.4172, timezone: 7 },
  { name: "Banda Aceh", province: "Aceh", lat: 5.5483, lng: 95.3238, timezone: 7 },
  { name: "Samarinda", province: "Kalimantan Timur", lat: -0.5021, lng: 117.1537, timezone: 8 },
  { name: "Mataram", province: "Nusa Tenggara Barat", lat: -8.5833, lng: 116.1167, timezone: 8 },
  { name: "Jayapura", province: "Papua", lat: -2.5337, lng: 140.7181, timezone: 9 },
  { name: "Manado", province: "Sulawesi Utara", lat: 1.4748, lng: 124.8428, timezone: 8 },
  { name: "Pontianak", province: "Kalimantan Barat", lat: -0.0263, lng: 109.3425, timezone: 7 },
  { name: "Pekanbaru", province: "Riau", lat: 0.5071, lng: 101.4478, timezone: 7 },
  { name: "Bandar Lampung", province: "Lampung", lat: -5.45, lng: 105.2667, timezone: 7 },
  { name: "Kupang", province: "Nusa Tenggara Timur", lat: -10.1772, lng: 123.607, timezone: 8 },
  { name: "Ambon", province: "Maluku", lat: -3.6954, lng: 128.1814, timezone: 9 },
];

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalize(value: number, max: number): number {
  let val = value - max * Math.floor(value / max);
  if (val < 0) val += max;
  return val;
}

// Astronomical calculation for prayer times (Kemenag standard: Subuh 20 deg, Isya 18 deg)
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone: number
): PrayerTimeData {
  const d =
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000 -
    10957.5;

  // Sun's mean anomaly and longitude
  const g = normalize(357.529 + 0.98560028 * d, 360);
  const q = normalize(280.459 + 0.98564736 * d, 360);
  const l = normalize(
    q + 1.915 * Math.sin(degToRad(g)) + 0.02 * Math.sin(degToRad(2 * g)),
    360
  );

  // Sun's declination
  const e = 23.439 - 0.00000036 * d;
  const sinDec = Math.sin(degToRad(e)) * Math.sin(degToRad(l));
  const dec = Math.asin(sinDec);

  // Equation of time
  const ra = normalize(
    radToDeg(Math.atan2(Math.cos(degToRad(e)) * Math.sin(degToRad(l)), Math.cos(degToRad(l)))),
    360
  );
  const eqt = (q / 15 - ra / 15) * 60; // in minutes

  // Solar noon
  const noon = 12 + timezone - lng / 15 - eqt / 60;

  // Helper for Sun Angle
  function sunAngleTime(angle: number, direction: "morning" | "evening"): number {
    const cosH =
      (Math.sin(degToRad(-angle)) - Math.sin(degToRad(lat)) * Math.sin(dec)) /
      (Math.cos(degToRad(lat)) * Math.cos(dec));

    if (cosH > 1 || cosH < -1) return noon; // Polar regions fallback
    const h = radToDeg(Math.acos(cosH)) / 15;
    return direction === "morning" ? noon - h : noon + h;
  }

  // Ashar calculation (Shafi'i/Hanbali/Maliki: shadow length = 1 + shadow at noon)
  function asharTime(): number {
    const shadowFactor = 1;
    const noonSunAltitude = 90 - Math.abs(lat - radToDeg(dec));
    const noonShadow = 1 / Math.tan(degToRad(noonSunAltitude));
    const asharAltitude = radToDeg(Math.atan(1 / (shadowFactor + noonShadow)));
    const cosH =
      (Math.sin(degToRad(asharAltitude)) - Math.sin(degToRad(lat)) * Math.sin(dec)) /
      (Math.cos(degToRad(lat)) * Math.cos(dec));
    const h = radToDeg(Math.acos(Math.min(1, Math.max(-1, cosH)))) / 15;
    return noon + h;
  }

  // Indonesian Kemenag standard: Subuh 20°, Isya 18°, Syuruq 0.833°
  const subuhRaw = sunAngleTime(20, "morning");
  const syuruqRaw = sunAngleTime(0.833, "morning");
  const dzuhurRaw = noon;
  const asharRaw = asharTime();
  const maghribRaw = sunAngleTime(0.833, "evening");
  const isyaRaw = sunAngleTime(18, "evening");

  // Ihtiyat (+2 minutes for certainty in Indonesia)
  const ihtiyat = 2 / 60;

  function toTimeString(decimalHours: number): string {
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const subuhVal = subuhRaw + ihtiyat;
  const imsakVal = subuhVal - 10 / 60; // Imsak = 10 mins before Subuh
  const syuruqVal = syuruqRaw - ihtiyat;
  const dhuhaVal = syuruqRaw + 20 / 60; // Dhuha ~ 20 mins after sunrise
  const dzuhurVal = dzuhurRaw + ihtiyat;
  const asharVal = asharRaw + ihtiyat;
  const maghribVal = maghribRaw + ihtiyat;
  const isyaVal = isyaRaw + ihtiyat;

  return {
    imsak: toTimeString(imsakVal),
    subuh: toTimeString(subuhVal),
    syuruq: toTimeString(syuruqVal),
    dhuha: toTimeString(dhuhaVal),
    dzuhur: toTimeString(dzuhurVal),
    ashar: toTimeString(asharVal),
    maghrib: toTimeString(maghribVal),
    isya: toTimeString(isyaVal),
  };
}

export interface NextPrayerInfo {
  name: string;
  timeStr: string;
  time: string;
  diffMinutes: number;
  formattedCountdown: string;
  countdown: string;
  isToday: boolean;
}

export function getNextPrayer(prayerTimes: PrayerTimeData, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayers: Array<{ name: string; timeStr: string }> = [
    { name: "Subuh", timeStr: prayerTimes.subuh },
    { name: "Syuruq", timeStr: prayerTimes.syuruq },
    { name: "Dzuhur", timeStr: prayerTimes.dzuhur },
    { name: "Ashar", timeStr: prayerTimes.ashar },
    { name: "Maghrib", timeStr: prayerTimes.maghrib },
    { name: "Isya", timeStr: prayerTimes.isya },
  ];

  function parseMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  for (const p of prayers) {
    const pMinutes = parseMinutes(p.timeStr);
    if (pMinutes > currentMinutes) {
      const diff = pMinutes - currentMinutes;
      const hours = Math.floor(diff / 60);
      const mins = Math.floor(diff % 60);
      const secs = Math.floor((diff * 60) % 60);
      const cd = `${hours > 0 ? `${hours}j ` : ""}${mins}m ${secs}s`;
      return {
        name: p.name,
        timeStr: p.timeStr,
        time: p.timeStr,
        diffMinutes: Math.round(diff),
        formattedCountdown: cd,
        countdown: cd,
        isToday: true,
      };
    }
  }

  // If all prayers passed today, next is Subuh tomorrow
  const subuhMinutes = parseMinutes(prayerTimes.subuh);
  const diff = 1440 - currentMinutes + subuhMinutes;
  const hours = Math.floor(diff / 60);
  const mins = Math.floor(diff % 60);
  const secs = Math.floor((diff * 60) % 60);
  const cd = `${hours > 0 ? `${hours}j ` : ""}${mins}m ${secs}s`;

  return {
    name: "Subuh (Besok)",
    timeStr: prayerTimes.subuh,
    time: prayerTimes.subuh,
    diffMinutes: Math.round(diff),
    formattedCountdown: cd,
    countdown: cd,
    isToday: false,
  };
}

// Convert Gregorian date to estimated Islamic/Hijri date
export function getHijriDate(date: Date = new Date()): string {
  // Approximate Umm al-Qura calculation offset
  const hijriMonths = [
    "Muharram",
    "Safar",
    "Rabi'ul Awwal",
    "Rabi'ul Akhir",
    "Jumadil Ula",
    "Jumadil Akhirah",
    "Rajab",
    "Sya'ban",
    "Ramadhan",
    "Syawwal",
    "Dzulqa'dah",
    "Dzulhijjah",
  ];

  try {
    const intl = new Intl.DateTimeFormat("id-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);
    
    // e.g. "24/2/1448 AH" or "24/2/1448"
    const parts = intl.replace(/[^0-9/]/g, "").split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[2];
      const monthName = hijriMonths[monthIdx] || "Bulan Hijriyah";
      return `${day} ${monthName} ${year} H`;
    }
  } catch {
    // fallback
  }

  // Algorithmic estimation fallback
  const jd = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) + 86400000 * 2440587.5) /
      86400000
  );
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;

  return `${d} ${hijriMonths[m - 1] || "Hijriyah"} ${y} H`;
}

export const getHijriDateString = getHijriDate;

// Calculate Qibla direction from any coordinate (Kaaba: 21.4225° N, 39.8262° E)
export function calculateQiblaDirection(lat: number, lng: number): number {
  const kaabaLat = degToRad(21.4225);
  const kaabaLng = degToRad(39.8262);
  const userLat = degToRad(lat);
  const userLng = degToRad(lng);

  const deltaLng = kaabaLng - userLng;
  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLng);

  let qibla = radToDeg(Math.atan2(y, x));
  return normalize(qibla, 360);
}
