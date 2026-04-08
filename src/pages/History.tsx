import { useState, useEffect } from "react";
import { MealCard } from "@/components/MealCard";
import { apiService, Meal } from "@/services/api";

function groupMealsByDay(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce((groups, meal) => {
    const day = new Date(meal.created_at).toDateString();
    return {
      ...groups,
      [day]: [...(groups[day] ?? []), meal],
    };
  }, {} as Record<string, Meal[]>);
}

function formatDayLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (dateString === today) return "Today";
  if (dateString === yesterday) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function History() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const fetchedMeals = await apiService.getMeals();
        setMeals(fetchedMeals);
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const mealsByDay = groupMealsByDay(meals);
  const sortedDays = Object.keys(mealsByDay).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime() // most recent first
  );

  return (
    <div className="flex flex-col gap-6 pb-6">
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading meals...</p>
      ) : sortedDays.length > 0 ? (
        sortedDays.map((day) => (
          <div key={day}>
            <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">
              {formatDayLabel(day)}
            </h2>
            <div className="flex flex-col gap-3">
              {mealsByDay[day].map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No meals logged yet</p>
      )}
    </div>
  );
}