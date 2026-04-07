import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { MealCard } from "@/components/MealCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { todaysMeals } from "@/data/mockData";

export default function MealLog() {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold">Meal Log</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track everything you eat</p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5">
          <Plus className="h-4 w-4" /> Add Meal
        </Button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meals..."
          className="pl-9 rounded-xl bg-card border"
        />
      </div>

      <div>
        <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">Today</h2>
        <div className="flex flex-col gap-3">
          {todaysMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">Yesterday</h2>
        <p className="text-sm text-muted-foreground text-center py-8">No meals logged</p>
      </div>
    </div>
  );
}
