from sqlalchemy.orm import Session
from . import models, schemas

def get_meals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Meal).offset(skip).limit(limit).all()

def get_meal(db: Session, meal_id: int):
    return db.query(models.Meal).filter(models.Meal.id == meal_id).first()

def create_meal(db: Session, meal: schemas.MealCreate):
    db_meal = models.Meal(**meal.model_dump())
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal

def update_meal(db: Session, meal_id: int, meal: schemas.MealCreate):
    db_meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if db_meal:
        for key, value in meal.model_dump().items():
            setattr(db_meal, key, value)
        db.commit()
        db.refresh(db_meal)
    return db_meal

def delete_meal(db: Session, meal_id: int):
    db_meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if db_meal:
        db.delete(db_meal)
        db.commit()
    return db_meal


# Ingredient CRUD operations
def get_ingredients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Ingredient).offset(skip).limit(limit).all()

def get_ingredient(db: Session, ingredient_id: int):
    return db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()

def get_ingredient_by_name(db: Session, name: str):
    return db.query(models.Ingredient).filter(models.Ingredient.name == name).first()

def create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    db_ingredient = models.Ingredient(**ingredient.model_dump())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

def update_ingredient(db: Session, ingredient_id: int, ingredient: schemas.IngredientCreate):
    db_ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if db_ingredient:
        for key, value in ingredient.model_dump().items():
            setattr(db_ingredient, key, value)
        db.commit()
        db.refresh(db_ingredient)
    return db_ingredient

def delete_ingredient(db: Session, ingredient_id: int):
    db_ingredient = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if db_ingredient:
        db.delete(db_ingredient)
        db.commit()
    return db_ingredient