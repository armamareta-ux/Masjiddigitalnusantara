import React, { useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  Printer,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { HistoryRecord, DalilItem } from "../types";

export interface RiwayatViewProps {
  records: HistoryRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onOpenDocEngine: (content: string, title: string, dalil?: DalilItem[]) => void;
}

export function RiwayatView({
  records,
  onDeleteRecord,
  onClearAll,
  onOpenDocEngine,
}: RiwayatViewProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");
  const [activeRecord, setActiveRecord] = useState<HistoryRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const types = ["Semua", ...Array.from(new Set(records.map((r) => r.type)))];

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "Semua" || r.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#E6E8E6]">
          Riwayat &amp; Arsip Dokumen Dakwah
        </h1>
        <p className="text-sm text-[#A3ABA3]">
          Seluruh naskah khutbah, proposal, surat dinas, poster, dan materi dakwah yang pernah dibuat tersimpan aman secara lokal.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#C19D60] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul atau isi naskah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl text-[#E6E8E6] placeholder-[#A3ABA3]/60 focus:outline-none focus:border-[#C19D60]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#C19D60]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl px-2.5 py-1.5 font-medium text-[#E6E8E6] focus:outline-none focus:border-[#C19D60]"
            >
              {types.map((t) => (
                <option key={t} value={t} className="bg-[#0D110D]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {records.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Hapus seluruh riwayat tersimpan?")) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Bersihkan Riwayat
            </button>
          )}
        </div>
      </div>

      {/* Grid of records and detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-4 shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#A3ABA3] py-12 text-center">
              Tidak ada arsip dokumen yang sesuai pencarian.
            </p>
          ) : (
            filtered.map((rec) => {
              const isSelected = activeRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setActiveRecord(rec)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#C19D60]/15 border-[#C19D60] shadow-sm"
                      : "bg-[#0A0D0A] border-[#C19D60]/10 hover:border-[#C19D60]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] text-[#A3ABA3]">
                      {new Date(rec.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] font-bold text-[#C19D60] bg-[#C19D60]/15 px-2 py-0.5 rounded-full border border-[#C19D60]/30">
                      {rec.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#E6E8E6] font-serif line-clamp-1">{rec.title}</h4>
                  <p className="text-[11px] text-[#A3ABA3] line-clamp-2 mt-0.5">{rec.content}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 bg-[#0D110D] rounded-2xl border border-[#C19D60]/20 p-5 shadow-sm space-y-4">
          {activeRecord ? (
            <>
              <div className="flex items-start justify-between border-b border-[#C19D60]/15 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C19D60] uppercase bg-[#C19D60]/15 border border-[#C19D60]/30 px-2 py-0.5 rounded-full">
                    {activeRecord.type}
                  </span>
                  <h3 className="text-lg font-bold font-serif text-[#E6E8E6] mt-1">
                    {activeRecord.title}
                  </h3>
                  <p className="text-[11px] text-[#A3ABA3] font-mono">
                    Dibuat pada: {new Date(activeRecord.date).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeRecord.content)}
                    className="p-2 bg-[#0A0D0A] text-[#E6E8E6] hover:bg-[#C19D60]/20 border border-[#C19D60]/20 rounded-xl text-xs font-semibold"
                    title="Salin Isi"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onOpenDocEngine(activeRecord.content, activeRecord.title, activeRecord.dalil)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#C19D60] text-[#0A0D0A] rounded-xl text-xs font-bold hover:bg-[#d4b074] shadow-sm transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak / Word
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Hapus arsip ini?")) {
                        onDeleteRecord(activeRecord.id);
                        setActiveRecord(null);
                      }
                    }}
                    className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dalil List if present */}
              {activeRecord.dalil && activeRecord.dalil.length > 0 && (
                <div className="p-3 bg-[#0A0D0A] rounded-xl border border-[#C19D60]/20 space-y-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#C19D60] uppercase">
                    Kutipan Dalil ({activeRecord.dalil.length}):
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {activeRecord.dalil.map((d, i) => (
                      <div key={i} className="text-xs text-[#E6E8E6]">
                        <span className="font-bold text-[#C19D60]">{d.reference}</span>:{" "}
                        <span className="italic text-[#A3ABA3]">{d.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Preview */}
              <div className="p-4 bg-[#0A0D0A] border border-[#C19D60]/20 rounded-xl max-h-96 overflow-y-auto text-xs leading-relaxed text-[#E6E8E6] font-serif whitespace-pre-wrap">
                {activeRecord.content}
              </div>
            </>
          ) : (
            <div className="p-20 text-center text-[#A3ABA3] space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-[#C19D60]/40" />
              <p className="text-xs font-medium">Pilih salah satu dokumen di sebelah kiri untuk melihat isi naskah dan mengekspor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
