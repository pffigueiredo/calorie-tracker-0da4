
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodEntriesTable } from '../db/schema';
import { getDailyCalories } from '../handlers/get_daily_calories';

describe('getDailyCalories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero calories for date with no entries', async () => {
    const result = await getDailyCalories('2024-01-15');
    
    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(0);
  });

  it('should calculate total calories for a specific date', async () => {
    const testDate = '2024-01-15';
    
    // Insert test food entries for the target date
    await db.insert(foodEntriesTable).values([
      {
        food_name: 'Apple',
        calories: 80,
        logged_at: new Date('2024-01-15T08:00:00.000Z')
      },
      {
        food_name: 'Banana',
        calories: 120,
        logged_at: new Date('2024-01-15T12:00:00.000Z')
      },
      {
        food_name: 'Orange',
        calories: 60,
        logged_at: new Date('2024-01-15T18:00:00.000Z')
      }
    ]).execute();

    // Insert entry for different date (should not be included)
    await db.insert(foodEntriesTable).values({
      food_name: 'Pizza',
      calories: 300,
      logged_at: new Date('2024-01-16T12:00:00.000Z')
    }).execute();

    const result = await getDailyCalories(testDate);
    
    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(260); // 80 + 120 + 60
  });

  it('should default to current date when no date provided', async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Insert entry for today
    await db.insert(foodEntriesTable).values({
      food_name: 'Breakfast',
      calories: 350,
      logged_at: new Date() // Current timestamp
    }).execute();

    const result = await getDailyCalories();
    
    expect(result.date).toEqual(today);
    expect(result.total_calories).toEqual(350);
  });

  it('should only include entries from the exact date range', async () => {
    const testDate = '2024-01-15';
    
    // Insert entries: one just before midnight, one at start of day, one at end of day, one just after midnight
    await db.insert(foodEntriesTable).values([
      {
        food_name: 'Late Night Snack',
        calories: 100,
        logged_at: new Date('2024-01-14T23:59:59.999Z') // Should NOT be included
      },
      {
        food_name: 'Early Breakfast',
        calories: 200,
        logged_at: new Date('2024-01-15T00:00:00.000Z') // Should be included
      },
      {
        food_name: 'Late Dinner',
        calories: 300,
        logged_at: new Date('2024-01-15T23:59:59.999Z') // Should be included
      },
      {
        food_name: 'Midnight Snack',
        calories: 150,
        logged_at: new Date('2024-01-16T00:00:00.000Z') // Should NOT be included
      }
    ]).execute();

    const result = await getDailyCalories(testDate);
    
    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(500); // 200 + 300 only
  });

  it('should handle single digit dates correctly', async () => {
    const testDate = '2024-01-05'; // Single digit day
    
    await db.insert(foodEntriesTable).values({
      food_name: 'Test Food',
      calories: 150,
      logged_at: new Date('2024-01-05T15:30:00.000Z')
    }).execute();

    const result = await getDailyCalories(testDate);
    
    expect(result.date).toEqual('2024-01-05');
    expect(result.total_calories).toEqual(150);
  });
});
