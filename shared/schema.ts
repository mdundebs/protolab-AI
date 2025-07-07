import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  username: text("username").notNull(),
  password: text("password"),
  phone: text("phone").unique(),
  country: text("country"),
  carrier: text("carrier"),
  plan: text("plan").default("free"), // free, hustler_plus, founder, corporate, enterprise
  planExpiry: timestamp("plan_expiry"),
  subscriptionTier: text("subscription_tier").default("hustler"), // hustler, hustler+, founder, corporate, enterprise
  monthlyDecks: integer("monthly_decks").default(0),
  monthlyPatentChecks: integer("monthly_patent_checks").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  // User role and permissions
  role: text("role").default("user"), // user, admin, super_admin
  permissions: jsonb("permissions").default([]), // Array of specific permissions
  // Corporate account details
  companyName: text("company_name"),
  companySize: text("company_size"), // startup, small, medium, large, enterprise
  industry: text("industry"),
  jobTitle: text("job_title"),
  department: text("department"),
  // Advanced features access
  hasAnalyticsAccess: boolean("has_analytics_access").default(false),
  hasUserManagement: boolean("has_user_management").default(false),
  hasCustomBranding: boolean("has_custom_branding").default(false),
  hasPrioritySupport: boolean("has_priority_support").default(false),
  // Usage limits and tracking
  monthlyCredits: integer("monthly_credits").default(100),
  creditsUsed: integer("credits_used").default(0),
  apiCallsLimit: integer("api_calls_limit").default(1000),
  apiCallsUsed: integer("api_calls_used").default(0),
});

