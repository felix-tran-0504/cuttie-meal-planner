import { Home, UtensilsCrossed, Lightbulb, Leaf, Clock } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/log", icon: UtensilsCrossed, label: "Log" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/suggestions", icon: Lightbulb, label: "Ideas" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary bg-primary/10"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[11px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
