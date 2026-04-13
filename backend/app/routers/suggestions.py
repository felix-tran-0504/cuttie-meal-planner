from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..security.rate_limit import enforce_suggestions_rate_limit
from ..settings import get_settings
from ..suggestions_llm import suggest_dishes_from_ingredients

router = APIRouter()


@router.post(
    "/suggestions/dishes",
    response_model=schemas.DishSuggestionsResponse,
    dependencies=[Depends(enforce_suggestions_rate_limit)],
)
def create_dish_suggestions(
    body: schemas.DishSuggestionRequest | None = None,
    db: Session = Depends(get_db),
):
    settings = get_settings()
    key = settings.openai_key_plain()
    if not key:
        raise HTTPException(
            status_code=503,
            detail="Set OPENAI_API_KEY in the backend .env to enable AI meal ideas.",
        )
    if key == "sk-your-key-here":
        raise HTTPException(
            status_code=503,
            detail="Replace OPENAI_API_KEY with a real secret from https://platform.openai.com/api-keys — the example placeholder is not valid.",
        )

    ingredients = crud.get_ingredients(db, skip=0, limit=500)
    names = [i.name for i in ingredients if i.name and i.name.strip()]
    if not names:
        raise HTTPException(
            status_code=400,
            detail="Add ingredients under Log → Ingredients first so we can suggest dishes.",
        )

    count = body.count if body else 5
    try:
        raw = suggest_dishes_from_ingredients(names, count=count)
        items = [schemas.DishSuggestionItem.model_validate(x) for x in raw]
        return schemas.DishSuggestionsResponse(suggestions=items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
