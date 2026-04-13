import json
import uuid
from typing import Any

import httpx

from .settings import get_settings


def _strip_code_fence(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text.strip()


def _parse_llm_json(content: str) -> dict[str, Any]:
    text = _strip_code_fence(content)
    return json.loads(text)


def suggest_dishes_from_ingredients(ingredient_names: list[str], count: int = 5) -> list[dict[str, Any]]:
    """
    Call an OpenAI-compatible Chat Completions API and return validated suggestion dicts
    with id, name, emoji, macros, description, tags, servings, times, ingredients, steps.
    """
    settings = get_settings()
    key = settings.openai_key_plain()
    if not key:
        raise RuntimeError("OPENAI_API_KEY is not set")

    names = sorted({n.strip() for n in ingredient_names if n and n.strip()})
    if not names:
        raise ValueError("No ingredients provided")

    count = max(1, min(count, 12))
    names_block = ", ".join(names)

    system = (
        "You are a practical home-cooking assistant. You respond with compact JSON only, "
        "no markdown, no commentary."
    )
    user = f"""The user has logged these ingredients (they may cook with others like salt, oil, or spices):

{names_block}

Return a JSON object with exactly one key, "suggestions", whose value is an array of {count} objects.
Each object must have these keys:
- "name": string (dish title)
- "emoji": string (a single emoji only)
- "calories": number (estimated per serving)
- "protein": number (grams)
- "carbs": number (grams)
- "fat": number (grams)
- "description": string (one short sentence)
- "tags": array of 1 to 3 short strings (e.g. "High Protein", "Quick", "Low Carb")
- "servings": integer (recipe yield, typically 2 to 4)
- "prep_time_minutes": integer (active prep time)
- "cook_time_minutes": integer (hands-off or stovetop/oven time; use 0 if none)
- "ingredients": array of 4 to 12 strings; each string is one line with amount + ingredient (e.g. "200 g chicken breast, diced")
- "steps": array of 4 to 10 strings; numbered instructions in cooking order, clear and concise

Ideas should primarily use ingredients from the user's list; small amounts of pantry staples are fine.
Use realistic portion estimates for macros. The recipe must match the dish name and macros."""

    url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.openai_model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    with httpx.Client(timeout=90.0) as client:
        resp = client.post(url, headers=headers, json=payload)
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            if resp.status_code == 401:
                raise RuntimeError(
                    "OpenAI returned 401: invalid or expired API key. "
                    "Use a real secret from https://platform.openai.com/api-keys — not the placeholder text."
                ) from e
            if resp.status_code == 429:
                try:
                    body = resp.json()
                    err = (body.get("error") or {}) if isinstance(body, dict) else {}
                    if err.get("code") == "insufficient_quota":
                        raise RuntimeError(
                            "OpenAI quota exceeded (insufficient_quota). "
                            "Add billing or credits at https://platform.openai.com/account/billing — new keys need a funded account for API usage."
                        ) from e
                except RuntimeError:
                    raise
                except (json.JSONDecodeError, TypeError, ValueError, AttributeError):
                    pass
                raise RuntimeError(
                    "OpenAI returned 429 (rate limit or quota). Check https://platform.openai.com/account/billing"
                ) from e
            detail = resp.text[:500] if resp.text else str(e)
            raise RuntimeError(f"LLM API error: {resp.status_code} {detail}") from e

    data = resp.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        raise RuntimeError("Unexpected LLM response shape") from e

    parsed = _parse_llm_json(content)
    suggestions_raw = parsed.get("suggestions")
    if not isinstance(suggestions_raw, list):
        raise RuntimeError('LLM JSON must contain a "suggestions" array')

    out: list[dict[str, Any]] = []
    for item in suggestions_raw:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        emoji = (str(item.get("emoji", "🍽️")).strip() or "🍽️")[:8]
        tags = item.get("tags")
        if not isinstance(tags, list):
            tags = []
        tags = [str(t).strip() for t in tags if str(t).strip()][:3]

        def _str_list(key: str, min_len: int, fallback: str, max_n: int) -> list[str]:
            raw_list = item.get(key)
            if not isinstance(raw_list, list):
                raw_list = []
            lines = [str(x).strip() for x in raw_list if str(x).strip()]
            if not lines:
                lines = [fallback]
            while len(lines) < min_len:
                lines.append(fallback)
            return lines[:max_n]

        servings_raw = item.get("servings", 2)
        try:
            servings = int(servings_raw)
        except (TypeError, ValueError):
            servings = 2
        servings = max(1, min(servings, 12))

        try:
            prep_m = int(item.get("prep_time_minutes", 15))
        except (TypeError, ValueError):
            prep_m = 15
        prep_m = max(0, min(prep_m, 240))

        try:
            cook_m = int(item.get("cook_time_minutes", 0))
        except (TypeError, ValueError):
            cook_m = 0
        cook_m = max(0, min(cook_m, 480))

        ingredients = _str_list("ingredients", 3, "Pantry staples as needed", 16)
        steps = _str_list("steps", 3, "Cook through; season to taste.", 12)

        out.append(
            {
                "id": str(uuid.uuid4()),
                "name": name,
                "emoji": emoji,
                "calories": float(item.get("calories", 0)),
                "protein": float(item.get("protein", 0)),
                "carbs": float(item.get("carbs", 0)),
                "fat": float(item.get("fat", 0)),
                "description": str(item.get("description", "")).strip() or "A tasty idea using your ingredients.",
                "tags": tags or ["Balanced"],
                "servings": servings,
                "prep_time_minutes": prep_m,
                "cook_time_minutes": cook_m,
                "ingredients": ingredients[:16],
                "steps": steps[:12],
            }
        )

    if not out:
        raise RuntimeError("LLM returned no usable suggestions")

    return out[:count]
