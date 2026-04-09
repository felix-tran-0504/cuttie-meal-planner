import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MacroRing } from "@/components/MacroRing";
import { MealCard } from "@/components/MealCard";
import { apiService, Meal } from "@/services/api";
import { macroGoals } from "@/data/mockData";

export default function Dashboard() {
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

  const todaysMeals = meals.filter((meal) => {
    const today = new Date().toDateString();
    const mealDate = new Date(meal.created_at).toDateString();
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
          <MacroRing label="Calories" current={Math.ceil(totals.calories)} goal={macroGoals.calories} unit="kcal" colorClass="text-calories" size={85} />
          <MacroRing label="Protein" current={Math.ceil(totals.protein)} goal={macroGoals.protein} unit="g" colorClass="text-protein" />
          <MacroRing label="Carbs" current={Math.ceil(totals.carbs)} goal={macroGoals.carbs} unit="g" colorClass="text-carbs" />
          <MacroRing label="Fat" current={Math.ceil(totals.fat)} goal={macroGoals.fat} unit="g" colorClass="text-fat" />
        </div>
      </motion.div>

      <div>
        <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">Today's Meals</h2>
        <div className="flex flex-col gap-3">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading meals...</p>
          ) : todaysMeals.length > 0 ? (
            todaysMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No meals logged today</p>
          )}
        </div>
      </div>
    </div>
  );
}
