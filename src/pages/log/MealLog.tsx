import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { MealCard } from "@/components/MealCard";
import { AddMealDialog } from "@/components/AddMealDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService, Meal } from "@/services/api";

export default function MealLog() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMeals = async () => {
    try {
      const fetchedMeals = await apiService.getMeals();
      setMeals(fetchedMeals);
    } catch (error) {
      console.error("Failed to fetch meals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const filteredMeals = meals.filter((meal) =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaysMeals = filteredMeals.filter((meal) => {
    const today = new Date().toDateString();
    const mealDate = new Date(meal.created_at).toDateString();
    return mealDate === today;
  });

  const yesterdayMeals = filteredMeals.filter((meal) => {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const mealDate = new Date(meal.created_at).toDateString();
    return mealDate === yesterday;
  });

  return (
    <div className="flex flex-col gap-6 pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-heading font-extrabold">Meal Log</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Track everything you eat</p>
          </div>
        </div>
        <AddMealDialog onMealAdded={fetchMeals}>
          <Button size="sm" className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" /> Add Meal
          </Button>
        </AddMealDialog>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meals..."
          className="pl-9 rounded-xl bg-card border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading meals...</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">Today</h2>
            <div className="flex flex-col gap-3">
              {todaysMeals.length > 0 ? (
                todaysMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No meals logged today</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-heading font-bold text-sm text-muted-foreground mb-3">Yesterday</h2>
            <div className="flex flex-col gap-3">
              {yesterdayMeals.length > 0 ? (
                yesterdayMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No meals logged yesterday</p>
              )}
            </div>
          </div>
        </>
      )}
      <div className="flex justify-end">
        <Link to="/log" className="inline-flex items-center rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </div>
    </div>
  );
}