export const pitchRequests = pgTable("pitch_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  industry: text("industry").notNull(),
  country: text("country").notNull(),
  businessType: text("business_type").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, generating, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const pitchDecks = pgTable("pitch_decks", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => pitchRequests.id),
  content: jsonb("content"), // Generated pitch deck content
  pdfUrl: text("pdf_url"), // URL to generated PDF
  slides: jsonb("slides"), // Array of slide data
  insights: jsonb("insights"), // Market insights and key points
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  requestId: integer("request_id").references(() => pitchRequests.id),
  amount: integer("amount"), // Amount in cents
  currency: text("currency").default("USD"),
  type: text("type").default("deck"), // deck, addon, subscription
  status: text("status").default("pending"), // pending, completed, failed
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patentChecks = pgTable("patent_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  description: text("description").notNull(),
  noveltyScore: integer("novelty_score"),
  similarPatents: jsonb("similar_patents"),
  isPriority: boolean("is_priority").default(false),
  status: text("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const grants = pgTable("grants", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // AfDB, GCF, WorldBank, etc.
  title: text("title").notNull(),
  description: text("description"),
  amount: text("amount"),
  deadline: timestamp("deadline"),
  region: text("region"), // africa, global, etc.
  sectors: jsonb("sectors"), // array of applicable sectors
  eligibility: jsonb("eligibility"),
  applicationUrl: text("application_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const grantMatches = pgTable("grant_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  grantId: integer("grant_id").references(() => grants.id),
  matchScore: integer("match_score"), // 1-100
  notified: boolean("notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  team: jsonb("team").notNull(), // {academia: string[], privateSector: string[]}
  liveDocUrl: text("live_doc_url"),
  evidence: jsonb("evidence").default([]), // Evidence[]
  approvals: jsonb("approvals").default({}), // Record<string, Approval>
  status: text("status").default("draft"), // draft, review, approved, submitted
  activity: jsonb("activity").default([]), // Activity[]
  createdAt: timestamp("created_at").defaultNow(),
});

export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").references(() => proposals.id),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  tags: jsonb("tags").default([]), // string[]
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const userPatterns = pgTable("user_patterns", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  languageStyle: jsonb("language_style"),
  slideStructure: jsonb("slide_structure"),
  designPreferences: jsonb("design_preferences"),
  industryContext: jsonb("industry_context"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  insights: jsonb("insights").default([]), // string[]
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const documentContexts = pgTable("document_contexts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  documentType: text("document_type").notNull(),
  websiteUrl: text("website_url"),
  websiteContent: text("website_content"),
  companyProfile: text("company_profile"),
  pastProjects: jsonb("past_projects").default([]), // string[]
  linkedinProfile: text("linkedin_profile"),
  fileIds: jsonb("file_ids").default([]), // number[]
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // user_registered, feature_used, payment_completed, etc.
  userId: text("user_id").notNull(),
  metadata: jsonb("metadata").default({}), // Event-specific data
  timestamp: timestamp("timestamp").defaultNow(),
});

export const corporateAccounts = pgTable("corporate_accounts", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  domain: text("domain").unique(), // company.com
  industry: text("industry").notNull(),
  size: text("size").notNull(), // startup, small, medium, large, enterprise
  country: text("country").notNull(),
  adminUserId: integer("admin_user_id").references(() => users.id),
  plan: text("plan").default("corporate"), // corporate, enterprise, custom
  maxUsers: integer("max_users").default(10),
  currentUsers: integer("current_users").default(0),
  monthlyCredits: integer("monthly_credits").default(5000),
  creditsUsed: integer("credits_used").default(0),
  features: jsonb("features").default([]), // Array of enabled features
  customBranding: jsonb("custom_branding").default({}),
  billingEmail: text("billing_email"),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  corporateAccountId: integer("corporate_account_id").references(() => corporateAccounts.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").default("member"), // admin, member, viewer
  permissions: jsonb("permissions").default([]),
  invitedBy: integer("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  status: text("status").default("pending"), // pending, active, inactive
});

export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id),
  action: text("action").notNull(), // user_created, account_suspended, plan_changed, etc.
  targetType: text("target_type").notNull(), // user, corporate_account, system
  targetId: text("target_id").notNull(),
  details: jsonb("details").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  category: text("category").default("general"), // general, pricing, features, limits
  isPublic: boolean("is_public").default(false),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  phone: true,
  country: true,
  carrier: true,
  plan: true,
  subscriptionTier: true,
  role: true,
  companyName: true,
  companySize: true,
  industry: true,
  jobTitle: true,
  department: true,
}).extend({
  name: z.string().optional()
});

export const insertCorporateAccountSchema = createInsertSchema(corporateAccounts).pick({
  companyName: true,
  domain: true,
  industry: true,
  size: true,
  country: true,
  plan: true,
  maxUsers: true,
  monthlyCredits: true,
  features: true,
  billingEmail: true,
  contractStart: true,
  contractEnd: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  corporateAccountId: true,
  userId: true,
  role: true,
  permissions: true,
});

export const insertAdminLogSchema = createInsertSchema(adminLogs).pick({
  adminId: true,
  action: true,
  targetType: true,
  targetId: true,
  details: true,
  ipAddress: true,
  userAgent: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).pick({
  key: true,
  value: true,
  description: true,
  category: true,
  isPublic: true,
});

export const insertPitchRequestSchema = createInsertSchema(pitchRequests).pick({
  industry: true,
  country: true,
  businessType: true,
  description: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  requestId: true,
  amount: true,
  currency: true,
  type: true,
});

export const insertPatentCheckSchema = createInsertSchema(patentChecks).pick({
  description: true,
  isPriority: true,
});

export const insertGrantSchema = createInsertSchema(grants).pick({
  source: true,
  title: true,
  description: true,
  amount: true,
  deadline: true,
  region: true,
  sectors: true,
  eligibility: true,
  applicationUrl: true,
});

export const insertProposalSchema = createInsertSchema(proposals).pick({
  title: true,
  team: true,
  liveDocUrl: true,
  status: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).pick({
  filename: true,
  url: true,
  tags: true,
  uploadedBy: true,
});

export const insertUserPatternsSchema = createInsertSchema(userPatterns).pick({
  userId: true,
  languageStyle: true,
  slideStructure: true,
  designPreferences: true,
  industryContext: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).pick({
  userId: true,
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  content: true,
  metadata: true,
  insights: true,
});

export const insertDocumentContextSchema = createInsertSchema(documentContexts).pick({
  userId: true,
  documentType: true,
  websiteUrl: true,
  websiteContent: true,
  companyProfile: true,
  pastProjects: true,
  linkedinProfile: true,
  fileIds: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPitchRequest = z.infer<typeof insertPitchRequestSchema>;
export type PitchRequest = typeof pitchRequests.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type PitchDeck = typeof pitchDecks.$inferSelect;
export type InsertPatentCheck = z.infer<typeof insertPatentCheckSchema>;
export type PatentCheck = typeof patentChecks.$inferSelect;
export type InsertGrant = z.infer<typeof insertGrantSchema>;
export type Grant = typeof grants.$inferSelect;
export type GrantMatch = typeof grantMatches.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertUserPatterns = z.infer<typeof insertUserPatternsSchema>;
export type UserPatterns = typeof userPatterns.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertDocumentContext = z.infer<typeof insertDocumentContextSchema>;
export type DocumentContext = typeof documentContexts.$inferSelect;
export type InsertCorporateAccount = z.infer<typeof insertCorporateAccountSchema>;
export type CorporateAccount = typeof corporateAccounts.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
