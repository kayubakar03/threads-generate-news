export type PlatformType = 'threads' | 'twitter' | 'linkedin' | 'instagram_carousel';

export type ThemeMode = 'dark' | 'light';

export type ToneType = 
  | 'viral_story'
  | 'casual_tech'
  | 'bullet_summary'
  | 'deep_dive'
  | 'provocative_hook'
  | 'professional_exec'
  | 'gen_z'
  | 'millennial'
  | 'boomer'
  | 'programmer'
  | 'hacker';

export type LanguageType = 'id' | 'en';

export type ThreadLengthType = 'short' | 'medium' | 'deep';

export interface ThreadPost {
  id: string;
  postNumber: number;
  content: string;
  imagePrompt?: string;
  suggestedHashtags?: string[];
  keyHighlight?: string;
}

export interface HookAnalysis {
  score: number; // 1-100
  type: string;
  whyItWorks: string;
  improvementTip: string;
  humanScore?: number; // 1-100 human voice & conversational authenticity
  emotionalTrigger?: string;
  curiosityScore?: number;
  retentionRate?: string;
}

export interface MetricRange {
  min: number;
  max: number;
  formatted: string;
}

export interface ViralityBoostTip {
  id: string;
  title: string;
  description: string;
  potentialScoreGain: number;
}

export interface EngagementPrediction {
  viralityScore: number; // 0-100 overall virality index
  viralityTier: 'cold' | 'moderate' | 'high' | 'viral' | 'breakout';
  tierLabel: string;
  forecastedLikes: MetricRange;
  forecastedShares: MetricRange;
  forecastedComments: MetricRange;
  forecastedBookmarks: MetricRange;
  forecastedImpressions: MetricRange;
  likeProbability: number; // 0-100
  shareabilityScore: number; // 0-100
  discussionScore: number; // 0-100 (comments catalyst)
  retentionScore: number; // 0-100
  peakEngagementWindow: string;
  audienceSentiment: string;
  keyViralityDrivers: string[];
  suggestedBoosts: ViralityBoostTip[];
  platformBenchmarkComparison: string;
  analyzedAt: number;
}

export interface ScheduledPostConfig {
  id: string;
  threadId: string;
  threadTitle: string;
  platform: PlatformType;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  timezone: string;
  scheduledTimestamp: number;
  cadenceMinutes: number; // 0 for all at once, 1, 2, 5 min
  autoPlugFirstReply: boolean;
  notes?: string;
  status: 'scheduled' | 'published' | 'cancelled';
  createdAt: number;
}

export interface GeneratedThread {
  id: string;
  originalUrl?: string;
  articleTitle: string;
  articleSource?: string;
  articleSummary: string;
  platform: PlatformType;
  tone: ToneType;
  language: LanguageType;
  posts: ThreadPost[];
  hookAnalysis: HookAnalysis;
  suggestedHashtags: string[];
  estimatedReadingTime: string;
  createdAt: number;
  favorite?: boolean;
  engagementPrediction?: EngagementPrediction;
  scheduledInfo?: ScheduledPostConfig;
}

export interface GenerateThreadRequest {
  url?: string;
  rawText?: string;
  articleTitle?: string;
  platform: PlatformType;
  tone: ToneType;
  language: LanguageType;
  length: ThreadLengthType;
  includeEmojis: boolean;
  includeHashtags: boolean;
  includeImagePrompts: boolean;
  includeSourceLink: boolean;
  customInstructions?: string;
  targetAudience?: string;
  humanizeLevel?: 'standard' | 'hyper_human';
  hookFormula?: string;
}

export interface TrendingNewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  url: string;
  badge?: string;
  rawContent?: string;
}
