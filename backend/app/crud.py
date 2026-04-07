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