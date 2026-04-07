import { Link } from "react-router-dom";
import { Leaf, UtensilsCrossed } from "lucide-react";

const logPages = [
  {
    to: "/log/meals",
    title: "Meal Log",
    description: "Track meals, calories, protein, carbs, and fat.",
    icon: UtensilsCrossed,
  },
  {
    to: "/log/ingredients",
    title: "Ingredients",
    description: "Add ingredients and manage nutrition.",
    icon: Leaf,
  },
];

export default function Log() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
    {logPages.map((page) => {
        const Icon = page.icon;
        return (
        <Link
            key={page.to}
            to={page.to}
            className="group rounded-3xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
        >
            <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {page.title}
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">{page.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary transition group-hover:bg-primary/10">
                <Icon className="h-6 w-6" />
            </div>
            </div>
        </Link>
        );
    })}
    </div>
  );
}

