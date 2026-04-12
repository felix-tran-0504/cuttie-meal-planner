import type { Ingredient } from "@/services/api";

export type MealIngredientLine = { ingredient_id: number; amount_grams: number };

/** Strip trailing prep notes so names match the pantry list better. */
function cleanNameHint(s: string): string {
  return s
    .replace(/,\s*(sliced|diced|chopped|minced|cubed|grated|optional|to taste).*$/i, "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .trim();
}

/** Try to read a weight in grams and the food name from one LLM line. */
function parseGramsAndHint(line: string): { grams: number | null; nameHint: string } {
  const t = line.trim();
  let m = t.match(/^([\d.]+)\s*g(?:rams)?\b\s*(.+)$/i);
  if (m) {
    const grams = parseFloat(m[1]);
    if (!Number.isFinite(grams) || grams <= 0) return { grams: null, nameHint: cleanNameHint(t) };
    return { grams, nameHint: cleanNameHint(m[2]) };
  }
  m = t.match(/^([\d.]+)\s*kg\b\s*(.+)$/i);
  if (m) {
    const kg = parseFloat(m[1]);
    if (!Number.isFinite(kg) || kg <= 0) return { grams: null, nameHint: cleanNameHint(t) };
    return { grams: kg * 1000, nameHint: cleanNameHint(m[2]) };
  }
  m = t.match(/^([\d.]+)\s*ml\b\s*(.+)$/i);
  if (m) {
    const ml = parseFloat(m[1]);
    if (!Number.isFinite(ml) || ml <= 0) return { grams: null, nameHint: cleanNameHint(t) };
    return { grams: ml, nameHint: cleanNameHint(m[2]) };
  }
  m = t.match(/^([\d.]+)\s+(.+)$/);
  if (m) {
    let rest = cleanNameHint(m[2]).replace(
      /^(tbsp|tsp|tablespoons?|teaspoons?|cups?|oz|ounces?|lb|pounds?)\s+/i,
      ""
    );
    rest = rest.trim();
    return { grams: null, nameHint: rest };
  }
  return { grams: null, nameHint: cleanNameHint(t) };
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/** Pick the best matching pantry ingredient for a free-text hint. */
export function matchIngredientByName(hint: string, ingredients: Ingredient[]): Ingredient | null {
  const h = normalize(hint);
  if (!h) return null;

  let found = ingredients.find((i) => normalize(i.name) === h);
  if (found) return found;

  found = ingredients.find((i) => h.includes(normalize(i.name)) || normalize(i.name).includes(h));
  if (found) return found;

  const words = h.split(/\s+/).filter((w) => w.length > 2);
  for (const w of words) {
    found = ingredients.find((i) => normalize(i.name).includes(w));
    if (found) return found;
  }

  const first = h.split(/[,\s]+/).find((p) => p.length > 2);
  if (first) {
    found = ingredients.find((i) => normalize(i.name).includes(first) || first.includes(normalize(i.name)));
    if (found) return found;
  }

  return null;
}

const DEFAULT_FALLBACK_GRAMS = 100;

/**
 * Map suggestion strings to meal_ingredient rows using the user's ingredient list.
 * Lines without a match are skipped (recipe text still has the full list).
 */
export function mealIngredientsFromSuggestion(
  ingredientLines: string[],
  dbIngredients: Ingredient[]
): MealIngredientLine[] {
  const amounts = new Map<number, number>();

  for (const line of ingredientLines) {
    const skip =
      /refresh meal ideas|pantry staples|detail as needed/i.test(line) ||
      line.trim().length < 2;
    if (skip) continue;

    const { grams, nameHint } = parseGramsAndHint(line);
    const ing = matchIngredientByName(nameHint, dbIngredients);
    if (!ing) continue;

    const amount = grams != null && grams > 0 ? grams : DEFAULT_FALLBACK_GRAMS;
    const prev = amounts.get(ing.id) ?? 0;
    amounts.set(ing.id, prev + amount);
  }

  return Array.from(amounts.entries()).map(([ingredient_id, amount_grams]) => ({
    ingredient_id,
    amount_grams: Math.round(amount_grams * 10) / 10,
  }));
}
