from fastapi import APIRouter
from app.api.schema.auth_schema import Login_schema,Signup_schema
from app.api.services.auth_service import signup_service
from fastapi.responses import JSONResponse
from app.database.config.dependency import db_exec
router = APIRouter()

@router.post("/signin")
def signin(payload:Login_schema):
    print(payload)
    return {"message": "Welcome to my FastAPI User Authentication!"}

@router.post("/signup")
def signup(payload:Signup_schema,db: db_exec):
    resp=signup_service.new_user(payload,db)
    if resp==True:
        return JSONResponse(
            status_code=200,
            content={"message": "User Created Successfully!"}
        )
    else:
        return JSONResponse(
            status_code=400,
            content={"message": "User Already Exists!"}
        )