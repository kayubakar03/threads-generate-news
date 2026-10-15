import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  ExternalLink,
  Send,
  Download,
  ListFilter,
  Check,
} from "lucide-react";
import {
  GeneratedThread,
  LanguageType,
  PlatformType,
  ScheduledPostConfig,
  ThemeMode,
} from "../types";
import { downloadIcsFile } from "../utils/calendarExport";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: GeneratedThread;
  language?: LanguageType;
  theme?: ThemeMode;
  onScheduleUpdated: (schedule: ScheduledPostConfig | null) => void;
  onNotify?: (message: string, type?: "success" | "error" | "info") => void;
}

const STORAGE_KEY = "threadforge_scheduled_posts";

export function ScheduleModal({
  isOpen,
  onClose,
  thread,
  language = "id",
  theme = "dark",
  onScheduleUpdated,
  onNotify,
}: ScheduleModalProps) {
  const isDark = theme === "dark";

  // Active view tab: "schedule" (configure) or "queue" (view scheduled)
  const [activeTab, setActiveTab] = useState<"schedule" | "queue">("schedule");

  // Date and Time calculation helpers
  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [scheduledDate, setScheduledDate] = useState<string>(
    thread.scheduledInfo?.scheduledDate || getTomorrowDateStr()
  );
  const [scheduledTime, setScheduledTime] = useState<string>(
    thread.scheduledInfo?.scheduledTime || "09:30"
  );
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(
    thread.scheduledInfo?.platform || thread.platform || "threads"
  );
  const [timezone, setTimezone] = useState<string>(
    thread.scheduledInfo?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "Asia/Jakarta"
  );
  const [cadenceMinutes, setCadenceMinutes] = useState<number>(
    thread.scheduledInfo?.cadenceMinutes ?? 1
  );
  const [autoPlug, setAutoPlug] = useState<boolean>(
    thread.scheduledInfo?.autoPlugFirstReply ?? true
  );
  const [notes, setNotes] = useState<string>(
    thread.scheduledInfo?.notes || ""
  );

  const [scheduledList, setScheduledList] = useState<ScheduledPostConfig[]>([]);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);

  // Load saved scheduled queue from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setScheduledList(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  // Sync state if thread changes or modal opens
  useEffect(() => {
    if (thread.scheduledInfo) {
      setScheduledDate(thread.scheduledInfo.scheduledDate);
      setScheduledTime(thread.scheduledInfo.scheduledTime);
      setSelectedPlatform(thread.scheduledInfo.platform);
      setTimezone(thread.scheduledInfo.timezone);
      setCadenceMinutes(thread.scheduledInfo.cadenceMinutes);
      setAutoPlug(thread.scheduledInfo.autoPlugFirstReply);
      setNotes(thread.scheduledInfo.notes || "");
    }
  }, [thread, isOpen]);

  if (!isOpen) return null;

  // Preset time helpers
  const handleApplyPreset = (presetType: "morning" | "lunch" | "evening" | "ai_peak") => {
    const tomorrow = getTomorrowDateStr();
    setScheduledDate(tomorrow);

    if (presetType === "morning") {
      setScheduledTime("09:15");
    } else if (presetType === "lunch") {
      setScheduledTime("12:45");
    } else if (presetType === "evening") {
      setScheduledTime("19:30");
    } else if (presetType === "ai_peak") {
      // Use peak engagement window if available
      const windowStr = thread.engagementPrediction?.peakEngagementWindow;
      if (windowStr && windowStr.includes(":")) {
        const match = windowStr.match(/(\d{1,2}:\d{2})/);
        if (match) {
          setScheduledTime(match[1]);
          return;
        }
      }
      setScheduledTime("20:00");
    }
  };

  const handleSaveSchedule = () => {
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    const timestamp = scheduledDateTime.getTime();

    const newSchedule: ScheduledPostConfig = {
      id: thread.scheduledInfo?.id || `sched-${Date.now()}`,
      threadId: thread.id,
      threadTitle: thread.articleTitle || "Untitled Thread",
      platform: selectedPlatform,
      scheduledDate,
      scheduledTime,
      timezone,
      scheduledTimestamp: timestamp,
      cadenceMinutes,
      autoPlugFirstReply: autoPlug,
      notes,
      status: "scheduled",
      createdAt: Date.now(),
    };

    // Update queue list in localStorage
    const updatedList = [
      ...scheduledList.filter((item) => item.threadId !== thread.id),
      newSchedule,
    ].sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp);

    setScheduledList(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    onScheduleUpdated(newSchedule);
    setIsSuccessAnimated(true);

    if (onNotify) {
      onNotify(
        language === "id"
          ? `Thread berhasil dijadwalkan untuk ${scheduledDate} pukul ${scheduledTime}!`
          : `Thread successfully scheduled for ${scheduledDate} at ${scheduledTime}!`,
        "success"
      );
    }

    setTimeout(() => {
      setIsSuccessAnimated(false);
      onClose();
    }, 1200);
  };

  const handleCancelSchedule = () => {
    const updatedList = scheduledList.filter((item) => item.threadId !== thread.id);
    setScheduledList(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    onScheduleUpdated(null);

    if (onNotify) {
      onNotify(
        language === "id"
          ? "Jadwal posting berhasil dibatalkan."
          : "Scheduled post was cancelled.",
        "info"
      );
    }
  };

  const handlePublishNowMock = (schedId: string) => {
    const updated = scheduledList.map((item) =>
      item.id === schedId ? { ...item, status: "published" as const } : item
    );
    setScheduledList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (thread.scheduledInfo?.id === schedId) {
      onScheduleUpdated({
        ...thread.scheduledInfo,
        status: "published",
      });
    }

    if (onNotify) {
      onNotify(
        language === "id"
          ? "Simulasi publikasi sukses! Thread telah ditandai sebagai 'Terpublikasi'."
          : "Mock publish successful! Thread marked as 'Published'.",
        "success"
      );
    }
  };

  const handleRemoveFromQueue = (schedId: string) => {
    const updated = scheduledList.filter((item) => item.id !== schedId);
    setScheduledList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (thread.scheduledInfo?.id === schedId) {
      onScheduleUpdated(null);
    }
  };

  const handleDownloadCalendar = () => {
    const dummyConfig: ScheduledPostConfig = {
      id: thread.scheduledInfo?.id || `sched-${Date.now()}`,
      threadId: thread.id,
      threadTitle: thread.articleTitle,
      platform: selectedPlatform,
      scheduledDate,
      scheduledTime,
      timezone,
      scheduledTimestamp: new Date(`${scheduledDate}T${scheduledTime}:00`).getTime(),
      cadenceMinutes,
      autoPlugFirstReply: autoPlug,
      status: "scheduled",
      createdAt: Date.now(),
    };
    downloadIcsFile(thread, dummyConfig);
    if (onNotify) {
      onNotify(
        language === "id"
          ? "File kalender (.ics) berhasil diunduh! Buka untuk menambahkan ke Google / Apple Calendar."
          : "Calendar event (.ics) downloaded! Open to add to Google or Apple Calendar.",
        "success"
      );
    }
  };

  // Calculate countdown if scheduled
  const getCountdownString = () => {
    if (!thread.scheduledInfo) return "";
    const target = thread.scheduledInfo.scheduledTimestamp;
    const diff = target - Date.now();
    if (diff <= 0) {
      return language === "id" ? "Waktu posting telah tiba" : "Posting time reached";
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return language === "id"
      ? `dalam ${hours} jam ${minutes} menit`
      : `in ${hours} hrs ${minutes} mins`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
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
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>
                  {language === "id" ? "Jadwalkan Thread" : "Schedule Thread"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium capitalize">
                  {selectedPlatform}
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

        {/* Tab switch bar */}
        <div
          className={`flex border-b px-6 pt-2 gap-4 ${
            isDark ? "border-[#1E293B] bg-[#0D1527]" : "border-slate-100 bg-slate-50/50"
          }`}
        >
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "schedule"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{language === "id" ? "Konfigurasi Jadwal" : "Schedule Planner"}</span>
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "queue"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span>
              {language === "id" ? "Antrean Terjadwal" : "Scheduled Queue"}
            </span>
            {scheduledList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/20 text-blue-400 font-mono">
                {scheduledList.length}
              </span>
            )}
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "schedule" ? (
            <>
              {/* If already scheduled banner */}
              {thread.scheduledInfo && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    isDark
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>
                          {language === "id"
                            ? "Thread ini sedang terjadwal!"
                            : "This thread is actively scheduled!"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 font-medium">
                          {getCountdownString()}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {thread.scheduledInfo.scheduledDate} • {thread.scheduledInfo.scheduledTime} ({thread.scheduledInfo.timezone})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCancelSchedule}
                    className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium transition-colors"
                  >
                    {language === "id" ? "Batal" : "Cancel"}
                  </button>
                </div>
              )}

              {/* Quick AI & Timing Presets */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2.5 flex items-center justify-between ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    {language === "id" ? "Rekomendasi Waktu Posting" : "Smart Time Recommendations"}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {language === "id" ? "Klik untuk terapkan otomatis" : "Click to auto-fill"}
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("morning")}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                      isDark
                        ? "bg-[#162032] border-[#253248] hover:border-blue-500/50 hover:bg-blue-950/20"
                        : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="font-semibold text-blue-400 flex items-center justify-between">
                      <span>09:15 AM</span>
                      <span className="text-[10px] text-slate-400">🌅</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {language === "id" ? "Pagi (Morning Rush)" : "Morning Peak"}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset("lunch")}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                      isDark
                        ? "bg-[#162032] border-[#253248] hover:border-blue-500/50 hover:bg-blue-950/20"
                        : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="font-semibold text-blue-400 flex items-center justify-between">
                      <span>12:45 PM</span>
                      <span className="text-[10px] text-slate-400">🥪</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {language === "id" ? "Makan Siang" : "Lunch Break"}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset("evening")}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                      isDark
                        ? "bg-[#162032] border-[#253248] hover:border-blue-500/50 hover:bg-blue-950/20"
                        : "bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="font-semibold text-blue-400 flex items-center justify-between">
                      <span>19:30 PM</span>
                      <span className="text-[10px] text-slate-400">🌙</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {language === "id" ? "Malam Santai" : "Prime Evening"}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset("ai_peak")}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs relative overflow-hidden ${
                      isDark
                        ? "bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/40 hover:border-indigo-400"
                        : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-400"
                    }`}
                  >
                    <div className="font-bold text-indigo-400 flex items-center justify-between">
                      <span>AI Golden</span>
                      <Sparkles className="h-3 w-3 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {thread.engagementPrediction?.peakEngagementWindow || "20:00 WIB"}
                    </div>
                  </button>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="schedule-date-input"
                    className={`block text-xs font-semibold mb-1.5 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {language === "id" ? "Tanggal Posting" : "Publish Date"}
                  </label>
                  <div className="relative">
                    <input
                      id="schedule-date-input"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-colors ${
                        isDark
                          ? "bg-[#111A2E] border-[#23314B] focus:border-blue-500 text-white"
                          : "bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="schedule-time-input"
                    className={`block text-xs font-semibold mb-1.5 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {language === "id" ? "Waktu Posting" : "Publish Time"}
                  </label>
                  <input
                    id="schedule-time-input"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-colors ${
                      isDark
                        ? "bg-[#111A2E] border-[#23314B] focus:border-blue-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Timezone & Platform Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="schedule-timezone-select"
                    className={`block text-xs font-semibold mb-1.5 flex items-center gap-1 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    <Globe className="h-3 w-3 text-slate-400" />
                    <span>{language === "id" ? "Zona Waktu" : "Timezone"}</span>
                  </label>
                  <select
                    id="schedule-timezone-select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium outline-none transition-colors ${
                      isDark
                        ? "bg-[#111A2E] border-[#23314B] focus:border-blue-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900"
                    }`}
                  >
                    <option value="Asia/Jakarta">WIB (UTC+7) - Jakarta / Bandung</option>
                    <option value="Asia/Makassar">WITA (UTC+8) - Bali / Makassar</option>
                    <option value="Asia/Jayapura">WIT (UTC+9) - Papua</option>
                    <option value="Asia/Singapore">SGT (UTC+8) - Singapore / KL</option>
                    <option value="America/New_York">EST (UTC-5) - New York</option>
                    <option value="America/Los_Angeles">PST (UTC-8) - Los Angeles</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {language === "id" ? "Target Platform" : "Target Network"}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["threads", "twitter", "linkedin"] as PlatformType[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPlatform(p)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all capitalize ${
                          selectedPlatform === p
                            ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                            : isDark
                            ? "bg-[#111A2E] border-[#23314B] text-slate-400 hover:text-white"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {p === "twitter" ? "X / Twitter" : p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced posting parameters: cadence & auto-reply */}
              <div
                className={`p-4 rounded-xl border space-y-3.5 ${
                  isDark ? "bg-[#0C1322] border-[#1C263B]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold">
                      {language === "id" ? "Jeda Antar Tweet / Post" : "Thread Post Cadence"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === "id"
                        ? "Mencegah spam flag & memaksimalkan retensi pembaca"
                        : "Pacing intervals between tweets for natural flow"}
                    </div>
                  </div>
                  <select
                    value={cadenceMinutes}
                    onChange={(e) => setCadenceMinutes(Number(e.target.value))}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${
                      isDark
                        ? "bg-[#162033] border-[#2B3A54] text-white"
                        : "bg-white border-slate-300 text-slate-800"
                    }`}
                  >
                    <option value={0}>
                      {language === "id" ? "Sekaligus (Instan)" : "All at once"}
                    </option>
                    <option value={1}>1 menit antar post</option>
                    <option value={2}>2 menit antar post</option>
                    <option value={5}>5 menit antar post</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/20">
                  <div>
                    <div className="text-xs font-semibold">
                      {language === "id" ? "Sematkan CTA & Sumber Artikel" : "Auto-Plug CTA & Source"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {language === "id"
                        ? "Otomatis tambahkan ajakan interaksi & link artikel di post terakhir"
                        : "Append engagement call-to-action & original article link on final post"}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPlug}
                    onChange={(e) => setAutoPlug(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label
                  htmlFor="schedule-notes-input"
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {language === "id" ? "Catatan Internal (Opsional)" : "Internal Notes (Optional)"}
                </label>
                <input
                  id="schedule-notes-input"
                  type="text"
                  placeholder={
                    language === "id"
                      ? "Misal: Rilis bareng artikel blog / peluncuran fitur..."
                      : "e.g. Align with company product launch..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
                    isDark
                      ? "bg-[#111A2E] border-[#23314B] focus:border-blue-500 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </>
          ) : (
            /* Queue tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/20">
                <span className="text-xs font-semibold text-slate-400">
                  {language === "id"
                    ? `Total ${scheduledList.length} thread dalam antrean jadwal`
                    : `Total ${scheduledList.length} thread in scheduled queue`}
                </span>
                {scheduledList.length > 0 && (
                  <button
                    onClick={() => {
                      setScheduledList([]);
                      localStorage.removeItem(STORAGE_KEY);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    {language === "id" ? "Bersihkan Antrean" : "Clear All"}
                  </button>
                )}
              </div>

              {scheduledList.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Calendar className="h-10 w-10 text-slate-500 mx-auto opacity-50" />
                  <p className="text-xs text-slate-400">
                    {language === "id"
                      ? "Belum ada thread yang dijadwalkan."
                      : "No scheduled threads yet."}
                  </p>
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className="text-xs text-blue-400 hover:underline font-medium"
                  >
                    {language === "id" ? "Jadwalkan thread sekarang" : "Schedule a thread now"}
                  </button>
                </div>
              ) : (
                scheduledList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                      isDark
                        ? "bg-[#111A2E] border-[#23314B]"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate max-w-[240px]">
                          {item.threadTitle}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-semibold uppercase ${
                            item.status === "published"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>🗓 {item.scheduledDate}</span>
                        <span>⏰ {item.scheduledTime}</span>
                        <span>🌐 {item.timezone.split("/")[1] || item.timezone}</span>
                        <span className="capitalize text-blue-400 font-medium font-mono">
                          #{item.platform}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 italic">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.status !== "published" && (
                        <button
                          onClick={() => handlePublishNowMock(item.id)}
                          title={language === "id" ? "Simulasi Terbitkan Sekarang" : "Publish Now (Simulate)"}
                          className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFromQueue(item.id)}
                        title={language === "id" ? "Hapus dari Jadwal" : "Remove from queue"}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t gap-3 ${
            isDark ? "border-[#1E293B] bg-[#0B1120]" : "border-slate-100 bg-slate-50"
          }`}
        >
          {activeTab === "schedule" ? (
            <>
              {/* iCal download button */}
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? "bg-[#162033] hover:bg-[#1E2D48] text-slate-300 border-[#253655]"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
                title={
                  language === "id"
                    ? "Unduh file kalender (.ics) untuk Google Calendar atau Apple Calendar"
                    : "Download .ics calendar event file"
                }
              >
                <Download className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">
                  {language === "id" ? "Export Kalender (.ics)" : "Export .ICS"}
                </span>
                <span className="sm:hidden">.ICS</span>
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
                  {language === "id" ? "Tutup" : "Close"}
                </button>

                <button
                  id="confirm-schedule-btn"
                  type="button"
                  onClick={handleSaveSchedule}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                    isSuccessAnimated
                      ? "bg-emerald-600 shadow-emerald-500/30 scale-95"
                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-[0.98]"
                  }`}
                >
                  {isSuccessAnimated ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{language === "id" ? "Tersimpan!" : "Scheduled!"}</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      <span>
                        {thread.scheduledInfo
                          ? language === "id"
                            ? "Perbarui Jadwal"
                            : "Update Schedule"
                          : language === "id"
                          ? "Konfirmasi Jadwal"
                          : "Schedule Thread"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {language === "id" ? "Selesai" : "Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
