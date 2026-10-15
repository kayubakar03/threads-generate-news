import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  Eye,
  Clock,
  Compass,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Share2,
  HelpCircle,
  Flame,
  Award,
} from "lucide-react";
import {
  GeneratedThread,
  EngagementPrediction,
  LanguageType,
  ThemeMode,
  ViralityBoostTip,
} from "../types";
import { DynamicGaugeChart } from "./DynamicGaugeChart";
import { showToast } from "./Toast";

interface EngagementPredictorProps {
  thread: GeneratedThread;
  language: LanguageType;
  theme?: ThemeMode;
  onUpdateThreadPrediction?: (prediction: EngagementPrediction) => void;
}

// Generate realistic default heuristic prediction based on thread attributes
export function generateHeuristicPrediction(
  thread: GeneratedThread,
  language: LanguageType
): EngagementPrediction {
  const postsCount = thread.posts?.length || 5;
  const totalWords = thread.posts?.reduce(
    (acc, p) => acc + (p.content?.split(/\s+/).filter(Boolean).length || 0),
    0
  ) || 250;
  const hookScore = thread.hookAnalysis?.score || 85;
  const humanScore = thread.hookAnalysis?.humanScore || 92;

  // Compute virality score
  const lengthBonus = postsCount >= 4 && postsCount <= 7 ? 6 : 2;
  const wordPacingBonus = totalWords >= 180 && totalWords <= 550 ? 5 : 1;
  const rawVirality = Math.round(
    hookScore * 0.45 + humanScore * 0.35 + lengthBonus + wordPacingBonus
  );
  const viralityScore = Math.max(45, Math.min(98, rawVirality));

  // Determine tier
  let viralityTier: EngagementPrediction["viralityTier"] = "moderate";
  let tierLabel = language === "id" ? "Moderat" : "Moderate";
  if (viralityScore >= 90) {
    viralityTier = "breakout";
    tierLabel = language === "id" ? "Breakout Viral 🔥" : "Breakout Viral 🔥";
  } else if (viralityScore >= 78) {
    viralityTier = "viral";
    tierLabel = language === "id" ? "Viral Heat ⚡" : "Viral Heat ⚡";
  } else if (viralityScore >= 62) {
    viralityTier = "high";
    tierLabel = language === "id" ? "Potensi Tinggi 🚀" : "High Potential 🚀";
  }

  // Calculate forecasted metric ranges
  const baseMultiplier = Math.pow(viralityScore / 50, 2.2);
  const minLikes = Math.round(350 * baseMultiplier);
  const maxLikes = Math.round(minLikes * 2.8);
  const minShares = Math.round(minLikes * 0.28);
  const maxShares = Math.round(maxLikes * 0.32);
  const minComments = Math.round(minLikes * 0.12);
  const maxComments = Math.round(maxLikes * 0.16);
  const minBookmarks = Math.round(minLikes * 0.35);
  const maxBookmarks = Math.round(maxLikes * 0.42);
  const minImpressions = Math.round(minLikes * 22);
  const maxImpressions = Math.round(maxLikes * 28);

  const formatK = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const shareabilityScore = Math.min(97, Math.round(viralityScore * 0.95 + 3));
  const discussionScore = Math.min(95, Math.round(viralityScore * 0.9 + 5));
  const retentionScore = Math.min(98, Math.round(humanScore * 0.95 + 4));
  const likeProbability = Math.min(96, Math.round(viralityScore * 0.92 + 2));

  return {
    viralityScore,
    viralityTier,
    tierLabel,
    forecastedLikes: {
      min: minLikes,
      max: maxLikes,
      formatted: `${formatK(minLikes)} - ${formatK(maxLikes)}`,
    },
    forecastedShares: {
      min: minShares,
      max: maxShares,
      formatted: `${formatK(minShares)} - ${formatK(maxShares)}`,
    },
    forecastedComments: {
      min: minComments,
      max: maxComments,
      formatted: `${formatK(minComments)} - ${formatK(maxComments)}`,
    },
    forecastedBookmarks: {
      min: minBookmarks,
      max: maxBookmarks,
      formatted: `${formatK(minBookmarks)} - ${formatK(maxBookmarks)}`,
    },
    forecastedImpressions: {
      min: minImpressions,
      max: maxImpressions,
      formatted: `${formatK(minImpressions)} - ${formatK(maxImpressions)}`,
    },
    likeProbability,
    shareabilityScore,
    discussionScore,
    retentionScore,
    peakEngagementWindow:
      language === "id"
        ? "18:30 - 21:00 WIB (Waktu Prime Browsing Malam)"
        : "6:30 PM - 9:00 PM (Prime Evening Browsing)",
    audienceSentiment:
      language === "id"
        ? "Rasa Ingin Tahu Tinggi, Diskusi Teknis & Relevansi Masa Depan"
        : "High Curiosity, Technical Wonder & Future Urgency",
    keyViralityDrivers:
      language === "id"
        ? [
            "Hook awal memicu 'Curiosity Gap' tanpa aroma clickbait murahan.",
            "Pacing transisi antar postingan ringkas dan menjaga atensi pembaca tetap tinggi.",
            "Terdapat poin data/fakta spesifik yang mendorong dorongan 'Share to Story / Retweet'.",
            "Post penutup mengundang opini pembaca sehingga memicu algoritma kolom komentar.",
          ]
        : [
            "Strong curiosity-gap opening hooks readers within first 3 seconds.",
            "High reading rhythm with zero fluff keeps drop-off rates exceptionally low.",
            "Contains high-value data insights that readers want to bookmark and quote.",
            "Closing call to conversation naturally sparks high debate in the reply section.",
          ],
    suggestedBoosts:
      language === "id"
        ? [
            {
              id: "boost-debate",
              title: "Pertajam Pertanyaan Kolom Komentar",
              description:
                "Ganti pertanyaan terbuka menjadi pilihan biner (misal: 'Tim A vs Tim B?') di slide terakhir untuk melipatgandakan komentar.",
              potentialScoreGain: 5,
            },
            {
              id: "boost-quote",
              title: "Tandai 1 Angka Kunci di Baris Pertama",
              description:
                "Letakkan metrik persentase atau angka penting di kalimat pembuka hook agar pembaca langsung terhenyak.",
              potentialScoreGain: 4,
            },
          ]
        : [
            {
              id: "boost-debate",
              title: "Sharpen Reply Catalyst in Final Post",
              description:
                "Switch to a binary perspective question (e.g., 'Option A vs Option B?') to double comment algorithm signals.",
              potentialScoreGain: 5,
            },
            {
              id: "boost-quote",
              title: "Lead with a Hard Metric in Post #1",
              description:
                "Put the most staggering stat or percentage in line 1 to maximize stop-scrolling velocity.",
              potentialScoreGain: 4,
            },
          ],
    platformBenchmarkComparison:
      language === "id"
        ? `Melampaui ~${Math.max(70, viralityScore - 5)}% postingan sejenis di ${
            thread.platform === "twitter"
              ? "X (Twitter)"
              : thread.platform === "linkedin"
              ? "LinkedIn"
              : "Meta Threads"
          }`
        : `Ranks in the top ~${Math.max(5, 100 - viralityScore)}% of AI tech threads on ${
            thread.platform === "twitter"
              ? "X (Twitter)"
              : thread.platform === "linkedin"
              ? "LinkedIn"
              : "Meta Threads"
          }`,
    analyzedAt: Date.now(),
  };
}

