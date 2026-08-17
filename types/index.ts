// types/index.ts
// Shared TypeScript types for the entire application

export type Role = "ADMIN" | "ANALYST" | "VIEWER";
export type Sentiment = "POS" | "NEU" | "NEG";
export type FeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED";
export type Channel =
  | "support_ticket"
  | "app_store"
  | "nps_survey"
  | "sales_call"
  | "community"
  | "portal"
  | "other";

// ---- Workspace ----
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

// ---- User ----
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  workspaceId: string;
  createdAt: Date;
}

// ---- Feedback ----
export interface Feedback {
  id: string;
  content: string;
  channel: Channel;
  sourceRef: string | null;
  customerLabel: string | null;
  sentiment: Sentiment | null;
  sentimentScore: number | null;
  featureArea: string | null;
  rationale: string | null;
  status: FeedbackStatus;
  classified: boolean;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
  themes?: ThemeRef[];
}

// ---- Theme ----
export interface Theme {
  id: string;
  name: string;
  description: string | null;
  color: string;
  workspaceId: string;
  createdAt: Date;
  _count?: { feedbackThemes: number };
}

export interface ThemeRef {
  theme: { id: string; name: string; color: string };
  confidence: number;
}

// ---- Report ----
export interface Report {
  id: string;
  title: string;
  periodStart: Date;
  periodEnd: Date;
  contentJson: ReportContent;
  createdAt: Date;
  workspaceId: string;
  generatedBy: { name: string | null; email: string };
}

export interface ReportContent {
  executiveSummary: string;
  topThemes: Array<{ name: string; count: number; delta: number }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    previousPositive: number;
    previousNegative: number;
  };
  notableQuotes: Array<{ content: string; channel: Channel; sentiment: Sentiment }>;
  recommendedActions: string[];
  totalItems: number;
  periodLabel: string;
}

// ---- AI Classification ----
export interface ClassificationResult {
  sentiment: Sentiment;
  sentimentScore: number;
  themes: string[];
  featureArea: string;
  rationale: string;
}

// ---- Ask LOOP ----
export interface AskLoopResponse {
  answer: string;
  citedItems: Feedback[];
  questionEmbedded: boolean;
}

// ---- API Responses ----
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalFeedback: number;
  negativePercent: number;
  newThisWeek: number;
  activeThemes: number;
}

export interface VolumeDataPoint {
  date: string;
  count: number;
}

export interface SentimentDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ThemeDataPoint {
  name: string;
  count: number;
  color: string;
}

// ---- Theme Trends ----
export interface ThemeTrendData {
  theme: Theme;
  weeklyData: Array<{ week: string; count: number }>;
  currentCount: number;
  previousCount: number;
  changePercent: number;
  isSpiking: boolean;
}

// ---- Filters ----
export interface FeedbackFilters {
  search?: string;
  channel?: Channel[];
  sentiment?: Sentiment[];
  themeIds?: string[];
  status?: FeedbackStatus[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ---- CSV Import ----
export interface CsvImportResult {
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}
