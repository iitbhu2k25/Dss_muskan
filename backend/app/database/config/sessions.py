from app.conf.settings import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

DB_URL = settings.DB_URL

engine = create_engine(
    DB_URL
)

Session_Local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
ScopedSession = scoped_session(Session_Local)