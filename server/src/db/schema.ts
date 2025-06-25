
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const foodEntriesTable = pgTable('food_entries', {
  id: serial('id').primaryKey(),
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  logged_at: timestamp('logged_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type FoodEntry = typeof foodEntriesTable.$inferSelect;
export type NewFoodEntry = typeof foodEntriesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { foodEntries: foodEntriesTable };
