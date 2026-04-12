import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { SuggestionCard } from "@/components/SuggestionCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiService, DishSuggestionItem, normalizeDishSuggestion } from "@/services/api";
import { suggestions as demoMealIdeas } from "@/data/mockData";
import { cn } from "@/lib/utils";

const TAG_FILTERS = ["All", "High Protein", "Low Carb", "Vegan", "Quick"] as const;

function isLlmDisabledMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("openai_api_key") ||
    m.includes("enable ai meal ideas") ||
    m.includes("llm not configured") ||
    m.includes("example placeholder") ||
    m.includes("not the example placeholder")
  );
}

/** OpenAI billing / credits — show sample ideas instead of raw JSON. */
function isQuotaExceededMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("insufficient_quota") ||
    m.includes("quota exceeded") ||
    m.includes("exceeded your current quota") ||
    (m.includes("429") && (m.includes("quota") || m.includes("billing")))
  );
}

const DISH_SUGGESTIONS_KEY = ["dish-suggestions"] as const;

type DishSuggestionsResult = {
  suggestions: DishSuggestionItem[];
  isDemo: boolean;
  demoKind: "live" | "no_key" | "quota";
};

export default function Suggestions() {
  const [tagFilter, setTagFilter] = useState<string>("All");
  const queryClient = useQueryClient();

  const ingredientsQuery = useQuery({
    queryKey: ["ingredients"],
    queryFn: () => apiService.getIngredients(),
  });

  /** Survives navigating away from Ideas (same session). */
  const { data: persistedSuggestions } = useQuery<DishSuggestionsResult | undefined>({
    queryKey: DISH_SUGGESTIONS_KEY,
    queryFn: () => Promise.resolve(undefined),
    enabled: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const suggestionsMutation = useMutation({
    mutationFn: async (count: number) => {
      const n = Math.min(Math.max(count, 1), demoMealIdeas.length);
      try {
        const list = await apiService.fetchDishSuggestions(count);
        return {
          suggestions: list,
          isDemo: false as const,
          demoKind: "live" as const,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (isLlmDisabledMessage(msg)) {
          return {
            suggestions: demoMealIdeas.slice(0, n).map(normalizeDishSuggestion),
            isDemo: true as const,
            demoKind: "no_key" as const,
          };
        }
        if (isQuotaExceededMessage(msg)) {
          return {
            suggestions: demoMealIdeas.slice(0, n).map(normalizeDishSuggestion),
            isDemo: true as const,
            demoKind: "quota" as const,
          };
        }
        throw e;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(DISH_SUGGESTIONS_KEY, data);
    },
  });

  const latestResult = suggestionsMutation.data ?? persistedSuggestions;
  const suggestions = latestResult?.suggestions ?? [];
  const isDemoMode = latestResult?.isDemo ?? false;
  const demoKind = latestResult?.demoKind ?? "live";
  const filtered = useMemo(() => {
    if (tagFilter === "All") return suggestions;
    const t = tagFilter.toLowerCase();
    return suggestions.filter((s) =>
      (s.tags ?? []).some((x) => x.toLowerCase().includes(t) || t.includes(x.toLowerCase()))
    );
  }, [suggestions, tagFilter]);

  const ingredientCount = ingredientsQuery.data?.length ?? 0;
  const canRequest = ingredientCount > 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-extrabold">Meal Ideas</h1>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-xl gap-2"
              disabled={!canRequest || suggestionsMutation.isPending}
              onClick={() => suggestionsMutation.mutate(5)}
            >
              {suggestionsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : suggestions.length > 0 ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh ideas
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate ideas
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {ingredientsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading ingredients…</p>
      ) : !canRequest ? (
        <p className="rounded-2xl border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          Add at least one ingredient to get tailored dish ideas.{" "}
          <Link to="/log/ingredients" className="font-medium text-primary underline-offset-2 hover:underline">
            Go to Ingredients
          </Link>
        </p>
      ) : null}

      {isDemoMode && suggestions.length > 0 && demoKind === "no_key" ? (
        <Alert
          variant="destructive"
          className="rounded-xl border-destructive/40 [&>svg]:text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn&apos;t load AI suggestions</AlertTitle>
          <AlertDescription className="text-destructive/95">
            Set <code className="rounded bg-destructive/10 px-1 py-0.5 text-xs">OPENAI_API_KEY</code> in{" "}
            <code className="rounded bg-destructive/10 px-1 py-0.5 text-xs">backend/.env</code> and restart the API. Showing
            sample ideas below until the key is configured.
          </AlertDescription>
        </Alert>
      ) : null}

      {isDemoMode && suggestions.length > 0 && demoKind === "quota" ? (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn&apos;t load AI suggestions</AlertTitle>
          <AlertDescription className="text-destructive/95">
            OpenAI returned <strong>quota exceeded</strong> — add billing or credits at{" "}
            <a
              href="https://platform.openai.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              platform.openai.com/account/billing
            </a>
            . Sample ideas are shown below until the API accepts requests.
          </AlertDescription>
        </Alert>
      ) : null}

      {suggestionsMutation.isError ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {(suggestionsMutation.error as Error).message}
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <>
          <div className="flex gap-2 flex-wrap">
            {TAG_FILTERS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  tag === tagFilter
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {filtered.map((meal: DishSuggestionItem, i: number) => (
              <SuggestionCard key={meal.id} meal={meal} index={i} />
            ))}
          </div>
          {filtered.length === 0 && suggestions.length > 0 ? (
            <p className="text-center text-sm text-muted-foreground">No ideas match this tag. Try &quot;All&quot;.</p>
          ) : null}
        </>
      ) : !suggestionsMutation.isPending && canRequest && !suggestionsMutation.isError ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Tap <strong className="text-foreground">Generate ideas</strong> to ask the AI for dishes using your ingredients.
        </p>
      ) : null}

      {suggestionsMutation.isPending && suggestions.length === 0 ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((k) => (
            <div key={k} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
