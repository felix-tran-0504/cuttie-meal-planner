import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MealSuggestion {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  tags: string[];
}

export function SuggestionCard({ meal, index }: { meal: MealSuggestion; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl bg-card p-5 shadow-sm border flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl">
            {meal.emoji}
          </div>
          <div>
            <h3 className="font-heading font-bold">{meal.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{meal.description}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {meal.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span><strong className="text-calories">{meal.calories}</strong> kcal</span>
          <span><strong className="text-protein">{meal.protein}g</strong> P</span>
          <span><strong className="text-carbs">{meal.carbs}g</strong> C</span>
          <span><strong className="text-fat">{meal.fat}g</strong> F</span>
        </div>
        <Button size="sm" className="rounded-xl gap-1 h-8">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
    </motion.div>
  );
}
