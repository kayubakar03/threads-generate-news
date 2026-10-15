import React, { useState, useRef, useMemo } from "react";
import {
  GeneratedThread,
  ThreadPost,
  LanguageType,
  ThemeMode,
} from "../types";
import {
  Sparkles,
  Heart,
  Repeat2,
  MessageCircle,
  Share2,
  Bookmark,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Layers,
  AtSign,
  Twitter,
  Linkedin,
  Instagram,
  Eye,
  Sliders,
  Download,
  FileDown,
} from "lucide-react";
import { showToast } from "./Toast";
import { exportThreadToPdf } from "../utils/pdfExport";

interface SocialPreviewProps {
  thread: GeneratedThread;
  language: LanguageType;
  theme?: ThemeMode;
  onPostEdit?: (postId: string, newContent: string) => void;
}

type PlatformSkin = "threads" | "twitter" | "linkedin" | "instagram";
type GlowAccent = "blue" | "purple" | "emerald" | "amber";
type GlassIntensity = "subtle" | "medium" | "deep";

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  thread,
  language,
  theme = "dark",
  onPostEdit,
}) => {
  const isDark = theme === "dark";
  const [platformSkin, setPlatformSkin] = useState<PlatformSkin>(
    thread.platform === "twitter"
      ? "twitter"
      : thread.platform === "instagram_carousel"
      ? "instagram"
      : "threads"
  );
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [glowAccent, setGlowAccent] = useState<GlowAccent>("blue");
  const [glassIntensity, setGlassIntensity] = useState<GlassIntensity>("medium");
  const [is3DActive, setIs3DActive] = useState(true);
  const [isAutoFloating, setIsAutoFloating] = useState(false);
  const [showVerified, setShowVerified] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Simulated engagement metrics per post
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [reposts, setReposts] = useState<Record<string, number>>({});
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});
  const [hasReposted, setHasReposted] = useState<Record<string, boolean>>({});

  // 3D Tilt calculation
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const posts = thread.posts || [];
  const activePost: ThreadPost | undefined = posts[currentPostIndex] || posts[0];

  // Base metrics calculated from AI virality forecast or post characteristics
  const postMetrics = useMemo(() => {
    if (!activePost) return { likes: 1240, reposts: 382, replies: 94, views: 24500 };
    const ep = thread.engagementPrediction;
    const baseLikes = ep
      ? Math.round(ep.forecastedLikes.min + (currentPostIndex === 0 ? (ep.forecastedLikes.max - ep.forecastedLikes.min) * 0.6 : (ep.forecastedLikes.max - ep.forecastedLikes.min) * 0.15))
      : 450 + (activePost.content.length % 200) * 12 + (currentPostIndex === 0 ? 800 : 150);
    const baseReposts = ep
      ? Math.round(ep.forecastedShares.min + (currentPostIndex === 0 ? (ep.forecastedShares.max - ep.forecastedShares.min) * 0.5 : (ep.forecastedShares.max - ep.forecastedShares.min) * 0.12))
      : Math.floor(baseLikes * 0.32);
    const baseReplies = ep
      ? Math.round(ep.forecastedComments.min + (currentPostIndex === 0 ? (ep.forecastedComments.max - ep.forecastedComments.min) * 0.5 : (ep.forecastedComments.max - ep.forecastedComments.min) * 0.1))
      : Math.floor(baseLikes * 0.08);
    const baseViews = ep
      ? Math.round(ep.forecastedImpressions.min + (currentPostIndex === 0 ? (ep.forecastedImpressions.max - ep.forecastedImpressions.min) * 0.6 : (ep.forecastedImpressions.max - ep.forecastedImpressions.min) * 0.2))
      : baseLikes * 28;

    return {
      likes: (likes[activePost.id] !== undefined ? likes[activePost.id] : baseLikes),
      reposts: (reposts[activePost.id] !== undefined ? reposts[activePost.id] : baseReposts),
      replies: baseReplies,
      views: baseViews,
    };
  }, [activePost, currentPostIndex, likes, reposts, thread.engagementPrediction]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3DActive || isAutoFloating || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Constrain tilt angle for realistic glass refraction
    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 12;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    if (isAutoFloating) return;
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleLike = (postId: string) => {
    const currentLiked = !!hasLiked[postId];
    setHasLiked((prev) => ({ ...prev, [postId]: !currentLiked }));
    setLikes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || postMetrics.likes) + (currentLiked ? -1 : 1),
    }));
  };

  const handleRepost = (postId: string) => {
    const currentReposted = !!hasReposted[postId];
    setHasReposted((prev) => ({ ...prev, [postId]: !currentReposted }));
    setReposts((prev) => ({
      ...prev,
      [postId]: (prev[postId] || postMetrics.reposts) + (currentReposted ? -1 : 1),
    }));
  };

  const handleCopyCurrentPost = () => {
    if (!activePost) return;
    navigator.clipboard.writeText(activePost.content);
    setCopiedCurrent(true);
    showToast(
      language === "id"
        ? `Post #${currentPostIndex + 1} berhasil disalin ke clipboard!`
        : `Post #${currentPostIndex + 1} copied to clipboard!`,
      "success"
    );
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  const handleDownloadCardPreview = () => {
    setIsDownloading(true);
    try {
      // Export text card representation with decorative format
      const cardHeader = `--- [${platformSkin.toUpperCase()} 3D GLASS PREVIEW] ---`;
      const postNumber = `Post ${currentPostIndex + 1}/${posts.length} • ${activePost?.keyHighlight || "Insight"}`;
      const content = activePost?.content || "";
      const source = thread.articleSource ? `Source: ${thread.articleSource}` : "";
      const tags = (thread.suggestedHashtags || []).join(" ");
      const fullText = `${cardHeader}\n${postNumber}\n\n${content}\n\n${source}\n${tags}\n--------------------------------------`;

      const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `social-preview-post-${currentPostIndex + 1}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        language === "id" ? "Kartu sosial preview berhasil diunduh!" : "Social card downloaded!",
        "success"
      );
    } catch {
      showToast("Gagal mengunduh kartu.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  // Glass styles configurations
  const glowConfig = {
    blue: {
      shadow: isDark ? "rgba(59, 130, 246, 0.25)" : "rgba(37, 99, 235, 0.2)",
      border: isDark ? "rgba(96, 165, 250, 0.35)" : "rgba(59, 130, 246, 0.4)",
      badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      accentHex: "#3b82f6",
    },
    purple: {
      shadow: isDark ? "rgba(168, 85, 247, 0.25)" : "rgba(147, 51, 234, 0.2)",
      border: isDark ? "rgba(192, 132, 252, 0.35)" : "rgba(168, 85, 247, 0.4)",
      badgeBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      accentHex: "#a855f7",
    },
    emerald: {
      shadow: isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(5, 150, 105, 0.2)",
      border: isDark ? "rgba(52, 211, 153, 0.35)" : "rgba(16, 185, 129, 0.4)",
      badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accentHex: "#10b981",
    },
    amber: {
      shadow: isDark ? "rgba(245, 158, 11, 0.25)" : "rgba(217, 119, 6, 0.2)",
      border: isDark ? "rgba(251, 191, 36, 0.35)" : "rgba(245, 158, 11, 0.4)",
      badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      accentHex: "#f59e0b",
    },
  }[glowAccent];

  const glassBg = {
    subtle: isDark
      ? "bg-[#111116]/80 backdrop-blur-md"
      : "bg-white/80 backdrop-blur-md",
    medium: isDark
      ? "bg-gradient-to-b from-slate-900/85 via-[#0d111a]/90 to-slate-950/90 backdrop-blur-xl"
      : "bg-gradient-to-b from-white/90 via-slate-50/85 to-white/90 backdrop-blur-xl",
    deep: isDark
      ? "bg-slate-950/95 backdrop-blur-2xl"
      : "bg-white/95 backdrop-blur-2xl",
  }[glassIntensity];

  const authorName = "Alex Sanders";
  const authorHandle = platformSkin === "linkedin" ? "Alex Sanders, AI Creator" : "@alex_ai_insights";
  const avatarInitials = "AS";

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar: Platform Selector & 3D Glass Settings */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDark ? "bg-[#0d1017] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Platform Skin Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold uppercase tracking-wider mr-1 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              {language === "id" ? "Skin Platform:" : "Platform Skin:"}
            </span>

            <button
              id="skin-threads-btn"
              type="button"
              onClick={() => setPlatformSkin("threads")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                platformSkin === "threads"
                  ? "bg-slate-950 text-white border-slate-700 shadow-md ring-2 ring-blue-500/40"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-400 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
              }`}
            >
              <AtSign className="h-3.5 w-3.5" />
              <span>Threads</span>
            </button>

            <button
              id="skin-twitter-btn"
              type="button"
              onClick={() => setPlatformSkin("twitter")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                platformSkin === "twitter"
                  ? "bg-sky-600 text-white border-sky-500 shadow-md ring-2 ring-sky-400/40"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-400 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
              }`}
            >
              <Twitter className="h-3.5 w-3.5" />
              <span>X (Twitter)</span>
            </button>

            <button
              id="skin-linkedin-btn"
              type="button"
              onClick={() => setPlatformSkin("linkedin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                platformSkin === "linkedin"
                  ? "bg-blue-700 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-400 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
              }`}
            >
              <Linkedin className="h-3.5 w-3.5" />
              <span>LinkedIn</span>
            </button>

            <button
              id="skin-instagram-btn"
              type="button"
              onClick={() => setPlatformSkin("instagram")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                platformSkin === "instagram"
                  ? "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white border-transparent shadow-md ring-2 ring-rose-400/40"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-400 hover:text-white"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
              }`}
            >
              <Instagram className="h-3.5 w-3.5" />
              <span>Instagram</span>
            </button>
          </div>

          {/* 3D Glass Customization: Glow, Tilt, Verified */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Glow Color Selector */}
            <div className="flex items-center gap-1.5 bg-slate-500/10 p-1 rounded-xl border border-slate-500/20">
              {(["blue", "purple", "emerald", "amber"] as GlowAccent[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setGlowAccent(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    c === "blue"
                      ? "bg-blue-500"
                      : c === "purple"
                      ? "bg-purple-500"
                      : c === "emerald"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  } ${glowAccent === c ? "scale-125 ring-2 ring-white shadow-sm" : "opacity-60 hover:opacity-100"}`}
                  title={`Glow ${c}`}
                />
              ))}
            </div>

            {/* 3D Tilt Toggle */}
            <button
              type="button"
              onClick={() => setIs3DActive(!is3DActive)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                is3DActive
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-500"
                  : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
              title={language === "id" ? "Aktifkan efek 3D Tilt interaktif" : "Toggle interactive 3D Tilt"}
            >
              <Layers className="h-3 w-3" />
              <span>{is3DActive ? "3D Tilt On" : "3D Tilt Off"}</span>
            </button>

            {/* Auto Float Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsAutoFloating(!isAutoFloating);
                if (!isAutoFloating) {
                  setTilt({ rotateX: 6, rotateY: -8, glareX: 30, glareY: 40 });
                } else {
                  setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isAutoFloating
                  ? "bg-purple-600/20 text-purple-400 border-purple-500/40 animate-pulse"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-500"
                  : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
              title={language === "id" ? "Animasi melayang 3D otomatis" : "Auto floating 3D animation"}
            >
              <Sparkles className="h-3 w-3" />
              <span>{isAutoFloating ? "Floating ✨" : "Float"}</span>
            </button>

            {/* Verified Badge Toggle */}
            <button
              type="button"
              onClick={() => setShowVerified(!showVerified)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                showVerified
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                  : isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-500"
                  : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
              title="Toggle Verified Checkmark"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Verified</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Glass Stage */}
      <div className="relative flex flex-col items-center justify-center py-6 px-2 sm:px-6">
        {/* Ambient background glow spheres */}
        <div
          className="absolute -top-10 -left-10 w-72 h-72 rounded-full pointer-events-none filter blur-3xl opacity-30 transition-all duration-700"
          style={{ backgroundColor: glowConfig.accentHex }}
        />
        <div
          className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full pointer-events-none filter blur-3xl opacity-20 transition-all duration-700"
          style={{ backgroundColor: glowAccent === "blue" ? "#6366f1" : "#ec4899" }}
        />

        {/* 3D Perspective Container */}
        <div
          style={{ perspective: 1200 }}
          className="w-full max-w-xl mx-auto flex items-center justify-center py-4"
        >
          {/* 3D Glass Post Card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(10px)`,
              transition: isAutoFloating
                ? "transform 3s ease-in-out infinite alternate"
                : "transform 0.15s cubic-bezier(0.2, 0.8, 0.4, 1)",
              boxShadow: `0 25px 50px -12px ${glowConfig.shadow}, 0 0 0 1px ${glowConfig.border}`,
            }}
            className={`relative w-full rounded-3xl p-6 sm:p-7 border transition-shadow duration-300 select-none ${glassBg} ${
              isAutoFloating ? "animate-bounce-subtle" : ""
            }`}
          >
            {/* Dynamic Glass Specular Sheen (Moves with cursor / tilt) */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, ${
                  isDark ? "0.12" : "0.35"
                }) 0%, transparent 60%)`,
              }}
            />

            {/* Header: Author Info, Platform Badge, Post Number */}
            <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {/* 3D Glass Avatar with gradient border */}
                <div
                  className="relative w-12 h-12 rounded-2xl p-[2px] transition-transform duration-200 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${glowConfig.accentHex}, #9333ea)`,
                  }}
                >
                  <div className={`w-full h-full rounded-[14px] flex items-center justify-center font-extrabold text-sm ${
                    isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                  }`}>
                    {avatarInitials}
                  </div>
                  {showVerified && (
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2"
                      style={{
                        backgroundColor: glowConfig.accentHex,
                        borderColor: isDark ? "#0f172a" : "#ffffff",
                      }}
                    >
                      <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-bold text-sm sm:text-base ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}>
                      {authorName}
                    </span>
                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {authorHandle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                      {thread.articleSource || "News Source"}
                    </span>
                    <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>
                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                      {language === "id" ? "Baru saja" : "Just now"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sequence Badge: "1/5 • Hook" */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${glowConfig.badgeBg}`}
                >
                  {currentPostIndex + 1}/{posts.length} {currentPostIndex === 0 ? "🔥 Hook" : ""}
                </span>
              </div>
            </div>

            {/* Post Highlight Banner */}
            {activePost?.keyHighlight && (
              <div className="relative z-10 mb-3">
                <span
                  className={`inline-block text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-lg border ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700/60 text-slate-300"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  📌 {activePost.keyHighlight}
                </span>
              </div>
            )}

            {/* Card Main Content */}
            <div className="relative z-10 my-3">
              <p
                className={`text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                {activePost?.content || "Konten thread..."}
              </p>
            </div>

            {/* AI Image Prompt / Visual Asset Glass Placeholder */}
            {activePost?.imagePrompt && (
              <div
                className={`relative z-10 mt-4 p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
                  isDark
                    ? "bg-slate-900/60 border-slate-800/80 text-slate-300"
                    : "bg-slate-100/70 border-slate-200/80 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-500">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{language === "id" ? "Saran Visual AI" : "AI Visual Prompt"}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-60">Aspect 16:9 / 1:1</span>
                </div>
                <p className="text-xs italic opacity-90 line-clamp-2">
                  "{activePost.imagePrompt}"
                </p>
              </div>
            )}

            {/* Suggested Hashtags */}
            {thread.suggestedHashtags && thread.suggestedHashtags.length > 0 && currentPostIndex === posts.length - 1 && (
              <div className="relative z-10 mt-3 flex items-center gap-1.5 flex-wrap">
                {thread.suggestedHashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Metrics & Interactive Buttons */}
            {showMetrics && (
              <div
                className={`relative z-10 mt-5 pt-4 border-t flex items-center justify-between text-xs ${
                  isDark ? "border-slate-800/80 text-slate-400" : "border-slate-200 text-slate-600"
                }`}
              >
                {/* Replies */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
                  title="Replies"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{postMetrics.replies}</span>
                </button>

                {/* Reposts */}
                <button
                  type="button"
                  onClick={() => activePost && handleRepost(activePost.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    activePost && hasReposted[activePost.id] ? "text-emerald-500 font-semibold" : "hover:text-emerald-500"
                  }`}
                  title="Repost"
                >
                  <Repeat2 className="h-4 w-4" />
                  <span>{postMetrics.reposts.toLocaleString()}</span>
                </button>

                {/* Likes */}
                <button
                  type="button"
                  onClick={() => activePost && handleLike(activePost.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    activePost && hasLiked[activePost.id] ? "text-rose-500 font-semibold" : "hover:text-rose-500"
                  }`}
                  title="Like"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      activePost && hasLiked[activePost.id] ? "fill-rose-500 text-rose-500 scale-110" : ""
                    }`}
                  />
                  <span>{postMetrics.likes.toLocaleString()}</span>
                </button>

                {/* Views */}
                <div className="hidden sm:flex items-center gap-1.5 opacity-80" title="Impressions">
                  <Eye className="h-4 w-4" />
                  <span>{(postMetrics.views / 1000).toFixed(1)}k</span>
                </div>

                {/* Share / Bookmark */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCurrentPost}
                    className="hover:text-blue-500 transition-colors"
                    title="Copy post content"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="hover:text-amber-500 transition-colors"
                    title="Bookmark"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stepper Navigation: Next / Prev Post */}
        <div className="mt-4 flex items-center justify-between w-full max-w-xl px-2 gap-3">
          <button
            type="button"
            disabled={currentPostIndex <= 0}
            onClick={() => setCurrentPostIndex((prev) => Math.max(0, prev - 1))}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              currentPostIndex <= 0
                ? "opacity-40 cursor-not-allowed border-transparent"
                : isDark
                ? "bg-[#111116] border-[#1E293B] text-slate-300 hover:text-white hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{language === "id" ? "Post Sebelumnya" : "Previous Post"}</span>
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {posts.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPostIndex(idx)}
                className={`transition-all duration-200 rounded-full ${
                  idx === currentPostIndex
                    ? `w-6 h-2 ${glowConfig.accentHex === "#3b82f6" ? "bg-blue-500" : "bg-purple-500"}`
                    : "w-2 h-2 bg-slate-500/40 hover:bg-slate-400"
                }`}
                title={`Go to post ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentPostIndex >= posts.length - 1}
            onClick={() => setCurrentPostIndex((prev) => Math.min(posts.length - 1, prev + 1))}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              currentPostIndex >= posts.length - 1
                ? "opacity-40 cursor-not-allowed border-transparent"
                : isDark
                ? "bg-[#111116] border-[#1E293B] text-slate-300 hover:text-white hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
          >
            <span>{language === "id" ? "Post Selanjutnya" : "Next Post"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Actions Footer: Copy Card Text, Export Card */}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <button
            id="copy-card-text-btn"
            type="button"
            onClick={handleCopyCurrentPost}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              copiedCurrent
                ? "bg-emerald-600 text-white border-emerald-500"
                : isDark
                ? "bg-[#111116] border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600"
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
          >
            {copiedCurrent ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCurrent ? (language === "id" ? "Tersalin!" : "Copied!") : (language === "id" ? "Salin Teks Post Ini" : "Copy This Post")}</span>
          </button>

          <button
            id="download-card-preview-btn"
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadCardPreview}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30"
                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{language === "id" ? "Unduh Kartu Preview (.txt)" : "Export Card (.txt)"}</span>
          </button>

          <button
            id="download-thread-pdf-btn"
            type="button"
            onClick={() => {
              exportThreadToPdf(thread);
              showToast(
                language === "id"
                  ? "Dokumen PDF thread berhasil diunduh!"
                  : "Thread PDF document downloaded!",
                "success"
              );
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? "bg-rose-600/20 text-rose-400 border-rose-500/30 hover:bg-rose-600/30"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
            title={language === "id" ? "Unduh seluruh thread sebagai dokumen PDF" : "Download entire thread as PDF document"}
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>{language === "id" ? "Unduh Thread (.pdf)" : "Export Thread (.pdf)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
