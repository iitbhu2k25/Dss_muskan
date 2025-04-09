
# Create your views here.
import geopandas as gpd
from django.http import JsonResponse
import os
from django.conf import settings

def get_well_points(request):
    # Path to shapefile directory
    shapefile_path = os.path.join(settings.MEDIA_ROOT, 'well', 'clip.shp')
    
    try:
        gdf = gpd.read_file(shapefile_path)
        geojson = gdf.to_json()
        return JsonResponse(geojson, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

