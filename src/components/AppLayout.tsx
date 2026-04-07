import { BottomNav } from "@/components/BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
