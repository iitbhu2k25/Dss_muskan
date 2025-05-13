from fastapi import APIRouter
from app.database.config.dependency import db_dependency
from app.api.service.spt_service import Stp_service
from fastapi import HTTPException,status
from app.api.schema.stp_schema import Stp_response,District_request,Sub_district_request
router=APIRouter()
# return all the state polygon


@router.get("/get_states",response_model=list[Stp_response])
async def get_states(db:db_dependency,all_data: bool = False):
    try:
        return Stp_service.get_state(db,all_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    

@router.post("/get_districts",response_model=list[Stp_response])
async def get_districts(db:db_dependency,payload:District_request):
    try:
        return Stp_service.get_district(db,payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/get_sub_districts",response_model=list[Stp_response])
async def get_sub_districts(db:db_dependency,payload:Sub_district_request):
    try:
        return Stp_service.get_sub_district(db,payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
