from sqlalchemy.orm import Session, joinedload
from . import models, schemas


def _meal_query(db: Session):
    return db.query(models.Meal).options(
        joinedload(models.Meal.ingredients).joinedload(models.MealIngredient.ingredient)
    )


def get_meals(db: Session, skip: int = 0, limit: int = 100):
    return _meal_query(db).offset(skip).limit(limit).all()


def get_meal(db: Session, meal_id: int):
    return _meal_query(db).filter(models.Meal.id == meal_id).first()


def create_meal(db: Session, meal: schemas.MealCreate):
    data = meal.model_dump(exclude={"ingredients"})
    db_meal = models.Meal(**data)
    db.add(db_meal)
    db.flush()
    if meal.ingredients:
        for line in meal.ingredients:
            db.add(
                models.MealIngredient(
                    meal_id=db_meal.id,
                    ingredient_id=line.ingredient_id,
                    amount_grams=line.amount_grams,
                )
            )
    db.commit()
    return get_meal(db, db_meal.id)


def update_meal(db: Session, meal_id: int, meal: schemas.MealCreate):
    db_meal = _meal_query(db).filter(models.Meal.id == meal_id).first()
    if db_meal:
        for key, value in meal.model_dump(exclude={"ingredients"}).items():
            setattr(db_meal, key, value)
        if meal.ingredients is not None:
            db.query(models.MealIngredient).filter(
                models.MealIngredient.meal_id == meal_id
            ).delete(synchronize_session=False)
            for line in meal.ingredients:
                db.add(
                    models.MealIngredient(
                        meal_id=meal_id,
                        ingredient_id=line.ingredient_id,
                        amount_grams=line.amount_grams,
                    )
                )
        db.commit()
        return get_meal(db, meal_id)
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