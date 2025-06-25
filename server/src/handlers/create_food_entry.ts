
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type CreateFoodEntryInput, type FoodEntry } from '../schema';

export const createFoodEntry = async (input: CreateFoodEntryInput): Promise<FoodEntry> => {
  try {
    // Insert food entry record
    const result = await db.insert(foodEntriesTable)
      .values({
        food_name: input.food_name,
        calories: input.calories
        // logged_at will use the default timestamp from schema
      })
      .returning()
      .execute();

    // Return the created entry
    const foodEntry = result[0];
    return {
      id: foodEntry.id,
      food_name: foodEntry.food_name,
      calories: foodEntry.calories,
      logged_at: foodEntry.logged_at
    };
  } catch (error) {
    console.error('Food entry creation failed:', error);
    throw error;
  }
};
