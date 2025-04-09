# Create your views here.
import geopandas as gpd
from django.http import JsonResponse
import os
from django.conf import settings

def get_well_geojson(request):
    # Get the well group ID from the query parameters
    well_id = request.GET.get('id', '1')  # Default to '1' if not provided
    
    # Path to shapefile directory - you may need to adjust this based on your file structure
    shapefile_base = os.path.join(settings.MEDIA_ROOT, 'gwa_data', 'well')
    
    # You could have different shapefiles for different well groups
    # For now, we'll just use the same file but this gives you the flexibility to expand
    shapefile_map = {
        'well-1': 'clip.shp',
        # Add more mappings as needed
    }
    
    # Get the correct shapefile or default to clip.shp
    shapefile_name = shapefile_map.get(well_id, 'clip.shp')
    shapefile_path = os.path.join(shapefile_base, shapefile_name)
    
    try:
        # Read the shapefile
        gdf = gpd.read_file(shapefile_path)
        
        # Ensure the CRS is set to WGS84 (EPSG:4326) for web mapping
        if gdf.crs and gdf.crs != "EPSG:4326":
            gdf = gdf.to_crs("EPSG:4326")
        
        # Convert to GeoJSON
        geojson = gdf.to_json()
        
        return JsonResponse(geojson, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
