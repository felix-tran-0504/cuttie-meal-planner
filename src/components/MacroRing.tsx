interface MacroRingProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  colorClass: string;
  size?: number;
}

export function MacroRing({ label, current, goal, unit, colorClass, size = 80 }: MacroRingProps) {
  const pct = Math.min(current / goal, 1);
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colorClass}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold font-heading">{current}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">{goal}{unit} goal</span>
    </div>
  );
}
