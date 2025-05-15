import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startOnBoot: boolean("start_on_boot").notNull().default(true),
  showInTray: boolean("show_in_tray").notNull().default(true),
  autoUpdates: boolean("auto_updates").notNull().default(true),
  spellingCheck: boolean("spelling_check").notNull().default(true),
  grammarCheck: boolean("grammar_check").notNull().default(true),
  autocomplete: boolean("autocomplete").notNull().default(true),
  language: text("language").notNull().default("en-US"),
  usageData: boolean("usage_data").notNull().default(true),
  storeHistory: boolean("store_history").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Correction history schema
export const corrections = pgTable("corrections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'spelling', 'grammar', 'autocomplete'
  original: text("original").notNull(),
  corrected: text("corrected").notNull(),
  application: text("application").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Statistics schema
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  wordsProcessed: integer("words_processed").notNull().default(0),
  correctionsApplied: integer("corrections_applied").notNull().default(0),
  suggestionsMade: integer("suggestions_made").notNull().default(0),
  timeSaved: integer("time_saved").notNull().default(0), // in seconds
  applicationUsage: json("application_usage").notNull().default({}),
});

// User schema (referenced by other tables)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Zod schemas for validation
export const settingsSchema = createInsertSchema(settings).omit({ id: true });
export const correctionSchema = createInsertSchema(corrections).omit({ id: true, createdAt: true });
export const statisticsSchema = createInsertSchema(statistics).omit({ id: true, date: true });
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Utility types
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof settingsSchema>;

export type Correction = typeof corrections.$inferSelect;
export type InsertCorrection = z.infer<typeof correctionSchema>;

export type Statistics = typeof statistics.$inferSelect;
export type InsertStatistics = z.infer<typeof statisticsSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Additional types for the API
export type RecentCorrection = {
  id: number;
  type: 'spelling' | 'grammar' | 'autocomplete';
  title: string;
  description: string;
  time: string;
};

export type StatisticsOverview = {
  [key: string]: {
    label: string;
    value: string;
    change: number;
  }
};

export type TopApplication = {
  name: string;
  percentage: number;
};
