from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MealBase(BaseModel):
    name: str
    description: Optional[str] = None
    calories: float
    protein: float
    carbs: float
    fat: float

class MealCreate(MealBase):
    pass

class Meal(MealBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

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