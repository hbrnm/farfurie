import { pgTable, text, timestamp, jsonb, real, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  salt: text("salt").notNull(),
  hash: text("hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const diaryEntries = pgTable("diary_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  meal: text("meal").notNull(),
  nameRo: text("name_ro").notNull(),
  nameEn: text("name_en").notNull(),
  kcal: real("kcal").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  grams: real("grams"),
  foodId: text("food_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const weightLogs = pgTable("weight_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  kg: real("kg").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userRecipes = pgTable("user_recipes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  nameRo: text("name_ro").notNull(),
  nameEn: text("name_en").notNull(),
  servings: integer("servings").notNull().default(1),
  perServingKcal: real("per_serving_kcal").notNull(),
  perServingProtein: real("per_serving_protein").notNull(),
  perServingCarbs: real("per_serving_carbs").notNull(),
  perServingFat: real("per_serving_fat").notNull(),
  ingredientsRo: jsonb("ingredients_ro").notNull(),
  ingredientsEn: jsonb("ingredients_en").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const shoppingItems = pgTable("shopping_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  nameRo: text("name_ro").notNull(),
  nameEn: text("name_en").notNull(),
  checked: boolean("checked").notNull().default(false),
  fromRecipeId: text("from_recipe_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const snapshots = pgTable("snapshots", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
