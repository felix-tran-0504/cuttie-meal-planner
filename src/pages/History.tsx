import { useQuery } from "@tanstack/react-query";
import { MealCard } from "@/components/MealCard";
import { apiService, Meal } from "@/services/api";
import { getMealEatenAtDate } from "@/lib/mealTime";
import { mealsQueryKey } from "@/lib/queryKeys";

function groupMealsByDay(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce((groups, meal) => {
    const day = getMealEatenAtDate(meal).toDateString();
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
  const { data: meals = [], isLoading: loading } = useQuery({
    queryKey: mealsQueryKey,
    queryFn: () => apiService.getMeals(),
  });

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