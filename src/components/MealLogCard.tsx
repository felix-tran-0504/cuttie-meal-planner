import { useState } from "react";
import { motion } from "framer-motion";
import { Meal } from "@/services/api";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MealDetailPanel } from "@/components/MealDetailDialog";
import { MealDeleteButton } from "@/components/MealDeleteButton";
import { MacroInlineSummary } from "@/components/MacroInlineSummary";
import { formatMealLoggedTime } from "@/lib/utils";

export function MealLogCard({
  meal,
  showTime = false,
}: {
  meal: Meal;
  /** When true (e.g. Today on Home), show eaten/logged time under the meal name. */
  showTime?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const loggedAt = showTime ? formatMealLoggedTime(meal.eaten_at ?? meal.created_at) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="relative rounded-2xl border bg-card shadow-sm transition-colors hover:bg-accent/30">
        <DialogTrigger asChild>
          <button
            type="button"
            className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View details: ${meal.name}`}
          />
        </DialogTrigger>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none relative z-10 flex cursor-default items-center gap-3 p-4"
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
            className="pointer-events-auto h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          />
        </motion.div>
      </div>
      {open ? <MealDetailPanel meal={meal} /> : null}
    </Dialog>
  );
}
