import React, { useState, useMemo } from "react";
import {
  Monitor,
  Tablet,
  Printer,
  X,
  FileOutput,
  Download,
  Copy,
  ShieldCheck,
  Check,
  AlertTriangle,
} from "lucide-react";
import { DocSettings, MosqueBranding, DalilItem } from "../types";

export interface DocEngineProps {
  onClose: () => void;
  isOpen?: boolean;
  content: string;
  title?: string;
  dalil?: DalilItem[];
  docType?: string;
  meta?: { title: string; subtitle?: string };
  branding: MosqueBranding;
  docSettings?: DocSettings;
  onSaveSettings?: (settings: DocSettings) => void;
}

const DEFAULT_DOC_SETTINGS: DocSettings = {
  paperSize: "A4",
  orientation: "Portrait",
  margin: "Normal",
  customMargin: { top: 25, right: 20, bottom: 25, left: 20 },
  colorTheme: "Islamic Green",
  style: "Modern Formal",
  pageNumberPos: "bottom center",
  printMode: false,
  showCover: false,
};

const PAPER_SIZES: Record<string, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A5: { w: 148, h: 210 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
};

const MARGIN_PRESETS: Record<string, { top: number; right: number; bottom: number; left: number }> = {
  Normal: { top: 25, right: 20, bottom: 25, left: 20 },
  Narrow: { top: 12, right: 12, bottom: 12, left: 12 },
  Wide: { top: 35, right: 30, bottom: 35, left: 30 },
};

const COLOR_THEME_PRESETS: Record<string, { primary: string; accent: string }> = {
  "Islamic Green": { primary: "#0F3D3E", accent: "#B98B3E" },
  Emerald: { primary: "#0F6E4F", accent: "#C9A85C" },
  "Deep Green": { primary: "#0A2E22", accent: "#C9A85C" },
  Navy: { primary: "#122B4D", accent: "#B98B3E" },
  Maroon: { primary: "#5C1A22", accent: "#C9A85C" },
  "Earth Tone": { primary: "#5B4630", accent: "#8A6F3E" },
};

function isArabicText(s: string): boolean {
  return /[\u0600-\u06FF]/.test(s);
}

interface DocBlock {
  type: "h1" | "h2" | "h3" | "p" | "quote" | "arabic" | "table";
  text?: string;
  rows?: string[][];
}

function parseDocumentBlocks(text: string): DocBlock[] {
  if (!text) return [];
  const lines = String(text).split("\n");
  const raw: Array<{ type: string; text?: string; cells?: string[] }> = [];
  let buf: string[] = [];

  function flush() {
    if (buf.length) {
      const joined = buf.join(" ").trim();
      if (joined) raw.push({ type: isArabicText(joined) ? "arabic" : "p", text: joined });
      buf = [];
    }
  }

  lines.forEach((line0) => {
    const line = line0.trim();
    if (!line) {
      flush();
      return;
    }
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    const quote = line.match(/^>\s?(.*)/);
    const tableRow = line.match(/^\|(.+)\|$/);

    if (h3) {
      flush();
      raw.push({ type: "h3", text: h3[1] });
    } else if (h2) {
      flush();
      raw.push({ type: "h2", text: h2[1] });
    } else if (h1) {
      flush();
      raw.push({ type: "h1", text: h1[1] });
    } else if (quote) {
      flush();
      raw.push({ type: "quote", text: quote[1] });
    } else if (tableRow) {
      flush();
      const cells = tableRow[1].split("|").map((c) => c.trim());
      if (cells.every((c) => /^-*$/.test(c))) return;
      raw.push({ type: "tablerow", cells });
    } else {
      buf.push(line);
    }
  });
  flush();

  const blocks: DocBlock[] = [];
  raw.forEach((b) => {
    if (b.type === "tablerow" && b.cells) {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "table" && last.rows) {
        last.rows.push(b.cells);
      } else {
        blocks.push({ type: "table", rows: [b.cells] });
      }
    } else {
      blocks.push(b as DocBlock);
    }
  });
  return blocks;
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slugify(s: string): string {
  return (
    String(s || "dokumen")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "dokumen"
  );
}

