# This is an example of how your urls.py might look
from django.urls import path
from . import views

urlpatterns = [
    # Keep any existing URL patterns you have
    # ...
    
    # Add the new endpoint that matches what we're using in the frontend
   path('get-well-geojson/', views.get_well_geojson, name='get-well-geojson'),
    
    # # Keep your original endpoint
    # path('get-well-points/', views.get_well_points, name='get-well-points'),
]