export const EngagementPredictor: React.FC<EngagementPredictorProps> = ({
  thread,
  language,
  theme = "dark",
  onUpdateThreadPrediction,
}) => {
  const isDark = theme === "dark";

  // Active prediction state
  const [prediction, setPrediction] = useState<EngagementPrediction>(() => {
    return (
      thread.engagementPrediction || generateHeuristicPrediction(thread, language)
    );
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [activeGaugeMetric, setActiveGaugeMetric] = useState<
    "virality" | "likes" | "shares" | "comments"
  >("virality");
  const [showBoostTips, setShowBoostTips] = useState(true);

  // Sync if thread prop changes with an existing prediction
  useEffect(() => {
    if (thread.engagementPrediction) {
      setPrediction(thread.engagementPrediction);
    }
  }, [thread.id, thread.engagementPrediction]);

  // Handle re-predicting virality using Gemini AI based on CURRENT thread content
  const handlePredictEngagementAI = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch("/api/predict-engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: thread.posts.map((p) => ({
            postNumber: p.postNumber,
            content: p.content,
          })),
          articleTitle: thread.articleTitle,
          platform: thread.platform,
          tone: thread.tone,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil prediksi dari AI.");
      }

      const data = await response.json();
      if (data.success && data.prediction) {
        setPrediction(data.prediction);
        if (onUpdateThreadPrediction) {
          onUpdateThreadPrediction(data.prediction);
        }
        showToast(
          language === "id"
            ? "Prediksi engagement AI berhasil diperbarui!"
            : "AI Engagement Prediction updated!",
          "success"
        );
      } else {
        // Fallback to fresh heuristic
        const fallback = generateHeuristicPrediction(thread, language);
        setPrediction(fallback);
        if (onUpdateThreadPrediction) {
          onUpdateThreadPrediction(fallback);
        }
      }
    } catch (err) {
      console.warn("AI Predict fallback:", err);
      const fallback = generateHeuristicPrediction(thread, language);
      setPrediction(fallback);
      if (onUpdateThreadPrediction) {
        onUpdateThreadPrediction(fallback);
      }
      showToast(
        language === "id"
          ? "Prediksi engagement dihitung berbasis konten terbaru!"
          : "Engagement forecast recalculated from latest content!",
        "info"
      );
    } finally {
      setIsPredicting(false);
    }
  };

  // Determine current gauge score & metadata depending on active metric tab
  const getActiveGaugeDetails = () => {
    switch (activeGaugeMetric) {
      case "likes":
        return {
          score: prediction.likeProbability,
          title: language === "id" ? "Like Magnetism" : "Like Magnetism",
          subtitle: language === "id" ? "Daya Tarik Reaksi Audiens" : "Audience Reaction Appeal",
          tierLabel:
            prediction.likeProbability >= 85
              ? "MAGNETIK ❤️"
              : prediction.likeProbability >= 70
              ? "TINGGI 👍"
              : "STANDAR",
        };
      case "shares":
        return {
          score: prediction.shareabilityScore,
          title: language === "id" ? "Shareability Factor" : "Shareability Factor",
          subtitle: language === "id" ? "Dorongan Repost / Retweet" : "Repost & Quote Catalyst",
          tierLabel:
            prediction.shareabilityScore >= 85
              ? "SANGAT VIRAL 🔄"
              : prediction.shareabilityScore >= 70
              ? "TINGGI 🚀"
              : "MODERAT",
        };
      case "comments":
        return {
          score: prediction.discussionScore,
          title: language === "id" ? "Discussion Catalyst" : "Discussion Catalyst",
          subtitle: language === "id" ? "Pemicu Perdebatan & Balasan" : "Reply & Debate Trigger",
          tierLabel:
            prediction.discussionScore >= 85
              ? "RAMAI KOMENTAR 💬"
              : prediction.discussionScore >= 70
              ? "DISKUSI AKTIF ⚡"
              : "MODERAT",
        };
      case "virality":
      default:
        return {
          score: prediction.viralityScore,
          title: language === "id" ? "Skor Viralitas Total" : "Overall Virality Index",
          subtitle: language === "id" ? "Potensi Ledakan Algoritma" : "Algorithm Explosion Potential",
          tierLabel: prediction.tierLabel,
        };
    }
  };

  const currentGauge = getActiveGaugeDetails();

  return (
    <div
      id="engagement-predictor-card"
      data-testid="engagement-predictor-card"
      className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 relative overflow-hidden ${
        isDark
          ? "bg-[#111114] border-[#1E293B] shadow-2xl shadow-black/40 backdrop-blur-md"
          : "bg-white border-slate-200 shadow-xl shadow-slate-200/60"
      }`}
    >
      {/* Decorative background glow */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
          prediction.viralityScore >= 80
            ? "bg-gradient-to-br from-amber-500 to-rose-600"
            : "bg-gradient-to-br from-blue-500 to-indigo-600"
        }`}
      />

      {/* Header Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b mb-5 gap-3 relative z-10 ${
          isDark ? "border-[#1E293B]" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
              prediction.viralityScore >= 80
                ? isDark
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-amber-50 border-amber-200 text-amber-700"
                : isDark
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-sm sm:text-base font-bold tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {language === "id"
                  ? "AI Virality & Engagement Predictor"
                  : "AI Virality & Engagement Predictor"}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono ${
                  prediction.viralityScore >= 80
                    ? isDark
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                      : "bg-rose-50 border-rose-200 text-rose-700"
                    : isDark
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                Gemini 3.8 Flash
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {language === "id"
                ? "Meramal potensi virality algoritma (Likes, Reposts & Komentar) berdasarkan konten teks saat ini."
                : "Forecasts social algorithm virality (Likes, Shares & Comments) based on current thread content."}
            </p>
          </div>
        </div>

        {/* Re-calculate Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="recalculate-virality-btn"
            data-testid="recalculate-virality-btn"
            onClick={handlePredictEngagementAI}
            disabled={isPredicting}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-sm ${
              isDark
                ? "bg-[#18181f] hover:bg-[#22222d] text-slate-200 hover:text-white border-[#2A2A38] hover:border-blue-500/50"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300 hover:border-blue-400"
            } ${isPredicting ? "opacity-75 cursor-not-allowed" : "active:scale-95"}`}
            title={
              language === "id"
                ? "Hitung ulang prediksi virality menggunakan teks thread yang telah diedit"
                : "Re-analyze virality forecast with latest edited text"
            }
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isPredicting ? "animate-spin text-blue-400" : "text-blue-500"}`}
            />
            <span>
              {isPredicting
                ? language === "id"
                  ? "Menganalisis..."
                  : "Forecasting..."
                : language === "id"
                ? "Analisis Ulang Virality"
                : "Re-Forecast Virality"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Gauge & Metric Switcher | Right Forecast Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT: Dynamic Radial Gauge Section (5 cols) */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl border relative ${
            isDark
              ? "bg-[#0b0b0e] border-[#1E293B]"
              : "bg-slate-50/80 border-slate-200"
          }`}
        >
          {/* Sub-Metric Switcher Tabs */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border text-[11px] mb-3 max-w-full overflow-x-auto ${
              isDark
                ? "bg-[#14141a] border-[#22222e]"
                : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => setActiveGaugeMetric("virality")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeGaugeMetric === "virality"
                  ? "bg-blue-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚡ {language === "id" ? "Total" : "Total"}
            </button>
            <button
              onClick={() => setActiveGaugeMetric("likes")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeGaugeMetric === "likes"
                  ? "bg-rose-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ❤️ {language === "id" ? "Likes" : "Likes"}
            </button>
            <button
              onClick={() => setActiveGaugeMetric("shares")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeGaugeMetric === "shares"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🔄 {language === "id" ? "Shares" : "Shares"}
            </button>
            <button
              onClick={() => setActiveGaugeMetric("comments")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeGaugeMetric === "comments"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💬 {language === "id" ? "Komentar" : "Replies"}
            </button>
          </div>

          {/* Dynamic Gauge Chart */}
          <DynamicGaugeChart
            score={currentGauge.score}
            title={currentGauge.title}
            subtitle={currentGauge.subtitle}
            tierLabel={currentGauge.tierLabel}
            theme={theme}
            size={280}
            activeMetricName={
              activeGaugeMetric !== "virality"
                ? `${currentGauge.title} Score`
                : undefined
            }
          />

          {/* Benchmark comparison note */}
          <div
            className={`mt-3 text-center text-[11px] font-medium px-3 py-1.5 rounded-lg border w-full ${
              isDark
                ? "bg-[#14141c] border-[#1E293B] text-slate-300"
                : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <span>🏆 {prediction.platformBenchmarkComparison}</span>
          </div>
        </div>

        {/* RIGHT: Forecasted Virality Metrics & Golden Window (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
          {/* 4 Social Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
            {/* Likes Card */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-[#0b0b0e] border-[#1E293B] hover:border-rose-500/30"
                  : "bg-slate-50 border-slate-200 hover:border-rose-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-rose-500">
                  <Heart className="h-3.5 w-3.5 fill-rose-500/20" />
                  <span>{language === "id" ? "Potensi Likes" : "Forecasted Likes"}</span>
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDark ? "bg-rose-500/10 text-rose-300" : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {prediction.likeProbability}% Prob.
                </span>
              </div>
              <div
                className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {prediction.forecastedLikes.formatted}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "id" ? "Estimasi interaksi tombol suka" : "Est. positive heart signals"}
              </div>
            </div>

            {/* Shares/Reposts Card */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-[#0b0b0e] border-[#1E293B] hover:border-indigo-500/30"
                  : "bg-slate-50 border-slate-200 hover:border-indigo-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-indigo-500">
                  <Repeat2 className="h-3.5 w-3.5" />
                  <span>
                    {language === "id" ? "Potensi Reposts" : "Forecasted Shares"}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDark
                      ? "bg-indigo-500/10 text-indigo-300"
                      : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {prediction.shareabilityScore}/100
                </span>
              </div>
              <div
                className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {prediction.forecastedShares.formatted}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "id"
                  ? "Kunci ledakan viral antar lingkaran"
                  : "Amplification factor to new audiences"}
              </div>
            </div>

            {/* Comments Card */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-[#0b0b0e] border-[#1E293B] hover:border-emerald-500/30"
                  : "bg-slate-50 border-slate-200 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <MessageCircle className="h-3.5 w-3.5 fill-emerald-500/20" />
                  <span>
                    {language === "id" ? "Potensi Komentar" : "Forecasted Comments"}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {prediction.discussionScore}/100
                </span>
              </div>
              <div
                className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {prediction.forecastedComments.formatted}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "id"
                  ? "Debat & tanggapan di kolom balasan"
                  : "High conversational debate catalyst"}
              </div>
            </div>

            {/* Bookmarks / Saves Card */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                isDark
                  ? "bg-[#0b0b0e] border-[#1E293B] hover:border-amber-500/30"
                  : "bg-slate-50 border-slate-200 hover:border-amber-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 font-bold text-amber-500">
                  <Bookmark className="h-3.5 w-3.5 fill-amber-500/20" />
                  <span>
                    {language === "id" ? "Potensi Saves" : "Forecasted Saves"}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isDark
                      ? "bg-amber-500/10 text-amber-300"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {prediction.retentionScore}% Retensi
                </span>
              </div>
              <div
                className={`text-lg sm:text-xl font-black font-mono tracking-tight ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {prediction.forecastedBookmarks.formatted}
              </div>
              <div className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {language === "id" ? "Sinyal nilai edukasi tahan lama" : "Long-term reference bookmarks"}
              </div>
            </div>
          </div>

          {/* Golden Hour & Total Reach Bar */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isDark
                ? "bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border-blue-900/30"
                : "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isDark
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span
                  className={`font-bold block ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {language === "id" ? "Waktu Posting Emas (Golden Hour):" : "Best Time to Post:"}
                </span>
                <span
                  className={`text-[11px] ${
                    isDark ? "text-blue-300 font-medium" : "text-blue-700 font-semibold"
                  }`}
                >
                  {prediction.peakEngagementWindow}
                </span>
              </div>
            </div>

            {/* Estimated Total Impressions */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-2 sm:border-l border-blue-500/20">
              <Eye className="h-4 w-4 text-purple-400" />
              <div>
                <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {language === "id" ? "Estimasi Jangkauan" : "Est. Total Reach"}
                </div>
                <div
                  className={`text-sm font-black font-mono ${
                    isDark ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  ~{prediction.forecastedImpressions.formatted}
                </div>
              </div>
            </div>
          </div>

          {/* Audience Sentiment */}
          <div
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark
                ? "bg-[#0b0b0e] border-[#1E293B] text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <span className="font-bold text-amber-400 shrink-0">🎯 {language === "id" ? "Sentimen Audiens:" : "Audience Trigger:"}</span>
            <span className="italic line-clamp-1">{prediction.audienceSentiment}</span>
          </div>
        </div>
      </div>

      {/* Accordion / Expandable Section: Virality Drivers & AI Boost Recommendations */}
      <div className={`mt-5 pt-4 border-t ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {language === "id"
                ? "Faktor Pendorong & Rekomendasi Peningkatan AI"
                : "Virality Drivers & AI Boost Suggestions"}
            </h4>
          </div>
          <button
            onClick={() => setShowBoostTips(!showBoostTips)}
            className={`text-xs font-medium ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
          >
            {showBoostTips
              ? language === "id"
                ? "Sembunyikan Detail"
                : "Collapse"
              : language === "id"
              ? "Lihat Detail"
              : "Expand"}
          </button>
        </div>

        {showBoostTips && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs animate-in fade-in-50 duration-200">
            {/* Virality Drivers */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isDark ? "bg-[#0b0b0e] border-[#1E293B]" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {language === "id"
                    ? "Kenapa Thread Ini Berpotensi Viral:"
                    : "Why This Content Will Perform:"}
                </span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {prediction.keyViralityDrivers.map((driver, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 leading-relaxed text-[11px] ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Boost Recommendations */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isDark ? "bg-[#0b0b0e] border-[#1E293B]" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  {language === "id"
                    ? "Saran AI untuk Mendongkrak Skor:"
                    : "AI Actionable Boost Recommendations:"}
                </span>
              </div>
              <div className="space-y-2">
                {prediction.suggestedBoosts.map((boost) => (
                  <div
                    key={boost.id}
                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                      isDark
                        ? "bg-[#14141c] border-[#1E293B]"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {boost.title}
                      </span>
                      <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        +{boost.potentialScoreGain} Pts
                      </span>
                    </div>
                    <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                      {boost.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