export function DocumentEngineModal({
  onClose,
  content,
  title: propTitle,
  dalil,
  docType,
  meta: propMeta,
  branding,
  docSettings = DEFAULT_DOC_SETTINGS,
  onSaveSettings = () => {},
}: DocEngineProps) {
  const meta = propMeta || { title: propTitle || "Dokumen Masjid Digital" };
  const [settings, setSettings] = useState<DocSettings>(docSettings);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "print">("desktop");
  const [copied, setCopied] = useState(false);
  const [printCheck, setPrintCheck] = useState<{
    allOk: boolean;
    checks: Array<{ label: string; ok: boolean; note: string }>;
  } | null>(null);

  const updateSetting = <K extends keyof DocSettings>(key: K, value: DocSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    onSaveSettings(next);
  };

  const blocks = useMemo(() => parseDocumentBlocks(content), [content]);
  const theme = COLOR_THEME_PRESETS[settings.colorTheme] || COLOR_THEME_PRESETS["Islamic Green"];
  const baseDims = PAPER_SIZES[settings.paperSize] || PAPER_SIZES.A4;
  const dims = settings.orientation === "Landscape" ? { w: baseDims.h, h: baseDims.w } : baseDims;
  const marginVals =
    settings.margin === "Custom"
      ? settings.customMargin
      : MARGIN_PRESETS[settings.margin] || MARGIN_PRESETS.Normal;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const bodyHtml = blocks
      .map((b) => {
        if (b.type === "h1")
          return `<h1 style="color:${theme.primary};font-size:18pt;margin-top:16pt;font-family:'Calibri',sans-serif;">${escapeHtml(b.text || "")}</h1>`;
        if (b.type === "h2")
          return `<h2 style="color:${theme.primary};font-size:14pt;margin-top:14pt;border-bottom:1pt solid ${theme.accent};padding-bottom:3pt;font-family:'Calibri',sans-serif;">${escapeHtml(b.text || "")}</h2>`;
        if (b.type === "h3")
          return `<h3 style="color:${theme.primary};font-size:12pt;margin-top:10pt;font-family:'Calibri',sans-serif;">${escapeHtml(b.text || "")}</h3>`;
        if (b.type === "quote")
          return `<table style="width:100%;background:#F7F4EC;margin:10pt 0;"><tr><td style="border-left:4pt solid ${theme.accent};padding:10pt 14pt;font-style:italic;">${escapeHtml(b.text || "")}</td></tr></table>`;
        if (b.type === "arabic")
          return `<p dir="rtl" lang="AR-SA" style="text-align:center;font-size:17pt;line-height:2.2;font-family:'Traditional Arabic','Amiri',serif;margin:10pt 0;">${escapeHtml(b.text || "")}</p>`;
        if (b.type === "table" && b.rows) {
          const [head, ...rows] = b.rows;
          return `<table style="width:100%;border-collapse:collapse;margin:10pt 0;" border="1" cellpadding="6">
            <tr>${(head || []).map((c) => `<th style="border:1pt solid #ccc;background:${theme.primary};color:#fff;font-size:9.5pt;">${escapeHtml(c)}</th>`).join("")}</tr>
            ${rows.map((r) => `<tr>${r.map((c) => `<td style="border:1pt solid #ccc;font-size:9.5pt;">${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}
          </table>`;
        }
        return `<p style="font-size:11pt;line-height:1.6;margin:6pt 0;text-align:justify;font-family:'Calibri',sans-serif;">${escapeHtml(b.text || "")}</p>`;
      })
      .join("\n");

    const dalilHtml =
      dalil && dalil.length
        ? `<h2 style="color:${theme.primary};font-size:14pt;border-bottom:1pt solid ${theme.accent};padding-bottom:3pt;">Rujukan &amp; Dalil</h2>
        ${dalil
          .map(
            (d) => `<table style="width:100%;background:#FBF6E8;margin:8pt 0;border:1pt solid ${theme.accent};"><tr><td style="padding:10pt 14pt;">
            <p style="font-weight:bold;margin:0 0 4pt;">${escapeHtml(d.reference || "")}</p>
            <p style="margin:0 0 4pt;font-style:italic;">${escapeHtml(d.text || "")}</p>
            <p style="margin:0;font-size:9pt;color:#666;">Status: ${escapeHtml(d.status || "")}</p>
          </td></tr></table>`
          )
          .join("")}`
        : "";

    const headerHtml = `<div style='mso-element:header' id='h1'><p style="text-align:center;border-bottom:1pt solid ${theme.accent};padding-bottom:6pt;font-family:Calibri;">
      ${branding.namaMasjid ? `<b>${escapeHtml(branding.namaMasjid)}</b>` : ""}${branding.alamat ? `<br/><span style="font-size:8.5pt;color:#555;">${escapeHtml(branding.alamat)}</span>` : ""}
    </p></div>`;

    const footerHtml = `<div style='mso-element:footer' id='f1'><p style="text-align:center;font-size:8.5pt;color:#666;border-top:0.5pt solid #ccc;padding-top:4pt;font-family:Calibri;">
      ${escapeHtml(branding.namaMasjid || "Masjid Digital")} | ${escapeHtml(meta.title || "Dokumen")} | Halaman <span style="mso-field-code:' PAGE '"></span>
    </p></div>`;

    const fullDocHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${escapeHtml(meta.title || "Dokumen")}</title>
    <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
    <style>
    @page Section1 { size: ${dims.w}mm ${dims.h}mm; margin: ${marginVals.top}mm ${marginVals.right}mm ${marginVals.bottom}mm ${marginVals.left}mm; mso-header: h1; mso-footer: f1; }
    div.Section1 { page: Section1; }
    body { font-family: Calibri, Arial, sans-serif; color:#1B2B2A; }
    </style></head>
    <body>
    ${headerHtml}${footerHtml}
    <div class="Section1">
      <h1 style="text-align:center;color:${theme.primary};font-size:20pt;">${escapeHtml(meta.title || "")}</h1>
      ${meta.subtitle ? `<p style="text-align:center;color:#666;font-size:12pt;">${escapeHtml(meta.subtitle)}</p>` : ""}
      <hr style="border:0;border-top:2pt solid ${theme.accent};margin:12pt 0;">
      ${bodyHtml}
      ${dalilHtml}
    </div>
    </body></html>`;

    const blob = new Blob(["\ufeff", fullDocHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(meta.title)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPrintCheck = () => {
    const checks = [
      { label: "Ukuran Kertas", ok: true, note: settings.paperSize },
      { label: "Orientasi", ok: true, note: settings.orientation },
      { label: "Margin", ok: true, note: settings.margin },
      { label: "Font & Tipografi", ok: true, note: settings.style },
      {
        label: "Deteksi Teks Arab",
        ok: true,
        note: blocks.some((b) => b.type === "arabic")
          ? "Teks Arab terdeteksi, format RTL diterapkan"
          : "Tidak ada teks Arab",
      },
      {
        label: "Branding Masjid",
        ok: Boolean(branding.namaMasjid),
        note: branding.namaMasjid ? branding.namaMasjid : "Header kosong (nama masjid belum diisi)",
      },
      { label: "Jumlah Blok Konten", ok: blocks.length > 0, note: `${blocks.length} blok terurai` },
    ];
    setPrintCheck({ allOk: checks.every((c) => c.ok), checks });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .doc-print-target, .doc-print-target * { visibility: visible !important; }
          .doc-print-target {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
          }
          @page {
            size: ${dims.w}mm ${dims.h}mm;
            margin: ${marginVals.top}mm ${marginVals.right}mm ${marginVals.bottom}mm ${marginVals.left}mm;
          }
        }
      `}</style>

      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-emerald-950 text-emerald-100 border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
            Document &amp; Print Engine
          </span>
          <span className="text-sm font-semibold text-white truncate max-w-md">
            {meta.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              previewMode === "desktop"
                ? "bg-amber-500 text-emerald-950 font-bold"
                : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setPreviewMode("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              previewMode === "tablet"
                ? "bg-amber-500 text-emerald-950 font-bold"
                : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" /> Tablet
          </button>
          <button
            onClick={() => setPreviewMode("print")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              previewMode === "print"
                ? "bg-amber-500 text-emerald-950 font-bold"
                : "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main engine body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 p-5 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Ukuran Kertas
            </label>
            <select
              value={settings.paperSize}
              onChange={(e) => updateSetting("paperSize", e.target.value as DocSettings["paperSize"])}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {Object.keys(PAPER_SIZES).map((s) => (
                <option key={s} value={s}>
                  {s} ({PAPER_SIZES[s].w} × {PAPER_SIZES[s].h} mm)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Orientasi
            </label>
            <select
              value={settings.orientation}
              onChange={(e) => updateSetting("orientation", e.target.value as DocSettings["orientation"])}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Margin
            </label>
            <select
              value={settings.margin}
              onChange={(e) => updateSetting("margin", e.target.value as DocSettings["margin"])}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {Object.keys(MARGIN_PRESETS).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Tema Warna
            </label>
            <select
              value={settings.colorTheme}
              onChange={(e) => updateSetting("colorTheme", e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {Object.keys(COLOR_THEME_PRESETS).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={handleDownloadWord}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              <FileOutput className="w-4 h-4" /> Download Word (.doc)
            </button>
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-300"
            >
              <Printer className="w-4 h-4" /> Cetak / PDF
            </button>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Tersalin!" : "Salin Teks"}
            </button>
            <button
              onClick={handleRunPrintCheck}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Print Check
            </button>
          </div>

          {printCheck && (
            <div
              className={`p-3 rounded-lg text-xs ${
                printCheck.allOk ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              <p className="font-bold mb-1.5 flex items-center gap-1.5">
                {printCheck.allOk ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                {printCheck.allOk ? "Print Check Lulus" : "Perlu Penyesuaian"}
              </p>
              <div className="space-y-1 text-[11px]">
                {printCheck.checks.map((c, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="font-semibold">{c.label}:</span> {c.note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Document Preview Canvas */}
        <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center items-start">
          <div
            className={`doc-print-target bg-white shadow-2xl transition-all duration-200 ${
              previewMode === "tablet" ? "max-w-xl" : previewMode === "print" ? "shadow-none" : "max-w-3xl"
            }`}
            style={{
              width: `${dims.w * 3.5}px`,
              minHeight: `${dims.h * 3.5}px`,
              padding: `${marginVals.top * 2.5}px ${marginVals.right * 2.5}px ${marginVals.bottom * 2.5}px ${marginVals.left * 2.5}px`,
            }}
          >
            {/* Header / Kop Surat */}
            {(branding.namaMasjid || branding.logo) && (
              <div
                className="flex items-center gap-4 pb-4 mb-6 border-b-2"
                style={{ borderColor: theme.accent }}
              >
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-14 h-14 object-contain rounded" />
                ) : (
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif font-bold text-xl rounded">
                    M
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold tracking-tight" style={{ color: theme.primary }}>
                    {branding.namaMasjid || "Masjid Digital"}
                  </h3>
                  {branding.alamat && <p className="text-xs text-slate-600 mt-0.5">{branding.alamat}</p>}
                  {branding.kontak && (
                    <p className="text-[11px] text-slate-500">
                      Telp/WA: {branding.kontak} {branding.website ? `| ${branding.website}` : ""}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Document Title */}
            <div className="text-center my-4">
              <h1 className="text-xl font-bold font-serif" style={{ color: theme.primary }}>
                {meta.title}
              </h1>
              {meta.subtitle && <p className="text-xs text-slate-600 mt-1">{meta.subtitle}</p>}
              <div
                className="w-16 h-0.5 mx-auto mt-3 mb-6"
                style={{ backgroundColor: theme.accent }}
              />
            </div>

            {/* Document Content Blocks */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-800">
              {blocks.map((b, i) => {
                if (b.type === "h1")
                  return (
                    <h2 key={i} className="text-base font-bold font-serif pt-3" style={{ color: theme.primary }}>
                      {b.text}
                    </h2>
                  );
                if (b.type === "h2")
                  return (
                    <h3
                      key={i}
                      className="text-sm font-bold font-serif pt-2 pb-1 border-b"
                      style={{ color: theme.primary, borderColor: theme.accent }}
                    >
                      {b.text}
                    </h3>
                  );
                if (b.type === "h3")
                  return (
                    <h4 key={i} className="text-xs font-bold pt-1" style={{ color: theme.primary }}>
                      {b.text}
                    </h4>
                  );
                if (b.type === "quote")
                  return (
                    <blockquote
                      key={i}
                      className="p-3 bg-amber-50/50 rounded-r-lg border-l-4 italic my-2 text-slate-700"
                      style={{ borderColor: theme.accent }}
                    >
                      {b.text}
                    </blockquote>
                  );
                if (b.type === "arabic")
                  return (
                    <p
                      key={i}
                      dir="rtl"
                      lang="ar"
                      className="text-lg text-center font-serif leading-loose my-3 px-4 font-normal"
                      style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
                    >
                      {b.text}
                    </p>
                  );
                if (b.type === "table" && b.rows) {
                  const [head, ...rows] = b.rows;
                  return (
                    <div key={i} className="overflow-x-auto my-3">
                      <table className="w-full text-[11px] border border-slate-200">
                        <thead>
                          <tr style={{ backgroundColor: theme.primary, color: "#fff" }}>
                            {(head || []).map((c, ci) => (
                              <th key={ci} className="px-2.5 py-1.5 text-left font-semibold border-r border-emerald-900/30">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, ri) => (
                            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                              {r.map((c, ci) => (
                                <td key={ci} className="px-2.5 py-1.5 border-t border-slate-200 text-slate-700">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-justify">
                    {b.text}
                  </p>
                );
              })}

              {/* Dalil Section */}
              {dalil && dalil.length > 0 && (
                <div className="mt-8 pt-4 border-t-2" style={{ borderColor: theme.accent }}>
                  <h3 className="text-sm font-bold font-serif mb-3" style={{ color: theme.primary }}>
                    Daftar Rujukan &amp; Dalil Terkait
                  </h3>
                  <div className="space-y-2">
                    {dalil.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 bg-amber-50/60 rounded-lg border text-[11px]"
                        style={{ borderColor: theme.accent }}
                      >
                        <div className="flex items-center justify-between gap-2 font-mono font-bold text-slate-900 mb-1">
                          <span>{d.reference || "Referensi Dalil"}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] ${
                              d.status === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                        <p className="italic text-slate-700">{d.text}</p>
                        {d.note && <p className="text-[10px] text-slate-500 mt-1">{d.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 flex justify-between items-center">
              <span>{branding.namaMasjid || "Masjid Digital"}</span>
              <span>{meta.title}</span>
              <span>Halaman 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
