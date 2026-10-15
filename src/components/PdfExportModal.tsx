import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  X,
  Sparkles,
  Sliders,
  Settings2,
  Eye,
  Check,
} from "lucide-react";
import { GeneratedThread, LanguageType, ThemeMode } from "../types";
import { exportThreadToPdf, PdfExportOptions } from "../utils/pdfExport";

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: GeneratedThread;
  language?: LanguageType;
  theme?: ThemeMode;
  onNotify?: (message: string, type?: "success" | "error" | "info") => void;
}

export function PdfExportModal({
  isOpen,
  onClose,
  thread,
  language = "id",
  theme = "dark",
  onNotify,
}: PdfExportModalProps) {
  const isDark = theme === "dark";

  const [includeAnalytics, setIncludeAnalytics] = useState<boolean>(true);
  const [includeImagePrompts, setIncludeImagePrompts] = useState<boolean>(true);
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [paperSize, setPaperSize] = useState<"a4" | "letter">("a4");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadDone, setDownloadDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      const options: PdfExportOptions = {
        includeAnalytics,
        includeImagePrompts,
        includeHashtags,
        includeMetadata,
        paperSize,
      };

      exportThreadToPdf(thread, options);
      setDownloadDone(true);

      if (onNotify) {
        onNotify(
          language === "id"
            ? "Dokumen PDF berhasil dibuat dan diunduh!"
            : "PDF document successfully generated and downloaded!",
          "success"
        );
      }

      setTimeout(() => {
        setDownloadDone(false);
        setIsExporting(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("PDF export error:", err);
      setIsExporting(false);
      if (onNotify) {
        onNotify(
          language === "id"
            ? "Gagal mengekspor PDF: " + (err.message || "Kesalahan tidak diketahui")
            : "Failed to export PDF: " + (err.message || "Unknown error"),
          "error"
        );
      }
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const estimatedPages = Math.max(1, Math.ceil(thread.posts.length / 3));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? "bg-[#0F172A] border-[#1E293B] text-slate-100 shadow-blue-950/40"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/60"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-[#1E293B] bg-[#0B1120]" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-md shadow-rose-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>
                  {language === "id" ? "Ekspor PDF Dokumen" : "Export Thread as PDF"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                  .PDF
                </span>
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} line-clamp-1`}>
                {thread.articleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Document Summary Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              isDark
                ? "bg-[#111A2E] border-[#23314B]"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-400">
                {language === "id" ? "Detail Dokumen Cetak" : "Document Overview"}
              </div>
              <div className="text-sm font-bold truncate max-w-[280px]">
                {thread.articleTitle}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                <span>📝 {thread.posts.length} {language === "id" ? "Postingan" : "Posts"}</span>
                <span>📄 ~{estimatedPages} {language === "id" ? "Halaman" : "Pages"}</span>
                <span className="capitalize">🌐 {thread.platform}</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Vector PDF
              </div>
            </div>
          </div>

          {/* Export Customization Options */}
          <div className="space-y-3">
            <label
              className={`block text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5 text-blue-400" />
              <span>{language === "id" ? "Opsi Konten PDF" : "PDF Content Customization"}</span>
            </label>

            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isDark ? "bg-[#0C1322] border-[#1C263B]" : "bg-white border-slate-200"
              }`}
            >
              {/* Option 1: Virality & Analytics summary */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-medium">
                    {language === "id"
                      ? "Sertakan Analitik & Skor Viralitas AI"
                      : "Include AI Virality & Forecast Scores"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === "id"
                      ? "Menampilkan ringkasan forecast likes, reposts, dan komentar"
                      : "Includes virality index, metrics range, and peak posting window"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeAnalytics}
                  onChange={(e) => setIncludeAnalytics(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer ml-3"
                />
              </label>

              {/* Option 2: Image Prompts */}
              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-700/20">
                <div>
                  <div className="text-xs font-medium">
                    {language === "id"
                      ? "Sertakan Prompt Visual Gambar"
                      : "Include Visual Image Prompts"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === "id"
                      ? "Prompt AI gambar untuk setiap slide atau postingan"
                      : "Suggested AI prompts for Midjourney or image generators"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeImagePrompts}
                  onChange={(e) => setIncludeImagePrompts(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer ml-3"
                />
              </label>

              {/* Option 3: Hashtags */}
              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-700/20">
                <div>
                  <div className="text-xs font-medium">
                    {language === "id"
                      ? "Sertakan Rekomendasi Hashtags"
                      : "Include Recommended Hashtags"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === "id"
                      ? "Tag tren media sosial di bawah setiap konten"
                      : "Viral tag recommendations printed below each post"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeHashtags}
                  onChange={(e) => setIncludeHashtags(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer ml-3"
                />
              </label>

              {/* Option 4: Metadata & Source Link */}
              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-700/20">
                <div>
                  <div className="text-xs font-medium">
                    {language === "id"
                      ? "Sertakan Metadata & Tautan Sumber"
                      : "Include Metadata & Article Source"}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === "id"
                      ? "URL artikel asli, tanggal pembuatan, dan persona gaya"
                      : "Original source URL, generation date, and tone badge"}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer ml-3"
                />
              </label>
            </div>
          </div>

          {/* Paper Size Selector */}
          <div>
            <label
              className={`block text-xs font-semibold mb-2 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {language === "id" ? "Ukuran Kertas Dokumen" : "Paper Format"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaperSize("a4")}
                className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                  paperSize === "a4"
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                    : isDark
                    ? "bg-[#111A2E] border-[#23314B] text-slate-400 hover:text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div>A4 International</div>
                <div className="text-[10px] opacity-80 font-normal mt-0.5">210 × 297 mm</div>
              </button>

              <button
                type="button"
                onClick={() => setPaperSize("letter")}
                className={`p-3 rounded-xl border text-center transition-all text-xs font-semibold ${
                  paperSize === "letter"
                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                    : isDark
                    ? "bg-[#111A2E] border-[#23314B] text-slate-400 hover:text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div>US Letter</div>
                <div className="text-[10px] opacity-80 font-normal mt-0.5">8.5 × 11 in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t gap-3 ${
            isDark ? "border-[#1E293B] bg-[#0B1120]" : "border-slate-100 bg-slate-50"
          }`}
        >
          {/* Quick print button */}
          <button
            type="button"
            onClick={handlePrintDocument}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? "bg-[#162033] hover:bg-[#1E2D48] text-slate-300 border-[#253655]"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title={language === "id" ? "Cetak langsung dengan printer" : "Print via browser dialog"}
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">
              {language === "id" ? "Cetak Langsung" : "Print Document"}
            </span>
            <span className="sm:hidden">Print</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {language === "id" ? "Batal" : "Cancel"}
            </button>

            <button
              id="confirm-pdf-export-btn"
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                downloadDone
                  ? "bg-emerald-600 shadow-emerald-500/30 scale-95"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-[0.98]"
              }`}
            >
              {downloadDone ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>{language === "id" ? "Terunduh!" : "Downloaded!"}</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>
                    {isExporting
                      ? language === "id"
                        ? "Membuat PDF..."
                        : "Generating PDF..."
                      : language === "id"
                      ? "Unduh PDF (.pdf)"
                      : "Download PDF (.pdf)"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
