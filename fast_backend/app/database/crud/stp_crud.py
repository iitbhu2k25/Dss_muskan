from app.database.models import State,District,SubDistrict,STP_raster,STP_sutability_raster
from app.database.crud.base import CrudBase
from sqlalchemy.orm import Session
import sqlalchemy as sq

class Stp_State_crud(CrudBase):
    def __init__(self,db:Session,Model=State):
        super().__init__(db,Model)
        self.obj = None
    
    def get_states(self,all_data:bool=False,page=1, page_size=5):
        query= self.db.query(self.Model).filter().order_by(
            sq.asc(self.Model.state_name))
        return self._pagination(query,all_data,page,page_size)

class Stp_District_crud(CrudBase):
    def __init__(self,db:Session,Model=District):
        super().__init__(db,Model)
        self.obj = None

    def get_district(self,state_id:int,all_data:bool=False):
        query=self.db.query(self.Model).filter(
            self.Model.state_code==state_id).order_by( sq.asc(self.Model.district_name))
        return self._pagination(query,all_data)


class Stp_SubDistrict_crud(CrudBase):
    def __init__(self,db:Session,Model=SubDistrict):
        super().__init__(db,Model)
        self.obj = None

    def get_subdistrict(self,district:list,all_data:bool=False):
        query=self.db.query(self.Model).filter(
            self.Model.district_code.in_(district)).order_by(sq.asc(self.Model.subdistrict_name))
        return self._pagination(query,all_data)


    
class STP_raster_crud(CrudBase):
    def __init__(self,db:Session,Model=STP_raster):
        super().__init__(db,Model)
        self.obj = None
    def get_raster_path(self,name:str):
        query=self.db.query(self.Model).filter(
            self.Model.layer_name==name)
        return (
            query.first().file_path
        )

class STP_sutability_crud(CrudBase):
    def __init__(self,db:Session,Model=STP_sutability_raster):
        super().__init__(db,Model)
        self.obj = None
    def get_sutability_category(self,category:str,all_data:bool=False):
        query=self.db.query(self.Model).filter(
            self.Model.raster_category==category)
        return self._pagination(query,all_data)

        