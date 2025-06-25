
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { type CreateFoodEntryInput } from '../schema';
import { createFoodEntry } from '../handlers/create_food_entry';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateFoodEntryInput = {
  food_name: 'Apple',
  calories: 95
};

describe('createFoodEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a food entry', async () => {
    const result = await createFoodEntry(testInput);

    // Basic field validation
    expect(result.food_name).toEqual('Apple');
    expect(result.calories).toEqual(95);
    expect(result.id).toBeDefined();
    expect(result.logged_at).toBeInstanceOf(Date);
  });

  it('should save food entry to database', async () => {
    const result = await createFoodEntry(testInput);

    // Query using proper drizzle syntax
    const foodEntries = await db.select()
      .from(foodEntriesTable)
      .where(eq(foodEntriesTable.id, result.id))
      .execute();

    expect(foodEntries).toHaveLength(1);
    expect(foodEntries[0].food_name).toEqual('Apple');
    expect(foodEntries[0].calories).toEqual(95);
    expect(foodEntries[0].logged_at).toBeInstanceOf(Date);
  });

  it('should use current timestamp for logged_at', async () => {
    const beforeCreation = new Date();
    const result = await createFoodEntry(testInput);
    const afterCreation = new Date();

    expect(result.logged_at).toBeInstanceOf(Date);
    expect(result.logged_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.logged_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });

  it('should handle different food names and calorie values', async () => {
    const testInput2: CreateFoodEntryInput = {
      food_name: 'Banana',
      calories: 105
    };

    const result = await createFoodEntry(testInput2);

    expect(result.food_name).toEqual('Banana');
    expect(result.calories).toEqual(105);
    expect(result.id).toBeDefined();
    expect(result.logged_at).toBeInstanceOf(Date);
  });
});
