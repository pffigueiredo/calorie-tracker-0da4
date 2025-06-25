
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, CreateFoodEntryInput, DailyCalorieSummary } from '../../server/src/schema';

function App() {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyCalorieSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateFoodEntryInput>({
    food_name: '',
    calories: 0
  });

  // Load data functions
  const loadFoodEntries = useCallback(async () => {
    try {
      const entries = await trpc.getFoodEntries.query();
      setFoodEntries(entries);
    } catch (error) {
      console.error('Failed to load food entries:', error);
    }
  }, []);

  const loadDailySummary = useCallback(async () => {
    try {
      const summary = await trpc.getDailyCalories.query();
      setDailySummary(summary);
    } catch (error) {
      console.error('Failed to load daily summary:', error);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadFoodEntries();
    loadDailySummary();
  }, [loadFoodEntries, loadDailySummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food_name.trim() || formData.calories <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      const newEntry = await trpc.createFoodEntry.mutate(formData);
      setFoodEntries((prev: FoodEntry[]) => [newEntry, ...prev]);
      
      // Update daily summary
      if (dailySummary) {
        setDailySummary((prev: DailyCalorieSummary | null) => 
          prev ? {
            ...prev,
            total_calories: prev.total_calories + formData.calories
          } : null
        );
      }

      // Reset form
      setFormData({
        food_name: '',
        calories: 0
      });
    } catch (error) {
      console.error('Failed to create food entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayString = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🥗 Calorie Tracker
          </h1>
          <p className="text-gray-600">Track your daily food intake and calories</p>
        </div>

        {/* Daily Summary Card */}
        <Card className="mb-8 bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-center">
              📅 Today's Summary - {getTodayString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {dailySummary?.total_calories || 0}
              </div>
              <div className="text-lg text-gray-600">Total Calories</div>
              {/* Note: Backend is using placeholder data, so this shows 0 until real implementation */}
              {dailySummary?.total_calories === 0 && (
                <Badge variant="outline" className="mt-2">
                  📝 Backend using placeholder data
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Food Entry Form */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                🍎 Add Food Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Food name (e.g., Apple, Chicken Breast)"
                    value={formData.food_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateFoodEntryInput) => ({ 
                        ...prev, 
                        food_name: e.target.value 
                      }))
                    }
                    className="h-12"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Calories"
                    value={formData.calories || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateFoodEntryInput) => ({ 
                        ...prev, 
                        calories: parseInt(e.target.value) || 0 
                      }))
                    }
                    min="1"
                    className="h-12"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.food_name.trim() || formData.calories <= 0}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isLoading ? '⏳ Adding...' : '➕ Add Food Entry'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Food Entries List */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                📋 Food Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {foodEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-gray-500 mb-2">No food entries yet!</p>
                  <p className="text-sm text-gray-400">
                    Add your first meal above to get started.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    📝 Backend using placeholder - returns empty array
                  </Badge>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {foodEntries.map((entry: FoodEntry) => (
                    <div key={entry.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {entry.food_name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            🕐 {entry.logged_at.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2 text-lg px-3 py-1">
                          {entry.calories} cal
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <Separator className="mb-4" />
          <p className="text-sm">
            💡 Track your meals and stay healthy! 
            <Badge variant="outline" className="ml-2">
              Note: Backend handlers use placeholder data
            </Badge>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
