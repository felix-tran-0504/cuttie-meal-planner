import { ChevronDown } from "lucide-react";
import { Meal } from "@/services/api";
import { MacroDetailGrid } from "@/components/MacroDetailGrid";
import { cn, formatMealLoggedDateTime } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Full meal detail sheet — render inside `<Dialog>` next to a `DialogTrigger`. */
export function MealDetailPanel({ meal }: { meal: Meal }) {
  const emoji = "🍽️";
  const photoUrls = meal.photo_urls?.filter(Boolean) ?? [];
  const multiplePhotos = photoUrls.length > 1;
  const loggedAt = formatMealLoggedDateTime(meal.eaten_at ?? meal.created_at);

  return (
    <DialogContent className="flex w-[calc(100%-1.5rem)] min-h-[50vh] max-h-[90vh] flex-col gap-4 overflow-y-auto p-8 sm:min-w-[50vw] sm:max-w-6xl sm:gap-6 sm:p-10">
        <DialogHeader>
          <div className="flex items-start gap-4 pr-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-4xl">
              {emoji}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <DialogTitle className="font-heading text-xl leading-snug sm:text-2xl">{meal.name}</DialogTitle>
              {loggedAt ? (
                <p className="mt-2 text-sm text-muted-foreground tabular-nums">{loggedAt}</p>
              ) : null}
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          {photoUrls.length > 0 ? (
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Photos
              </p>
              <div
                className={cn(
                  multiplePhotos &&
                    "overflow-x-auto overscroll-x-contain pb-2 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
                )}
              >
                <div
                  className={cn(
                    "flex gap-3",
                    multiplePhotos ? "w-max max-w-none snap-x snap-mandatory pr-1" : "w-full flex-col"
                  )}
                >
                  {photoUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className={cn(
                        "relative aspect-video overflow-hidden rounded-xl border bg-muted",
                        multiplePhotos
                          ? "w-[min(74vw,19rem)] shrink-0 snap-center snap-always sm:w-[min(60vw,21rem)]"
                          : "w-full max-w-[min(100%,20rem)] sm:max-w-[22rem]"
                      )}
                    >
                      <img
                        src={url}
                        alt={`${meal.name} — photo ${index + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Ingredients
            </p>
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <ul className="space-y-3 rounded-2xl border bg-muted/30 px-4 py-4 sm:px-5 sm:py-5">
                {meal.ingredients.map((line, index) => (
                  <li
                    key={`${line.ingredient.id}-${index}`}
                    className="flex items-baseline justify-between gap-4 text-base sm:text-lg"
                  >
                    <span className="min-w-0 font-medium leading-snug">{line.ingredient.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {line.amount_grams % 1 === 0
                        ? line.amount_grams.toFixed(0)
                        : line.amount_grams.toFixed(1)}
                      g
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base italic text-muted-foreground">No ingredients recorded for this dish.</p>
            )}
          </div>
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Macros
            </p>
            <MacroDetailGrid
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
            />
          </div>
          {meal.description?.trim() ? (
            <Collapsible defaultOpen className="w-full">
              <div className="overflow-hidden rounded-2xl border bg-muted/30">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left outline-none ring-offset-background transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:[&>svg]:rotate-180 sm:px-5 sm:py-4">
                  <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Recipe
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border/60 px-4 pb-4 pt-1 text-base leading-relaxed text-foreground sm:px-5 sm:pb-5 sm:pt-2 sm:text-lg">
                    <p className="whitespace-pre-wrap">{meal.description.trim()}</p>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ) : null}
        </div>
      </DialogContent>
  );
}
