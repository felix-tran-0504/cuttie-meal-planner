import { ChevronDown } from "lucide-react";
import type { DishSuggestionItem } from "@/services/api";
import { MacroDetailGrid } from "@/components/MacroDetailGrid";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Inner panel for a suggestion — use inside `<Dialog>` next to `<DialogTrigger>`. */
export function SuggestionDetailPanel({ suggestion: m }: { suggestion: DishSuggestionItem }) {
  const ingredients = m.ingredients ?? [];
  const steps = m.steps ?? [];
  const tags = m.tags ?? [];

  return (
    <DialogContent className="flex w-[calc(100%-1.5rem)] min-h-[50vh] max-h-[90vh] flex-col gap-4 overflow-y-auto p-8 sm:min-w-[50vw] sm:max-w-6xl sm:gap-6 sm:p-10">
      <DialogHeader>
        <div className="flex items-start gap-4 pr-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-4xl">
            {m.emoji}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <DialogTitle className="font-heading text-xl leading-snug sm:text-2xl">{m.name}</DialogTitle>
            {tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag, ti) => (
                  <span
                    key={`${m.id}-h-${ti}`}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Ingredients
          </p>
          <ul className="space-y-3 rounded-2xl border bg-muted/30 px-4 py-4 sm:px-5 sm:py-5">
            {ingredients.map((line, i) => (
              <li
                key={`${m.id}-ing-${i}`}
                className="text-base font-medium leading-snug sm:text-lg"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Macros
          </p>
          <MacroDetailGrid
            calories={m.calories}
            protein={m.protein}
            carbs={m.carbs}
            fat={m.fat}
            subtitle="Estimated per serving"
          />
        </div>

        <Collapsible defaultOpen className="w-full">
          <div className="overflow-hidden rounded-2xl border bg-muted/30">
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left outline-none ring-offset-background transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:[&>svg]:rotate-180 sm:px-5 sm:py-4">
              <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Recipe
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-3 text-base leading-relaxed text-foreground sm:px-5 sm:pb-5 sm:pt-4 sm:text-lg">
                <p className="whitespace-pre-wrap">{m.description}</p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{m.servings ?? 1}</strong> serving
                  {(m.servings ?? 1) === 1 ? "" : "s"}
                  {" · "}
                  Prep <strong className="text-foreground">{m.prep_time_minutes ?? 0}</strong> min
                  {(m.cook_time_minutes ?? 0) > 0 ? (
                    <>
                      {" · "}
                      Cook <strong className="text-foreground">{m.cook_time_minutes}</strong> min
                    </>
                  ) : (
                    <>
                      {" · "}
                      No cooking
                    </>
                  )}
                </p>
                <ol className="list-inside list-decimal space-y-2 pl-0 sm:list-outside sm:pl-5">
                  {steps.map((step, i) => (
                    <li key={`${m.id}-step-${i}`} className="leading-snug">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <p className="text-xs text-muted-foreground">
          Suggestion only — add it as a meal from <strong className="text-foreground">Log → Meals</strong> when you cook it.
        </p>
      </div>
    </DialogContent>
  );
}
