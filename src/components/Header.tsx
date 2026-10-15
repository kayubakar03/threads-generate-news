import React from "react";
import { Sparkles, Bookmark, HelpCircle, Sun, Moon } from "lucide-react";
import { LanguageType, ThemeMode } from "../types";

interface HeaderProps {
  language: LanguageType;
  onLanguageChange: (lang: LanguageType) => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenHelpModal: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  savedCount,
  onOpenSavedModal,
  onOpenHelpModal,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === "dark";

  return (
    <header
      id="app-header"
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-200 ${
        isDark
          ? "bg-[#0A0A0C]/90 border-[#1E293B]"
          : "bg-white/95 border-slate-200 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-white font-bold text-lg italic">T</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Threadly<span className="text-blue-500">AI</span>
              </span>
              <span className={`text-xs hidden md:inline ${isDark ? "text-slate-600" : "text-slate-300"}`}>|</span>
              <span className={`text-xs font-medium hidden md:inline ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                News-to-Thread Engine
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {language === "id"
                ? "Salin link berita, langsung jadi Thread siap posting"
                : "Transform any news URL into viral ready-to-post social threads"}
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">


          {/* Active Gemini Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-semibold text-green-500 uppercase tracking-wider">
              Gemini Active
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${
              isDark
                ? "bg-[#111114] hover:bg-[#1E293B] border-[#1E293B] text-amber-400 hover:text-amber-300"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900"
            }`}
            title={
              isDark
                ? language === "id" ? "Beralih ke Tema Terang (High Contrast Light Mode)" : "Switch to High-Contrast Light Mode"
                : language === "id" ? "Beralih ke Tema Gelap (Dark Mode)" : "Switch to Dark Mode"
            }
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
                <span className="hidden lg:inline text-slate-300 text-[11px]">
                  {language === "id" ? "Terang" : "Light"}
                </span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-blue-600 animate-in fade-in zoom-in duration-200" />
                <span className="hidden lg:inline text-slate-700 text-[11px]">
                  {language === "id" ? "Gelap" : "Dark"}
                </span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <div className={`flex items-center rounded-lg p-0.5 text-xs border ${
            isDark ? "bg-[#111114] border-[#1E293B]" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              id="lang-btn-id"
              onClick={() => onLanguageChange("id")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                language === "id"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Bahasa Indonesia"
            >
              🇮🇩 ID
            </button>
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange("en")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                language === "en"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
              title="English"
            >
              🇺🇸 EN
            </button>
          </div>

          {/* Saved Library */}
          <button
            id="saved-library-btn"
            onClick={onOpenSavedModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
              isDark
                ? "bg-[#111114] hover:bg-[#1E293B] border-[#1E293B] text-slate-300 hover:text-white"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <span className="hidden sm:inline">
              {language === "id" ? "Tersimpan" : "Library"}
            </span>
            {savedCount > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full border ${
                isDark
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}>
                {savedCount}
              </span>
            )}
          </button>

          {/* Help / Guide */}
          <button
            id="help-guide-btn"
            onClick={onOpenHelpModal}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? "bg-[#111114] hover:bg-[#1E293B] border-[#1E293B] text-slate-400 hover:text-white"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            }`}
            title={language === "id" ? "Panduan & Tips Thread Viral" : "Guide & Viral Tips"}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};


