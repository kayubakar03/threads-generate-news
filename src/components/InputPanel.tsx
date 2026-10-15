import React, { useState } from "react";
import {
  Link2,
  FileText,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Loader2,
  AtSign,
  Twitter,
  Linkedin,
  Layers,
  Info,
} from "lucide-react";
import {
  PlatformType,
  ToneType,
  LanguageType,
  ThreadLengthType,
  GenerateThreadRequest,
  TrendingNewsItem,
  ThemeMode,
} from "../types";

interface InputPanelProps {
  language: LanguageType;
  isLoading: boolean;
  loadingStep: string;
  onGenerate: (data: GenerateThreadRequest) => void;
  trendingNews: TrendingNewsItem[];
  onSelectTrendingNews: (item: TrendingNewsItem) => void;
  theme?: ThemeMode;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  language,
  isLoading,
  loadingStep,
  onGenerate,
  trendingNews,
  onSelectTrendingNews,
  theme = "dark",
}) => {
  const isDark = theme === "dark";
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  
  // Generation Options
  const [platform, setPlatform] = useState<PlatformType>("threads");
  const [tone, setTone] = useState<ToneType>("gen_z");
  const [length, setLength] = useState<ThreadLengthType>("medium");
  const [targetAudience, setTargetAudience] = useState<string>("general");
  const [hookFormula, setHookFormula] = useState<string>("curiosity_gap");
  const [humanizeLevel, setHumanizeLevel] = useState<"standard" | "hyper_human">("hyper_human");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeImagePrompts, setIncludeImagePrompts] = useState(true);
  const [includeSourceLink, setIncludeSourceLink] = useState(true);
  const [customInstructions, setCustomInstructions] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toneCategory, setToneCategory] = useState<"generations" | "standard">("generations");

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.startsWith("http://") || text.startsWith("https://")) {
          setUrl(text);
          setInputMode("url");
        } else {
          setRawText(text);
          setInputMode("text");
        }
      }
    } catch {
      // Clipboard access not granted or unavailable in iframe
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === "url" && !url.trim()) return;
    if (inputMode === "text" && !rawText.trim()) return;

    onGenerate({
      url: inputMode === "url" ? url.trim() : undefined,
      rawText: inputMode === "text" ? rawText.trim() : undefined,
      articleTitle: articleTitle.trim() || undefined,
      platform,
      tone,
      language,
      length,
      includeEmojis,
      includeHashtags,
      includeImagePrompts,
      includeSourceLink,
      customInstructions: customInstructions.trim() || undefined,
      targetAudience,
      humanizeLevel,
      hookFormula,
    });
  };

  const platforms: { id: PlatformType; label: string; icon: any; note: string }[] = [
    {
      id: "threads",
      label: "Meta Threads",
      icon: AtSign,
      note: language === "id" ? "Gaya luwes, santai, max 500 char" : "Conversational, engaging, 500 char limit",
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      icon: Twitter,
      note: language === "id" ? "Format 1/n, tajam, max 280 char" : "Numbered 1/n, tight 280 char limit",
    },
    {
      id: "linkedin",
      label: "LinkedIn Post",
      icon: Linkedin,
      note: language === "id" ? "Insight profesional & berbobot" : "Executive insights & storytelling",
    },
    {
      id: "instagram_carousel",
      label: "IG Carousel",
      icon: Layers,
      note: language === "id" ? "Format Slide per Slide" : "Slide-by-slide swipeable structure",
    },
  ];

  interface ToneItem {
    id: ToneType;
    title: string;
    desc: string;
    emoji: string;
    category: "generations" | "standard";
    badge?: string;
    sampleId: string;
    sampleEn: string;
  }

  const toneOptions: ToneItem[] = [
    // Generasi & Karakter (New Requested Personas)
    {
      id: "gen_z",
      emoji: "💅",
      category: "generations",
      badge: "🔥 Trending Gen-Z",
      title: language === "id" ? "Gaya Gen-Z" : "Gen-Z Vibe",
      desc: language === "id" ? "Slang kekinian, no cap, spill the tea, aesthetic, relate bgt & anti-kaku" : "Slang, no cap, fr fr, aesthetic, periodt & unfiltered",
      sampleId: "“bjir ini real bgt no cap 😭 baru tau model AI skrg bisa secepat ini, spill prompt-nya dong min! periodt 🔥”",
      sampleEn: "“no cap this is actually insane fr fr 😭 60fps neural render on mobile? absolute cinema, periodt ✨”",
    },
    {
      id: "millennial",
      emoji: "☕",
      category: "generations",
      badge: "✨ Relatable",
      title: language === "id" ? "Gen Milenial" : "Millennial Voice",
      desc: language === "id" ? "Kopi susu senja, adulting, witty, nostalgia 90s/2000s, quarter-life humor" : "Iced latte, adulting humor, 90s nostalgia, witty and reflective",
      sampleId: "“Setelah lelah lembur adulting dan segelas kopi susu senja, berita ini bener-bener relatable buat kaum quarter-life crisis ☕”",
      sampleEn: "“Sipping iced latte after a 10-hour sprint, reading this hits different. Adulting is hard, but tech keeps the spark alive ☕”",
    },
    {
      id: "boomer",
      emoji: "🌸",
      category: "generations",
      badge: "🙏 Wejangan Penuh Doa",
      title: language === "id" ? "Gen Boomer / WA" : "Boomer / WA Group",
      desc: language === "id" ? "Salam santun grup WA keluarga, petuah bijak, penuh doa berkah 🙏🌺!!" : "Warm family WhatsApp greeting, blessing, wisdom and good morning 🙏🌺!!",
      sampleId: "“Selamat pagi bapak ibu dan rekan sekalian 🙏 Semoga hari ini penuh berkah dan kesehatan. Mari kita simak hikmah kemajuan teknologi ini!! Sangat bermanfaat untuk anak cucu kita 🌺👍”",
      sampleEn: "“Good morning dear family and friends 🙏 Wishing you all abundant health and blessings. What a remarkable technology for our grandchildren to learn from!! 🙏🌸”",
    },
    {
      id: "programmer",
      emoji: "💻",
      category: "generations",
      badge: "⚡ Dev Humor",
      title: language === "id" ? "Programmer & Dev" : "Software Engineer",
      desc: language === "id" ? "Git commit, bug jam 2 pagi, merge conflict, clean code, stack trace humor" : "Git commit, 2 AM debugging, merge conflicts, clean architecture & tech debt",
      sampleId: "“git commit -m 'feat: optimize neural pipeline'. Akhirnya bisa tidur nyenyak tanpa bug ping Slack jam 2 pagi. Arsitekturnya clean, zero tech debt 💻🚀”",
      sampleEn: "“git commit -m 'fix: zero memory leak on WebGL render loop'. No more 2 AM PagerDuty alerts. Clean architecture always wins 💻⚡”",
    },
    {
      id: "hacker",
      emoji: "🕶️",
      category: "generations",
      badge: "🛡️ Cyberpunk",
      title: language === "id" ? "Hacker & Cyberpunk" : "Cyberpunk & Hacker",
      desc: language === "id" ? "Terminal console, zero-day intel, decrypted payload, tanpa filter PR" : "Terminal console, zero-day intel, decrypted payload, raw unfiltered telemetry",
      sampleId: "“Bypass corporate PR firewall. Decrypting telemetry payload: weights 8B unlocked, root access granted. Inilah kebenaran sistem di balik layar 🕶️🏴‍☠️”",
      sampleEn: "“Bypassing PR noise. Decrypting raw telemetry on the wire: root access granted. The zero-day future is already live 🕶️⚡”",
    },
    // Standar & Storytelling
    {
      id: "viral_story",
      emoji: "🚀",
      category: "standard",
      badge: "📈 Viral Gap",
      title: language === "id" ? "Viral Storytelling" : "Viral Storytelling",
      desc: language === "id" ? "Hook memikat & alur cerita beruntun (retensi tinggi)" : "High curiosity gap & captivating pacing",
      sampleId: "“Kabar ini baru dirilis 2 jam lalu dan langsung mengguncang Silicon Valley. Ini alasan kenapa 99% orang belum sadar dampaknya... 🧵👇”",
      sampleEn: "“This dropped 2 hours ago and already shook the industry. Here is the untold breakdown 99% of people missed 🧵👇”",
    },
    {
      id: "casual_tech",
      emoji: "⚡",
      category: "standard",
      badge: "💡 Startup",
      title: language === "id" ? "Kasual Anak Tech" : "Casual Techie",
      desc: language === "id" ? "Bahasa gaul pegiat AI & startup, cerdas tapi santai" : "Approachable, witty, modern tech enthusiast",
      sampleId: "“Buat kalian yang ngikutin AI & startup, rilis kali ini beneran game changer. Yuk kita bedah bareng kenapa ini bikin geger! ⚡”",
      sampleEn: "“For everyone building in AI and tech, this update is huge. Let's break down the practical highlights together ⚡”",
    },
    {
      id: "bullet_summary",
      emoji: "📋",
      category: "standard",
      badge: "⚡ To-the-point",
      title: language === "id" ? "Ringkas Poin-Poin" : "Bullet Summary",
      desc: language === "id" ? "To the point, sarat data, tanpa basa-basi" : "Direct, clear takeaways & critical facts",
      sampleId: "“• Poin 1: Kecepatan inferensi naik 3x lipat\n• Poin 2: Biaya komputasi hemat 50%\n• Poin 3: Siap pakai tanpa konfigurasi ribet 📋”",
      sampleEn: "“• 3x inference throughput\n• 50% lower compute cost\n• Production-ready out of the box 📋”",
    },
    {
      id: "deep_dive",
      emoji: "🔍",
      category: "standard",
      badge: "🧠 Deep Insight",
      title: language === "id" ? "Analisis Mendalam" : "Deep Dive Analysis",
      desc: language === "id" ? "Kupas tuntas 'why it matters' & implikasi masa depan" : "Comprehensive breakdown & strategic context",
      sampleId: "“Bukan sekadar update fitur, ini pergeseran paradigma arsitektur komputasi. Inilah analisis dampak 5 tahun ke depan 🔍”",
      sampleEn: "“Beyond the surface hype lies a fundamental architectural shift. Here's our comprehensive 5-year outlook 🔍”",
    },
    {
      id: "provocative_hook",
      emoji: "🔥",
      category: "standard",
      badge: "💬 Memicu Debat",
      title: language === "id" ? "Hook Provokatif" : "Debate Starter",
      desc: language === "id" ? "Tantang status quo & pancing diskusi hangat di komentar" : "Challenge common beliefs, spark debate",
      sampleId: "“Kalian salah besar kalau mengira teknologi ini hanya tren sesaat. Siap-siap terdisrupsi atau beradaptasi sekarang juga 🔥”",
      sampleEn: "“Most founders are looking at this all wrong. The consensus is mistaken—here is the uncomfortable truth 🔥”",
    },
    {
      id: "professional_exec",
      emoji: "👔",
      category: "standard",
      badge: "💼 Eksekutif",
      title: language === "id" ? "Eksekutif & Bisnis" : "Executive Briefing",
      desc: language === "id" ? "Format formal terstruktur untuk profesional industri" : "Structured, authoritative, business-first",
      sampleId: "“Executive briefing: Implikasi strategis, efisiensi alokasi modal, dan roadmap implementasi bagi pimpinan bisnis 👔”",
      sampleEn: "“Executive briefing: Strategic market implications, capital allocation efficiency, and enterprise deployment roadmap 👔”",
    },
  ];

  return (
    <div
      id="input-panel-card"
      className={`rounded-2xl p-5 sm:p-7 transition-colors duration-200 border ${
        isDark
          ? "bg-[#111114] border-[#1E293B] shadow-xl shadow-black/40 backdrop-blur-sm"
          : "bg-white border-slate-200 shadow-md shadow-slate-200/50"
      }`}
    >
      {/* Quick Curated AI News Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "id" ? "Trending AI News (Klik 1x Untuk Tes)" : "Trending AI News (1-Click Test)"}
            </h2>
          </div>
          <span className={`text-[11px] hidden sm:inline ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {language === "id" ? "Klik berita di bawah untuk langsung isi konten" : "Click to auto-populate source"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {trendingNews.map((item) => (
            <button
              key={item.id}
              id={`trending-btn-${item.id}`}
              type="button"
              onClick={() => {
                setInputMode("text");
                setArticleTitle(item.title);
                setRawText(item.rawContent || item.summary);
                setUrl(item.url);
                onSelectTrendingNews(item);
              }}
              className={`text-left p-3 rounded-xl border transition-all group flex flex-col justify-between ${
                isDark
                  ? "bg-[#0A0A0C] hover:bg-[#16161B] border-[#1E293B] hover:border-blue-500/50"
                  : "bg-slate-50 hover:bg-blue-50/60 border-slate-200 hover:border-blue-400 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                    isDark
                      ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                      : "text-blue-700 bg-blue-100 border-blue-200"
                  }`}>
                    {item.badge || item.category}
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {item.source}
                  </span>
                </div>
                <h4 className={`text-xs font-semibold line-clamp-1 transition-colors ${
                  isDark
                    ? "text-slate-200 group-hover:text-blue-300"
                    : "text-slate-900 group-hover:text-blue-700"
                }`}>
                  {item.title}
                </h4>
              </div>
              <p className={`text-[11px] line-clamp-1 mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {item.summary}
              </p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Selector Tabs */}
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
            isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              type="button"
              id="mode-url-tab"
              onClick={() => setInputMode("url")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                inputMode === "url"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>{language === "id" ? "Salin Link Berita (URL)" : "News URL Link"}</span>
            </button>
            <button
              type="button"
              id="mode-text-tab"
              onClick={() => setInputMode("text")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                inputMode === "text"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{language === "id" ? "Teks / Rangkuman Manual" : "Paste Text Content"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className={`text-xs transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg border ${
              isDark
                ? "text-slate-400 hover:text-white bg-[#0A0A0C] hover:bg-[#1E293B] border-[#1E293B]"
                : "text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm"
            }`}
          >
            <span>📋 {language === "id" ? "Tempel Clipboard" : "Paste Clipboard"}</span>
          </button>
        </div>

        {/* URL Input */}
        {inputMode === "url" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                {language === "id" ? "Sumber Berita (URL)" : "Input Source URL"}
              </h3>
              <span className={`text-[10px] font-mono ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Auto Article Extraction
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Link2 className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <input
                id="news-url-input"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://techcrunch.com/2026/... atau https://kompas.com/..."
                className={`w-full pl-10 pr-24 py-3.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark
                    ? "bg-[#0A0A0C] border-[#1E293B] text-slate-100 placeholder-slate-500 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-sm"
                }`}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className={`absolute inset-y-0 right-3 flex items-center text-xs ${
                    isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
            <p className={`text-[11px] flex items-center gap-1.5 mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              <Info className={`h-3.5 w-3.5 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              {language === "id"
                ? "AI akan otomatis membaca isi artikel, mengekstrak fakta utama, dan menyusun thread berdaya tarik tinggi."
                : "Gemini AI will fetch the webpage, extract key points, and write the complete thread."}
            </p>
          </div>
        ) : (
          /* Text Input */
          <div className="space-y-3">
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                {language === "id" ? "Judul Berita (Opsional):" : "Article Title (Optional):"}
              </h3>
              <input
                id="news-title-input"
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder={language === "id" ? "Misal: Rilis Model AI Baru..." : "e.g. New Breakthrough Model Released..."}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark
                    ? "bg-[#0A0A0C] border-[#1E293B] text-slate-100 placeholder-slate-500 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-sm"
                }`}
              />
            </div>
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                {language === "id" ? "Isi Teks Berita / Poin-Poin:" : "News Text / Summary:"}
              </h3>
              <textarea
                id="news-text-input"
                required
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  language === "id"
                    ? "Tempel teks berita, rilis pers, atau ringkasan yang ingin diubah menjadi Thread..."
                    : "Paste the news body, press release, or key bullet points here..."
                }
                className={`w-full p-4 border rounded-xl text-sm transition-colors resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark
                    ? "bg-[#0A0A0C] border-[#1E293B] text-slate-100 placeholder-slate-500 focus:border-blue-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-sm"
                }`}
              />
            </div>
          </div>
        )}

        {/* Platform Target Tabs */}
        <div>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {language === "id" ? "Format Platform Target" : "Target Platform"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {platforms.map((p) => {
              const Icon = p.icon;
              const isSelected = platform === p.id;
              return (
                <button
                  key={p.id}
                  id={`platform-btn-${p.id}`}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? isDark
                        ? "bg-blue-950/50 border-blue-500 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50"
                        : "bg-blue-50 border-blue-600 text-blue-950 shadow-md shadow-blue-500/10 ring-1 ring-blue-600/30"
                      : isDark
                        ? "bg-[#0A0A0C] border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-white shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${
                      isSelected
                        ? isDark ? "text-blue-400" : "text-blue-600"
                        : isDark ? "text-slate-400" : "text-slate-500"
                    }`} />
                    {isSelected && (
                      <span className={`h-2 w-2 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-600"}`} />
                    )}
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${isSelected ? (isDark ? "text-white" : "text-blue-950") : ""}`}>
                      {p.label}
                    </span>
                    <span className={`text-[10px] block line-clamp-1 mt-0.5 ${
                      isSelected ? (isDark ? "text-blue-200" : "text-blue-800") : (isDark ? "text-slate-500" : "text-slate-500")
                    }`}>
                      {p.note}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tone & Persona Selector */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                {language === "id" ? "Gaya Bahasa, Persona & Karakter" : "Voice Persona & Tone"}
              </h3>
              <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {language === "id"
                  ? "Pilih gaya tutur manusiawi: Gen-Z gaul, Milenial senja, Boomer WA, Programmer, atau Hacker"
                  : "Pick authentic human voices: Gen-Z slang, Millennial wit, Boomer family blessings, Dev, or Hacker"}
              </p>
            </div>

            {/* Persona Category Tabs */}
            <div className={`flex items-center p-0.5 rounded-lg border text-[11px] self-start sm:self-auto ${
              isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                type="button"
                id="tone-cat-gen-btn"
                onClick={() => setToneCategory("generations")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  toneCategory === "generations"
                    ? "bg-blue-600 text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {language === "id" ? "✨ Generasi & Karakter (5)" : "✨ Personas (5)"}
              </button>
              <button
                type="button"
                id="tone-cat-all-btn"
                onClick={() => setToneCategory("standard")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  toneCategory === "standard"
                    ? "bg-blue-600 text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {language === "id" ? "📰 Format Medsos (6)" : "📰 Formats (6)"}
              </button>
            </div>
          </div>

          {/* Tone Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {toneOptions
              .filter((t) => (toneCategory === "generations" ? t.category === "generations" : t.category === "standard"))
              .map((t) => {
                const isSelected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    id={`tone-btn-${t.id}`}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? isDark
                          ? "bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-500/60"
                          : "bg-blue-50 border-blue-600 text-blue-950 shadow-md ring-2 ring-blue-600/40"
                        : isDark
                          ? "bg-[#0A0A0C] border-[#1E293B] text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-white shadow-sm"
                    }`}
                  >
                    <div>
                      {t.badge && (
                        <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mb-1.5 border ${
                          isSelected
                            ? isDark
                              ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                              : "bg-blue-200/70 text-blue-900 border-blue-300"
                            : isDark
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-slate-200/80 text-slate-700 border-slate-300"
                        }`}>
                          {t.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{t.emoji}</span>
                        <span className={`text-xs font-semibold ${
                          isSelected
                            ? isDark ? "text-white font-bold" : "text-blue-950 font-bold"
                            : isDark ? "text-slate-200" : "text-slate-800"
                        }`}>
                          {t.title}
                        </span>
                      </div>
                      <p className={`text-[10px] line-clamp-2 leading-relaxed ${
                        isSelected
                          ? isDark ? "text-blue-200" : "text-blue-800"
                          : isDark ? "text-slate-400" : "text-slate-600"
                      }`}>
                        {t.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-1 border-t border-blue-500/30 flex items-center justify-between text-[10px]">
                        <span className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          ● {language === "id" ? "Aktif" : "Selected"}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Real-time Persona Voice Speech Bubble Preview */}
          {(() => {
            const currentItem = toneOptions.find((t) => t.id === tone);
            if (!currentItem) return null;
            return (
              <div className={`mt-3 p-3.5 rounded-xl border transition-all animate-in fade-in-50 ${
                isDark
                  ? "bg-[#0c1017] border-blue-500/30 text-slate-300 shadow-inner"
                  : "bg-blue-50/70 border-blue-200 text-slate-800 shadow-sm"
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span>{currentItem.emoji}</span>
                    <span className={isDark ? "text-blue-300" : "text-blue-800"}>
                      {language === "id" ? `Pratinjau Suara Manusiawi (${currentItem.title}):` : `Human Voice Sample (${currentItem.title}):`}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? "bg-blue-950 border-blue-800 text-blue-300" : "bg-white border-blue-200 text-blue-700"
                  }`}>
                    100% Anti-AI Slop
                  </span>
                </div>
                <p className={`text-xs italic leading-relaxed pl-2 border-l-2 ${
                  isDark ? "border-blue-500/50 text-slate-200" : "border-blue-500 text-slate-700"
                }`}>
                  {language === "id" ? currentItem.sampleId : currentItem.sampleEn}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Advanced Options Accordion */}
        <div className={`border-t pt-3.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
          <button
            type="button"
            id="toggle-advanced-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center justify-between w-full text-xs font-medium transition-colors py-1 ${
              isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className={`h-3.5 w-3.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              <span>
                {language === "id"
                  ? "Pengaturan Lanjutan (Panjang Thread, Hashtag, Prompt Visual)"
                  : "Advanced Configuration (Length, Hashtags, Visual Prompts)"}
              </span>
            </div>
            <span className={`text-xs font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              {showAdvanced ? "▲ Sembunyikan" : "▼ Tampilkan"}
            </span>
          </button>

          {showAdvanced && (
            <div className={`mt-3.5 p-4 rounded-xl border space-y-4 text-xs animate-in fade-in-50 ${
              isDark ? "bg-[#0A0A0C] border-[#1E293B]" : "bg-slate-50 border-slate-200"
            }`}>
              {/* Thread Length */}
              <div>
                <h4 className={`text-xs font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {language === "id" ? "Panjang / Jumlah Post:" : "Thread Length:"}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "short", label: language === "id" ? "Short (3-5)" : "Short (3-5)" },
                    { id: "medium", label: language === "id" ? "Med (6-8)" : "Med (6-8)" },
                    { id: "deep", label: language === "id" ? "Deep (9-12)" : "Deep (9-12)" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLength(l.id as ThreadLengthType)}
                      className={`py-2 px-3 rounded-lg border text-center font-bold text-xs transition-all ${
                        length === l.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : isDark
                            ? "bg-[#111114] border-[#1E293B] text-slate-400 hover:text-slate-200"
                            : "bg-white border-slate-200 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#111114] border-[#1E293B] hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}>
                  <input
                    type="checkbox"
                    checked={includeEmojis}
                    onChange={(e) => setIncludeEmojis(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}>✨ Emojis</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#111114] border-[#1E293B] hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}>
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => setIncludeHashtags(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}>#️⃣ Hashtags</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#111114] border-[#1E293B] hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}>
                  <input
                    type="checkbox"
                    checked={includeImagePrompts}
                    onChange={(e) => setIncludeImagePrompts(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}>🖼️ Visual Prompts</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  isDark
                    ? "bg-[#111114] border-[#1E293B] hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}>
                  <input
                    type="checkbox"
                    checked={includeSourceLink}
                    onChange={(e) => setIncludeSourceLink(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}>🔗 Source Link</span>
                </label>
              </div>

              {/* Target Audience & Hook Formula Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Target Audience */}
                <div>
                  <h4 className={`text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {language === "id" ? "🎯 Target Audiens Utama:" : "🎯 Target Audience:"}
                  </h4>
                  <select
                    id="target-audience-select"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark
                        ? "bg-[#111114] border-[#1E293B] text-slate-200"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="general">{language === "id" ? "Semua Kalangan (Umum)" : "General Public"}</option>
                    <option value="gen_z">{language === "id" ? "Gen-Z & Mahasiswa / Pelajar" : "Gen-Z & Students"}</option>
                    <option value="millennial">{language === "id" ? "Gen Milenial & Pekerja Muda" : "Millennials & Young Workers"}</option>
                    <option value="developers">{language === "id" ? "Developer & Software Engineer" : "Developers & Engineers"}</option>
                    <option value="founders">{language === "id" ? "Founder Startup & Eksekutif" : "Startup Founders & Execs"}</option>
                    <option value="boomers">{language === "id" ? "Orang Tua & Komunitas Senior" : "Seniors & Family Communities"}</option>
                  </select>
                </div>

                {/* Hook Formula */}
                <div>
                  <h4 className={`text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {language === "id" ? "🪝 Formula Hook Pembuka (Post 1):" : "🪝 Hook Strategy Formula:"}
                  </h4>
                  <select
                    id="hook-formula-select"
                    value={hookFormula}
                    onChange={(e) => setHookFormula(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark
                        ? "bg-[#111114] border-[#1E293B] text-slate-200"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="curiosity_gap">{language === "id" ? "Curiosity Gap (Memicu Rasa Penasaran)" : "Curiosity Gap (High Intrigue)"}</option>
                    <option value="contrarian">{language === "id" ? "Kontra-Intuitif (Debunk Mitos Umum)" : "Contrarian (Myth Busting)"}</option>
                    <option value="shocking_stat">{language === "id" ? "Fakta / Angka Mengejutkan" : "Shocking Stat or Figure"}</option>
                    <option value="story_personal">{language === "id" ? "Storytelling Personal / Pengalaman Nyata" : "Personal Story Arc"}</option>
                    <option value="fomo_urgency">{language === "id" ? "FOMO & Urgensi Masa Depan" : "FOMO & Urgency"}</option>
                  </select>
                </div>
              </div>

              {/* Anti-AI Slop Humanizer Level */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                isDark ? "bg-[#111114] border-[#1E293B]" : "bg-white border-blue-200 shadow-sm"
              }`}>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className={isDark ? "text-emerald-400" : "text-emerald-700"}>✨ Human-Voice First (Anti-AI Slop)</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {language === "id"
                      ? "Blokir frasa robotik AI klise. Ciptakan alur yang 100% natural, mengalir, dan bernyawa."
                      : "Strictly bans AI cliches. Generates 100% organic, vibrant, authentic human prose."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHumanizeLevel(humanizeLevel === "hyper_human" ? "standard" : "hyper_human")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    humanizeLevel === "hyper_human"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30"
                      : isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-300"
                  }`}
                >
                  {humanizeLevel === "hyper_human" ? "✓ Hyper-Human" : "Standard"}
                </button>
              </div>

              {/* Custom Instructions */}
              <div>
                <h4 className={`text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {language === "id"
                    ? "Instruksi Khusus Tambahan (Opsional):"
                    : "Custom Additional Directives (Optional):"}
                </h4>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={
                    language === "id"
                      ? "Misal: Fokuskan pada dampak bagi kreator pemula, atau gunakan istilah gen-Z..."
                      : "e.g. Emphasize developer productivity, keep it under 400 chars each..."
                  }
                  className={`w-full px-3.5 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark
                      ? "bg-[#111114] border-[#1E293B] text-slate-200 placeholder-slate-500 focus:border-blue-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-sm"
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            id="generate-thread-submit-btn"
            disabled={isLoading || (inputMode === "url" && !url) || (inputMode === "text" && !rawText)}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{loadingStep || (language === "id" ? "Meracik Thread..." : "Drafting Thread...")}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-blue-200" />
                <span>
                  {language === "id"
                    ? "Generate Thread Siap Posting"
                    : "Generate Thread"}
                </span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
          <p className={`text-[10px] text-center mt-3 uppercase tracking-[0.2em] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Powered by Google Gemini 3.7 Flash Engine
          </p>
        </div>
      </form>
    </div>
  );
};


