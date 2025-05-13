from fastapi import APIRouter
from app.api.routes import stp_operation,stp_sutability,stp_prority
app_router = APIRouter()

app_router.include_router(
    stp_prority.router,
    prefix="/stp",
    tags=["STP priority"]
)
app_router.include_router(
    stp_operation.router,
    prefix="/stp_operation",
    tags=["STP OPERATIONS"]
)
app_router.include_router(
    stp_sutability.router,
    prefix="/stp_sutability",
    tags=["STP SUTABILITY"]
)