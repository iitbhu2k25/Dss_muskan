from pydantic import BaseModel

class Signup_schema(BaseModel):
    username : str
    email : str
    password : str

    #TODO we add here logic to volidate

class Login_schema(BaseModel):
    email : str
    password : str

    #TODO we add here logic to volidate