import { motion } from "framer-motion";
import { Meal } from "@/services/api";

export function MealCard({ meal }: { meal: Meal }) {
  // Format the time from created_at
  const time = new Date(meal.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Default emoji based on meal name or something, for now use a food emoji
  const emoji = "🍽️";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm border"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-bold text-sm truncate">{meal.name}</h3>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <div className="flex gap-3 text-[11px] text-muted-foreground font-medium">
        <div className="flex flex-col items-center">
          <span className="text-calories font-bold text-sm">{meal.calories}</span>
          <span>kcal</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-protein font-bold text-sm">{meal.protein}g</span>
          <span>P</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-carbs font-bold text-sm">{meal.carbs}g</span>
          <span>C</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-fat font-bold text-sm">{meal.fat}g</span>
          <span>F</span>
        </div>
      </div>
    </motion.div>
  );
}
