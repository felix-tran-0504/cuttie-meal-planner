import { cn } from "@/lib/utils";

/** Compact P / C / F + kcal row used on meal and suggestion cards. */
export function MacroInlineSummary({
  calories,
  protein,
  carbs,
  fat,
  className,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-3 text-[11px] font-medium text-muted-foreground",
        className
      )}
    >
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-calories">{Math.round(calories)}</span>
        <span>kcal</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-protein">{protein}g</span>
        <span>P</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-carbs">{carbs}g</span>
        <span>C</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-fat">{fat}g</span>
        <span>F</span>
      </div>
    </div>
  );
}
