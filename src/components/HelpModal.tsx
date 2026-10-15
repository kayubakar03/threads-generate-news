import React from "react";
import { Sparkles, Flame, Zap, Target } from "lucide-react";
import { LanguageType, ThemeMode } from "../types";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageType;
  theme?: ThemeMode;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  language,
  theme = "dark",
}) => {
  const isDark = theme === "dark";
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={`rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border transition-colors duration-200 ${
        isDark ? "bg-[#111114] border-[#1E293B]" : "bg-white border-slate-200"
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? "border-[#1E293B]" : "border-slate-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {language === "id" ? "Panduan & Formula Thread Viral" : "Viral Thread Playbook"}
            </h2>
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

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm leading-relaxed ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}>
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"
          }`}>
            <h3 className={`font-bold flex items-center gap-1.5 text-sm ${
              isDark ? "text-blue-300" : "text-blue-800"
            }`}>
              <Zap className="h-4 w-4 text-blue-500" />
              {language === "id" ? "Alur Kerja Otomatis 3 Detik:" : "3-Second Automated Flow:"}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {language === "id"
                ? "1. Salin link artikel berita (Kompas, Detik, TechCrunch, Blog AI, dsb) atau pilih Trending News.\n2. Gemini AI membaca isi artikel, mengekstrak data penting & merancang hook viral.\n3. Salin thread per post atau langsung posting ke Meta Threads / X."
                : "1. Paste any news link or click a trending AI topic.\n2. Gemini reads the article, extracts critical insights & crafts viral hooks.\n3. 1-click copy or post directly to Meta Threads or X."}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className={`font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              <Target className="h-4 w-4 text-amber-500" />
              {language === "id" ? "Anatomi Thread yang Berhasil:" : "Anatomy of High-Retention Threads:"}
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
              }`}>
                <span className={`font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>1. Post #1 (The Hook):</span>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {language === "id"
                    ? "Menahan scroll pembaca dalam 1.5 detik pertama. Menggunakan curiosity gap, angka mencengangkan, atau pernyataan berani."
                    : "Stops the scroll in 1.5s. Uses curiosity gaps, shocking stats, or bold thesis."}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
              }`}>
                <span className={`font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>2. Post #2 - #N-1 (The Meat / Story):</span>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {language === "id"
                    ? "Memecah berita panjang menjadi poin-poin renyah. Satu ide per post, line-break bersih, dan ritme bacaan yang cepat."
                    : "Breaks complex facts into digestible chunks. One idea per tweet, crisp line breaks, fast pacing."}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
              }`}>
                <span className={`font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>3. Post Terakhir (CTA & Engagement):</span>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {language === "id"
                    ? "Mengajukan 1 pertanyaan tajam untuk memicu perdebatan di kolom komentar, mendorong bookmark/repost, dan link sumber."
                    : "Asks an engaging question to ignite comment section debates, bookmarks, and shares."}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${
            isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
          }`}>
            <h4 className={`font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              <Flame className="h-4 w-4 text-rose-500" />
              {language === "id" ? "Tips Tambahan Algoritma Threads & X:" : "Algorithm Hacks:"}
            </h4>
            <ul className={`list-disc list-inside space-y-1 text-xs ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              <li>
                {language === "id"
                  ? "Sertakan gambar/visual pada post pertama (gunakan AI Visual Prompt yang disediakan)."
                  : "Include visuals on post #1 using our generated AI prompts."}
              </li>
              <li>
                {language === "id"
                  ? "Balas 3-5 komentar pertama dalam 30 menit setelah posting untuk memicu lonjakan distribusi."
                  : "Reply to first 3-5 comments within 30 minutes to boost algorithmic reach."}
              </li>
              <li>
                {language === "id"
                  ? "Gunakan fitur 'AI Polish' di editor untuk memotong kata yang bertele-tele."
                  : "Use the 'AI Polish' tool on any post to trim fluff."}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isDark ? "border-[#1E293B]" : "border-slate-200"
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/20"
          >
            {language === "id" ? "Saya Mengerti, Mulai Buat Thread!" : "Got it, let's create!"}
          </button>
        </div>
      </div>
    </div>
  );
};
