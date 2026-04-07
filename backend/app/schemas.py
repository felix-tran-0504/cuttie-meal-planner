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