from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # SecretStr: never printed in repr/model_dump; use openai_key_plain() for HTTP calls only.
    openai_api_key: SecretStr | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"

    # --- Security / deployment ---
    environment: str = Field(
        default="development",
        description="Use 'production' to disable OpenAPI UIs and tighten defaults.",
    )
    allowed_origins: str = Field(
        default="http://localhost:8081",
        description="Comma-separated CORS origins (browser apps allowed to call this API).",
    )
    trusted_hosts: str = Field(
        default="localhost,127.0.0.1",
        description="Comma-separated Host values for TrustedHostMiddleware; empty disables it.",
    )
    suggestions_rate_limit_max: int = Field(
        default=30,
        ge=1,
        description="Max POST /suggestions/dishes calls per IP per window (in-memory; single worker).",
    )
    suggestions_rate_limit_window_seconds: int = Field(
        default=60,
        ge=1,
        description="Sliding window length in seconds for suggestion rate limit.",
    )

    def openai_key_plain(self) -> str:
        """Bearer token for OpenAI — use only in server-side requests; never log or return to clients."""
        if self.openai_api_key is None:
            return ""
        return self.openai_api_key.get_secret_value().strip()


def get_settings() -> Settings:
    """New instance each call so edits to ``backend/.env`` apply after a server restart."""
    return Settings()
