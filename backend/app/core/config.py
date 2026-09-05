from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    cors_origins: str = "http://localhost:4200"
    site_base_url: str = "https://bilimdata.com"
    youtube_api_key: str | None = None
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    openai_model: str = "gpt-5-mini"
    deepseek_api_key: str | None = None
    deepseek_model: str = "deepseek-v4-flash"
    ai_provider: str = "anthropic"  # "anthropic" | "openai" | "deepseek"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
