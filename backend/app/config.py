from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str
    database_name: str = "ms_fashions"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    admin_username: str = "sufian"
    admin_password_hash: str = ""
    frontend_url: str = "http://localhost:5173,https://ms-fashion-closet.vercel.app"
    environment: str = "development"
    tls_allow_invalid_certs: bool = False
    cloudinary_cloud_name: str = "iv29blwq"
    cloudinary_api_key: str = "432749377965394"
    cloudinary_api_secret: str = "6RvhNOiCsm2ZyDyn58h1RlkwA5U"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
