
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { getFoodEntries } from '../handlers/get_food_entries';

describe('getFoodEntries', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no food entries exist', async () => {
    const result = await getFoodEntries();
    expect(result).toEqual([]);
  });

  it('should return all food entries', async () => {
    // Create test food entries
    await db.insert(foodEntriesTable)
      .values([
        {
          food_name: 'Apple',
          calories: 95
        },
        {
          food_name: 'Banana',
          calories: 105
        }
      ])
      .execute();

    const result = await getFoodEntries();

    expect(result).toHaveLength(2);
    expect(result[0].food_name).toBeDefined();
    expect(result[0].calories).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].logged_at).toBeInstanceOf(Date);
  });

  it('should return food entries sorted by logged_at in descending order', async () => {
    // Create food entries with specific timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    await db.insert(foodEntriesTable)
      .values([
        {
          food_name: 'Oldest Entry',
          calories: 100,
          logged_at: twoHoursAgo
        },
        {
          food_name: 'Newest Entry',
          calories: 200,
          logged_at: now
        },
        {
          food_name: 'Middle Entry',
          calories: 150,
          logged_at: oneHourAgo
        }
      ])
      .execute();

    const result = await getFoodEntries();

    expect(result).toHaveLength(3);
    
    // Verify descending order - most recent first
    expect(result[0].food_name).toEqual('Newest Entry');
    expect(result[1].food_name).toEqual('Middle Entry');
    expect(result[2].food_name).toEqual('Oldest Entry');
    
    // Verify timestamps are properly ordered
    expect(result[0].logged_at >= result[1].logged_at).toBe(true);
    expect(result[1].logged_at >= result[2].logged_at).toBe(true);
  });

  it('should return proper data types for all fields', async () => {
    await db.insert(foodEntriesTable)
      .values({
        food_name: 'Test Food',
        calories: 250
      })
      .execute();

    const result = await getFoodEntries();

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('number');
    expect(typeof result[0].food_name).toBe('string');
    expect(typeof result[0].calories).toBe('number');
    expect(result[0].logged_at).toBeInstanceOf(Date);
  });
});
