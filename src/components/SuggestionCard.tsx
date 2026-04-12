import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { apiService, dishSuggestionToCreateRequest, type DishSuggestionItem } from "@/services/api";
import { mealIngredientsFromSuggestion } from "@/lib/suggestionIngredients";
import { mealsQueryKey } from "@/lib/queryKeys";
import { MacroInlineSummary } from "@/components/MacroInlineSummary";
import { SuggestionDetailPanel } from "@/components/SuggestionDetailDialog";

export function SuggestionCard({ meal, index }: { meal: DishSuggestionItem; index: number }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const addMealMutation = useMutation({
    mutationFn: async (suggestion: DishSuggestionItem) => {
      const pantry = await apiService.getIngredients();
      const mealLines = mealIngredientsFromSuggestion(suggestion.ingredients ?? [], pantry);
      return apiService.createMeal(
        dishSuggestionToCreateRequest(suggestion, { mealIngredients: mealLines })
      );
    },
    onSuccess: async (_, suggestion) => {
      await queryClient.invalidateQueries({ queryKey: mealsQueryKey });
      toast.success(`Added “${suggestion.name}” to your meals`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not add meal");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="relative flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/30"
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View details: ${meal.name}`}
          />
        </DialogTrigger>
        <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
            {meal.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-sm font-bold">{meal.name}</h3>
          </div>
          <MacroInlineSummary
            calories={meal.calories}
            protein={meal.protein}
            carbs={meal.carbs}
            fat={meal.fat}
          />
          <Button
            type="button"
            size="sm"
            disabled={addMealMutation.isPending}
            className="pointer-events-auto h-8 shrink-0 gap-1 rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              addMealMutation.mutate(meal);
            }}
          >
            {addMealMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add
          </Button>
        </div>
      </motion.div>
      {open ? <SuggestionDetailPanel suggestion={meal} /> : null}
    </Dialog>
  );
}
