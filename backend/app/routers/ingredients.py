from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/ingredients/", response_model=List[schemas.Ingredient])
def read_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ingredients = crud.get_ingredients(db, skip=skip, limit=limit)
    return ingredients

@router.get("/ingredients/{ingredient_id}", response_model=schemas.Ingredient)
def read_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    db_ingredient = crud.get_ingredient(db, ingredient_id=ingredient_id)
    if db_ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return db_ingredient

@router.post("/ingredients/", response_model=schemas.Ingredient)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    db_ingredient = crud.get_ingredient_by_name(db, ingredient.name)
    if db_ingredient:
        raise HTTPException(status_code=400, detail="Ingredient with this name already exists")
    return crud.create_ingredient(db=db, ingredient=ingredient)

@router.put("/ingredients/{ingredient_id}", response_model=schemas.Ingredient)
def update_ingredient(ingredient_id: int, ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    db_ingredient = crud.update_ingredient(db=db, ingredient_id=ingredient_id, ingredient=ingredient)
    if db_ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return db_ingredient

@router.delete("/ingredients/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    db_ingredient = crud.delete_ingredient(db=db, ingredient_id=ingredient_id)
    if db_ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return {"message": "Ingredient deleted successfully"}
