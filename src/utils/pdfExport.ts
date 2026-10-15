import { jsPDF } from "jspdf";
import { GeneratedThread } from "../types";

export interface PdfExportOptions {
  includeAnalytics?: boolean;
  includeImagePrompts?: boolean;
  includeHashtags?: boolean;
  includeMetadata?: boolean;
  paperSize?: "a4" | "letter";
  theme?: "modern_blue" | "minimal_dark" | "editorial_clean";
}

/**
 * Generates and downloads a clean, beautifully formatted vector PDF document from a GeneratedThread
 */
export function exportThreadToPdf(
  thread: GeneratedThread,
  options: PdfExportOptions = {}
): void {
  const {
    includeAnalytics = true,
    includeImagePrompts = true,
    includeHashtags = true,
    includeMetadata = true,
    paperSize = "a4",
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: paperSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Helper for adding new pages with consistent margin
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      cursorY = margin;
      drawPageDecorations();
      return true;
    }
    return false;
  };

  const drawPageDecorations = () => {
    // Subtle top border line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Subtle header label
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("THREADFORGE AI • SOCIAL THREAD EXPORT", margin, 10);
  };

  // --- HEADER SECTION ---
  drawPageDecorations();

  // Header Title
  cursorY += 8;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // slate-900

  const wrappedTitle = doc.splitTextToSize(thread.articleTitle || "Untitled Thread", contentWidth);
  doc.text(wrappedTitle, margin, cursorY);
  cursorY += wrappedTitle.length * 7.5 + 2;

  // Meta Badges row: Platform, Tone, Date, Posts Count
  if (includeMetadata) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500

    const platformLabel = (thread.platform || "threads").toUpperCase();
    const toneLabel = (thread.tone || "casual").replace(/_/g, " ").toUpperCase();
    const dateStr = new Date(thread.createdAt || Date.now()).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const metaText = `Platform: ${platformLabel}  |  Persona: ${toneLabel}  |  Posts: ${thread.posts.length}  |  Date: ${dateStr}`;
    doc.text(metaText, margin, cursorY);
    cursorY += 6;

    if (thread.originalUrl) {
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235); // blue-600
      const safeUrl = thread.originalUrl.length > 70 ? thread.originalUrl.slice(0, 67) + "..." : thread.originalUrl;
      doc.text(`Source: ${safeUrl}`, margin, cursorY);
      cursorY += 5;
    }
  }

  // --- OPTIONAL VIRALITY & ENGAGEMENT SCORE SUMMARY BOX ---
  if (includeAnalytics && thread.engagementPrediction) {
    const ep = thread.engagementPrediction;
    checkPageBreak(28);

    cursorY += 3;
    // Box background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, "FD");

    // Title inside box
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("AI ENGAGEMENT & VIRALITY FORECAST", margin + 4, cursorY + 6);

    // Virality score badge text
    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72); // rose-600
    const viralityText = `Virality Index: ${ep.viralityScore}/100 (${ep.tierLabel || ep.viralityTier.toUpperCase()})`;
    doc.text(viralityText, pageWidth - margin - 4 - doc.getTextWidth(viralityText), cursorY + 6);

    // Metrics summary items inside box
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // slate-600

    const colWidth = contentWidth / 4;
    const yMetrics = cursorY + 14;

    doc.text(`Likes: ${ep.forecastedLikes.formatted}`, margin + 4, yMetrics);
    doc.text(`Reposts: ${ep.forecastedShares.formatted}`, margin + 4 + colWidth, yMetrics);
    doc.text(`Comments: ${ep.forecastedComments.formatted}`, margin + 4 + colWidth * 2, yMetrics);
    doc.text(`Views: ${ep.forecastedImpressions.formatted}`, margin + 4 + colWidth * 3, yMetrics);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Peak Window: ${ep.peakEngagementWindow || "19:00 - 21:00"}  •  Audience: ${ep.audienceSentiment || "High Interest"}`,
      margin + 4,
      cursorY + 20
    );

    cursorY += 30;
  } else {
    cursorY += 4;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // --- POSTS LIST ---
  thread.posts.forEach((post, index) => {
    const isHook = index === 0;
    const postNumber = index + 1;
    const totalPosts = thread.posts.length;

    // Estimate height needed for this post card
    doc.setFontSize(10);
    const splitContent = doc.splitTextToSize(post.content, contentWidth - 8);
    const contentHeight = splitContent.length * 5.2;

    let extraHeight = 16; // Header and padding
    if (includeImagePrompts && post.imagePrompt) extraHeight += 12;
    if (includeHashtags && post.suggestedHashtags?.length) extraHeight += 8;

    const totalPostHeight = contentHeight + extraHeight;

    checkPageBreak(Math.min(totalPostHeight, 45));

    // Post Card Container
    doc.setFillColor(isHook ? 248 : 255, isHook ? 250 : 255, isHook ? 252 : 255);
    doc.setDrawColor(isHook ? 147 : 226, isHook ? 197 : 232, isHook ? 253 : 240); // blue border for hook
    doc.setLineWidth(isHook ? 0.6 : 0.3);
    doc.roundedRect(margin, cursorY, contentWidth, totalPostHeight, 2, 2, "FD");

    // Card Header Bar
    const headerY = cursorY + 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isHook ? 29 : 51, isHook ? 78 : 65, isHook ? 216 : 85); // blue-700 or slate-700
    doc.text(`POST ${postNumber} / ${totalPosts}${isHook ? "  •  VIRAL HOOK" : ""}`, margin + 4, headerY);

    // Character count indicator
    const charCountText = `${post.content.length} chars`;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(charCountText, pageWidth - margin - 4 - doc.getTextWidth(charCountText), headerY);

    // Card Body Text
    const bodyY = headerY + 5;
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(splitContent, margin + 4, bodyY);

    let nextY = bodyY + contentHeight;

    // Optional Image Prompt
    if (includeImagePrompts && post.imagePrompt) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      const promptText = `Visual Prompt: "${post.imagePrompt}"`;
      const splitPrompt = doc.splitTextToSize(promptText, contentWidth - 8);
      doc.text(splitPrompt, margin + 4, nextY + 2);
      nextY += splitPrompt.length * 4 + 2;
    }

    // Optional Hashtags
    if (includeHashtags && post.suggestedHashtags?.length) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(37, 99, 235); // blue-600
      const tagText = post.suggestedHashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
      doc.text(tagText, margin + 4, nextY + 2);
      nextY += 6;
    }

    cursorY += totalPostHeight + 6;
  });

  // --- FOOTER ON ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Footer Text
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("ThreadForge AI • High-Conversion Social Thread Suite", margin, pageHeight - 8);

    const pageNumberText = `Page ${i} of ${totalPages}`;
    doc.text(pageNumberText, pageWidth - margin - doc.getTextWidth(pageNumberText), pageHeight - 8);
  }

  // --- TRIGGER DOWNLOAD ---
  const safeTitle = (thread.articleTitle || "thread")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 35);
  doc.save(`${safeTitle}-thread.pdf`);
}
