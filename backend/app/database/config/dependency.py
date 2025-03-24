from contextlib import contextmanager
from typing import Annotated
from fastapi import Depends
import logging
from .sessions import ScopedSession

class Database_PG():
    def __init__(self):
        self.db_session = ScopedSession
    
    @contextmanager
    def session(self):
        session = self.db_session()
        try:
            yield session
        except Exception as e:
            logging.error(e)
            session.rollback()
            raise
        finally:
            session.close()
            
    def get_session(self):
        with self.session() as session:
            yield session

db = Database_PG()

db_exec = Annotated[ScopedSession, Depends(db.get_session, use_cache=False)]