// lib/validations.ts
// All Zod schemas for API input validation

import { z } from "zod";

// ---- Auth ----
export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters").max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ---- Feedback ----
export const VALID_CHANNELS = [
  "support_ticket",
  "app_store",
  "nps_survey",
  "sales_call",
  "community",
  "other",
] as const;

export const CreateFeedbackSchema = z.object({
  content: z.string().min(1, "Feedback content is required").max(10000),
  channel: z.enum(VALID_CHANNELS),
  sourceRef: z.string().max(500).optional(),
  customerLabel: z.string().max(200).optional(),
});

export const UpdateFeedbackStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

export const FeedbackFiltersSchema = z.object({
  search: z.string().optional(),
  channel: z.array(z.enum(VALID_CHANNELS)).optional(),
  sentiment: z.array(z.enum(["POS", "NEU", "NEG"])).optional(),
  themeIds: z.array(z.string()).optional(),
  status: z.array(z.enum(["NEW", "REVIEWED", "ACTIONED"])).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ---- CSV Row ----
export const CsvRowSchema = z.object({
  content: z.string().min(1, "Content is required"),
  channel: z.enum(VALID_CHANNELS).default("other"),
  customer_label: z.string().optional(),
  created_at: z.string().optional(),
});

// ---- Theme ----
export const CreateThemeSchema = z.object({
  name: z.string().min(1, "Theme name is required").max(100),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(),
});

export const UpdateThemeSchema = CreateThemeSchema.partial();

// ---- Insights (Ask LOOP) ----
export const AskLoopSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
});

// ---- Reports ----
export const GenerateReportSchema = z.object({
  title: z.string().min(1, "Report title is required").max(200),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

// ---- Members ----
export const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

// ---- AI Classification response validation ----
export const ClassificationResponseSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(0).max(5),
  featureArea: z.string().min(1).max(100),
  rationale: z.string().min(1).max(500),
});

// ---- Workspace ----
export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>;
export type FeedbackFiltersInput = z.infer<typeof FeedbackFiltersSchema>;
export type CsvRowInput = z.infer<typeof CsvRowSchema>;
export type CreateThemeInput = z.infer<typeof CreateThemeSchema>;
export type AskLoopInput = z.infer<typeof AskLoopSchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type ClassificationResponse = z.infer<typeof ClassificationResponseSchema>;
