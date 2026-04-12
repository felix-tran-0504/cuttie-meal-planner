import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { apiService, CreateMealRequest, Meal } from "@/services/api";
import { mealsQueryKey } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  fromDateAndTimeToIso,
  getMealEatenAtIso,
  roundToFiveMinutes,
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/mealTime";

function mealToCreatePayload(meal: Meal, eatenAtIso: string): CreateMealRequest {
  const lines =
    meal.ingredients?.map((line) => ({
      ingredient_id: line.ingredient.id,
      amount_grams: line.amount_grams,
    })) ?? [];
  return {
    name: meal.name,
    description: meal.description?.trim() || undefined,
    calories: Math.round(meal.calories),
    protein: Number(meal.protein.toFixed(1)),
    carbs: Number(meal.carbs.toFixed(1)),
    fat: Number(meal.fat.toFixed(1)),
    ingredients: lines.length > 0 ? lines : undefined,
    photo_urls: meal.photo_urls?.length ? [...meal.photo_urls] : undefined,
    eaten_at: eatenAtIso,
  };
}

interface LogSavedMealDialogProps {
  /** Optional; meal lists also refresh via shared query cache invalidation. */
  onMealAdded?: () => void;
  children: React.ReactNode;
}

export function LogSavedMealDialog({ onMealAdded, children }: LogSavedMealDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [eatenDate, setEatenDate] = useState(() => toDateInputValue(roundToFiveMinutes(new Date())));
  const [eatenTime, setEatenTime] = useState(() => toTimeInputValue(roundToFiveMinutes(new Date())));

  useEffect(() => {
    if (!open) return;
    const n = roundToFiveMinutes(new Date());
    setEatenDate(toDateInputValue(n));
    setEatenTime(toTimeInputValue(n));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await apiService.getMeals();
        if (!cancelled) {
          const sorted = [...list].sort(
            (a, b) =>
              new Date(getMealEatenAtIso(b)).getTime() - new Date(getMealEatenAtIso(a)).getTime()
          );
          setMeals(sorted);
        }
      } catch (error) {
        console.error("Failed to load meals:", error);
        if (!cancelled) setMeals([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handlePick = async (meal: Meal) => {
    setSubmittingId(meal.id);
    try {
      const eatenIso = fromDateAndTimeToIso(eatenDate, eatenTime);
      await apiService.createMeal(mealToCreatePayload(meal, eatenIso));
      await queryClient.invalidateQueries({ queryKey: mealsQueryKey });
      onMealAdded?.();
      setOpen(false);
    } catch (error) {
      console.error("Failed to log meal:", error);
      alert(error instanceof Error ? error.message : "Failed to log meal");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[calc(100%-1.5rem)] max-h-[min(90vh,720px)] flex-col gap-4 overflow-hidden p-6 sm:min-w-[min(90vw,32rem)] sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-2 pr-6">
          <DialogTitle>Log a saved meal</DialogTitle>
          <DialogDescription>
            Choose a meal you logged before. It will be added again for today with the same nutrition and recipe details.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading saved meals…</p>
        ) : meals.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No meals yet. Add dishes from Log → Meals first.
          </p>
        ) : (
          <>
            <div className="shrink-0 space-y-2">
              <p className="text-sm font-medium leading-none">When did you eat this?</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="saved-meal-eaten-date">
                    Date
                  </label>
                  <Input
                    id="saved-meal-eaten-date"
                    type="date"
                    value={eatenDate}
                    onChange={(e) => setEatenDate(e.target.value)}
                    className="w-full min-w-0 sm:w-[11rem]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="saved-meal-eaten-time">
                    Time
                  </label>
                  <Input
                    id="saved-meal-eaten-time"
                    type="time"
                    step={300}
                    value={eatenTime}
                    onChange={(e) => setEatenTime(e.target.value)}
                    className="w-full min-w-0 sm:w-[8.5rem]"
                  />
                </div>
              </div>
            </div>
          <div
            className="min-h-0 max-h-[min(52vh,420px)] overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]"
            role="listbox"
            aria-label="Saved meals"
          >
            <ul className="flex flex-col gap-2 pb-1">
              {meals.map((meal) => {
                const busy = submittingId === meal.id;
                return (
                  <li key={meal.id}>
                    <button
                      type="button"
                      disabled={submittingId !== null}
                      onClick={() => handlePick(meal)}
                      className={cn(
                        "relative w-full rounded-xl border border-border bg-card px-4 py-3 text-left transition",
                        "hover:border-primary/40 hover:bg-accent/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        busy && "pointer-events-none opacity-70"
                      )}
                    >
                      <span className="block truncate font-heading text-sm font-semibold">{meal.name}</span>
                      {busy ? (
                        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-background/70">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
                          <span className="sr-only">Logging meal…</span>
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
