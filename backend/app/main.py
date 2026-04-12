from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from .database import engine, Base
from .routers import meals, ingredients, suggestions

# Create database tables
Base.metadata.create_all(bind=engine)

# Add new columns on existing PostgreSQL databases (create_all does not migrate)
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE meals ADD COLUMN IF NOT EXISTS photo_urls JSON"))
except Exception as exc:
    print(f"DB migration (photo_urls): {exc}")

try:
    with engine.begin() as conn:
        conn.execute(
            text("ALTER TABLE meals ADD COLUMN IF NOT EXISTS eaten_at TIMESTAMP WITH TIME ZONE")
        )
        conn.execute(text("UPDATE meals SET eaten_at = created_at WHERE eaten_at IS NULL"))
except Exception as exc:
    print(f"DB migration (eaten_at): {exc}")

BACKEND_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BACKEND_DIR / "static"
(STATIC_DIR / "uploads").mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Meal Planner API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meals.router, prefix="/api/v1", tags=["meals"])
app.include_router(ingredients.router, prefix="/api/v1", tags=["ingredients"])
app.include_router(suggestions.router, prefix="/api/v1", tags=["suggestions"])
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to Meal Planner API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}