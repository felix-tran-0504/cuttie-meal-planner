"""
Seed script to populate the database with common ingredients.
Run this from the backend directory: python seed_ingredients.py
"""

import sys
from pathlib import Path

# Add the backend to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine
from app.models import Base, Ingredient
from app.schemas import IngredientCreate
from app import crud

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Common ingredients with nutritional values per 100g
COMMON_INGREDIENTS = [
    # Proteins
    {
        "name": "Chicken Breast",
        "description": "Skinless chicken breast, raw",
        "calories_per_100g": 165,
        "protein_per_100g": 31,
        "carbs_per_100g": 0,
        "fat_per_100g": 3.6,
    },
    {
        "name": "Salmon",
        "description": "Raw salmon fillet",
        "calories_per_100g": 208,
        "protein_per_100g": 20,
        "carbs_per_100g": 0,
        "fat_per_100g": 13,
    },
    {
        "name": "Ground Beef",
        "description": "Lean ground beef",
        "calories_per_100g": 250,
        "protein_per_100g": 26,
        "carbs_per_100g": 0,
        "fat_per_100g": 15,
    },
    {
        "name": "Egg",
        "description": "1 large egg",
        "calories_per_100g": 155,
        "protein_per_100g": 13,
        "carbs_per_100g": 1.1,
        "fat_per_100g": 11,
    },
    {
        "name": "Greek Yogurt",
        "description": "Plain Greek yogurt",
        "calories_per_100g": 59,
        "protein_per_100g": 10,
        "carbs_per_100g": 3.3,
        "fat_per_100g": 0.4,
    },
    {
        "name": "Tuna",
        "description": "Canned tuna in water, drained",
        "calories_per_100g": 96,
        "protein_per_100g": 22,
        "carbs_per_100g": 0,
        "fat_per_100g": 0.8,
    },
    {
        "name": "Turkey Breast",
        "description": "Ground turkey breast",
        "calories_per_100g": 130,
        "protein_per_100g": 22,
        "carbs_per_100g": 0,
        "fat_per_100g": 4.7,
    },
    # Carbs
    {
        "name": "Brown Rice",
        "description": "Cooked brown rice",
        "calories_per_100g": 112,
        "protein_per_100g": 2.6,
        "carbs_per_100g": 24,
        "fat_per_100g": 1,
    },
    {
        "name": "Sweet Potato",
        "description": "Baked sweet potato",
        "calories_per_100g": 86,
        "protein_per_100g": 1.6,
        "carbs_per_100g": 20,
        "fat_per_100g": 0.1,
    },
    {
        "name": "Oats",
        "description": "Dry rolled oats",
        "calories_per_100g": 389,
        "protein_per_100g": 17,
        "carbs_per_100g": 66,
        "fat_per_100g": 7,
    },
    {
        "name": "White Rice",
        "description": "Cooked white rice",
        "calories_per_100g": 130,
        "protein_per_100g": 2.7,
        "carbs_per_100g": 28,
        "fat_per_100g": 0.3,
    },
    {
        "name": "Whole Wheat Bread",
        "description": "1 slice",
        "calories_per_100g": 247,
        "protein_per_100g": 9,
        "carbs_per_100g": 43,
        "fat_per_100g": 3.3,
    },
    {
        "name": "Banana",
        "description": "Raw banana",
        "calories_per_100g": 89,
        "protein_per_100g": 1.1,
        "carbs_per_100g": 23,
        "fat_per_100g": 0.3,
    },
    {
        "name": "Apple",
        "description": "Raw apple with skin",
        "calories_per_100g": 52,
        "protein_per_100g": 0.3,
        "carbs_per_100g": 14,
        "fat_per_100g": 0.2,
    },
    # Vegetables
    {
        "name": "Broccoli",
        "description": "Raw broccoli",
        "calories_per_100g": 34,
        "protein_per_100g": 2.8,
        "carbs_per_100g": 7,
        "fat_per_100g": 0.4,
    },
    {
        "name": "Spinach",
        "description": "Raw spinach",
        "calories_per_100g": 23,
        "protein_per_100g": 2.7,
        "carbs_per_100g": 3.6,
        "fat_per_100g": 0.4,
    },
    {
        "name": "Carrots",
        "description": "Raw carrots",
        "calories_per_100g": 41,
        "protein_per_100g": 0.9,
        "carbs_per_100g": 10,
        "fat_per_100g": 0.2,
    },
    {
        "name": "Bell Pepper",
        "description": "Raw red bell pepper",
        "calories_per_100g": 31,
        "protein_per_100g": 1,
        "carbs_per_100g": 6,
        "fat_per_100g": 0.3,
    },
    {
        "name": "Tomato",
        "description": "Raw tomato",
        "calories_per_100g": 18,
        "protein_per_100g": 0.9,
        "carbs_per_100g": 3.9,
        "fat_per_100g": 0.2,
    },
    {
        "name": "Cucumber",
        "description": "Raw cucumber with skin",
        "calories_per_100g": 16,
        "protein_per_100g": 0.7,
        "carbs_per_100g": 3.6,
        "fat_per_100g": 0.1,
    },
    # Fats
    {
        "name": "Almonds",
        "description": "Raw almonds",
        "calories_per_100g": 579,
        "protein_per_100g": 21,
        "carbs_per_100g": 22,
        "fat_per_100g": 50,
    },
    {
        "name": "Olive Oil",
        "description": "Extra virgin olive oil",
        "calories_per_100g": 884,
        "protein_per_100g": 0,
        "carbs_per_100g": 0,
        "fat_per_100g": 100,
    },
    {
        "name": "Avocado",
        "description": "Raw avocado",
        "calories_per_100g": 160,
        "protein_per_100g": 2,
        "carbs_per_100g": 9,
        "fat_per_100g": 15,
    },
    {
        "name": "Peanut Butter",
        "description": "Natural peanut butter",
        "calories_per_100g": 588,
        "protein_per_100g": 25,
        "carbs_per_100g": 27,
        "fat_per_100g": 50,
    },
]


def seed_ingredients():
    db = SessionLocal()
    try:
        added_count = 0
        skipped_count = 0

        for ingredient_data in COMMON_INGREDIENTS:
            # Check if ingredient already exists
            existing = crud.get_ingredient_by_name(db, ingredient_data["name"])
            if existing:
                print(f"⏭️  Skipped: {ingredient_data['name']} (already exists)")
                skipped_count += 1
                continue

            # Create new ingredient
            ingredient = IngredientCreate(**ingredient_data)
            created = crud.create_ingredient(db, ingredient)
            print(f"✅ Added: {created.name}")
            added_count += 1

        print(f"\n✨ Seed complete!")
        print(f"   Added: {added_count} ingredients")
        print(f"   Skipped: {skipped_count} ingredients (already exist)")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_ingredients()
