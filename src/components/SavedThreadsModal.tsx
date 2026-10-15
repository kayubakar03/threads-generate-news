import React, { useState } from "react";
import {
  Bookmark,
  Trash2,
  Copy,
  Check,
  Search,
  Layers,
  ArrowRight,
  AtSign,
  Twitter,
  Linkedin,
  Calendar,
  FileDown,
} from "lucide-react";
import { GeneratedThread, LanguageType, ThemeMode } from "../types";
import { showToast } from "./Toast";
import { exportThreadToPdf } from "../utils/pdfExport";

interface SavedThreadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedThreads: GeneratedThread[];
  onSelectThread: (thread: GeneratedThread) => void;
  onDeleteThread: (id: string) => void;
  onClearAll: () => void;
  language: LanguageType;
  theme?: ThemeMode;
}

export const SavedThreadsModal: React.FC<SavedThreadsModalProps> = ({
  isOpen,
  onClose,
  savedThreads,
  onSelectThread,
  onDeleteThread,
  onClearAll,
  language,
  theme = "dark",
}) => {
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedThreads.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.articleTitle.toLowerCase().includes(query) ||
      t.articleSummary.toLowerCase().includes(query) ||
      t.posts.some((p) => p.content.toLowerCase().includes(query))
    );
  });

  const handleCopyThread = (thread: GeneratedThread) => {
    const text = thread.posts.map((p) => p.content).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopiedId(thread.id);
    showToast(
      language === "id" ? "Thread berhasil disalin!" : "Thread copied!",
      "success"
    );
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === "twitter") return <Twitter className="h-3.5 w-3.5 text-sky-500" />;
    if (platform === "linkedin") return <Linkedin className="h-3.5 w-3.5 text-blue-500" />;
    return <AtSign className="h-3.5 w-3.5 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={`rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border transition-colors duration-200 ${
        isDark ? "bg-[#111114] border-[#1E293B]" : "bg-white border-slate-200"
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? "border-[#1E293B]" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <Bookmark className="h-5 w-5 text-blue-500" />
            <h2 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {language === "id" ? "Koleksi Thread Tersimpan" : "Saved Threads Library"}
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border font-mono ${
              isDark
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              {savedThreads.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`text-sm p-1.5 rounded-lg transition-colors ${
              isDark ? "text-slate-400 hover:text-white hover:bg-[#1E293B]" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-3.5 border-b flex items-center gap-2 ${
          isDark ? "border-[#1E293B] bg-[#0A0A0C]" : "border-slate-200 bg-slate-50"
        }`}>
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === "id"
                  ? "Cari thread berdasarkan judul atau isi..."
                  : "Search threads by title or content..."
              }
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 border ${
                isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-200 placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
          {savedThreads.length > 0 && (
            <button
              onClick={onClearAll}
              className={`text-xs px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
                isDark
                  ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              }`}
            >
              {language === "id" ? "Hapus Semua" : "Clear All"}
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Layers className={`h-8 w-8 mx-auto ${isDark ? "text-slate-600" : "text-slate-400"}`} />
              <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {savedThreads.length === 0
                  ? language === "id"
                    ? "Belum ada thread yang disimpan."
                    : "No saved threads yet."
                  : language === "id"
                  ? "Tidak ada thread yang cocok dengan pencarian."
                  : "No threads match your search."}
              </p>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {language === "id"
                  ? "Klik tombol 'Simpan' pada hasil thread untuk menyimpannya di sini."
                  : "Click 'Save' on generated threads to collect them here."}
              </p>
            </div>
          ) : (
            filtered.map((thread) => (
              <div
                key={thread.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  isDark
                    ? "bg-[#0A0A0C] border-[#1E293B] hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        isDark
                          ? "text-slate-300 bg-[#111114] border-[#1E293B]"
                          : "text-slate-700 bg-white border-slate-200"
                      }`}>
                        {getPlatformIcon(thread.platform)}
                        <span className="capitalize">{thread.platform}</span>
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        <Calendar className="h-3 w-3" />
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        {thread.posts.length} Posts
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold line-clamp-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                      {thread.articleTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyThread(thread)}
                      className={`p-1.5 rounded-lg transition-colors border ${
                        isDark
                          ? "bg-[#111114] hover:bg-[#1E293B] text-slate-300 border-[#1E293B]"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                      title={language === "id" ? "Salin semua" : "Copy all"}
                    >
                      {copiedId === thread.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        exportThreadToPdf(thread);
                        showToast(
                          language === "id"
                            ? "Dokumen PDF berhasil diunduh!"
                            : "PDF document downloaded!",
                          "success"
                        );
                      }}
                      className={`p-1.5 rounded-lg transition-colors border ${
                        isDark
                          ? "bg-[#111114] hover:bg-[#1E293B] text-rose-400 hover:text-rose-300 border-[#1E293B]"
                          : "bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-slate-200"
                      }`}
                      title={language === "id" ? "Unduh PDF Dokumen" : "Download PDF"}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteThread(thread.id)}
                      className={`p-1.5 rounded-lg transition-colors border ${
                        isDark
                          ? "bg-[#111114] hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border-[#1E293B]"
                          : "bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200"
                      }`}
                      title={language === "id" ? "Hapus" : "Delete"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {thread.posts[0]?.content}
                </p>

                <div className={`pt-2.5 border-t flex items-center justify-between ${
                  isDark ? "border-[#1E293B]" : "border-slate-200"
                }`}>
                  <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Hook Score: {thread.hookAnalysis.score}/100
                  </span>
                  <button
                    onClick={() => {
                      onSelectThread(thread);
                      onClose();
                    }}
                    className={`text-xs font-semibold flex items-center gap-1 ${
                      isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    <span>{language === "id" ? "Buka di Editor" : "Open in Editor"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
