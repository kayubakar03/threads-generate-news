import { GeneratedThread, ScheduledPostConfig } from "../types";

/**
 * Generates an iCalendar (.ics) file content string for a scheduled thread post
 */
export function generateIcsCalendarEvent(
  thread: GeneratedThread,
  schedule: ScheduledPostConfig
): string {
  const [year, month, day] = schedule.scheduledDate.split("-").map(Number);
  const [hours, minutes] = schedule.scheduledTime.split(":").map(Number);

  // Scheduled date in UTC format for iCal
  const startDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min duration

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatIcsDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const dtStamp = formatIcsDate(new Date());
  const dtStart = formatIcsDate(startDate);
  const dtEnd = formatIcsDate(endDate);

  const cleanTitle = (thread.articleTitle || "Social Media Thread")
    .replace(/[,\n]/g, " ")
    .slice(0, 100);
  
  const threadSummary = thread.posts
    .map((p, i) => `[${i + 1}/${thread.posts.length}] ${p.content.slice(0, 80)}...`)
    .join("\\n");

  const description = `Scheduled ${schedule.platform.toUpperCase()} Thread: ${cleanTitle}\\n\\nPosts:\\n${threadSummary}\\n\\nScheduled via ThreadForge AI`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ThreadForge AI//Thread Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:threadforge-${schedule.id}@threadforge.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:🚀 Post Thread: ${cleanTitle}`,
    `DESCRIPTION:${description}`,
    `STATUS:CONFIRMED`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder to post thread: ${cleanTitle}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers a client-side download of the .ics file
 */
export function downloadIcsFile(
  thread: GeneratedThread,
  schedule: ScheduledPostConfig
) {
  const icsData = generateIcsCalendarEvent(thread, schedule);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeTitle = (thread.articleTitle || "thread")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 30);
  link.download = `schedule-${safeTitle}-${schedule.scheduledDate}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
