import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  fullName: text("full_name"),
  userName: text("user_name").unique(),
  email: text("email").notNull().unique(),
  profilePhoto: text("profile_photo"),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  isBlocked: integer("is_blocked", { mode: "boolean" }).default(false),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  plan: text("plan", { enum: ["basic", "pro", "enterprise", "legacy"] }).default("basic").notNull(),
  planExpiresAt: integer("plan_expires_at"),
  lemonSqueezyCustomerId: text("lemon_squeezy_customer_id"),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  oauthTokens: many(oauthTokens),
  sessions: many(sessions),
  loginLogs: many(loginLogs),
  subscriptions: many(subscriptions),
}));

export const oauthTokens = sqliteTable(
  "oauth_tokens",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    strategy: text("strategy", { enum: ["google", "github"] }).notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.strategy] }),
    };
  }
);

export const oauthTokenRelations = relations(oauthTokens, ({ one }) => ({
  user: one(users, {
    fields: [oauthTokens.userId],
    references: [users.id],
  }),
}));

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  loginLog: one(loginLogs),
}));

export const loginLogs = sqliteTable("login_logs", {
  id: text("id")
    .$default(() => createId())
    .primaryKey(),
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  userId: text("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),

  browser: text("browser").notNull(),
  device: text("device").notNull(),
  os: text("os").notNull(),
  ip: text("ip").notNull(),
  loggedInAt: text("logged_in_at").default(sql`CURRENT_TIMESTAMP`),
});

export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
  user: one(users, {
    fields: [loginLogs.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [loginLogs.sessionId],
    references: [sessions.id],
  }),
}));

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").$default(() => createId()).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lemonSqueezySubscriptionId: text("lemon_squeezy_subscription_id").notNull(),
  status: text("status", { 
    enum: ["active", "past_due", "unpaid", "cancelled", "expired", "on_trial"] 
  }).notNull(),
  planType: text("plan_type", { enum: ["monthly", "annually"] }).notNull(),
  currentPeriodStart: integer("current_period_start").notNull(),
  currentPeriodEnd: integer("current_period_end").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});


export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));