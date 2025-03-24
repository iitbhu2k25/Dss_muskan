from fastapi import FastAPI,APIRouter
from app.conf.settings import settings
from app.api.routes import auth
app = FastAPI()

print("settings",settings.DB_URL)

app.include_router(
    auth.router,
    prefix='/auth',
    tags=["Auth"]
)
