from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API 配置
    api_key: str
    deepseek_base_url: str = "https://api.deepseek.com"
    
    # 服务器配置
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS 配置
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

