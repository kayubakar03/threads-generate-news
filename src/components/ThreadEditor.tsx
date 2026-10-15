import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Wand2,
  ImageIcon,
  AtSign,
  Twitter,
  Layers,
  FileText,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  ExternalLink,
  ChevronDown,
  Edit3,
  Clock,
  Zap,
  Gauge,
  Info,
  Sparkles,
  Loader2,
  Flame,
  Calendar,
  FileDown,
} from "lucide-react";
import {
  GeneratedThread,
  ThreadPost,
  LanguageType,
  ThemeMode,
  ToneType,
  ScheduledPostConfig,
} from "../types";
import { showToast } from "./Toast";
import { SocialPreview } from "./SocialPreview";
import { ScheduleModal } from "./ScheduleModal";
import { PdfExportModal } from "./PdfExportModal";

interface ThreadEditorProps {
  thread: GeneratedThread;
  language: LanguageType;
  theme?: ThemeMode;
  onUpdateThread: (updatedThread: GeneratedThread) => void;
  onSaveThread: (thread: GeneratedThread) => void;
  onRegenerate: () => void;
  isSaving?: boolean;
  onLaunch3D?: () => void;
}

export const ThreadEditor: React.FC<ThreadEditorProps> = ({
  thread,
  language,
  theme = "dark",
  onUpdateThread,
  onSaveThread,
  onRegenerate,
  onLaunch3D,
}) => {
  const isDark = theme === "dark";
  const [viewMode, setViewMode] = useState<
    "threads_mockup" | "twitter_mockup" | "cards" | "plaintext" | "carousel" | "social_preview"
  >(
    thread.platform === "twitter"
      ? "twitter_mockup"
      : thread.platform === "instagram_carousel"
      ? "carousel"
      : "threads_mockup"
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [refiningPostId, setRefiningPostId] = useState<string | null>(null);
  const [activeRefineDropdown, setActiveRefineDropdown] = useState<string | null>(null);
  const [isRemixingPersona, setIsRemixingPersona] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Word count utility
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Dynamic Reading Time Calculations
  // Standard mobile social media reading speed is ~200-220 words per minute (approx 3.3 words/second)
  const stats = useMemo(() => {
    const totalWords = thread.posts.reduce(
      (acc, post) => acc + countWords(post.content),
      0
    );
    const totalChars = thread.posts.reduce(
      (acc, post) => acc + post.content.length,
      0
    );
    const totalSeconds = Math.max(5, Math.ceil((totalWords / 200) * 60));
    const avgSecondsPerPost = Math.max(
      2,
      Math.round(totalSeconds / Math.max(1, thread.posts.length))
    );

    // Format display string in seconds or minutes
    let formattedTime = "";
    if (totalSeconds < 60) {
      formattedTime =
        language === "id"
          ? `${totalSeconds} detik`
          : `${totalSeconds} seconds`;
    } else {
      const mins = Math.floor(totalSeconds / 60);
      const remainingSecs = totalSeconds % 60;
      if (language === "id") {
        formattedTime =
          remainingSecs > 0
            ? `${mins} mnt ${remainingSecs} dtk`
            : `${mins} menit`;
      } else {
        formattedTime =
          remainingSecs > 0
            ? `${mins}m ${remainingSecs}s`
            : `${mins} min`;
      }
    }

    // Pacing tier analysis
    let pacingStatus: {
      label: string;
      description: string;
      colorClass: string;
      darkColorClass: string;
    };

    if (totalSeconds <= 45) {
      pacingStatus = {
        label: language === "id" ? "⚡ Ringkas & Cepat" : "⚡ Quick Read (<45s)",
        description:
          language === "id"
            ? "Pacing cepat, ideal untuk konsumsi kilat & breaking news."
            : "Brisk pace, ideal for fast snackable insights & breaking news.",
        colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        darkColorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    } else if (totalSeconds <= 120) {
      pacingStatus = {
        label: language === "id" ? "🎯 Pacing Optimal" : "🎯 Optimal Pacing (45s–2m)",
        description:
          language === "id"
            ? "Durasi emas (sweet spot) dengan tingkat retensi dan engagement tertinggi."
            : "Golden retention range with highest completion and repost rates.",
        colorClass: "bg-blue-50 text-blue-700 border-blue-200",
        darkColorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    } else {
      pacingStatus = {
        label: language === "id" ? "📖 Ulasan Mendalam" : "📖 Deep Dive (>2m)",
        description:
          language === "id"
            ? "Thread komprehensif. Pastikan setiap post menyuguhkan poin inti yang kuat."
            : "Detailed breakdown. Ensure high informational density per post.",
        colorClass: "bg-purple-50 text-purple-700 border-purple-200",
        darkColorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
    }

    return {
      totalWords,
      totalChars,
      totalSeconds,
      avgSecondsPerPost,
      formattedTime,
      pacingStatus,
    };
  }, [thread.posts, language]);

  // Format single post reading time
  const getPostReadingTime = (content: string) => {
    const words = countWords(content);
    const seconds = Math.max(2, Math.ceil((words / 200) * 60));
    if (seconds < 60) {
      return language === "id" ? `~${seconds} dtk` : `~${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    return language === "id"
      ? remSecs > 0
        ? `~${mins}m ${remSecs}s`
        : `~${mins}m`
      : remSecs > 0
      ? `~${mins}m ${remSecs}s`
      : `~${mins}m`;
  };

  // Get human-friendly label for current persona/tone
  const getPersonaLabel = (t?: string) => {
    switch (t) {
      case "gen_z":
        return language === "id" ? "💅 Gen-Z (Slang & Anti-Kaku)" : "💅 Gen-Z Vibe";
      case "millennial":
        return language === "id" ? "☕ Milenial (Adulting & Kopi Senja)" : "☕ Millennial Voice";
      case "boomer":
        return language === "id" ? "🌸 Boomer & WA (Doa & Petuah 🙏)" : "🌸 Boomer / WA Group";
      case "programmer":
        return language === "id" ? "💻 Programmer & Dev (Code & Tech Stack)" : "💻 Software Engineer";
      case "hacker":
        return language === "id" ? "🕶️ Hacker & Cyberpunk (Terminal Intel)" : "🕶️ Cyberpunk & Hacker";
      case "viral_story":
        return language === "id" ? "🚀 Viral Storytelling" : "🚀 Viral Storytelling";
      case "casual_tech":
        return language === "id" ? "⚡ Kasual Anak Tech" : "⚡ Casual Techie";
      case "bullet_summary":
        return language === "id" ? "📋 Ringkas Poin-Poin" : "📋 Bullet Summary";
      case "deep_dive":
        return language === "id" ? "🔍 Analisis Mendalam" : "🔍 Deep Dive";
      case "provocative_hook":
        return language === "id" ? "🔥 Hook Provokatif" : "🔥 Debate Starter";
      case "professional_exec":
        return language === "id" ? "👔 Eksekutif & Bisnis" : "👔 Executive Briefing";
      default:
        return t || (language === "id" ? "Gaya Standar" : "Standard Tone");
    }
  };


  // Update a single post's content
  const handleContentChange = (postId: string, newContent: string) => {
    const updatedPosts = thread.posts.map((post) =>
      post.id === postId ? { ...post, content: newContent } : post
    );
    onUpdateThread({ ...thread, posts: updatedPosts });
  };

  // Reorder posts
  const handleMovePost = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === thread.posts.length - 1)
    )
      return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newPosts = [...thread.posts];
    const temp = newPosts[index];
    newPosts[index] = newPosts[targetIndex];
    newPosts[targetIndex] = temp;

    // Recalculate post numbers
    const renumbered = newPosts.map((p, idx) => ({
      ...p,
      postNumber: idx + 1,
    }));

    onUpdateThread({ ...thread, posts: renumbered });
    showToast(
      language === "id"
        ? `Post #${index + 1} dipindahkan ke #${targetIndex + 1}`
        : `Post moved to #${targetIndex + 1}`,
      "info"
    );
  };

  // Delete a post
  const handleDeletePost = (postId: string) => {
    if (thread.posts.length <= 1) {
      showToast(
        language === "id"
          ? "Thread harus memiliki minimal 1 postingan."
          : "Thread must contain at least 1 post.",
        "error"
      );
      return;
    }
    const filtered = thread.posts.filter((p) => p.id !== postId);
    const renumbered = filtered.map((p, idx) => ({
      ...p,
      postNumber: idx + 1,
    }));
    onUpdateThread({ ...thread, posts: renumbered });
    showToast(
      language === "id" ? "Postingan dihapus." : "Post removed.",
      "info"
    );
  };

  // Add new post
  const handleAddPost = (afterIndex: number) => {
    const newPost: ThreadPost = {
      id: `post-${Date.now()}`,
      postNumber: afterIndex + 2,
      content:
        language === "id"
          ? "Tulis poin baru di sini..."
          : "Write new point here...",
      imagePrompt: "",
    };

    const newPosts = [...thread.posts];
    newPosts.splice(afterIndex + 1, 0, newPost);
    const renumbered = newPosts.map((p, idx) => ({
      ...p,
      postNumber: idx + 1,
    }));

    onUpdateThread({ ...thread, posts: renumbered });
    showToast(
      language === "id"
        ? `Post baru ditambahkan di urutan #${afterIndex + 2}`
        : `New post added at #${afterIndex + 2}`,
      "success"
    );
  };

  // Single post AI Refinement call
  const handleRefinePost = async (
    postId: string,
    action: string,
    customInstruction?: string
  ) => {
    const targetPost = thread.posts.find((p) => p.id === postId);
    if (!targetPost) return;

    setRefiningPostId(postId);
    setActiveRefineDropdown(null);

    try {
      const response = await fetch("/api/refine-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentContent: targetPost.content,
          action,
          customInstruction,
          platform: thread.platform,
          language: thread.language,
        }),
      });

      const data = await response.json();
      if (data.success && data.refinedContent) {
        handleContentChange(postId, data.refinedContent);
        showToast(
          language === "id"
            ? "Postingan berhasil dipoles dengan AI!"
            : "Post polished successfully!",
          "success"
        );
      } else {
        showToast(
          language === "id"
            ? "Gagal memoles post. Coba sesaat lagi."
            : "Failed to refine post.",
          "error"
        );
      }
    } catch {
      showToast(
        language === "id"
          ? "Terjadi kesalahan jaringan."
          : "Network error occurred.",
        "error"
      );
    } finally {
      setRefiningPostId(null);
    }
  };

  // Remix entire thread into a new persona
  const handleRemixThreadPersona = async (targetPersona: ToneType) => {
    setIsRemixingPersona(targetPersona);
    showToast(
      language === "id"
        ? `Mentransformasi thread ke gaya persona ${targetPersona.toUpperCase()}...`
        : `Remixing thread into ${targetPersona.toUpperCase()} persona...`,
      "info"
    );

    try {
      const response = await fetch("/api/remix-thread-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread,
          targetPersona,
          language: thread.language,
        }),
      });

      const data = await response.json();
      if (data.success && data.updatedPosts) {
        onUpdateThread({
          ...thread,
          tone: targetPersona,
          posts: data.updatedPosts,
        });
        showToast(
          language === "id"
            ? `✨ Berhasil ditransformasi ke gaya ${targetPersona.toUpperCase()}!`
            : `✨ Successfully remixed to ${targetPersona.toUpperCase()} style!`,
          "success"
        );
      } else {
        throw new Error(data.error || "Gagal mengubah persona.");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Gagal mentransformasi thread.", "error");
    } finally {
      setIsRemixingPersona(null);
    }
  };

  // Robust clipboard copy with fallback
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Proceed to fallback
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  // Copy entire generated thread to clipboard
  const handleCopyThreadToClipboard = async (includeNumbering = true) => {
    const fullText = thread.posts
      .map((p, idx) => {
        if (includeNumbering && thread.platform === "twitter") {
          return `${idx + 1}/${thread.posts.length}\n${p.content}`;
        }
        return p.content;
      })
      .join("\n\n---\n\n");

    const textToCopy =
      thread.suggestedHashtags && thread.suggestedHashtags.length > 0
        ? `${fullText}\n\n${thread.suggestedHashtags.join(" ")}`
        : fullText;

    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopiedAll(true);
      showToast(
        language === "id"
          ? "Seluruh isi thread berhasil disalin ke clipboard!"
          : "Entire thread copied to clipboard!",
        "success"
      );
      setTimeout(() => setCopiedAll(false), 2500);
    } else {
      showToast(
        language === "id"
          ? "Gagal menyalin ke clipboard. Mohon salin secara manual."
          : "Failed to copy to clipboard.",
        "error"
      );
    }
  };

  // Backwards compatible alias
  const handleCopyAll = handleCopyThreadToClipboard;

  // Copy single post
  const handleCopySingle = (postId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPostId(postId);
    showToast(
      language === "id" ? "Post disalin ke clipboard!" : "Post copied!",
      "success"
    );
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  // Copy AI Image Prompt
  const handleCopyPrompt = (postId: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPromptId(postId);
    showToast(
      language === "id"
        ? "AI Image Prompt disalin! Tempel di Midjourney / Imagen."
        : "AI Image prompt copied! Paste into Midjourney / Imagen.",
      "success"
    );
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Open intent share in Threads / X
  const handleShareIntent = () => {
    const firstPost = thread.posts[0]?.content || "";
    if (thread.platform === "twitter") {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        firstPost.slice(0, 260)
      )}`;
      window.open(tweetUrl, "_blank");
    } else {
      // Meta Threads share web link
      const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(
        firstPost
      )}`;
      window.open(threadsUrl, "_blank");
    }
  };

  // Download Markdown file
  const handleExportMarkdown = () => {
    const mdContent = `# ${thread.articleTitle}
*Sumber: ${thread.articleSource || "News"} | Dibuat dengan Threadly AI*
*Estimasi Waktu Baca: ${stats.formattedTime} (${stats.totalWords} kata)*

${thread.posts
  .map(
    (p, idx) =>
      `### Post ${idx + 1}/${thread.posts.length}\n${p.content}\n${
        p.imagePrompt ? `\n> 🖼️ *Image Prompt: ${p.imagePrompt}*` : ""
      }`
  )
  .join("\n\n---\n\n")}

### Hashtags:
${thread.suggestedHashtags.join(" ")}
`;

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `thread-${thread.articleTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30)}.md`;
    link.click();
    showToast(
      language === "id" ? "File Markdown didownload!" : "Markdown file saved!",
      "success"
    );
  };

  const getCharLimit = () => {
    if (thread.platform === "twitter") return 280;
    return 500; // Meta threads limit
  };

  return (
    <div id="thread-editor-workbench" className="space-y-4">
      {/* Top Toolbar */}
      <div
        className={`rounded-2xl p-5 border transition-colors duration-200 ${
          isDark
            ? "bg-[#111114] border-[#1E293B] shadow-xl shadow-black/40 backdrop-blur-md"
            : "bg-white border-slate-200 shadow-md shadow-slate-200/50"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Article Info */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  isDark
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {thread.platform === "twitter"
                  ? "X (Twitter) Thread"
                  : thread.platform === "linkedin"
                  ? "LinkedIn Post"
                  : thread.platform === "instagram_carousel"
                  ? "Instagram Carousel"
                  : "Meta Threads"}
              </span>

              <span
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                • {thread.posts.length} Posts
              </span>

              {/* Dynamic Reading Time Badge */}
              <span
                id="estimated-reading-time-badge"
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  isDark
                    ? stats.pacingStatus.darkColorClass
                    : stats.pacingStatus.colorClass
                }`}
                title={`Total ${stats.totalWords} kata (~${stats.avgSecondsPerPost} dtk/post)`}
              >
                <Clock className="h-3 w-3" />
                <span>
                  {language === "id" ? "Waktu Baca:" : "Read Time:"}{" "}
                  <strong className="font-semibold">{stats.formattedTime}</strong>
                </span>
              </span>

              {/* Dynamic Persona & Tone Badge */}
              <span
                id="current-persona-badge"
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  isDark
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    : "bg-purple-50 text-purple-800 border-purple-200"
                }`}
                title={language === "id" ? "Gaya persona bahasa thread" : "Current thread persona"}
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>{getPersonaLabel(thread.tone)}</span>
              </span>

              {/* Dynamic AI Virality Score Badge */}
              <a
                href="#engagement-predictor-card"
                id="header-virality-score-badge"
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold border transition-all ${
                  isDark
                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                }`}
                title={
                  language === "id"
                    ? "Skor Prediksi Viralitas AI (Klik untuk lihat Gauge Chart & Forecast)"
                    : "AI Virality Forecast Score (Click to view Gauge Chart & Forecast)"
                }
              >
                <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                <span>
                  Virality: {thread.engagementPrediction?.viralityScore || 88}/100
                </span>
              </a>

              {thread.articleSource && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-mono border ${
                    isDark
                      ? "text-blue-400/80 bg-[#0A0A0C] border-[#1E293B]"
                      : "text-blue-700 bg-slate-100 border-slate-200"
                  }`}
                >
                  {thread.articleSource}
                </span>
              )}
            </div>

            <h2
              className={`text-base sm:text-lg font-bold line-clamp-1 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {thread.articleTitle}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary 'Copy to Clipboard' Button */}
            <button
              id="copy-to-clipboard-btn"
              data-testid="copy-to-clipboard-btn"
              onClick={() => handleCopyThreadToClipboard(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-md ${
                copiedAll
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50"
                  : isDark
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-[0.98]"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-[0.98]"
              }`}
              title={
                language === "id"
                  ? "Salin seluruh isi thread ke clipboard perangkat Anda"
                  : "Copy entire generated thread to clipboard"
              }
              aria-label="Copy to Clipboard"
            >
              {copiedAll ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>
                    {language === "id"
                      ? "Tersalin ke Clipboard!"
                      : "Copied to Clipboard!"}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>
                    {language === "id"
                      ? "Salin ke Clipboard"
                      : "Copy to Clipboard"}
                  </span>
                </>
              )}
            </button>

            <button
              id="share-intent-btn"
              onClick={handleShareIntent}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                isDark
                  ? "bg-white text-black hover:bg-slate-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
              }`}
              title={
                thread.platform === "twitter"
                  ? "Buka di X (Twitter)"
                  : "Posting ke Threads"
              }
            >
              <ExternalLink
                className={`h-3.5 w-3.5 ${
                  isDark ? "text-blue-600" : "text-white"
                }`}
              />
              <span>
                {thread.platform === "twitter"
                  ? "Post to X"
                  : "Post to Threads"}
              </span>
            </button>

            <button
              id="save-to-library-btn"
              onClick={() => onSaveThread(thread)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] text-slate-300 hover:text-white border-[#1E293B]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              <span>{language === "id" ? "Simpan" : "Save"}</span>
            </button>

            {/* Schedule Post Button */}
            <button
              id="schedule-thread-btn"
              onClick={() => setIsScheduleModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                thread.scheduledInfo
                  ? "bg-blue-600/15 text-blue-400 border-blue-500/40 hover:bg-blue-600/25"
                  : isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] text-slate-300 hover:text-white border-[#1E293B]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200"
              }`}
              title={
                thread.scheduledInfo
                  ? language === "id"
                    ? `Terjadwal untuk ${thread.scheduledInfo.scheduledDate} ${thread.scheduledInfo.scheduledTime} (Klik untuk edit/batalkan)`
                    : `Scheduled for ${thread.scheduledInfo.scheduledDate} ${thread.scheduledInfo.scheduledTime} (Click to edit/cancel)`
                  : language === "id"
                  ? "Jadwalkan Thread untuk diposting"
                  : "Schedule thread for posting"
              }
            >
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>
                {thread.scheduledInfo
                  ? language === "id"
                    ? "Terjadwal"
                    : "Scheduled"
                  : language === "id"
                  ? "Jadwalkan"
                  : "Schedule"}
              </span>
              {thread.scheduledInfo && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Export PDF Document Button */}
            <button
              id="export-pdf-btn"
              onClick={() => setIsPdfModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] text-slate-300 hover:text-white border-[#1E293B]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200"
              }`}
              title={
                language === "id"
                  ? "Ekspor Thread ke Dokumen PDF (Cetak / Simpan Offline)"
                  : "Export thread as PDF document (Print / Save Offline)"
              }
            >
              <FileDown className="h-3.5 w-3.5 text-rose-400" />
              <span>PDF</span>
            </button>

            <button
              id="export-md-btn"
              onClick={handleExportMarkdown}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] text-slate-400 hover:text-white border-[#1E293B]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
              title="Download Markdown"
            >
              <FileText className="h-4 w-4" />
            </button>

            <button
              id="regenerate-btn"
              onClick={onRegenerate}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] text-slate-400 hover:text-white border-[#1E293B]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"
              }`}
              title={
                language === "id" ? "Generate Ulang" : "Regenerate Thread"
              }
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Pacing & Reading Speed Breakdown Card */}
        <div
          id="content-pacing-bar"
          className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isDark
              ? "bg-[#0A0A0C] border-[#1E293B]"
              : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium">
              <Gauge className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                {language === "id" ? "Pacing Konten:" : "Content Pacing:"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-semibold border text-[11px] ${
                  isDark
                    ? stats.pacingStatus.darkColorClass
                    : stats.pacingStatus.colorClass
                }`}
              >
                {stats.pacingStatus.label}
              </span>
            </div>

            <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>

            <div className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <span>📊</span>
              <span>
                <strong>{stats.totalWords}</strong> {language === "id" ? "kata" : "words"} ({stats.totalChars} chars)
              </span>
            </div>

            <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>

            <div className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>
                <strong>~{stats.avgSecondsPerPost}s</strong> {language === "id" ? "per post" : "per post"}
              </span>
            </div>
          </div>

          <div
            className={`text-[11px] flex items-center gap-1 italic ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Info className="h-3 w-3 shrink-0 text-blue-500" />
            <span>{stats.pacingStatus.description}</span>
          </div>
        </div>

        {/* Persona Quick-Remixer Bar (1-Click Transform) */}
        <div
          id="persona-quick-remixer-bar"
          className={`mt-3 p-3 sm:p-3.5 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs transition-all ${
            isDark
              ? "bg-[#0c1017] border-blue-500/30 text-slate-300"
              : "bg-blue-50/70 border-blue-200 text-slate-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border shrink-0 ${
              isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-100 border-blue-200 text-blue-700"
            }`}>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {language === "id" ? "Transformasi Persona Thread (1-Click Remix):" : "1-Click Persona Remixer:"}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isDark ? "bg-[#0A0A0C] border-[#1E293B] text-slate-400" : "bg-white border-slate-200 text-slate-600"
                }`}>
                  {getPersonaLabel(thread.tone)}
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {language === "id"
                  ? "Ubah seluruh nada thread ke Gen-Z, Milenial, Boomer, Programmer, atau Hacker secara instan tanpa merusak fakta."
                  : "Transform full thread voice to Gen-Z, Millennial, Boomer, Dev, or Hacker instantly."}
              </p>
            </div>
          </div>

          {/* Persona Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "gen_z", label: "💅 Gen-Z", title: "Slang kekinian, no cap, periodt" },
              { id: "millennial", label: "☕ Milenial", title: "Adulting, kopi senja, witty" },
              { id: "boomer", label: "🌸 Boomer WA", title: "Salam santun, petuah bijak & doa 🙏" },
              { id: "programmer", label: "💻 Programmer", title: "Git commit, bug, clean code" },
              { id: "hacker", label: "🕶️ Hacker", title: "Terminal console, zero-day intel" },
              { id: "viral_story", label: "🚀 Viral Story", title: "Curiosity gap tinggi" },
            ].map((p) => {
              const isCurrent = thread.tone === p.id;
              const isRemixingThis = isRemixingPersona === p.id;
              return (
                <button
                  key={p.id}
                  id={`remix-persona-${p.id}-btn`}
                  type="button"
                  disabled={!!isRemixingPersona}
                  onClick={() => handleRemixThreadPersona(p.id as ToneType)}
                  title={p.title}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border flex items-center gap-1.5 ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 ring-1 ring-blue-400"
                      : isDark
                      ? "bg-[#111114] border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600 hover:bg-[#16161c]"
                      : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm"
                  } ${isRemixingThis ? "animate-pulse" : ""}`}
                >
                  {isRemixingThis ? (
                    <Loader2 className="h-3 w-3 animate-spin text-white" />
                  ) : null}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div
          className={`mt-4 pt-3.5 border-t flex items-center justify-between flex-wrap gap-2 ${
            isDark ? "border-[#1E293B]" : "border-slate-200"
          }`}
        >
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
              isDark
                ? "bg-[#0A0A0C] border-[#1E293B]"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              id="view-threads-tab"
              onClick={() => setViewMode("threads_mockup")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "threads_mockup"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <AtSign className="h-3.5 w-3.5" />
              <span>Threads Mockup</span>
            </button>
            <button
              id="view-twitter-tab"
              onClick={() => setViewMode("twitter_mockup")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "twitter_mockup"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Twitter className="h-3.5 w-3.5" />
              <span>X (Twitter) Feed</span>
            </button>
            <button
              id="view-cards-tab"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Editor Cards</span>
            </button>
            <button
              id="view-carousel-tab"
              onClick={() => setViewMode("carousel")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "carousel"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Slide Carousel</span>
            </button>
            <button
              id="view-plaintext-tab"
              onClick={() => setViewMode("plaintext")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "plaintext"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Raw Text</span>
            </button>

            <button
              id="view-social-preview-tab"
              data-testid="view-social-preview-tab"
              onClick={() => setViewMode("social_preview")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === "social_preview"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20"
                  : isDark
                  ? "text-blue-400 hover:text-white hover:bg-blue-600/10"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>✨ {language === "id" ? "3D Social Preview" : "3D Social Preview"}</span>
            </button>
          </div>

          <div
            className={`text-xs flex items-center gap-2 ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            <span>
              💡{" "}
              {language === "id"
                ? "Klik teks untuk mengedit langsung"
                : "Click any text to edit inline"}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW: Threads Realistic Mockup */}
      {viewMode === "threads_mockup" && (
        <div
          className={`rounded-2xl p-6 sm:p-8 border space-y-4 transition-colors duration-200 ${
            isDark
              ? "bg-[#111114] border-[#1E293B] shadow-2xl"
              : "bg-white border-slate-200 shadow-xl"
          }`}
        >
          <div
            className={`flex items-center justify-between pb-4 border-b ${
              isDark ? "border-[#1E293B]" : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20">
                T
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold text-sm ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    threadly_writer
                  </span>
                  <span
                    className={`h-1 w-1 rounded-full ${
                      isDark ? "bg-slate-500" : "bg-slate-400"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    now
                  </span>
                </div>
                <span
                  className={`text-[11px] ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  News-to-Thread Engine
                </span>
              </div>
            </div>
            <div
              className={`text-xs px-3 py-1 rounded-full border font-mono flex items-center gap-1.5 ${
                isDark
                  ? "text-slate-400 bg-[#0A0A0C] border-[#1E293B]"
                  : "text-slate-600 bg-slate-100 border-slate-200"
              }`}
            >
              <Clock className="h-3 w-3 text-blue-500" />
              <span>{stats.formattedTime} read</span>
            </div>
          </div>

          {/* Posts list connected with line */}
          <div className="space-y-4 pt-2">
            {thread.posts.map((post, idx) => {
              const charLimit = getCharLimit();
              const charCount = post.content.length;
              const wordCount = countWords(post.content);
              const isOverLimit = charCount > charLimit;
              const isFirst = idx === 0;
              const postReadingTime = getPostReadingTime(post.content);

              return (
                <div
                  key={post.id}
                  className={`p-5 rounded-2xl relative border transition-all ${
                    isDark
                      ? "bg-[#0A0A0C] border-[#1E293B] hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  {/* Number Badge */}
                  <div
                    className={`absolute -left-3 top-6 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ${
                      isFirst
                        ? "bg-blue-600 shadow-blue-600/30"
                        : isDark
                        ? "bg-slate-700"
                        : "bg-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Top Bar for Post: Highlight Tag + Individual Reading Time */}
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    {post.keyHighlight ? (
                      <div
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        • {post.keyHighlight}
                      </div>
                    ) : (
                      <div className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Post #{idx + 1}
                      </div>
                    )}

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isDark
                          ? "bg-[#111114] text-slate-400 border-[#1E293B]"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                      title={`${wordCount} kata`}
                    >
                      <Clock className="h-2.5 w-2.5 text-blue-500" />
                      <span>{postReadingTime}</span>
                      <span>•</span>
                      <span>{wordCount} w</span>
                    </span>
                  </div>

                  {/* Editable Text Area */}
                  <textarea
                    rows={Math.max(3, Math.ceil(post.content.length / 55))}
                    value={post.content}
                    onChange={(e) =>
                      handleContentChange(post.id, e.target.value)
                    }
                    className={`w-full bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-lg p-1 resize-none leading-relaxed font-sans ${
                      isDark ? "text-[#E2E8F0]" : "text-slate-900"
                    }`}
                  />

                  {/* Image Prompt Box (if enabled) */}
                  {post.imagePrompt && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs ${
                        isDark
                          ? "bg-[#111114] border-[#1E293B]"
                          : "bg-white border-amber-200/80 shadow-sm"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between mb-1 ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        <span
                          className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                            isDark ? "text-amber-300/90" : "text-amber-700"
                          }`}
                        >
                          <ImageIcon
                            className={`h-3.5 w-3.5 ${
                              isDark ? "text-amber-400" : "text-amber-600"
                            }`}
                          />{" "}
                          AI Visual Prompt:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyPrompt(post.id, post.imagePrompt!)
                          }
                          className={`text-[10px] flex items-center gap-1 font-medium ${
                            isDark
                              ? "text-blue-400 hover:text-blue-300"
                              : "text-blue-600 hover:text-blue-700"
                          }`}
                        >
                          {copiedPromptId === post.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>
                            {copiedPromptId === post.id
                              ? "Copied"
                              : "Copy Prompt"}
                          </span>
                        </button>
                      </div>
                      <p
                        className={`text-[11px] italic ${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        "{post.imagePrompt}"
                      </p>
                    </div>
                  )}

                  {/* Footer Actions per Post */}
                  <div
                    className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
                      isDark
                        ? "border-[#1E293B] text-slate-400"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {/* Meta Interaction Icons */}
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
                        <Repeat2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex items-center gap-1 hover:text-sky-500 transition-colors">
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Character count + Post Tools */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono ${
                          isOverLimit
                            ? "text-rose-500 font-bold"
                            : isDark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        {charCount}/{charLimit}
                      </span>

                      {/* Quick AI Refine Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveRefineDropdown(
                              activeRefineDropdown === post.id
                                ? null
                                : post.id
                            )
                          }
                          disabled={refiningPostId === post.id}
                          className={`px-2.5 py-1 rounded-md border text-[11px] flex items-center gap-1 transition-colors ${
                            isDark
                              ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/20"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                        >
                          <Wand2 className="h-3 w-3" />
                          <span>
                            {refiningPostId === post.id
                              ? "Refining..."
                              : "AI Polish"}
                          </span>
                          <ChevronDown className="h-2.5 w-2.5" />
                        </button>

                        {activeRefineDropdown === post.id && (
                          <div
                            className={`absolute right-0 bottom-full mb-1 w-64 rounded-xl shadow-2xl p-1.5 z-30 text-xs space-y-0.5 border max-h-72 overflow-y-auto ${
                              isDark
                                ? "bg-[#111114] border-[#1E293B] text-slate-200"
                                : "bg-white border-slate-200 text-slate-800"
                            }`}
                          >
                            <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b mb-1 ${
                              isDark ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-100"
                            }`}>
                              {language === "id" ? "Transformasi Persona & Gaya:" : "Voice Persona Actions:"}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRefinePost(post.id, "gen_z")}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              💅 Ubah ke Gaya Gen-Z (Slang & No Cap)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefinePost(post.id, "millennial")}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              ☕ Ubah ke Gaya Milenial (Adulting & Witty)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefinePost(post.id, "boomer")}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              🌸 Ubah ke Gaya Boomer WA (Berkah 🙏)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefinePost(post.id, "programmer")}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              💻 Ubah ke Programmer (Dev & Code)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRefinePost(post.id, "hacker")}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              🕶️ Ubah ke Hacker (Terminal Intel)
                            </button>
                            <div className={`my-1 border-t ${isDark ? "border-slate-800" : "border-slate-100"}`} />
                            <button
                              type="button"
                              onClick={() => handleRefinePost(post.id, "humanize")}
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium ${
                                isDark
                                  ? "hover:bg-emerald-600/20 hover:text-emerald-300 text-emerald-400"
                                  : "hover:bg-emerald-50 hover:text-emerald-700 text-emerald-700"
                              }`}
                            >
                              ✨ Humanize (Hapus AI Slop)
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRefinePost(post.id, "punchier")
                              }
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              ⚡ Lebih Punchy & Nendang
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRefinePost(post.id, "shorten")
                              }
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              ✂️ Persingkat & Padat
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRefinePost(post.id, "casual")
                              }
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              💬 Gaya Lebih Santai
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRefinePost(post.id, "translate")
                              }
                              className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                isDark
                                  ? "hover:bg-blue-600/20 hover:text-blue-300 text-slate-200"
                                  : "hover:bg-blue-50 hover:text-blue-700 text-slate-700"
                              }`}
                            >
                              🌐 Terjemahkan ({thread.language === "id" ? "EN" : "ID"})
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Copy Single */}
                      <button
                        type="button"
                        onClick={() =>
                          handleCopySingle(post.id, post.content)
                        }
                        className={`p-1 rounded-md ${
                          isDark
                            ? "hover:bg-[#1E293B] text-slate-400 hover:text-white"
                            : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                        title="Salin post ini"
                      >
                        {copiedPostId === post.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Reorder / Delete */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMovePost(idx, "up")}
                          disabled={idx === 0}
                          className={`p-1 rounded disabled:opacity-30 ${
                            isDark
                              ? "hover:bg-[#1E293B] text-slate-400"
                              : "hover:bg-slate-200 text-slate-600"
                          }`}
                          title="Pindah ke atas"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePost(idx, "down")}
                          disabled={idx === thread.posts.length - 1}
                          className={`p-1 rounded disabled:opacity-30 ${
                            isDark
                              ? "hover:bg-[#1E293B] text-slate-400"
                              : "hover:bg-slate-200 text-slate-600"
                          }`}
                          title="Pindah ke bawah"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className={`p-1 rounded ${
                            isDark
                              ? "hover:bg-rose-950/50 text-rose-400/80 hover:text-rose-400"
                              : "hover:bg-rose-100 text-rose-600"
                          }`}
                          title="Hapus post ini"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add post button in between */}
                  <div className="flex justify-center -mb-2 mt-2 opacity-30 hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleAddPost(idx)}
                      className={`px-3 py-0.5 text-[10px] rounded-full border flex items-center gap-1 transition-all ${
                        isDark
                          ? "bg-[#111114] hover:bg-blue-600 text-slate-300 hover:text-white border-[#1E293B]"
                          : "bg-white hover:bg-blue-600 text-slate-700 hover:text-white border-slate-300 shadow-sm"
                      }`}
                    >
                      <Plus className="h-2.5 w-2.5" /> Tambah Post di Sini
                    </button>
                  </div>
                </div>
              );
            })}

            {/* End of preview banner */}
            <div
              className={`border border-dashed p-5 rounded-2xl flex items-center justify-center italic text-xs ${
                isDark
                  ? "bg-[#111114] border-[#1E293B] text-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-500"
              }`}
            >
              End of generated thread preview • {stats.formattedTime} estimated read • Ready to post
            </div>
          </div>
        </div>
      )}

      {/* VIEW: X (Twitter) Mockup */}
      {viewMode === "twitter_mockup" && (
        <div
          className={`rounded-2xl p-6 sm:p-8 border space-y-4 transition-colors duration-200 ${
            isDark
              ? "bg-[#0A0A0C] border-[#1E293B] shadow-2xl"
              : "bg-white border-slate-200 shadow-xl"
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3.5 border-b text-xs ${
              isDark
                ? "border-[#1E293B] text-slate-400"
                : "border-slate-200 text-slate-500"
            }`}
          >
            <span
              className={`flex items-center gap-2 font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              <Twitter className="h-4 w-4 text-sky-500" /> X (Twitter) Feed Preview
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span
                className={`px-2 py-0.5 rounded border text-[11px] ${
                  isDark
                    ? "bg-[#111114] border-[#1E293B] text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                ⏱️ {stats.formattedTime}
              </span>
              <span
                className={`${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                ({thread.posts.length} Tweets)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {thread.posts.map((post, idx) => {
              const charCount = post.content.length;
              const wordCount = countWords(post.content);
              const isOverLimit = charCount > 280;
              const postReadingTime = getPostReadingTime(post.content);

              return (
                <div
                  key={post.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark
                      ? "bg-[#111114] border-[#1E293B] hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`h-10 w-10 rounded-full border flex items-center justify-center font-bold text-sky-500 shrink-0 ${
                        isDark
                          ? "bg-[#0A0A0C] border-[#1E293B]"
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      𝕏
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-bold text-sm ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Threadly AI
                          </span>
                          <span className="text-sky-500 text-xs">☑️</span>
                          <span
                            className={`text-xs font-mono ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            @threadly_feed
                          </span>
                          <span
                            className={`text-xs font-mono ${
                              isDark ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            • {idx + 1}/{thread.posts.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              isDark
                                ? "bg-[#0A0A0C] text-slate-400 border-[#1E293B]"
                                : "bg-white text-slate-500 border-slate-200"
                            }`}
                          >
                            {postReadingTime}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopySingle(
                                post.id,
                                `${idx + 1}/${thread.posts.length}\n${
                                  post.content
                                }`
                              )
                            }
                            className={`text-xs flex items-center gap-1 ${
                              isDark
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            {copiedPostId === post.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={Math.max(3, Math.ceil(post.content.length / 50))}
                        value={post.content}
                        onChange={(e) =>
                          handleContentChange(post.id, e.target.value)
                        }
                        className={`w-full mt-2 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 rounded p-1 resize-none leading-relaxed ${
                          isDark ? "text-slate-100" : "text-slate-900"
                        }`}
                      />

                      {/* Character limit bar */}
                      <div
                        className={`mt-2.5 pt-2.5 border-t flex items-center justify-between text-xs ${
                          isDark
                            ? "border-[#1E293B]"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[11px] ${
                              isOverLimit
                                ? "text-rose-500 font-bold"
                                : isDark
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {charCount}/280 char
                          </span>
                          <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>
                          <span className={`font-mono text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {wordCount} words
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleRefinePost(post.id, "shorten")
                            }
                            className="text-[11px] text-sky-500 hover:underline font-medium"
                          >
                            ✂️ Singkatkan ke 280
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: Studio Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {thread.posts.map((post, idx) => {
            const postReadingTime = getPostReadingTime(post.content);
            const wordCount = countWords(post.content);

            return (
              <div
                key={post.id}
                className={`rounded-2xl p-5 flex flex-col justify-between border transition-colors duration-200 ${
                  isDark
                    ? "bg-[#111114] border-[#1E293B] shadow-lg shadow-black/20"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                          isDark
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}
                      >
                        Post #{idx + 1}
                      </span>
                      <span
                        className={`text-[11px] font-mono flex items-center gap-1 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        <Clock className="h-3 w-3 text-blue-500" />
                        {postReadingTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          handleCopySingle(post.id, post.content)
                        }
                        className={`p-1 ${
                          isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {copiedPostId === post.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className={`p-1 ${
                          isDark
                            ? "text-rose-400/70 hover:text-rose-400"
                            : "text-rose-500 hover:text-rose-700"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    value={post.content}
                    onChange={(e) =>
                      handleContentChange(post.id, e.target.value)
                    }
                    className={`w-full rounded-xl p-3.5 text-sm leading-relaxed border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? "bg-[#0A0A0C] border-[#1E293B] text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div
                  className={`mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs ${
                    isDark
                      ? "border-[#1E293B] text-slate-400"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[11px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {post.content.length} karakter
                    </span>
                    <span className={isDark ? "text-slate-600" : "text-slate-300"}>•</span>
                    <span
                      className={`font-mono text-[11px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {wordCount} kata
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRefinePost(post.id, "punchier")}
                    className={`font-medium ${
                      isDark
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    ⚡ Polish AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: Slide Carousel Presentation View */}
      {viewMode === "carousel" && (
        <div className="max-w-xl mx-auto space-y-4">
          <div
            className={`aspect-square w-full rounded-2xl border p-8 flex flex-col justify-between shadow-2xl relative transition-colors duration-200 ${
              isDark
                ? "bg-gradient-to-br from-blue-950/40 via-[#111114] to-[#0A0A0C] border-blue-500/30 text-white"
                : "bg-gradient-to-br from-blue-50 via-white to-slate-50 border-blue-200 text-slate-900"
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              <span className="font-bold uppercase tracking-wider font-mono">
                Slide {activeSlide + 1} of {thread.posts.length}
              </span>
              <span className="font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getPostReadingTime(thread.posts[activeSlide]?.content || "")}
              </span>
            </div>

            <div className="my-auto">
              <p
                className={`text-lg sm:text-xl font-bold leading-relaxed whitespace-pre-line ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {thread.posts[activeSlide]?.content}
              </p>
            </div>

            <div
              className={`flex items-center justify-between pt-4 border-t text-xs ${
                isDark
                  ? "border-[#1E293B] text-slate-400"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              <span>Swipe ➔ ({stats.formattedTime} total read)</span>
              <span
                className={`font-mono ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {thread.suggestedHashtags.slice(0, 2).join(" ")}
              </span>
            </div>
          </div>

          {/* Carousel Slide Controller */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDark
                ? "bg-[#111114] border-[#1E293B]"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <button
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              disabled={activeSlide === 0}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] border-[#1E293B] text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
            >
              ◀ Slide Sebelumnya
            </button>
            <div className="flex gap-1.5">
              {thread.posts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === i
                      ? "w-6 bg-blue-600"
                      : isDark
                      ? "w-2 bg-slate-700"
                      : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() =>
                setActiveSlide(
                  Math.min(thread.posts.length - 1, activeSlide + 1)
                )
              }
              disabled={activeSlide === thread.posts.length - 1}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] border-[#1E293B] text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
            >
              Slide Berikutnya ▶
            </button>
          </div>
        </div>
      )}

      {/* VIEW: Plain Text Mode */}
      {viewMode === "plaintext" && (
        <div
          className={`rounded-2xl p-5 sm:p-7 space-y-3.5 border transition-colors duration-200 ${
            isDark
              ? "bg-[#111114] border-[#1E293B] shadow-xl"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Format Raw Teks Siap Copy
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  isDark
                    ? "bg-[#0A0A0C] border-[#1E293B] text-slate-400"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                ⏱️ {stats.formattedTime} • {stats.totalWords} words
              </span>
            </div>

            <button
              id="copy-plaintext-clipboard-btn"
              onClick={() => handleCopyThreadToClipboard(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                copiedAll
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : isDark
                  ? "bg-[#0A0A0C] hover:bg-[#1E293B] border-[#1E293B] text-blue-400 hover:text-blue-300"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-blue-600 hover:text-blue-700"
              }`}
            >
              {copiedAll ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>{language === "id" ? "Tersalin ke Clipboard!" : "Copied to Clipboard!"}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{language === "id" ? "Salin ke Clipboard" : "Copy to Clipboard"}</span>
                </>
              )}
            </button>
          </div>
          <textarea
            readOnly
            rows={14}
            value={thread.posts
              .map(
                (p, idx) =>
                  `[Post ${idx + 1}/${thread.posts.length} - ${getPostReadingTime(
                    p.content
                  )}]\n${p.content}`
              )
              .join("\n\n--------------------\n\n")}
            className={`w-full rounded-xl p-4 font-mono text-xs focus:outline-none leading-relaxed border ${
              isDark
                ? "bg-[#0A0A0C] border-[#1E293B] text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>
      )}

      {/* VIEW: 3D Glassmorphic Social Preview */}
      {viewMode === "social_preview" && (
        <SocialPreview
          thread={thread}
          language={language}
          theme={theme}
          onPostEdit={handleContentChange}
        />
      )}

      {/* Bottom Sticky Quick Action Bar: Copy to Clipboard */}
      <div
        id="bottom-thread-clipboard-bar"
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200 ${
          isDark
            ? "bg-[#111114] border-[#1E293B] shadow-xl"
            : "bg-white border-slate-200 shadow-md"
        }`}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDark
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : "bg-blue-50 border-blue-200 text-blue-600"
            }`}
          >
            <Copy className="h-5 w-5" />
          </div>
          <div>
            <div
              className={`font-semibold text-sm ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              {language === "id"
                ? "Siap membagikan thread ini?"
                : "Ready to publish or share?"}
            </div>
            <div
              className={`text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {language === "id"
                ? `${thread.posts.length} post siap salin • Estimasi ${stats.formattedTime} waktu baca`
                : `${thread.posts.length} posts formatted • Estimated ${stats.formattedTime} read time`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Schedule button */}
          <button
            id="schedule-thread-bottom-btn"
            onClick={() => setIsScheduleModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              thread.scheduledInfo
                ? "bg-blue-600/15 text-blue-400 border-blue-500/30 hover:bg-blue-600/25"
                : isDark
                ? "bg-[#111A2E] hover:bg-[#1E2D48] text-slate-300 border-[#253655]"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>
              {thread.scheduledInfo
                ? language === "id"
                  ? "Lihat Jadwal"
                  : "View Schedule"
                : language === "id"
                ? "Jadwalkan"
                : "Schedule"}
            </span>
          </button>

          {/* PDF Export button */}
          <button
            id="export-pdf-bottom-btn"
            onClick={() => setIsPdfModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? "bg-[#111A2E] hover:bg-[#1E2D48] text-slate-300 border-[#253655]"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <FileDown className="h-4 w-4 text-rose-400" />
            <span>{language === "id" ? "Ekspor PDF" : "Export PDF"}</span>
          </button>

          <button
            id="copy-to-clipboard-bottom-btn"
            data-testid="copy-to-clipboard-bottom-btn"
            onClick={() => handleCopyThreadToClipboard(true)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md ${
              copiedAll
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/50"
                : isDark
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 active:scale-[0.98]"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-[0.98]"
            }`}
          >
            {copiedAll ? (
              <>
                <Check className="h-4 w-4 text-white" />
                <span>
                  {language === "id"
                    ? "Tersalin ke Clipboard!"
                    : "Copied to Clipboard!"}
                </span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>
                  {language === "id"
                    ? "Salin ke Clipboard"
                    : "Copy to Clipboard"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        thread={thread}
        language={language}
        theme={isDark ? "dark" : "light"}
        onScheduleUpdated={(newSchedule) => {
          onUpdateThread({
            ...thread,
            scheduledInfo: newSchedule || undefined,
          });
        }}
        onNotify={(msg, type) => showToast(msg, type)}
      />

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        thread={thread}
        language={language}
        theme={isDark ? "dark" : "light"}
        onNotify={(msg, type) => showToast(msg, type)}
      />
    </div>
  );
};
