from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class MealBase(BaseModel):
    name: str
    description: Optional[str] = None
    calories: float
    protein: float
    carbs: float
    fat: float
    photo_urls: Optional[List[str]] = None
    eaten_at: Optional[datetime] = None


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


class DishSuggestionRequest(BaseModel):
    count: int = Field(5, ge=1, le=12)


class DishSuggestionItem(BaseModel):
    id: str
    name: str
    emoji: str
    calories: float
    protein: float
    carbs: float
    fat: float
    description: str
    tags: List[str]
    servings: int = 2
    prep_time_minutes: int = 15
    cook_time_minutes: int = 0
    ingredients: List[str]
    steps: List[str]


class DishSuggestionsResponse(BaseModel):
    suggestions: List[DishSuggestionItem]