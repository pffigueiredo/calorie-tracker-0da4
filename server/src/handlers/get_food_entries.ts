
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type FoodEntry } from '../schema';
import { desc } from 'drizzle-orm';

export const getFoodEntries = async (): Promise<FoodEntry[]> => {
  try {
    const results = await db.select()
      .from(foodEntriesTable)
      .orderBy(desc(foodEntriesTable.logged_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch food entries:', error);
    throw error;
  }
};
