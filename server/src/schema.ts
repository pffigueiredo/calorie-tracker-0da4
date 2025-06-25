
import { z } from 'zod';

// Food entry schema
export const foodEntrySchema = z.object({
  id: z.number(),
  food_name: z.string(),
  calories: z.number().int().positive(),
  logged_at: z.coerce.date()
});

export type FoodEntry = z.infer<typeof foodEntrySchema>;

// Input schema for creating food entries
export const createFoodEntryInputSchema = z.object({
  food_name: z.string().min(1, "Food name is required"),
  calories: z.number().int().positive("Calories must be a positive integer")
});

export type CreateFoodEntryInput = z.infer<typeof createFoodEntryInputSchema>;

// Schema for daily calorie summary
export const dailyCalorieSummarySchema = z.object({
  date: z.string(), // Date in YYYY-MM-DD format
  total_calories: z.number().int().nonnegative()
});

export type DailyCalorieSummary = z.infer<typeof dailyCalorieSummarySchema>;
