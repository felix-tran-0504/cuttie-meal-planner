# Meal Planner Backend

This is the FastAPI backend for the Meal Planner application.

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up PostgreSQL database:
   - Create a database named `meal_planner`
   - Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials

3. **Meal Ideas (LLM)** — optional, for `/suggestions` in the app:
   - Add `OPENAI_API_KEY=sk-...` to `.env`
   - Optional: `OPENAI_MODEL=gpt-4o-mini` (default), `OPENAI_BASE_URL=https://api.openai.com/v1` (or another OpenAI-compatible API base)

4. Run database migrations (if using Alembic):
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Endpoints

- `GET /api/v1/meals/` - Get all meals
- `GET /api/v1/meals/{id}` - Get a specific meal
- `POST /api/v1/meals/` - Create a new meal
- `PUT /api/v1/meals/{id}` - Update a meal
- `DELETE /api/v1/meals/{id}` - Delete a meal
- `POST /api/v1/suggestions/dishes` - AI dish ideas from logged ingredients (requires `OPENAI_API_KEY`)