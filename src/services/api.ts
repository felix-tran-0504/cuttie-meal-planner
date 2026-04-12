const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface Ingredient {
  id: number;
  name: string;
  description?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  created_at: string;
  updated_at?: string;
}

export interface MealIngredientLine {
  amount_grams: number;
  ingredient: Ingredient;
}

export interface Meal {
  id: number;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** When the meal was eaten (wall time). Omitted on older rows until backfilled. */
  eaten_at?: string | null;
  created_at: string;
  updated_at?: string;
  ingredients?: MealIngredientLine[];
  photo_urls?: string[] | null;
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: { ingredient_id: number; amount_grams: number }[];
  photo_urls?: string[];
  /** ISO 8601 — when the food was eaten (defaults to now if omitted). */
  eaten_at?: string;
}

/** Build a create/update payload from an existing meal (e.g. after editing time). */
export function mealToCreateRequest(
  meal: Meal,
  overrides: Partial<CreateMealRequest> = {}
): CreateMealRequest {
  const lines =
    meal.ingredients?.map((line) => ({
      ingredient_id: line.ingredient.id,
      amount_grams: line.amount_grams,
    })) ?? [];
  const base: CreateMealRequest = {
    name: meal.name,
    description: meal.description?.trim() || undefined,
    calories: Math.round(meal.calories),
    protein: Number(meal.protein.toFixed(1)),
    carbs: Number(meal.carbs.toFixed(1)),
    fat: Number(meal.fat.toFixed(1)),
    ingredients: lines.length > 0 ? lines : undefined,
    photo_urls: meal.photo_urls?.length ? [...meal.photo_urls] : undefined,
    eaten_at: meal.eaten_at ?? meal.created_at,
  };
  return { ...base, ...overrides };
}

export interface CreateIngredientRequest {
  name: string;
  description?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

/** AI-generated meal idea (Ideas tab). */
export interface DishSuggestionItem {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  tags: string[];
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  ingredients: string[];
  steps: string[];
}

/** Coerce API / cached payloads so UI never calls .map on undefined. */
export function normalizeDishSuggestion(raw: unknown): DishSuggestionItem {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const strList = (key: string): string[] => {
    const v = item[key];
    if (!Array.isArray(v)) return [];
    return v.map((x) => String(x).trim()).filter(Boolean);
  };
  const tags = strList("tags");
  const ingredients = strList("ingredients");
  const steps = strList("steps");
  const emoji = String(item.emoji ?? "🍽️").trim().slice(0, 8) || "🍽️";
  const servings = Math.max(1, Math.min(12, Math.floor(Number(item.servings) || 2)));
  const prep = Math.max(0, Math.min(240, Math.floor(Number(item.prep_time_minutes) || 15)));
  const cook = Math.max(0, Math.min(480, Math.floor(Number(item.cook_time_minutes) || 0)));

  return {
    id: String(item.id ?? "").trim() || `idea-${Math.random().toString(36).slice(2, 9)}`,
    name: String(item.name ?? "Meal idea").trim() || "Meal idea",
    emoji,
    calories: Number(item.calories) || 0,
    protein: Number(item.protein) || 0,
    carbs: Number(item.carbs) || 0,
    fat: Number(item.fat) || 0,
    description:
      String(item.description ?? "").trim() || "A meal idea based on your ingredients.",
    tags: tags.length ? tags : ["Balanced"],
    servings,
    prep_time_minutes: prep,
    cook_time_minutes: cook,
    ingredients: ingredients.length
      ? ingredients
      : ["Refresh meal ideas to load a full ingredient list for this dish."],
    steps: steps.length
      ? steps
      : ["Refresh meal ideas to load step-by-step instructions."],
  };
}

/** Build a create payload from an AI suggestion (recipe text in description). */
export function dishSuggestionToCreateRequest(
  s: DishSuggestionItem,
  options?: {
    /** When set, ingredient lines are stored as meal rows; omit duplicate list from recipe text. */
    mealIngredients?: { ingredient_id: number; amount_grams: number }[];
  }
): CreateMealRequest {
  const mealIng = options?.mealIngredients;
  const structured = Array.isArray(mealIng) && mealIng.length > 0;
  const timeLine =
    (s.cook_time_minutes ?? 0) > 0
      ? `Servings: ${s.servings} · Prep ${s.prep_time_minutes} min · Cook ${s.cook_time_minutes} min`
      : `Servings: ${s.servings} · Prep ${s.prep_time_minutes} min · No cooking`;
  const lines: string[] = [s.description.trim(), "", timeLine, ""];
  if (!structured) {
    lines.push("Ingredients:");
    for (const line of s.ingredients ?? []) {
      lines.push(`• ${line}`);
    }
    lines.push("");
  }
  lines.push("Steps:");
  (s.steps ?? []).forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });
  if ((s.tags ?? []).length) {
    lines.push("", `Tags: ${(s.tags ?? []).join(", ")}`);
  }
  const description = lines.join("\n").trim();

  return {
    name: s.name.trim(),
    description: description || undefined,
    calories: Math.round(s.calories),
    protein: Number(s.protein.toFixed(1)),
    carbs: Number(s.carbs.toFixed(1)),
    fat: Number(s.fat.toFixed(1)),
    eaten_at: new Date().toISOString(),
    ingredients: structured ? mealIng : undefined,
  };
}

