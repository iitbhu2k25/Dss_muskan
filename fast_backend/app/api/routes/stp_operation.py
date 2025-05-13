from fastapi import APIRouter
from app.database.config.dependency import db_dependency
from app.api.service.spt_service import Stp_service
from fastapi import HTTPException,status
from app.api.schema.stp_schema import  STPCategory,STPClassification
from app.api.service.stp_operation import STPPriorityMapper,RasterProcess


router=APIRouter()

@router.post("/stp_raster")
def stp_raster(db:db_dependency,payload: STPCategory):
    try:
        if len(payload.data)==0:
            raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No data found"
        )
        raster_path,raster_weights=Stp_service.get_raster(db,payload)
        ans=STPPriorityMapper().create_priority_map(raster_path,raster_weights,payload.clip)
        return ans
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
@router.post("/raster_classify")
def stp_classify(db:db_dependency,payload:STPClassification):
    try:
        RasterProcess().processRaster(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
