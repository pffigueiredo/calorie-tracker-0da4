
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type DailyCalorieSummary } from '../schema';
import { sql, gte, lt } from 'drizzle-orm';

export const getDailyCalories = async (date?: string): Promise<DailyCalorieSummary> => {
  try {
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Create date range for the target date (start of day to start of next day)
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    // Query to sum calories for the specified date
    const result = await db.select({
      total_calories: sql<number>`COALESCE(SUM(${foodEntriesTable.calories}), 0)::integer`
    })
    .from(foodEntriesTable)
    .where(
      sql`${foodEntriesTable.logged_at} >= ${startOfDay} AND ${foodEntriesTable.logged_at} < ${startOfNextDay}`
    )
    .execute();

    const totalCalories = result[0]?.total_calories || 0;

    return {
      date: targetDate,
      total_calories: totalCalories
    };
  } catch (error) {
    console.error('Daily calories calculation failed:', error);
    throw error;
  }
};
