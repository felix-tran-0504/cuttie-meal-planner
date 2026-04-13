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

## Security

- **Secrets:** Copy `.env.example` to `.env` and keep `.env` out of version control (see repo `.gitignore`). `OPENAI_API_KEY` is loaded as a Pydantic `SecretStr` so it is not echoed in settings `repr` / accidental dumps—only passed to the OpenAI HTTP client.
- **If `.env` was ever committed:** Remove it from Git (`git rm --cached backend/.env`), commit, and **rotate** your OpenAI key (and any DB password) in the provider dashboard—history may still contain old files.
- **Frontend:** Never put API keys in `VITE_*` variables; they ship in the browser bundle. Meal ideas always go through this backend.
- **CORS:** Set `ALLOWED_ORIGINS` to a comma-separated list of front-end origins (default `http://localhost:8081`).
- **Host header:** `TRUSTED_HOSTS` (comma-separated) enables Starlette’s `TrustedHostMiddleware` (default `localhost,127.0.0.1`). Add your LAN hostname if you use `--host 0.0.0.0` and browse by IP.
- **Response headers:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` are set on API responses.
- **Rate limit:** `POST /suggestions/dishes` is limited per IP (defaults: 30 requests / 60s, tunable via `SUGGESTIONS_RATE_LIMIT_*`). In-memory; use a shared store if you run multiple workers.
- **Production:** Set `ENVIRONMENT=production` to disable `/docs`, `/redoc`, and `/openapi.json`.