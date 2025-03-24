from app.api.schema.auth_schema import Signup_schema
from app.database.config.dependency import db_exec
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database.models.users import User
from sqlalchemy import select
class signup_service:
    @classmethod
    def new_user(cls,payload: Signup_schema,db: Session):
        stmt=select(User).where(User.email==payload.email)
        obj=db.execute(stmt).scalar_one_or_none()
        if obj:
            return False
        else:
            db.add(User(name=payload.username,email=payload.email,password=payload.password))
            db.commit() 
            return True

    #todo we have to verfiy the emaiul is uniqiue
    #if uniq user name the insert gave the  true else false