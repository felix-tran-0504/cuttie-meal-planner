import { motion } from "framer-motion";
import { Meal } from "@/services/api";
import { MacroInlineSummary } from "@/components/MacroInlineSummary";
import { MealDeleteButton } from "@/components/MealDeleteButton";
import { formatMealLoggedTime } from "@/lib/utils";

export function MealCard({ meal }: { meal: Meal }) {
  const loggedAt = formatMealLoggedTime(meal.eaten_at ?? meal.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
        🍽️
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-sm font-bold">{meal.name}</h3>
        {loggedAt ? (
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{loggedAt}</p>
        ) : null}
      </div>
      <MacroInlineSummary
        calories={meal.calories}
        protein={meal.protein}
        carbs={meal.carbs}
        fat={meal.fat}
      />
      <MealDeleteButton
        mealId={meal.id}
        mealName={meal.name}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
      />
    </motion.div>
  );
}
