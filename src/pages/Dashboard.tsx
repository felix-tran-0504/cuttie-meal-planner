import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { MacroRing } from "@/components/MacroRing";
import { MealLogCard } from "@/components/MealLogCard";
import { LogSavedMealDialog } from "@/components/LogSavedMealDialog";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { getMealEatenAtDate } from "@/lib/mealTime";
import { mealsQueryKey } from "@/lib/queryKeys";
import { macroGoals } from "@/data/mockData";

export default function Dashboard() {
  const { data: meals = [], isLoading: loading } = useQuery({
    queryKey: mealsQueryKey,
    queryFn: () => apiService.getMeals(),
  });

  const todaysMeals = meals.filter((meal) => {
    const today = new Date().toDateString();
    const mealDate = getMealEatenAtDate(meal).toDateString();
    return mealDate === today;
  });

  const totals = todaysMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="flex flex-col gap-6 pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-heading font-extrabold">Today</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card p-6 shadow-sm border"
      >
        <h2 className="font-heading font-bold text-sm text-muted-foreground mb-4">Macro Overview</h2>
        <div className="flex justify-around">
          <MacroRing label="Calories" current={Math.round(totals.calories)} goal={macroGoals.calories} unit="kcal" colorClass="text-calories" size={85} />
          <MacroRing label="Protein" current={Math.ceil(totals.protein)} goal={macroGoals.protein} unit="g" colorClass="text-protein" />
          <MacroRing label="Carbs" current={Math.ceil(totals.carbs)} goal={macroGoals.carbs} unit="g" colorClass="text-carbs" />
          <MacroRing label="Fat" current={Math.ceil(totals.fat)} goal={macroGoals.fat} unit="g" colorClass="text-fat" />
        </div>
      </motion.div>

      <div>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading font-bold text-sm text-muted-foreground">Today's Meals</h2>
          <LogSavedMealDialog>
            <Button size="sm" className="rounded-xl gap-1.5 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Meal
            </Button>
          </LogSavedMealDialog>
        </div>
        <div className="flex flex-col gap-3">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading meals...</p>
          ) : todaysMeals.length > 0 ? (
            todaysMeals.map((meal) => (
              <MealLogCard key={meal.id} meal={meal} showTime />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No meals logged today</p>
          )}
        </div>
      </div>
    </div>
  );
}
