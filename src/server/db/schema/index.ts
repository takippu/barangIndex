import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "moderator", "admin"]);
export const reportStatus = pgEnum("report_status", ["pending", "verified", "rejected"]);

// Better Auth tables (kept separate from app-domain tables)
export const user = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("auth_session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => ({
  userIdIdx: index("auth_session_userId_idx").on(table.userId),
}));

export const account = pgTable("auth_account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("auth_account_userId_idx").on(table.userId),
}));

export const verification = pgTable("auth_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  identifierIdx: index("auth_verification_identifier_idx").on(table.identifier),
}));

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regionId: integer("region_id").notNull().references(() => regions.id),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  regionIdx: index("markets_region_id_idx").on(table.regionId),
  activeIdx: index("markets_is_active_idx").on(table.isActive),
}));

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("uncategorized"),
  defaultUnit: text("default_unit").notNull().default("unit"),
  isActive: boolean("is_active").default(true).notNull(),
  currency: varchar("currency", { length: 3 }).default("MYR").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  activeIdx: index("items_is_active_idx").on(table.isActive),
  categoryIdx: index("items_category_idx").on(table.category),
  nameIdx: index("items_name_idx").on(table.name),
}));

export const itemVariants = pgTable("item_variants", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => items.id),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  itemIdx: index("item_variants_item_id_idx").on(table.itemId),
}));

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: userRole("role").default("user").notNull(),
  reputation: integer("reputation").default(0).notNull(),
  reportCount: integer("report_count").default(0).notNull(),
  verifiedReportCount: integer("verified_report_count").default(0).notNull(),
  reputationMeta: jsonb("reputation_meta").default({}).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("users_role_idx").on(table.role),
}));

export const authIdentities = pgTable("auth_identities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  provider: text("provider").notNull(),
  providerSubjectId: text("provider_subject_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const priceReports = pgTable("price_reports", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => items.id),
  variantId: integer("variant_id").references(() => itemVariants.id),
  regionId: integer("region_id").notNull().references(() => regions.id),
  marketId: integer("market_id").notNull().references(() => markets.id),
  userId: integer("user_id").references(() => users.id),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("MYR").notNull(),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  status: reportStatus("status").default("pending").notNull(),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  itemRegionReportedIdx: index("price_reports_item_region_reported_idx").on(
    table.itemId,
    table.regionId,
    table.reportedAt,
  ),
  marketItemReportedIdx: index("price_reports_market_item_reported_idx").on(
    table.marketId,
    table.itemId,
    table.reportedAt,
  ),
  userCreatedIdx: index("price_reports_user_created_idx").on(table.userId, table.createdAt),
  statusIdx: index("price_reports_status_idx").on(table.status),
}));

export const reportVotes = pgTable("report_votes", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => priceReports.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userReputationEvents = pgTable("user_reputation_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  delta: integer("delta").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  adminCreatedIdx: index("admin_audit_logs_admin_created_idx").on(table.adminId, table.createdAt),
}));

export const notificationType = pgEnum("notification_type", [
  "report_verified",
  "report_commented",
  "report_upvoted",
  "new_follower_report",
  "badge_earned",
  "reputation_milestone",
]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: notificationType("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));
