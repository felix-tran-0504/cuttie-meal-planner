import { Meal } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MealDetailDialog({
  meal,
  children,
}: {
  meal: Meal;
  children: React.ReactNode;
}) {
  const created = new Date(meal.created_at);
  const timeStr = created.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = created.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const emoji = "🍽️";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-3xl">
              {emoji}
            </div>
            <div className="min-w-0 text-left">
              <DialogTitle className="font-heading leading-snug">{meal.name}</DialogTitle>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {dateStr} · {timeStr}
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {meal.description ? (
            <p className="text-sm leading-relaxed text-foreground">{meal.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No description added.</p>
          )}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ingredients
            </p>
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <ul className="space-y-2 rounded-xl border bg-muted/30 px-3 py-2.5">
                {meal.ingredients.map((line, index) => (
                  <li
                    key={`${line.ingredient.id}-${index}`}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 font-medium leading-snug">{line.ingredient.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {line.amount_grams % 1 === 0
                        ? line.amount_grams.toFixed(0)
                        : line.amount_grams.toFixed(1)}
                      g
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">No ingredients recorded for this dish.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Macros
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-muted-foreground sm:gap-3">
              <div className="rounded-xl border bg-muted/40 px-2 py-2.5">
                <div className="text-calories font-bold text-base tabular-nums">{meal.calories}</div>
                <div>kcal</div>
              </div>
              <div className="rounded-xl border bg-muted/40 px-2 py-2.5">
                <div className="text-protein font-bold text-base tabular-nums">{meal.protein}g</div>
                <div>Protein</div>
              </div>
              <div className="rounded-xl border bg-muted/40 px-2 py-2.5">
                <div className="text-carbs font-bold text-base tabular-nums">{meal.carbs}g</div>
                <div>Carbs</div>
              </div>
              <div className="rounded-xl border bg-muted/40 px-2 py-2.5">
                <div className="text-fat font-bold text-base tabular-nums">{meal.fat}g</div>
                <div>Fat</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
