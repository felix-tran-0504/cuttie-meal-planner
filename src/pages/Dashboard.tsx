import { motion } from "framer-motion";
import { MacroRing } from "@/components/MacroRing";
import { MealCard } from "@/components/MealCard";
import { todaysMeals, macroGoals } from "@/data/mockData";

const totals = todaysMeals.reduce(
  (acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 }
);

export default function Dashboard() {
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
          <MacroRing label="Calories" current={totals.calories} goal={macroGoals.calories} unit="kcal" colorClass="text-calories" size={85} />
          <MacroRing label="Protein" current={totals.protein} goal={macroGoals.protein} unit="g" colorClass="text-protein" />
          <MacroRing label="Carbs" current={totals.carbs} goal={macroGoals.carbs} unit="g" colorClass="text-carbs" />
          <MacroRing label="Fat" current={totals.fat} goal={macroGoals.fat} unit="g" colorClass="text-fat" />
        </div>
      </motion.div>

      <div>
        <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">Today's Meals</h2>
        <div className="flex flex-col gap-3">
          {todaysMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
}
