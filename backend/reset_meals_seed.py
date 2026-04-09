"""
Delete all meals (and meal_ingredient rows). Ingredients are left unchanged.
Insert demo meals consistent with the current schema (macros + ingredient lines).

Run from the backend directory:
  python3 reset_meals_seed.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app import crud, schemas
from app.models import Meal, MealIngredient

# Ensure tables exist (e.g. meal_ingredients on fresh DB)
Base.metadata.create_all(bind=engine)


def compute_totals(db, lines: list[tuple[str, float]]) -> tuple[dict[str, float], list[tuple[int, float]]]:
    """lines: (ingredient name, grams). Returns macro totals and resolved (ingredient_id, grams)."""
    totals = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}
    resolved: list[tuple[int, float]] = []
    for name, grams in lines:
        ing = crud.get_ingredient_by_name(db, name)
        if ing is None:
            raise ValueError(f"Ingredient not in database: {name!r}. Run seed_ingredients.py first.")
        factor = grams / 100.0
        totals["calories"] += ing.calories_per_100g * factor
        totals["protein"] += ing.protein_per_100g * factor
        totals["carbs"] += ing.carbs_per_100g * factor
        totals["fat"] += ing.fat_per_100g * factor
        resolved.append((ing.id, grams))
    return totals, resolved


# Demo meals: only use ingredient names that exist in seed_ingredients.COMMON_INGREDIENTS
DEMO_MEALS: list[dict] = [
    {
        "name": "Greek Yogurt & Oats Bowl",
        "description": "Cold oats with yogurt and fruit.",
        "lines": [
            ("Greek Yogurt", 130),
            ("Oats", 45),
            ("Banana", 90),
        ],
    },
    {
        "name": "Chicken Rice Bowl",
        "description": "Grilled chicken with rice and greens.",
        "lines": [
            ("Chicken Breast", 145),
            ("Brown Rice", 190),
            ("Broccoli", 110),
            ("Olive Oil", 6),
        ],
    },
    {
        "name": "Salmon & Sweet Potato",
        "description": "Baked salmon with roasted sweet potato and spinach.",
        "lines": [
            ("Salmon", 170),
            ("Sweet Potato", 150),
            ("Spinach", 75),
        ],
    },
    {
        "name": "Turkey Sandwich Plate",
        "description": "Open-faced turkey with veg.",
        "lines": [
            ("Turkey Breast", 95),
            ("Whole Wheat Bread", 55),
            ("Tomato", 55),
            ("Spinach", 35),
        ],
    },
    {
        "name": "Egg & Fruit Snack",
        "description": "Boiled egg, apple, and almonds.",
        "lines": [
            ("Egg", 100),
            ("Apple", 140),
            ("Almonds", 22),
        ],
    },
]


def clear_meals(db) -> None:
    db.query(MealIngredient).delete(synchronize_session=False)
    db.query(Meal).delete(synchronize_session=False)
    db.commit()
    print("Cleared all meals and meal_ingredient rows (ingredients unchanged).")


def seed_demo_meals(db) -> None:
    for demo in DEMO_MEALS:
        totals, resolved = compute_totals(db, demo["lines"])
        meal_in = schemas.MealCreate(
            name=demo["name"],
            description=demo["description"],
            calories=round(totals["calories"], 1),
            protein=round(totals["protein"], 1),
            carbs=round(totals["carbs"], 1),
            fat=round(totals["fat"], 1),
            ingredients=[
                schemas.MealIngredientCreate(ingredient_id=iid, amount_grams=grams)
                for iid, grams in resolved
            ],
        )
        created = crud.create_meal(db, meal_in)
        print(f"  Added meal #{created.id}: {created.name} ({len(resolved)} ingredients)")


def main() -> None:
    db = SessionLocal()
    try:
        clear_meals(db)
        print("Seeding demo meals…")
        seed_demo_meals(db)
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
