from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped,mapped_column
from sqlalchemy import Integer,String,ForeignKey,DateTime
from datetime import datetime
class Base(DeclarativeBase):
    id:Mapped[int]=mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    pass