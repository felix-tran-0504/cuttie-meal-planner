import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronsUpDown, ImagePlus, X } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { apiService, CreateMealRequest, Ingredient } from "@/services/api";
import { mealsQueryKey } from "@/lib/queryKeys";
import {
  fromDateAndTimeToIso,
  roundToFiveMinutes,
  toDateInputValue,
  toTimeInputValue,
} from "@/lib/mealTime";

const mealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  recipe: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

type SelectedIngredient = {
  ingredientId: number;
  /** Empty string while the user clears the field; otherwise grams. */
  amount: number | "";
};

interface AddMealDialogProps {
  /** Optional; meal lists also refresh via shared query cache invalidation. */
  onMealAdded?: () => void;
  children: React.ReactNode;
}

function IngredientCombobox({
  ingredients,
  value,
  onChange,
}: {
  ingredients: Ingredient[];
  value: number;
  onChange: (ingredientId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = ingredients.find((i) => i.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between px-3 font-normal"
        >
          <span className="truncate text-left">{selected?.name ?? "Select ingredient"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[var(--layout-z-popover)] w-[var(--radix-popover-trigger-width)] overflow-hidden border-border p-0 shadow-md"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command className="flex max-h-[min(320px,55vh)] flex-col overflow-hidden rounded-lg bg-popover">
          <CommandInput placeholder="Search ingredients…" className="h-9 shrink-0" />
          <CommandList className="max-h-none overflow-hidden p-0">
            <ScrollArea
              className="h-[min(220px,42vh)] w-full"
              type="hover"
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandEmpty className="py-6 text-muted-foreground">No ingredient found.</CommandEmpty>
              <CommandGroup className="p-1">
                {ingredients.map((ing) => (
                  <CommandItem
                    key={ing.id}
                    value={ing.name}
                    keywords={[ing.name, ing.description ?? ""]}
                    onSelect={() => {
                      onChange(ing.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-md data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground",
                      "data-[selected=true]:[&_svg]:text-primary"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === ing.id ? "text-primary opacity-100" : "opacity-0"
                      )}
                    />
                    {ing.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AddMealDialog({ onMealAdded, children }: AddMealDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoUrlDraft, setPhotoUrlDraft] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [eatenDate, setEatenDate] = useState(() => toDateInputValue(roundToFiveMinutes(new Date())));
  const [eatenTime, setEatenTime] = useState(() => toTimeInputValue(roundToFiveMinutes(new Date())));

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

  useEffect(() => {
    if (!open) return;
    const n = roundToFiveMinutes(new Date());
    setEatenDate(toDateInputValue(n));
    setEatenTime(toTimeInputValue(n));
  }, [open]);

  const totals = selectedIngredients.reduce(
    (acc, item) => {
      const ingredient = ingredients.find((ingredient) => ingredient.id === item.ingredientId);
      const grams = item.amount === "" ? 0 : item.amount;
      if (!ingredient || grams <= 0) {
        return acc;
      }

      const factor = grams / 100;
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

  const addPhotoUrlFromDraft = () => {
    const s = photoUrlDraft.trim();
    if (!s) return;
    try {
      const u = new URL(s);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("invalid");
      }
      setPhotoUrls((prev) => [...prev, s]);
      setPhotoUrlDraft("");
    } catch {
      alert("Enter a valid http(s) image URL.");
    }
  };

  const onSubmit = async (data: MealFormData) => {
    const hasValidIngredient = selectedIngredients.some((item) => {
      const grams = item.amount === "" ? 0 : item.amount;
      return grams > 0 && ingredients.some((ingredient) => ingredient.id === item.ingredientId);
    });

    if (!hasValidIngredient) {
      alert("Add at least one ingredient with a positive amount.");
      return;
    }

    setLoading(true);

    try {
      const mealData: CreateMealRequest = {
        name: data.name,
        description: data.recipe?.trim() || undefined,
        calories: Math.round(totals.calories),
        protein: Number(totals.protein.toFixed(1)),
        carbs: Number(totals.carbs.toFixed(1)),
        fat: Number(totals.fat.toFixed(1)),
        eaten_at: fromDateAndTimeToIso(eatenDate, eatenTime),
        ingredients: selectedIngredients
          .filter((item) => {
            const grams = item.amount === "" ? 0 : item.amount;
            return grams > 0 && ingredients.some((ingredient) => ingredient.id === item.ingredientId);
          })
          .map((item) => ({
            ingredient_id: item.ingredientId,
            amount_grams: item.amount === "" ? 0 : item.amount,
          })),
      };
      if (photoUrls.length > 0) {
        mealData.photo_urls = photoUrls;
      }

      await apiService.createMeal(mealData);
      await queryClient.invalidateQueries({ queryKey: mealsQueryKey });
      onMealAdded?.();
      setOpen(false);
      form.reset();
      setPhotoUrls([]);
      setPhotoUrlDraft("");
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
      <DialogContent className="flex w-[calc(100%-1.5rem)] min-h-[50vh] max-h-[90vh] flex-col gap-4 overflow-y-auto p-8 sm:min-w-[50vw] sm:max-w-5xl">
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

            <div className="space-y-2">
              <p className="text-sm font-medium leading-none">When did you eat this?</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="meal-eaten-date">
                    Date
                  </label>
                  <Input
                    id="meal-eaten-date"
                    type="date"
                    value={eatenDate}
                    onChange={(e) => setEatenDate(e.target.value)}
                    className="w-full min-w-0 sm:w-[11rem]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor="meal-eaten-time">
                    Time
                  </label>
                  <Input
                    id="meal-eaten-time"
                    type="time"
                    step={300}
                    value={eatenTime}
                    onChange={(e) => setEatenTime(e.target.value)}
                    className="w-full min-w-0 sm:w-[8.5rem]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">Photos (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Add image URLs or upload files (JPEG, PNG, WebP, GIF — max 5MB each).
                </p>
              </div>
              {photoUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {photoUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border bg-background"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 shadow hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setPhotoUrls((prev) => prev.filter((_, i) => i !== index))}
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="space-y-1 sm:flex-1">
                  <span className="text-xs font-medium text-muted-foreground">Image URL</span>
                  <Input
                    type="url"
                    placeholder="https://…"
                    value={photoUrlDraft}
                    onChange={(e) => setPhotoUrlDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPhotoUrlFromDraft();
                      }
                    }}
                  />
                </label>
                <Button type="button" variant="secondary" className="shrink-0" onClick={addPhotoUrlFromDraft}>
                  Add URL
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto}
                  className="gap-1.5"
                  onClick={() => document.getElementById("meal-photo-file")?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                  {uploadingPhoto ? "Uploading…" : "Upload from device"}
                </Button>
                <input
                  id="meal-photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setUploadingPhoto(true);
                    try {
                      const url = await apiService.uploadMealPhoto(file);
                      setPhotoUrls((prev) => [...prev, url]);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setUploadingPhoto(false);
                    }
                  }}
                />
              </div>
            </div>

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
                        <IngredientCombobox
                          ingredients={ingredients}
                          value={item.ingredientId}
                          onChange={(ingredientId) =>
                            updateSelectedIngredient(index, { ingredientId })
                          }
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground">Amount (g)</span>
                        <Input
                          type="number"
                          min={0}
                          value={item.amount === "" ? "" : item.amount}
                          onChange={(event) => {
                            const v = event.target.value;
                            if (v === "") {
                              updateSelectedIngredient(index, { amount: "" });
                              return;
                            }
                            const n = parseFloat(v);
                            if (!Number.isNaN(n)) {
                              updateSelectedIngredient(index, { amount: n });
                            }
                          }}
                          onBlur={() => {
                            if (item.amount === "") {
                              updateSelectedIngredient(index, { amount: 0 });
                            }
                          }}
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
                <p className="mt-2 text-2xl font-semibold">{Math.round(totals.calories)}</p>
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
