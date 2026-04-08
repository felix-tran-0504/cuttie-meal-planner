import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiService, CreateMealRequest, Ingredient } from "@/services/api";

const mealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  recipe: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

type SelectedIngredient = {
  ingredientId: number;
  amount: number;
};

interface AddMealDialogProps {
  onMealAdded: () => void;
  children: React.ReactNode;
}

export function AddMealDialog({ onMealAdded, children }: AddMealDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      recipe: "",
    },
  });

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoadingIngredients(true);
      setIngredientsError(null);

      try {
        const data = await apiService.getIngredients();
        setIngredients(data);
        if (data.length > 0) {
          setSelectedIngredients([{ ingredientId: data[0].id, amount: 100 }]);
        }
      } catch (error) {
        console.error("Failed to fetch ingredients:", error);
        setIngredientsError("Could not load ingredients. Add ingredients first.");
      } finally {
        setLoadingIngredients(false);
      }
    };

    fetchIngredients();
  }, []);

  const totals = selectedIngredients.reduce(
    (acc, item) => {
      const ingredient = ingredients.find((ingredient) => ingredient.id === item.ingredientId);
      if (!ingredient || item.amount <= 0) {
        return acc;
      }

      const factor = item.amount / 100;
      return {
        calories: acc.calories + ingredient.calories_per_100g * factor,
        protein: acc.protein + ingredient.protein_per_100g * factor,
        carbs: acc.carbs + ingredient.carbs_per_100g * factor,
        fat: acc.fat + ingredient.fat_per_100g * factor,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const updateSelectedIngredient = (
    index: number,
    updates: Partial<SelectedIngredient>
  ) => {
    setSelectedIngredients((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const addIngredientRow = () => {
    if (ingredients.length === 0) {
      return;
    }
    setSelectedIngredients((current) => [
      ...current,
      { ingredientId: ingredients[0].id, amount: 100 },
    ]);
  };

  const removeIngredientRow = (index: number) => {
    setSelectedIngredients((current) => current.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: MealFormData) => {
    const hasValidIngredient = selectedIngredients.some(
      (item) => item.amount > 0 && ingredients.some((ingredient) => ingredient.id === item.ingredientId)
    );

    if (!hasValidIngredient) {
      alert("Add at least one ingredient with a positive amount.");
      return;
    }

    setLoading(true);

    try {
      const mealData: CreateMealRequest = {
        name: data.name,
        description: data.recipe?.trim() || undefined,
        calories: Number(totals.calories.toFixed(1)),
        protein: Number(totals.protein.toFixed(1)),
        carbs: Number(totals.carbs.toFixed(1)),
        fat: Number(totals.fat.toFixed(1)),
      };

      await apiService.createMeal(mealData);
      onMealAdded();
      setOpen(false);
      form.reset();
      setSelectedIngredients(ingredients.length > 0 ? [{ ingredientId: ingredients[0].id, amount: 100 }] : []);
    } catch (error) {
      console.error("Failed to add meal:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Dish</DialogTitle>
          <DialogDescription>
            Build the dish by choosing ingredients and amounts. Macros are calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dish name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chicken Stir Fry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Ingredients</p>
                  <p className="text-xs text-muted-foreground">Select ingredients and add the amount used in grams.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addIngredientRow}
                  disabled={loadingIngredients || ingredients.length === 0}
                >
                  Add Ingredient
                </Button>
              </div>

              {loadingIngredients ? (
                <p className="text-sm text-muted-foreground">Loading ingredients…</p>
              ) : ingredientsError ? (
                <p className="text-sm text-destructive">{ingredientsError}</p>
              ) : selectedIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">Start by adding an ingredient to your dish.</p>
              ) : (
                <div className="space-y-3">
                  {selectedIngredients.map((item, index) => (
                    <div key={`${item.ingredientId}-${index}`} className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
                      <label className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Ingredient</span>
                        <select
                          className="block h-10 w-full rounded-md border border-input bg-background px-3 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/10"
                          value={item.ingredientId}
                          onChange={(event) =>
                            updateSelectedIngredient(index, {
                              ingredientId: Number(event.target.value),
                            })
                          }
                        >
                          {ingredients.map((ingredient) => (
                            <option key={ingredient.id} value={ingredient.id}>
                              {ingredient.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Amount (g)</span>
                        <Input
                          type="number"
                          min={0}
                          value={item.amount}
                          onChange={(event) =>
                            updateSelectedIngredient(index, {
                              amount: Number(event.target.value) || 0,
                            })
                          }
                        />
                      </label>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-3"
                        onClick={() => removeIngredientRow(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Calories</p>
                <p className="mt-2 text-2xl font-semibold">{Number(totals.calories.toFixed(0))}</p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Protein</p>
                <p className="mt-2 text-2xl font-semibold">{Number(totals.protein.toFixed(1))}g</p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Carbs</p>
                <p className="mt-2 text-2xl font-semibold">{Number(totals.carbs.toFixed(1))}g</p>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fat</p>
                <p className="mt-2 text-2xl font-semibold">{Number(totals.fat.toFixed(1))}g</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="recipe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe / notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional recipe instructions or notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  loading || loadingIngredients || !!ingredientsError || selectedIngredients.length === 0
                }
              >
                {loading ? "Adding..." : "Add Dish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
