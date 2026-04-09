import { BottomNav } from "@/components/BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-page-padding-x)]"
        style={{
          paddingTop: `calc(var(--layout-page-padding-top) + var(--layout-safe-top))`,
          paddingBottom: `calc(var(--layout-page-padding-bottom) + var(--layout-safe-bottom))`,
        }}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
