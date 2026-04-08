import { Link } from "react-router-dom";
import { Leaf, UtensilsCrossed } from "lucide-react";

const logPages = [
  {
    to: "/log/meals",
    title: "Meals",
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-8 md:grid-cols-2">
        {logPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.to}
              to={page.to}
              className="group rounded-[2rem] border bg-card p-10 min-h-[50vh] transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {page.title}
                  </p>
                  <h2 className="mt-4 text-4xl font-semibold leading-tight">{page.title}</h2>
                  <p className="mt-4 max-w-xl text-base text-muted-foreground">{page.description}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 text-primary transition group-hover:bg-primary/10">
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

