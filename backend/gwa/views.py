from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import geopandas as gpd
import os
from django.conf import settings

class WellGeoJSONAPIView(APIView):
    def get(self, request, format=None):
        try:
            well_id = request.GET.get('id', '1')
            well_key = f"well-{well_id}"
            
            shapefile_base = os.path.join(settings.MEDIA_ROOT, 'gwa_data', 'well')
            
            # Log path information for debugging
            print(f"Looking for well with ID: {well_key}")
            print(f"Shapefile base directory: {shapefile_base}")
            
            shapefile_map = {
                'well-1': 'clip.shp',
                # Add more mappings if needed
            }
            
            shapefile_name = shapefile_map.get(well_key, 'clip.shp')
            shapefile_path = os.path.join(shapefile_base, shapefile_name)
            
            print(f"Full path to shapefile: {shapefile_path}")
            print(f"File exists: {os.path.exists(shapefile_path)}")
            
            if not os.path.exists(shapefile_path):
                return Response(
                    {'error': f'Shapefile does not exist at path: {shapefile_path}'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            gdf = gpd.read_file(shapefile_path)
            
            if gdf.empty:
                return Response(
                    {'error': 'Shapefile is empty or contains no valid geometries'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if gdf.crs and gdf.crs != "EPSG:4326":
                gdf = gdf.to_crs("EPSG:4326")
            
            geojson = gdf.to_json()
            
            return Response(geojson, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print("Shapefile read error:", e)
            print(traceback.format_exc())
            return Response(
                {
                    'error': str(e),
                    'type': str(type(e).__name__),
                    'detail': traceback.format_exc()
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )