import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set. Using fallback or simulated response.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side AI generation proxy using GoogleGenAI SDK (gemini-3.7-flash)
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { system, prompt, temperature, jsonMode } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Parameter prompt wajib diisi." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "GEMINI_API_KEY belum dikonfigurasi di Settings > Secrets.",
        });
      }

      const ai = getAiClient();
      const config: Record<string, unknown> = {};

      if (system) {
        config.systemInstruction = system;
      }
      if (typeof temperature === "number") {
        config.temperature = temperature;
      }
      if (jsonMode) {
        config.responseMimeType = "application/json";
      }

      const modelsToTry = ["gemini-3.7-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let lastError: unknown = null;
      let generatedText: string | null = null;

      for (const modelName of modelsToTry) {
        // Try up to 2 attempts per model with backoff
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            if (attempt > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config,
            });
            generatedText = response.text || "";
            break;
          } catch (err: unknown) {
            lastError = err;
            const errStr = String(err);
            const isDemandOrRateLimit =
              errStr.includes("503") ||
              errStr.includes("UNAVAILABLE") ||
              errStr.includes("high demand") ||
              errStr.includes("RESOURCE_EXHAUSTED") ||
              errStr.includes("429");

            if (!isDemandOrRateLimit) {
              // If it's another type of fatal error, break attempt loop to try next model or fail
              break;
            }
          }
        }

        if (generatedText !== null) {
          break;
        }
      }

      if (generatedText === null) {
        throw lastError || new Error("Gagal memproses permintaan AI setelah beberapa percobaan.");
      }

      res.json({ text: generatedText });
    } catch (err: unknown) {
      console.error("Gemini API error:", err);
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat memanggil Gemini API.";
      res.status(500).json({ error: errMsg });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Masjid AI Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