class ApiService {
  private async readErrorMessage(response: Response): Promise<string> {
    const fallback = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const err = (await response.json()) as { detail?: unknown };
      const d = err.detail;
      if (typeof d === "string") return d;
      if (Array.isArray(d)) {
        const parts = d.map((x: { msg?: string }) =>
          typeof x === "object" && x && "msg" in x ? String((x as { msg: string }).msg) : String(x)
        );
        if (parts.length) return parts.join("; ");
      }
    } catch {
      /* ignore */
    }
    return fallback;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(await this.readErrorMessage(response));
      }

      return response.json();
    } catch (error) {
      console.error(`Fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  async getMeals(): Promise<Meal[]> {
    return this.request('/meals/');
  }

  async createMeal(meal: CreateMealRequest): Promise<Meal> {
    return this.request('/meals/', {
      method: 'POST',
      body: JSON.stringify(meal),
    });
  }

  /** Upload a meal photo; returns absolute URL served by the API (`/static/uploads/...`). */
  async uploadMealPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/meals/upload-photo`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || `Upload failed: ${response.status}`);
    }
    const data = (await response.json()) as { url: string };
    return data.url;
  }

  async updateMeal(id: number, meal: CreateMealRequest): Promise<Meal> {
    return this.request(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    });
  }

  async deleteMeal(id: number): Promise<void> {
    await this.request(`/meals/${id}`, {
      method: 'DELETE',
    });
  }

  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return this.request('/ingredients/');
  }

  async getIngredient(id: number): Promise<Ingredient> {
    return this.request(`/ingredients/${id}`);
  }

  async createIngredient(ingredient: CreateIngredientRequest): Promise<Ingredient> {
    return this.request('/ingredients/', {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
  }

  async updateIngredient(id: number, ingredient: CreateIngredientRequest): Promise<Ingredient> {
    return this.request(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ingredient),
    });
  }

  async deleteIngredient(id: number): Promise<void> {
    await this.request(`/ingredients/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Ask the LLM for dish ideas based on ingredients in the database.
   * Requires OPENAI_API_KEY on the backend. Errors include API `detail` text when available.
   */
  async fetchDishSuggestions(count = 5): Promise<DishSuggestionItem[]> {
    const response = await fetch(`${API_BASE_URL}/suggestions/dishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const err = (await response.json()) as { detail?: unknown };
        if (typeof err.detail === 'string') {
          message = err.detail;
        }
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    const data = (await response.json()) as { suggestions?: unknown[] };
    const list = Array.isArray(data.suggestions) ? data.suggestions : [];
    return list.map(normalizeDishSuggestion);
  }
}

export const apiService = new ApiService();