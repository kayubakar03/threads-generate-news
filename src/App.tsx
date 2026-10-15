import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { InputPanel } from "./components/InputPanel";
import { ThreadEditor } from "./components/ThreadEditor";
import { HookAnalyticsCard } from "./components/HookAnalyticsCard";
import { EngagementPredictor } from "./components/EngagementPredictor";
import { SavedThreadsModal } from "./components/SavedThreadsModal";
import { HelpModal } from "./components/HelpModal";
import { ToastContainer, showToast } from "./components/Toast";
import {
  GeneratedThread,
  GenerateThreadRequest,
  TrendingNewsItem,
  LanguageType,
  ThemeMode,
} from "./types";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "threads_ai_news_saved";
const THEME_STORAGE_KEY = "threads_theme_mode";

export default function App() {
  const [language, setLanguage] = useState<LanguageType>("id");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
    } catch {
      return "dark";
    }
  });
  const [currentThread, setCurrentThread] = useState<GeneratedThread | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [trendingNews, setTrendingNews] = useState<TrendingNewsItem[]>([]);
  const [savedThreads, setSavedThreads] = useState<GeneratedThread[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const isDark = theme === "dark";

  // Toggle Theme helper
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.warn("Could not save theme preference", e);
    }
    showToast(
      language === "id"
        ? `Tema diubah ke mode ${nextTheme === "dark" ? "Gelap (Dark)" : "Terang (Light)"}`
        : `Switched to ${nextTheme} mode`,
      "info"
    );
  };

  // Load saved threads from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedThreads(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  }, []);

  // Fetch trending AI news on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending-ai-news");
        const data = await res.json();
        if (data.success && data.news) {
          setTrendingNews(data.news);
        }
      } catch (err) {
        console.warn("Failed to fetch trending news", err);
      }
    };
    fetchTrending();
  }, []);

  // Save to localStorage helper
  const handleSaveThread = (threadToSave: GeneratedThread) => {
    try {
      const existingIndex = savedThreads.findIndex((t) => t.id === threadToSave.id);
      let updated: GeneratedThread[];
      if (existingIndex >= 0) {
        updated = [...savedThreads];
        updated[existingIndex] = threadToSave;
      } else {
        updated = [threadToSave, ...savedThreads];
      }
      setSavedThreads(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      showToast(
        language === "id"
          ? "Thread berhasil disimpan ke koleksi Anda!"
          : "Thread saved to your library!",
        "success"
      );
    } catch {
      showToast("Gagal menyimpan ke penyimpanan lokal.", "error");
    }
  };

  const handleDeleteSavedThread = (id: string) => {
    const updated = savedThreads.filter((t) => t.id !== id);
    setSavedThreads(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showToast(
      language === "id" ? "Thread dihapus dari koleksi." : "Thread removed from saved.",
      "info"
    );
  };

  const handleClearAllSaved = () => {
    if (
      window.confirm(
        language === "id"
          ? "Hapus semua koleksi thread tersimpan?"
          : "Clear all saved threads?"
      )
    ) {
      setSavedThreads([]);
      localStorage.removeItem(STORAGE_KEY);
      showToast(
        language === "id" ? "Semua koleksi telah dibersihkan." : "Library cleared.",
        "info"
      );
    }
  };

  // Main Generate Function
  const handleGenerateThread = async (params: GenerateThreadRequest) => {
    setIsLoading(true);
    setLoadingStep(
      language === "id" ? "1/4 Mengambil & mengekstrak artikel..." : "1/4 Fetching article..."
    );

    try {
      let articleText = params.rawText || "";
      let title = params.articleTitle || "";

      // Step 1: If URL is provided and no raw text, extract article
      if (params.url && !articleText) {
        try {
          const extractRes = await fetch("/api/extract-article", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: params.url }),
          });
          const extractData = await extractRes.json();
          if (extractData.success) {
            articleText = extractData.content;
            if (!title && extractData.title) {
              title = extractData.title;
            }
          }
        } catch (extractErr) {
          console.warn("Extraction warning:", extractErr);
        }
      }

      setLoadingStep(
        language === "id"
          ? "2/4 Merancang Hook viral & alur cerita..."
          : "2/4 Designing viral hooks..."
      );

      // Step 2: Call Generate Thread API with Gemini
      setTimeout(() => {
        setLoadingStep(
          language === "id"
            ? "3/4 Menulis postingan siap pakai..."
            : "3/4 Drafting optimized posts..."
        );
      }, 900);

      const generateRes = await fetch("/api/generate-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          rawText: articleText || params.rawText,
          articleTitle: title || params.articleTitle,
        }),
      });

      const data = await generateRes.json();
      if (data.success && data.thread) {
        setCurrentThread(data.thread);
        showToast(
          language === "id"
            ? "✨ Thread berhasil diracik dan siap diposting!"
            : "✨ Thread generated & ready to post!",
          "success"
        );

        // Smooth scroll to thread editor workbench
        setTimeout(() => {
          document.getElementById("thread-editor-workbench")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        throw new Error(data.error || "Gagal membuat thread.");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Terjadi kesalahan saat memproses.", "error");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div
      className={`min-h-screen font-sans selection:bg-blue-600 selection:text-white pb-16 transition-colors duration-200 ${
        isDark
          ? "theme-dark bg-[#0A0A0C] text-[#E2E8F0]"
          : "theme-light bg-slate-100 text-slate-900"
      }`}
    >
      {/* Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        savedCount={savedThreads.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Hero Section Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-1 shadow-sm border ${
            isDark
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            <Sparkles className={`h-3.5 w-3.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <span>
              {language === "id"
                ? "AI News-to-Thread Generator • 3D Holographic Visualizer"
                : "Instant News to Viral Social Threads • 3D Spatial Visualizer"}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
            isDark ? "text-white" : "text-slate-950"
          }`}>
            {language === "id" ? (
              <>
                Salin Link Berita,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400">
                  Langsung Jadi Thread
                </span>{" "}
                Siap Posting
              </>
            ) : (
              <>
                Paste Any News Link,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400">
                  Instantly Craft Viral Threads
                </span>
              </>
            )}
          </h1>

          <p className={`text-xs sm:text-sm leading-relaxed max-w-xl mx-auto ${
            isDark ? "text-slate-400" : "text-slate-600 font-medium"
          }`}>
            {language === "id"
              ? "Ubah artikel berita rumit menjadi thread Meta Threads, X (Twitter), dan LinkedIn yang padat, menarik, dan berdaya pikat tinggi dengan pratinjau 3D Glassmorphic Social Card."
              : "Transform complex tech and AI news into high-retention, engaging social threads with verified structure, curiosity hooks, and interactive 3D Glassmorphic Social Card preview."}
          </p>
        </div>

        {/* Input & Configuration Section */}
        <InputPanel
          language={language}
          isLoading={isLoading}
          loadingStep={loadingStep}
          onGenerate={handleGenerateThread}
          trendingNews={trendingNews}
          theme={theme}
          onSelectTrendingNews={(item) => {
            showToast(
              language === "id"
                ? `Berita '${item.title.slice(0, 30)}...' terpilih! Klik Generate untuk membuat thread.`
                : `Selected '${item.title.slice(0, 30)}...'! Click Generate to draft.`,
              "info"
            );
          }}
        />

        {/* Thread Output & Workbench */}
        {currentThread && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* AI Virality & Engagement Predictor with Dynamic Gauge Chart */}
            <EngagementPredictor
              thread={currentThread}
              language={language}
              theme={theme}
              onUpdateThreadPrediction={(prediction) => {
                setCurrentThread((prev) =>
                  prev ? { ...prev, engagementPrediction: prediction } : prev
                );
              }}
            />

            {/* Hook & Virality Analytics */}
            <HookAnalyticsCard
              analysis={currentThread.hookAnalysis}
              hashtags={currentThread.suggestedHashtags}
              language={language}
              theme={theme}
            />

            {/* Interactive Editor & Preview */}
            <ThreadEditor
              thread={currentThread}
              language={language}
              theme={theme}
              onUpdateThread={setCurrentThread}
              onSaveThread={handleSaveThread}
              onRegenerate={() => {
                handleGenerateThread({
                  url: currentThread.originalUrl,
                  rawText: currentThread.articleSummary,
                  articleTitle: currentThread.articleTitle,
                  platform: currentThread.platform,
                  tone: currentThread.tone,
                  language: currentThread.language,
                  length: "medium",
                  includeEmojis: true,
                  includeHashtags: true,
                  includeImagePrompts: true,
                  includeSourceLink: true,
                });
              }}
            />
          </div>
        )}

        {/* Footer */}
        <footer className={`pt-8 border-t text-center text-xs space-y-2 ${
          isDark ? "border-[#1E293B] text-slate-500" : "border-slate-300 text-slate-600"
        }`}>
          <p>
            {language === "id"
              ? "Ditenagai oleh Google Gemini 3.7 Flash AI • Dirancang khusus untuk Kreator Konten, Tech Enthusiast, & Media Creator"
              : "Powered by Google Gemini 3.7 Flash AI • Built for Social Media Creators & Tech Writers"}
          </p>
          <div className={`flex items-center justify-center gap-4 ${
            isDark ? "text-slate-400" : "text-slate-700 font-semibold"
          }`}>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="hover:text-blue-600 transition-colors"
            >
              {language === "id" ? "Panduan Hook Viral" : "Viral Hook Guide"}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className="hover:text-blue-600 transition-colors"
            >
              {language === "id" ? "Koleksi Tersimpan" : "Saved Library"}
            </button>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <SavedThreadsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedThreads={savedThreads}
        onSelectThread={(t) => {
          setCurrentThread(t);
          showToast(
            language === "id" ? "Thread dimuat ke editor!" : "Thread loaded into editor!",
            "info"
          );
        }}
        onDeleteThread={handleDeleteSavedThread}
        onClearAll={handleClearAllSaved}
        language={language}
        theme={theme}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        language={language}
        theme={theme}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
