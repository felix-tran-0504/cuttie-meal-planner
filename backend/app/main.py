from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import meals, ingredients

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meal Planner API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meals.router, prefix="/api/v1", tags=["meals"])
app.include_router(ingredients.router, prefix="/api/v1", tags=["ingredients"])

@app.get("/")
async def root():
    return {"message": "Welcome to Meal Planner API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}