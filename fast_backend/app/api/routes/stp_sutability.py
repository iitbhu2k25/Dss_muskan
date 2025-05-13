from fastapi import APIRouter
from app.database.config.dependency import db_dependency
from app.api.service.spt_service import Stp_service
from fastapi import HTTPException,status
from app.api.schema.stp_schema import Stp_response,District_request,Sub_district_request
router=APIRouter()

@router.get("/get_sutability_by_category")
async def get_raster_sutability(db:db_dependency,category:str,all_data: bool = False):
    try:
        return Stp_service.get_raster_sutability(db,category,all_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )