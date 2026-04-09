from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MealBase(BaseModel):
    name: str
    description: Optional[str] = None
    calories: float
    protein: float
    carbs: float
    fat: float


class MealIngredientCreate(BaseModel):
    ingredient_id: int
    amount_grams: float


class MealCreate(MealBase):
    ingredients: Optional[List[MealIngredientCreate]] = None


class MealIngredientRead(BaseModel):
    amount_grams: float
    ingredient: "Ingredient"

    class Config:
        from_attributes = True


class Meal(MealBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: List[MealIngredientRead] = []

    class Config:
        from_attributes = True


class IngredientBase(BaseModel):
    name: str
    description: Optional[str] = None
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Resolve forward reference for nested MealIngredientRead
MealIngredientRead.model_rebuild()