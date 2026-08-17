export interface AiCallOptions {
  system?: string;
  prompt: string;
  temperature?: number;
  jsonMode?: boolean;
}

export async function callGeminiAi(options: AiCallOptions): Promise<string> {
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        let errorMsg = `Permintaan AI gagal (${res.status})`;
        try {
          const errData = await res.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // ignore
        }

        const isTemporary =
          res.status === 503 ||
          res.status === 429 ||
          errorMsg.includes("high demand") ||
          errorMsg.includes("UNAVAILABLE") ||
          errorMsg.includes("temporarily");

        if (isTemporary && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        if (isTemporary) {
          throw new Error("Layanan AI sedang mengalami lonjakan trafik tinggi sementara. Silakan klik tombol Susun / Generate sekali lagi.");
        }

        throw new Error(errorMsg);
      }

      const data = await res.json();
      return (data.text || "").trim();
    } catch (err: unknown) {
      if (attempts >= maxAttempts) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  throw new Error("Gagal menghubungi server AI.");
}

export function parseSermonResponse(raw: string): { naskah: string; dalil: Array<{ text: string; reference: string; status: "VERIFIED" | "NEEDS CONTEXT" | "NEEDS VERIFICATION" | "NOT RECOMMENDED"; note?: string }> } {
  const marker = "===DALIL===";
  const idx = raw.indexOf(marker);
  let naskah = raw;
  let dalilRaw = "[]";

  if (idx !== -1) {
    naskah = raw.slice(0, idx).trim();
    dalilRaw = raw.slice(idx + marker.length).trim();
  }

  let dalil: Array<{ text: string; reference: string; status: "VERIFIED" | "NEEDS CONTEXT" | "NEEDS VERIFICATION" | "NOT RECOMMENDED"; note?: string }> = [];
  try {
    const match = dalilRaw.match(/\[[\s\S]*\]/);
    dalil = match ? JSON.parse(match[0]) : [];
  } catch {
    dalil = [];
  }
  return { naskah, dalil };
}

export async function parseJsonArrayRobust<T>(raw: string): Promise<T[] | null> {
  if (!raw) return null;
  const match = String(raw).match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]) as T[];
    } catch {
      // Try repair
    }
  }

  try {
    const fixed = await callGeminiAi({
      system: "Anda memperbaiki format output yang seharusnya berupa array JSON valid. Kembalikan HANYA array JSON yang valid tanpa teks lain, tanpa markdown.",
      prompt: `Perbaiki JSON berikut agar valid sintaksnya:\n\n${raw}`,
      jsonMode: true,
    });
    const matchFixed = String(fixed).match(/\[[\s\S]*\]/);
    return matchFixed ? (JSON.parse(matchFixed[0]) as T[]) : null;
  } catch {
    return null;
  }
}
