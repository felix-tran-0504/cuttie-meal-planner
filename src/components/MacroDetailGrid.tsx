import { cn } from "@/lib/utils";

/** Large macro tiles used in meal and suggestion detail dialogs (place below a “Macros” heading). */
export function MacroDetailGrid({
  calories,
  protein,
  carbs,
  fat,
  subtitle,
  className,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {subtitle ? <p className="mb-2 text-xs text-muted-foreground">{subtitle}</p> : null}
      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 sm:gap-4">
        <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border bg-muted/40 px-3 py-4 text-muted-foreground sm:min-h-[6.5rem] sm:px-4 sm:py-5">
          <div className="text-2xl font-bold tabular-nums text-calories sm:text-3xl">{Math.round(calories)}</div>
          <div className="mt-1 text-sm font-medium sm:text-base">kcal</div>
        </div>
        <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border bg-muted/40 px-3 py-4 text-muted-foreground sm:min-h-[6.5rem] sm:px-4 sm:py-5">
          <div className="text-2xl font-bold tabular-nums text-protein sm:text-3xl">{protein}g</div>
          <div className="mt-1 text-sm font-medium sm:text-base">Protein</div>
        </div>
        <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border bg-muted/40 px-3 py-4 text-muted-foreground sm:min-h-[6.5rem] sm:px-4 sm:py-5">
          <div className="text-2xl font-bold tabular-nums text-carbs sm:text-3xl">{carbs}g</div>
          <div className="mt-1 text-sm font-medium sm:text-base">Carbs</div>
        </div>
        <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border bg-muted/40 px-3 py-4 text-muted-foreground sm:min-h-[6.5rem] sm:px-4 sm:py-5">
          <div className="text-2xl font-bold tabular-nums text-fat sm:text-3xl">{fat}g</div>
          <div className="mt-1 text-sm font-medium sm:text-base">Fat</div>
        </div>
      </div>
    </div>
  );
}
