import os
from pydantic import AnyHttpUrl,Field
from sqlalchemy import URL
from decouple import config
from pydantic_settings import BaseSettings

def db_url_config(drivername:str, username:str,password:str,host:str, port:str,database:str):
    return URL.create(
        drivername=drivername,
        username=username,
        host=host,
        password=password,
        port=port,
        database=database
    )

class Settings(BaseSettings):
    POSTGRES_USER : str
    POSTGRES_PASSWORD : str
    POSTGRES_DB : str
    POSTGRES_HOST : str
    POSTGRES_PORT :str
    DB_URL:AnyHttpUrl=Field(db_url_config(
        drivername='postgresql+psycopg2',
        username=config('POSTGRES_USER',cast=str),
        password=config('POSTGRES_PASSWORD',cast=str),
        host=config('POSTGRES_HOST',cast=str),
        port=config('POSTGRES_PORT',cast=int),
        database=config('POSTGRES_DB',cast=str),
    ), validate_default=False)

    class Config:
        env_file = ".env"

settings=Settings()