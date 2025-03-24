from .base import Base
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped,mapped_column
from sqlalchemy import Integer,String,ForeignKey


class User(Base):
    __tablename__ = "users"
    name: Mapped[str] = mapped_column(String(40))
    email: Mapped[str]= mapped_column(String(30),unique=True)
    password: Mapped[str] = mapped_column(String(100))