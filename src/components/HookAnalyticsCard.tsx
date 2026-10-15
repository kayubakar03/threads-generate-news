import React, { useState } from "react";
import { Sparkles, TrendingUp, CheckCircle, Hash, Copy, Check, Lightbulb } from "lucide-react";
import { HookAnalysis, LanguageType, ThemeMode } from "../types";
import { showToast } from "./Toast";

interface HookAnalyticsCardProps {
  analysis: HookAnalysis;
  hashtags: string[];
  language: LanguageType;
  theme?: ThemeMode;
}

export const HookAnalyticsCard: React.FC<HookAnalyticsCardProps> = ({
  analysis,
  hashtags,
  language,
  theme = "dark",
}) => {
  const isDark = theme === "dark";
  const [copiedTags, setCopiedTags] = useState(false);

  const handleCopyTags = () => {
    if (hashtags.length === 0) return;
    navigator.clipboard.writeText(hashtags.join(" "));
    setCopiedTags(true);
    showToast(
      language === "id" ? "Hashtag berhasil disalin!" : "Hashtags copied!",
      "success"
    );
    setTimeout(() => setCopiedTags(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) {
      return isDark
        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        : "text-emerald-700 border-emerald-200 bg-emerald-50";
    }
    if (score >= 70) {
      return isDark
        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
        : "text-amber-700 border-amber-200 bg-amber-50";
    }
    return isDark
      ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
      : "text-blue-700 border-blue-200 bg-blue-50";
  };

  return (
    <div
      id="hook-analytics-card"
      className={`rounded-2xl p-5 border transition-colors duration-200 ${
        isDark
          ? "bg-[#111114] border-[#1E293B] shadow-xl shadow-black/30 backdrop-blur-sm"
          : "bg-white border-slate-200 shadow-md shadow-slate-200/50"
      }`}
    >
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b mb-4 gap-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            {language === "id" ? "Analisis Hook, Suara Manusia & Viralitas" : "Hook Strength, Human Voice & Retention"}
          </h3>
        </div>

        {/* Score Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Human Voice Score */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono ${
              isDark
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : "text-emerald-700 border-emerald-200 bg-emerald-50"
            }`}
            title="Skor keaslian bahasa manusia & bebas kata klise robotik"
          >
            <span>✨ Human Voice: {analysis.humanScore || 95}/100</span>
          </div>

          {/* Hook Score */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono ${getScoreColor(
              analysis.score
            )}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hook: {analysis.score}/100</span>
          </div>
        </div>
      </div>

      {/* Analytics Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-xs">
        <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"}`}>
          <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "id" ? "Keaslian Tutur" : "Human Authenticity"}
          </span>
          <span className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
            {analysis.humanScore || 95}% Organik
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"}`}>
          <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "id" ? "Curiosity Gap" : "Curiosity Gap"}
          </span>
          <span className={`text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            {analysis.curiosityScore || 92}/100
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"}`}>
          <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "id" ? "Estimasi Retensi" : "Est. Retention"}
          </span>
          <span className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
            {analysis.retentionRate || "Tinggi (94%)"}
          </span>
        </div>

        <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"}`}>
          <span className={`text-[10px] block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "id" ? "Pemicu Emosi" : "Trigger"}
          </span>
          <span className={`text-xs font-semibold line-clamp-1 mt-0.5 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            {analysis.emotionalTrigger || (language === "id" ? "FOMO & Rasa Penasaran" : "Intrigue & Urgency")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
        {/* Why it works */}
        <div className={`p-3.5 rounded-xl border space-y-1.5 ${
          isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`flex items-center gap-1.5 font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
            <CheckCircle className="h-3.5 w-3.5" />
            <span>
              {language === "id" ? "Tipe Hook & Daya Tarik:" : "Hook Framework & Angle:"}
            </span>
          </div>
          <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{analysis.type}</p>
          <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {analysis.whyItWorks}
          </p>
        </div>

        {/* Pro Tip */}
        <div className={`p-3.5 rounded-xl border space-y-1.5 ${
          isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`flex items-center gap-1.5 font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            <Lightbulb className="h-3.5 w-3.5" />
            <span>
              {language === "id" ? "Saran & Optimasi Interaksi:" : "Engagement Optimization Tip:"}
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {analysis.improvementTip}
          </p>
        </div>
      </div>

      {/* Recommended Hashtags */}
      {hashtags.length > 0 && (
        <div className={`mt-4 pt-3.5 border-t flex items-center justify-between flex-wrap gap-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <Hash className={`h-3 w-3 ${isDark ? "text-blue-400" : "text-blue-600"}`} /> Hashtag Relevan:
            </span>
            {hashtags.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border ${
                  isDark
                    ? "text-blue-300 bg-blue-500/10 border-blue-500/20"
                    : "text-blue-700 bg-blue-50 border-blue-200"
                }`}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>

          <button
            onClick={handleCopyTags}
            className={`text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              isDark
                ? "text-slate-300 hover:text-white bg-[#0A0A0C] hover:bg-[#1E293B] border-[#1E293B]"
                : "text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200"
            }`}
          >
            {copiedTags ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            <span>{copiedTags ? "Copied" : "Copy Tags"}</span>
          </button>
        </div>
      )}
    </div>
  );
};


