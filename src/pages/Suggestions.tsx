import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SuggestionCard } from "@/components/SuggestionCard";
import { suggestions } from "@/data/mockData";

export default function Suggestions() {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-heading font-extrabold">Meal Ideas</h1>
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <p className="text-muted-foreground text-sm mt-0.5">Personalized suggestions based on your goals</p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {["All", "High Protein", "Low Carb", "Vegan", "Quick"].map((tag) => (
          <button
            key={tag}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              tag === "All"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {suggestions.map((meal, i) => (
          <SuggestionCard key={meal.id} meal={meal} index={i} />
        ))}
      </div>
    </div>
  );
}
